-- Update scoring: exact result is now 3 points instead of 2

-- Update the function to calculate points for a prediction
CREATE OR REPLACE FUNCTION calculate_prediction_points(
  predicted_home INTEGER,
  predicted_away INTEGER,
  actual_home INTEGER,
  actual_away INTEGER
) RETURNS INTEGER AS $$
DECLARE
  predicted_outcome TEXT;
  actual_outcome TEXT;
BEGIN
  -- Exact match = 3 points (changed from 2)
  IF predicted_home = actual_home AND predicted_away = actual_away THEN
    RETURN 3;
  END IF;
  
  -- Determine predicted outcome (H = Home win, A = Away win, D = Draw)
  IF predicted_home > predicted_away THEN
    predicted_outcome := 'H';
  ELSIF predicted_home < predicted_away THEN
    predicted_outcome := 'A';
  ELSE
    predicted_outcome := 'D';
  END IF;
  
  -- Determine actual outcome
  IF actual_home > actual_away THEN
    actual_outcome := 'H';
  ELSIF actual_home < actual_away THEN
    actual_outcome := 'A';
  ELSE
    actual_outcome := 'D';
  END IF;
  
  -- Correct outcome = 1 point
  IF predicted_outcome = actual_outcome THEN
    RETURN 1;
  END IF;
  
  -- Wrong prediction = 0 points
  RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update the user rankings view to count exact predictions correctly (now 3 points)
CREATE OR REPLACE VIEW public.user_rankings AS
WITH user_stats AS (
  SELECT 
    p.user_id,
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
  FROM public.predictions p
  JOIN public.profiles prof ON p.user_id = prof.id
  GROUP BY p.user_id, prof.username, prof.avatar_url
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
