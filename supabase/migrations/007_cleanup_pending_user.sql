-- ============================================
-- SELF-CLEANUP FOR UNINVITED USERS
-- ============================================
-- When someone clicks "I have an account" but doesn't
-- actually have one, Google OAuth creates a garbage user
-- in auth.users + profiles (status = 'pending').
--
-- This RPC lets the auth callback immediately delete
-- that user so no garbage is left behind. Only works
-- for users whose status is still 'pending' — approved
-- or suspended users cannot self-delete this way.

CREATE OR REPLACE FUNCTION public.cleanup_pending_user()
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_status TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN 'not_authenticated';
  END IF;

  SELECT status INTO v_status
  FROM public.profiles WHERE id = v_user_id;

  -- Only allow cleanup of pending users
  IF v_status IS NULL THEN
    -- Profile doesn't exist yet (race condition) — just delete auth record
    DELETE FROM auth.users WHERE id = v_user_id;
    RETURN 'ok';
  END IF;

  IF v_status != 'pending' THEN
    RETURN 'not_pending';
  END IF;

  -- Delete profile (cascades to any invite_codes created_by, predictions)
  DELETE FROM public.profiles WHERE id = v_user_id;

  -- Delete the auth.users record
  DELETE FROM auth.users WHERE id = v_user_id;

  RETURN 'ok';
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_pending_user() TO authenticated;
