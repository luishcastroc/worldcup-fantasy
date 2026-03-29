-- FIFA 2026 World Cup Fantasy App Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50),
  full_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(3) NOT NULL UNIQUE,
  flag_url TEXT,
  group_letter CHAR(1) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_group ON public.teams(group_letter);

-- ============================================
-- MATCHES TABLE
-- ============================================
CREATE TYPE match_status AS ENUM ('scheduled', 'in_progress', 'completed');

CREATE TABLE IF NOT EXISTS public.matches (
  id SERIAL PRIMARY KEY,
  home_team_id INTEGER NOT NULL REFERENCES public.teams(id),
  away_team_id INTEGER NOT NULL REFERENCES public.teams(id),
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue VARCHAR(200),
  city VARCHAR(100),
  group_letter CHAR(1) NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status match_status DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_group ON public.matches(group_letter);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);

-- ============================================
-- PREDICTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.predictions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id INTEGER NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  predicted_home_score INTEGER NOT NULL CHECK (predicted_home_score >= 0),
  predicted_away_score INTEGER NOT NULL CHECK (predicted_away_score >= 0),
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

CREATE INDEX IF NOT EXISTS idx_predictions_user ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON public.predictions(match_id);

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default prediction deadline (before first match June 11, 2026)
INSERT INTO public.settings (key, value) 
VALUES ('prediction_deadline', '2026-06-10T23:59:59Z')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- USER RANKINGS VIEW
-- ============================================
CREATE OR REPLACE VIEW public.user_rankings AS
WITH user_stats AS (
  SELECT 
    p.user_id,
    prof.username,
    prof.avatar_url,
    COALESCE(SUM(p.points_earned), 0) AS total_points,
    COUNT(CASE WHEN p.points_earned = 2 THEN 1 END) AS exact_predictions,
    COUNT(CASE WHEN p.points_earned = 1 THEN 1 END) AS correct_outcomes,
    COALESCE(SUM(
      CASE WHEN p.points_earned = 2 
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

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate points for a prediction
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
  -- Exact match = 2 points
  IF predicted_home = actual_home AND predicted_away = actual_away THEN
    RETURN 2;
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

-- Function to update points when match results are entered
CREATE OR REPLACE FUNCTION update_prediction_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when match status changes to completed
  IF NEW.status = 'completed' AND (OLD.status != 'completed' OR OLD.status IS NULL) THEN
    -- Update all predictions for this match
    UPDATE public.predictions
    SET 
      points_earned = calculate_prediction_points(
        predicted_home_score,
        predicted_away_score,
        NEW.home_score,
        NEW.away_score
      ),
      updated_at = NOW()
    WHERE match_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic points calculation
DROP TRIGGER IF EXISTS trigger_update_prediction_points ON public.matches;
CREATE TRIGGER trigger_update_prediction_points
  AFTER UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION update_prediction_points();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Teams policies (read-only for authenticated users)
CREATE POLICY "Anyone can view teams" 
  ON public.teams FOR SELECT 
  USING (true);

-- Matches policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view matches" 
  ON public.matches FOR SELECT 
  TO authenticated
  USING (true);

-- Predictions policies
CREATE POLICY "Users can view all predictions" 
  ON public.predictions FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own predictions" 
  ON public.predictions FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions" 
  ON public.predictions FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own predictions" 
  ON public.predictions FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Settings policies (read-only)
CREATE POLICY "Anyone can view settings" 
  ON public.settings FOR SELECT 
  USING (true);

-- ============================================
-- HELPER FUNCTION FOR DEADLINE CHECK
-- ============================================
CREATE OR REPLACE FUNCTION is_before_deadline()
RETURNS BOOLEAN AS $$
DECLARE
  deadline_value TEXT;
  deadline_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT value INTO deadline_value 
  FROM public.settings 
  WHERE key = 'prediction_deadline';
  
  IF deadline_value IS NULL THEN
    RETURN true; -- No deadline set, allow predictions
  END IF;
  
  deadline_timestamp := deadline_value::TIMESTAMP WITH TIME ZONE;
  RETURN NOW() < deadline_timestamp;
END;
$$ LANGUAGE plpgsql STABLE;
