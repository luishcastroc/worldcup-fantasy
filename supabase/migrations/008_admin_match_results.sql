-- ============================================================
-- ADMIN MATCH RESULT MANAGEMENT
-- ============================================================
-- Three SECURITY DEFINER RPCs for admins to manage match results
-- without needing direct Supabase access.
--
-- All functions check is_admin() before executing.
--
-- NOTE on two-UPDATE pattern in admin_set_match_result:
--   The points trigger fires only on (scheduled → completed).
--   If a match is already completed, a single UPDATE changing
--   scores would NOT re-trigger point calculation. Resetting
--   to 'scheduled' first guarantees the trigger always fires.
-- ============================================================

-- ============================================================
-- 1. SET / UPDATE MATCH RESULT
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_set_match_result(
  p_match_id   INTEGER,
  p_home_score INTEGER,
  p_away_score INTEGER
)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN 'not_admin';
  END IF;

  IF p_home_score < 0 OR p_away_score < 0 THEN
    RETURN 'invalid_scores';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.matches WHERE id = p_match_id) THEN
    RETURN 'not_found';
  END IF;

  -- Reset to scheduled first so the trigger fires on next update
  UPDATE public.matches
  SET
    home_score = p_home_score,
    away_score = p_away_score,
    status     = 'scheduled',
    updated_at = NOW()
  WHERE id = p_match_id;

  -- Now set completed — this fires trigger_update_prediction_points
  UPDATE public.matches
  SET
    status     = 'completed',
    updated_at = NOW()
  WHERE id = p_match_id;

  RETURN 'ok';
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_match_result(INTEGER, INTEGER, INTEGER) TO authenticated;

-- ============================================================
-- 2. CLEAR ONE MATCH RESULT
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_clear_match_result(p_match_id INTEGER)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN 'not_admin';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.matches WHERE id = p_match_id) THEN
    RETURN 'not_found';
  END IF;

  -- Reset points for all predictions on this match
  UPDATE public.predictions
  SET
    points_earned = 0,
    updated_at    = NOW()
  WHERE match_id = p_match_id;

  -- Reset match to unplayed state
  UPDATE public.matches
  SET
    home_score = NULL,
    away_score = NULL,
    status     = 'scheduled',
    updated_at = NOW()
  WHERE id = p_match_id;

  RETURN 'ok';
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_clear_match_result(INTEGER) TO authenticated;

-- ============================================================
-- 3. CLEAR ALL MATCH RESULTS
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_clear_all_results()
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN 'not_admin';
  END IF;

  -- Zero out all prediction points
  UPDATE public.predictions
  SET
    points_earned = 0,
    updated_at    = NOW()
  WHERE points_earned != 0;

  -- Reset all completed/scored matches
  UPDATE public.matches
  SET
    home_score = NULL,
    away_score = NULL,
    status     = 'scheduled',
    updated_at = NOW()
  WHERE status != 'scheduled'
     OR home_score IS NOT NULL
     OR away_score IS NOT NULL;

  RETURN 'ok';
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_clear_all_results() TO authenticated;
