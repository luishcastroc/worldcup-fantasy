-- ============================================
-- INVITE-FIRST LOGIN FLOW + ADMIN DELETE USER
-- ============================================
-- 1. validate_invite_code  – pre-auth check (anon)
-- 2. admin_delete_user     – full user removal (admin)

-- ============================================
-- 1. VALIDATE INVITE CODE (PRE-AUTH)
-- ============================================
-- Called from the login page BEFORE Google OAuth.
-- Only checks validity — does NOT consume the code.
-- Granted to `anon` so it works without a session.

CREATE OR REPLACE FUNCTION public.validate_invite_code(p_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_invite public.invite_codes%ROWTYPE;
BEGIN
  SELECT * INTO v_invite
  FROM public.invite_codes
  WHERE code = upper(trim(p_code)) AND used_by IS NULL;

  IF NOT FOUND THEN
    RETURN 'invalid';
  END IF;

  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < NOW() THEN
    RETURN 'expired';
  END IF;

  RETURN 'valid';
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_invite_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_invite_code(TEXT) TO authenticated;

-- ============================================
-- 2. ADMIN DELETE USER
-- ============================================
-- Fully removes a user: predictions, profile, invite
-- code references, and the auth.users record.
--
-- Invite codes CREATED by the deleted user are removed
-- via ON DELETE CASCADE on invite_codes.created_by.
--
-- Invite codes REDEEMED by the deleted user have their
-- used_by/used_at cleared so the code becomes available
-- again (ON DELETE SET NULL only clears used_by; we also
-- need to clear used_at explicitly).

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_caller UUID := auth.uid();
BEGIN
  -- Must be an admin
  IF NOT public.is_admin() THEN
    RETURN 'not_admin';
  END IF;

  -- Cannot delete yourself
  IF v_caller = p_user_id THEN
    RETURN 'self_delete';
  END IF;

  -- Target must exist
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RETURN 'not_found';
  END IF;

  -- Free invite codes that were redeemed by this user
  UPDATE public.invite_codes
  SET used_by = NULL, used_at = NULL
  WHERE used_by = p_user_id;

  -- Explicitly delete predictions (CASCADE would handle it,
  -- but being explicit makes intent clear)
  DELETE FROM public.predictions WHERE user_id = p_user_id;

  -- Delete profile (cascades to invite_codes.created_by)
  DELETE FROM public.profiles WHERE id = p_user_id;

  -- Delete the auth.users record so the OAuth identity is
  -- fully removed and cannot auto-log-in again
  DELETE FROM auth.users WHERE id = p_user_id;

  RETURN 'ok';
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
