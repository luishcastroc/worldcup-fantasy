-- ============================================
-- Lock predictions once a match starts or has a result
-- ============================================
-- Previously the only gate on editing predictions was a client-side global
-- deadline. Users could still insert/update/delete predictions for a match
-- that had already kicked off or that the admin had already scored.
--
-- This migration enforces per-match locking at the database level: a
-- prediction can only be created, changed, or removed while its match is
-- still open (scheduled, in the future, and without a result).

-- Returns TRUE only while the match is still open for predictions.
CREATE OR REPLACE FUNCTION public.match_is_open(p_match_id INTEGER)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.matches m
    WHERE m.id = p_match_id
      AND m.status = 'scheduled'
      AND m.home_score IS NULL
      AND m.away_score IS NULL
      AND m.match_date > NOW()
  );
$$ LANGUAGE sql STABLE;

-- Re-create the predictions write policies to include the per-match lock.
DROP POLICY IF EXISTS "Users can insert own predictions" ON public.predictions;
CREATE POLICY "Users can insert own predictions"
  ON public.predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.match_is_open(match_id));

DROP POLICY IF EXISTS "Users can update own predictions" ON public.predictions;
CREATE POLICY "Users can update own predictions"
  ON public.predictions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND public.match_is_open(match_id))
  WITH CHECK (auth.uid() = user_id AND public.match_is_open(match_id));

DROP POLICY IF EXISTS "Users can delete own predictions" ON public.predictions;
CREATE POLICY "Users can delete own predictions"
  ON public.predictions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND public.match_is_open(match_id));
