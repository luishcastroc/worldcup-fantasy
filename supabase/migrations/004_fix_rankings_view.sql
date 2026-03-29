-- Fix user_rankings view to include ALL users with a profile,
-- even those who have not yet submitted any predictions.
--
-- Previously the view started FROM predictions JOIN profiles,
-- which silently excluded any user with zero prediction rows.
-- Now we start FROM profiles LEFT JOIN predictions so every
-- registered user appears in the leaderboard.

CREATE OR REPLACE VIEW public.user_rankings AS
WITH user_stats AS (
  SELECT 
    prof.id AS user_id,
    prof.username,
    prof.avatar_url,
    COALESCE(SUM(p.points_earned), 0) AS total_points,
    COUNT(CASE WHEN p.points_earned = 3 THEN 1 END) AS exact_predictions,
    COUNT(CASE WHEN p.points_earned = 1 THEN 1 END) AS correct_outcomes,
    COALESCE(SUM(
      CASE WHEN p.points_earned = 3 
      THEN p.predicted_home_score + p.predicted_away_score 
      ELSE 0 END
    ), 0) AS exact_with_goals,
    COUNT(p.id) AS total_predictions
  FROM public.profiles prof
  LEFT JOIN public.predictions p ON prof.id = p.user_id
  GROUP BY prof.id, prof.username, prof.avatar_url
)
SELECT 
  user_id,
  username,
  avatar_url,
  total_points,
  exact_predictions,
  correct_outcomes,
  exact_with_goals,
  total_predictions,
  RANK() OVER (
    ORDER BY 
      total_points DESC, 
      exact_predictions DESC, 
      exact_with_goals DESC
  ) AS rank
FROM user_stats;
