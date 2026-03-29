-- ============================================
-- INVITE-ONLY ACCESS SYSTEM
-- ============================================
-- Adds status/role/invite_quota to profiles,
-- creates invite_codes table, and enforces
-- approval via RLS + SECURITY DEFINER RPCs.

-- ============================================
-- 1. EXTEND PROFILES TABLE
-- ============================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'suspended')),
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin')),
  ADD COLUMN IF NOT EXISTS invite_quota INTEGER NOT NULL DEFAULT 3;

-- Grandfather all existing users — they were here before the invite system
UPDATE public.profiles SET status = 'approved';

-- ============================================
-- 2. INVITE CODES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- NULL = never expires (admin-generated codes)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_created_by ON public.invite_codes(created_by);

-- ============================================
-- 3. HELPER FUNCTION FOR RLS
-- ============================================

-- Returns true if the current user has approved status
CREATE OR REPLACE FUNCTION public.is_approved()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status = 'approved'
  );
$$;

-- Returns true if the current user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================
-- 4. UPDATE EXISTING RLS POLICIES TO REQUIRE APPROVAL
-- ============================================

-- Matches: require approved status
DROP POLICY IF EXISTS "Authenticated users can view matches" ON public.matches;
CREATE POLICY "Approved users can view matches"
  ON public.matches FOR SELECT
  TO authenticated
  USING (public.is_approved());

-- Predictions: require approved status
DROP POLICY IF EXISTS "Users can view all predictions" ON public.predictions;
CREATE POLICY "Approved users can view all predictions"
  ON public.predictions FOR SELECT
  TO authenticated
  USING (public.is_approved());

DROP POLICY IF EXISTS "Users can insert own predictions" ON public.predictions;
CREATE POLICY "Approved users can insert own predictions"
  ON public.predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_approved());

DROP POLICY IF EXISTS "Users can update own predictions" ON public.predictions;
CREATE POLICY "Approved users can update own predictions"
  ON public.predictions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND public.is_approved());

DROP POLICY IF EXISTS "Users can delete own predictions" ON public.predictions;
CREATE POLICY "Approved users can delete own predictions"
  ON public.predictions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND public.is_approved());

-- ============================================
-- 5. ADMIN PROFILE MANAGEMENT POLICY
-- ============================================

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- ============================================
-- 6. RLS ON INVITE CODES TABLE
-- ============================================

ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Approved users can view their own generated codes
CREATE POLICY "Users can view own invite codes"
  ON public.invite_codes FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() AND public.is_approved());

-- Admins can view all invite codes
CREATE POLICY "Admins can view all invite codes"
  ON public.invite_codes FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- No direct INSERT/UPDATE/DELETE — all writes go through SECURITY DEFINER RPCs

-- ============================================
-- 7. RPC: REDEEM INVITE CODE
-- ============================================

CREATE OR REPLACE FUNCTION public.redeem_invite_code(p_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_invite public.invite_codes%ROWTYPE;
  v_user_id UUID := auth.uid();
  v_current_status TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN 'invalid';
  END IF;

  -- Check current user status
  SELECT status INTO v_current_status
  FROM public.profiles WHERE id = v_user_id;

  IF v_current_status = 'approved' THEN
    RETURN 'already_approved';
  END IF;

  -- Lock the invite row to prevent race conditions
  SELECT * INTO v_invite
  FROM public.invite_codes
  WHERE code = upper(trim(p_code)) AND used_by IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'invalid';
  END IF;

  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < NOW() THEN
    RETURN 'expired';
  END IF;

  -- Mark invite as used
  UPDATE public.invite_codes
  SET used_by = v_user_id, used_at = NOW()
  WHERE id = v_invite.id;

  -- Approve the user and auto-generate their invite quota codes
  UPDATE public.profiles
  SET status = 'approved'
  WHERE id = v_user_id;

  RETURN 'ok';
END;
$$;

-- ============================================
-- 8. RPC: GENERATE INVITE CODE
-- ============================================

CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_role TEXT;
  v_quota INTEGER;
  v_unused_count INTEGER;
  v_code TEXT;
  v_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no O/0/1/I to avoid confusion
  v_len INTEGER := 8;
  v_i INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT role, invite_quota INTO v_role, v_quota
  FROM public.profiles WHERE id = v_user_id AND status = 'approved';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_approved';
  END IF;

  -- Non-admins are capped by their quota (count of unused codes they created)
  IF v_role != 'admin' THEN
    SELECT COUNT(*) INTO v_unused_count
    FROM public.invite_codes
    WHERE created_by = v_user_id AND used_by IS NULL;

    IF v_unused_count >= v_quota THEN
      RAISE EXCEPTION 'quota_exceeded';
    END IF;
  END IF;

  -- Generate a unique 8-char code from a readable character set
  LOOP
    v_code := '';
    FOR v_i IN 1..v_len LOOP
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    END LOOP;

    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.invite_codes WHERE code = v_code);
  END LOOP;

  INSERT INTO public.invite_codes (code, created_by, expires_at)
  VALUES (
    v_code,
    v_user_id,
    CASE WHEN v_role = 'admin' THEN NULL ELSE NOW() + INTERVAL '30 days' END
  );

  RETURN v_code;
END;
$$;

-- ============================================
-- 9. GRANT EXECUTE ON RPCs TO AUTHENTICATED USERS
-- ============================================

GRANT EXECUTE ON FUNCTION public.redeem_invite_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_invite_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_approved() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
