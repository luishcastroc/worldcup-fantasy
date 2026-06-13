-- ============================================
-- RESTRICT INVITE GENERATION TO ADMINS
-- ============================================
-- Previously any approved user could generate invite
-- codes (capped by invite_quota). This redefines the RPC
-- so ONLY admins can mint codes. Non-admins are rejected
-- regardless of their quota.

CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_code TEXT;
  v_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no O/0/1/I to avoid confusion
  v_len INTEGER := 8;
  v_i INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Only admins may generate invite codes
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  -- Generate a unique 8-char code from a readable character set
  LOOP
    v_code := '';
    FOR v_i IN 1..v_len LOOP
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    END LOOP;

    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.invite_codes WHERE code = v_code);
  END LOOP;

  -- Admin-generated codes never expire
  INSERT INTO public.invite_codes (code, created_by, expires_at)
  VALUES (v_code, v_user_id, NULL);

  RETURN v_code;
END;
$$;
