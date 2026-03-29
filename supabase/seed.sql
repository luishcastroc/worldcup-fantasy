-- FIFA 2026 World Cup Seed Data
-- Official Draw Results from December 5, 2025
-- 48 Teams in 12 Groups + 72 Group Stage Matches
-- Tournament: June 11 - July 19, 2026

-- ============================================
-- CLEAR EXISTING DATA (run this first)
-- ============================================
DELETE FROM public.predictions;
DELETE FROM public.matches;
DELETE FROM public.teams;

-- ============================================
-- TEAMS (48 teams in 12 groups)
-- Based on Official FIFA 2026 World Cup Draw
-- ============================================

-- Group A: Mexico, South Africa, South Korea, TBD (UEFA Path D)
INSERT INTO public.teams (name, code, flag_url, group_letter) VALUES
('Mexico', 'MEX', 'https://flagcdn.com/w80/mx.png', 'A'),
('South Africa', 'RSA', 'https://flagcdn.com/w80/za.png', 'A'),
('South Korea', 'KOR', 'https://flagcdn.com/w80/kr.png', 'A'),
('UEFA Path D', 'UD1', 'https://flagcdn.com/w80/eu.png', 'A');

-- Group B: Canada, TBD (UEFA Path A), Qatar, Switzerland
INSERT INTO public.teams (name, code, flag_url, group_letter) VALUES
('Canada', 'CAN', 'https://flagcdn.com/w80/ca.png', 'B'),
('UEFA Path A', 'UA1', 'https://flagcdn.com/w80/eu.png', 'B'),
('Qatar', 'QAT', 'https://flagcdn.com/w80/qa.png', 'B'),
('Switzerland', 'SUI', 'https://flagcdn.com/w80/ch.png', 'B');

-- Group C: Brazil, Morocco, Haiti, Scotland
INSERT INTO public.teams (name, code, flag_url, group_letter) VALUES
('Brazil', 'BRA', 'https://flagcdn.com/w80/br.png', 'C'),
('Morocco', 'MAR', 'https://flagcdn.com/w80/ma.png', 'C'),
('Haiti', 'HAI', 'https://flagcdn.com/w80/ht.png', 'C'),
('Scotland', 'SCO', 'https://flagcdn.com/w80/gb-sct.png', 'C');

-- Group D: United States, Paraguay, Australia, TBD (UEFA Path C)
INSERT INTO public.teams (name, code, flag_url, group_letter) VALUES
('United States', 'USA', 'https://flagcdn.com/w80/us.png', 'D'),
('Paraguay', 'PAR', 'https://flagcdn.com/w80/py.png', 'D'),
('Australia', 'AUS', 'https://flagcdn.com/w80/au.png', 'D'),
('UEFA Path C', 'UC1', 'https://flagcdn.com/w80/eu.png', 'D');

-- Group E: Germany, Curacao, Ivory Coast, Ecuador
INSERT INTO public.teams (name, code, flag_url, group_letter) VALUES
('Germany', 'GER', 'https://flagcdn.com/w80/de.png', 'E'),
('Curacao', 'CUR', 'https://flagcdn.com/w80/cw.png', 'E'),
('Ivory Coast', 'CIV', 'https://flagcdn.com/w80/ci.png', 'E'),
('Ecuador', 'ECU', 'https://flagcdn.com/w80/ec.png', 'E');

-- Group F: Netherlands, Japan, TBD (UEFA Path B), Tunisia
INSERT INTO public.teams (name, code, flag_url, group_letter) VALUES
('Netherlands', 'NED', 'https://flagcdn.com/w80/nl.png', 'F'),
('Japan', 'JPN', 'https://flagcdn.com/w80/jp.png', 'F'),
('UEFA Path B', 'UB1', 'https://flagcdn.com/w80/eu.png', 'F'),
('Tunisia', 'TUN', 'https://flagcdn.com/w80/tn.png', 'F');

-- Group G: Belgium, Egypt, Iran, New Zealand
INSERT INTO public.teams (name, code, flag_url, group_letter) VALUES
('Belgium', 'BEL', 'https://flagcdn.com/w80/be.png', 'G'),
('Egypt', 'EGY', 'https://flagcdn.com/w80/eg.png', 'G'),
('Iran', 'IRN', 'https://flagcdn.com/w80/ir.png', 'G'),
('New Zealand', 'NZL', 'https://flagcdn.com/w80/nz.png', 'G');

-- Group H: Spain, Cape Verde, Saudi Arabia, Uruguay
INSERT INTO public.teams (name, code, flag_url, group_letter) VALUES
('Spain', 'ESP', 'https://flagcdn.com/w80/es.png', 'H'),
('Cape Verde', 'CPV', 'https://flagcdn.com/w80/cv.png', 'H'),
('Saudi Arabia', 'KSA', 'https://flagcdn.com/w80/sa.png', 'H'),
('Uruguay', 'URU', 'https://flagcdn.com/w80/uy.png', 'H');

-- Group I: France, Senegal, TBD (IC Path 2), Norway
INSERT INTO public.teams (name, code, flag_url, group_letter) VALUES
('France', 'FRA', 'https://flagcdn.com/w80/fr.png', 'I'),
('Senegal', 'SEN', 'https://flagcdn.com/w80/sn.png', 'I'),
('IC Path 2', 'IC2', 'https://flagcdn.com/w80/un.png', 'I'),
('Norway', 'NOR', 'https://flagcdn.com/w80/no.png', 'I');

-- Group J: Argentina, Algeria, Austria, Jordan
INSERT INTO public.teams (name, code, flag_url, group_letter) VALUES
('Argentina', 'ARG', 'https://flagcdn.com/w80/ar.png', 'J'),
('Algeria', 'ALG', 'https://flagcdn.com/w80/dz.png', 'J'),
('Austria', 'AUT', 'https://flagcdn.com/w80/at.png', 'J'),
('Jordan', 'JOR', 'https://flagcdn.com/w80/jo.png', 'J');

-- Group K: Portugal, TBD (IC Path 1), Uzbekistan, Colombia
INSERT INTO public.teams (name, code, flag_url, group_letter) VALUES
('Portugal', 'POR', 'https://flagcdn.com/w80/pt.png', 'K'),
('IC Path 1', 'IC1', 'https://flagcdn.com/w80/un.png', 'K'),
('Uzbekistan', 'UZB', 'https://flagcdn.com/w80/uz.png', 'K'),
('Colombia', 'COL', 'https://flagcdn.com/w80/co.png', 'K');

-- Group L: England, Croatia, Ghana, Panama
INSERT INTO public.teams (name, code, flag_url, group_letter) VALUES
('England', 'ENG', 'https://flagcdn.com/w80/gb-eng.png', 'L'),
('Croatia', 'CRO', 'https://flagcdn.com/w80/hr.png', 'L'),
('Ghana', 'GHA', 'https://flagcdn.com/w80/gh.png', 'L'),
('Panama', 'PAN', 'https://flagcdn.com/w80/pa.png', 'L');

-- ============================================
-- GROUP STAGE MATCHES (72 matches)
-- FIFA 2026: June 11 - June 28, 2026
-- Venues across USA, Mexico, Canada
-- ============================================

-- ====================
-- MATCHDAY 1 (June 11-14)
-- ====================

-- Group A - Matchday 1 (June 11)
-- Opening match: Mexico as host plays first
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'MEX'), (SELECT id FROM teams WHERE code = 'UD1'), '2026-06-11 20:00:00-05', 'Estadio Azteca', 'Ciudad de México', 'A');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'RSA'), (SELECT id FROM teams WHERE code = 'KOR'), '2026-06-11 17:00:00-05', 'Rose Bowl', 'Los Ángeles', 'A');

-- Group B - Matchday 1 (June 11)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'CAN'), (SELECT id FROM teams WHERE code = 'SUI'), '2026-06-11 14:00:00-05', 'BMO Field', 'Toronto', 'B');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'QAT'), (SELECT id FROM teams WHERE code = 'UA1'), '2026-06-11 11:00:00-05', 'BC Place', 'Vancouver', 'B');

-- Group C - Matchday 1 (June 12)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'BRA'), (SELECT id FROM teams WHERE code = 'SCO'), '2026-06-12 20:00:00-05', 'SoFi Stadium', 'Los Ángeles', 'C');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'MAR'), (SELECT id FROM teams WHERE code = 'HAI'), '2026-06-12 17:00:00-05', 'Hard Rock Stadium', 'Miami', 'C');

-- Group D - Matchday 1 (June 12)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'USA'), (SELECT id FROM teams WHERE code = 'UC1'), '2026-06-12 14:00:00-05', 'AT&T Stadium', 'Dallas', 'D');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'PAR'), (SELECT id FROM teams WHERE code = 'AUS'), '2026-06-12 11:00:00-05', 'NRG Stadium', 'Houston', 'D');

-- Group E - Matchday 1 (June 13)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'GER'), (SELECT id FROM teams WHERE code = 'ECU'), '2026-06-13 20:00:00-05', 'MetLife Stadium', 'Nueva York', 'E');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'CIV'), (SELECT id FROM teams WHERE code = 'CUR'), '2026-06-13 17:00:00-05', 'Lincoln Financial Field', 'Filadelfia', 'E');

-- Group F - Matchday 1 (June 13)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'NED'), (SELECT id FROM teams WHERE code = 'TUN'), '2026-06-13 14:00:00-05', 'Mercedes-Benz Stadium', 'Atlanta', 'F');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'JPN'), (SELECT id FROM teams WHERE code = 'UB1'), '2026-06-13 11:00:00-05', 'Lumen Field', 'Seattle', 'F');

-- Group G - Matchday 1 (June 14)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'BEL'), (SELECT id FROM teams WHERE code = 'NZL'), '2026-06-14 20:00:00-05', 'Gillette Stadium', 'Boston', 'G');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'EGY'), (SELECT id FROM teams WHERE code = 'IRN'), '2026-06-14 17:00:00-05', 'Levi''s Stadium', 'San Francisco', 'G');

-- Group H - Matchday 1 (June 14)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'ESP'), (SELECT id FROM teams WHERE code = 'URU'), '2026-06-14 14:00:00-05', 'Hard Rock Stadium', 'Miami', 'H');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'KSA'), (SELECT id FROM teams WHERE code = 'CPV'), '2026-06-14 11:00:00-05', 'BBVA Stadium', 'Monterrey', 'H');

-- ====================
-- MATCHDAY 1 CONTINUED (June 15-16)
-- ====================

-- Group I - Matchday 1 (June 15)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'FRA'), (SELECT id FROM teams WHERE code = 'NOR'), '2026-06-15 20:00:00-05', 'SoFi Stadium', 'Los Ángeles', 'I');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'SEN'), (SELECT id FROM teams WHERE code = 'IC2'), '2026-06-15 17:00:00-05', 'Arrowhead Stadium', 'Kansas City', 'I');

-- Group J - Matchday 1 (June 15)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'ARG'), (SELECT id FROM teams WHERE code = 'JOR'), '2026-06-15 14:00:00-05', 'Hard Rock Stadium', 'Miami', 'J');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'ALG'), (SELECT id FROM teams WHERE code = 'AUT'), '2026-06-15 11:00:00-05', 'Estadio Akron', 'Guadalajara', 'J');

-- Group K - Matchday 1 (June 16)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'POR'), (SELECT id FROM teams WHERE code = 'COL'), '2026-06-16 20:00:00-05', 'MetLife Stadium', 'Nueva York', 'K');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'UZB'), (SELECT id FROM teams WHERE code = 'IC1'), '2026-06-16 17:00:00-05', 'Levi''s Stadium', 'San Francisco', 'K');

-- Group L - Matchday 1 (June 16)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'ENG'), (SELECT id FROM teams WHERE code = 'PAN'), '2026-06-16 14:00:00-05', 'Mercedes-Benz Stadium', 'Atlanta', 'L');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'CRO'), (SELECT id FROM teams WHERE code = 'GHA'), '2026-06-16 11:00:00-05', 'BC Place', 'Vancouver', 'L');

-- ====================
-- MATCHDAY 2 (June 17-20)
-- ====================

-- Group A - Matchday 2 (June 17)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'MEX'), (SELECT id FROM teams WHERE code = 'RSA'), '2026-06-17 20:00:00-05', 'Estadio Azteca', 'Ciudad de México', 'A');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'KOR'), (SELECT id FROM teams WHERE code = 'UD1'), '2026-06-17 17:00:00-05', 'Rose Bowl', 'Los Ángeles', 'A');

-- Group B - Matchday 2 (June 17)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'CAN'), (SELECT id FROM teams WHERE code = 'QAT'), '2026-06-17 14:00:00-05', 'BMO Field', 'Toronto', 'B');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'SUI'), (SELECT id FROM teams WHERE code = 'UA1'), '2026-06-17 11:00:00-05', 'Gillette Stadium', 'Boston', 'B');

-- Group C - Matchday 2 (June 18)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'BRA'), (SELECT id FROM teams WHERE code = 'MAR'), '2026-06-18 20:00:00-05', 'SoFi Stadium', 'Los Ángeles', 'C');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'SCO'), (SELECT id FROM teams WHERE code = 'HAI'), '2026-06-18 17:00:00-05', 'Hard Rock Stadium', 'Miami', 'C');

-- Group D - Matchday 2 (June 18)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'USA'), (SELECT id FROM teams WHERE code = 'PAR'), '2026-06-18 14:00:00-05', 'AT&T Stadium', 'Dallas', 'D');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'AUS'), (SELECT id FROM teams WHERE code = 'UC1'), '2026-06-18 11:00:00-05', 'NRG Stadium', 'Houston', 'D');

-- Group E - Matchday 2 (June 19)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'GER'), (SELECT id FROM teams WHERE code = 'CIV'), '2026-06-19 20:00:00-05', 'MetLife Stadium', 'Nueva York', 'E');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'ECU'), (SELECT id FROM teams WHERE code = 'CUR'), '2026-06-19 17:00:00-05', 'Lincoln Financial Field', 'Filadelfia', 'E');

-- Group F - Matchday 2 (June 19)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'NED'), (SELECT id FROM teams WHERE code = 'JPN'), '2026-06-19 14:00:00-05', 'Mercedes-Benz Stadium', 'Atlanta', 'F');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'TUN'), (SELECT id FROM teams WHERE code = 'UB1'), '2026-06-19 11:00:00-05', 'Lumen Field', 'Seattle', 'F');

-- Group G - Matchday 2 (June 20)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'BEL'), (SELECT id FROM teams WHERE code = 'EGY'), '2026-06-20 20:00:00-05', 'Gillette Stadium', 'Boston', 'G');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'IRN'), (SELECT id FROM teams WHERE code = 'NZL'), '2026-06-20 17:00:00-05', 'Levi''s Stadium', 'San Francisco', 'G');

-- Group H - Matchday 2 (June 20)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'ESP'), (SELECT id FROM teams WHERE code = 'KSA'), '2026-06-20 14:00:00-05', 'Hard Rock Stadium', 'Miami', 'H');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'URU'), (SELECT id FROM teams WHERE code = 'CPV'), '2026-06-20 11:00:00-05', 'BBVA Stadium', 'Monterrey', 'H');

-- ====================
-- MATCHDAY 2 CONTINUED (June 21-22)
-- ====================

-- Group I - Matchday 2 (June 21)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'FRA'), (SELECT id FROM teams WHERE code = 'SEN'), '2026-06-21 20:00:00-05', 'SoFi Stadium', 'Los Ángeles', 'I');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'NOR'), (SELECT id FROM teams WHERE code = 'IC2'), '2026-06-21 17:00:00-05', 'Arrowhead Stadium', 'Kansas City', 'I');

-- Group J - Matchday 2 (June 21)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'ARG'), (SELECT id FROM teams WHERE code = 'ALG'), '2026-06-21 14:00:00-05', 'Hard Rock Stadium', 'Miami', 'J');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'JOR'), (SELECT id FROM teams WHERE code = 'AUT'), '2026-06-21 11:00:00-05', 'Estadio Akron', 'Guadalajara', 'J');

-- Group K - Matchday 2 (June 22)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'POR'), (SELECT id FROM teams WHERE code = 'UZB'), '2026-06-22 20:00:00-05', 'MetLife Stadium', 'Nueva York', 'K');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'COL'), (SELECT id FROM teams WHERE code = 'IC1'), '2026-06-22 17:00:00-05', 'Levi''s Stadium', 'San Francisco', 'K');

-- Group L - Matchday 2 (June 22)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'ENG'), (SELECT id FROM teams WHERE code = 'CRO'), '2026-06-22 14:00:00-05', 'Mercedes-Benz Stadium', 'Atlanta', 'L');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'PAN'), (SELECT id FROM teams WHERE code = 'GHA'), '2026-06-22 11:00:00-05', 'BC Place', 'Vancouver', 'L');

-- ====================
-- MATCHDAY 3 (June 23-28) - Final Group Stage Matches
-- (Both matches in each group played simultaneously)
-- ====================

-- Group A - Matchday 3 (June 23)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'MEX'), (SELECT id FROM teams WHERE code = 'KOR'), '2026-06-23 19:00:00-05', 'Estadio Azteca', 'Ciudad de México', 'A');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'UD1'), (SELECT id FROM teams WHERE code = 'RSA'), '2026-06-23 19:00:00-05', 'Rose Bowl', 'Los Ángeles', 'A');

-- Group B - Matchday 3 (June 23)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'CAN'), (SELECT id FROM teams WHERE code = 'UA1'), '2026-06-23 15:00:00-05', 'BMO Field', 'Toronto', 'B');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'SUI'), (SELECT id FROM teams WHERE code = 'QAT'), '2026-06-23 15:00:00-05', 'BC Place', 'Vancouver', 'B');

-- Group C - Matchday 3 (June 24)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'BRA'), (SELECT id FROM teams WHERE code = 'HAI'), '2026-06-24 19:00:00-05', 'SoFi Stadium', 'Los Ángeles', 'C');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'SCO'), (SELECT id FROM teams WHERE code = 'MAR'), '2026-06-24 19:00:00-05', 'Hard Rock Stadium', 'Miami', 'C');

-- Group D - Matchday 3 (June 24)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'USA'), (SELECT id FROM teams WHERE code = 'AUS'), '2026-06-24 15:00:00-05', 'AT&T Stadium', 'Dallas', 'D');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'UC1'), (SELECT id FROM teams WHERE code = 'PAR'), '2026-06-24 15:00:00-05', 'NRG Stadium', 'Houston', 'D');

-- Group E - Matchday 3 (June 25)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'GER'), (SELECT id FROM teams WHERE code = 'CUR'), '2026-06-25 19:00:00-05', 'MetLife Stadium', 'Nueva York', 'E');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'ECU'), (SELECT id FROM teams WHERE code = 'CIV'), '2026-06-25 19:00:00-05', 'Lincoln Financial Field', 'Filadelfia', 'E');

-- Group F - Matchday 3 (June 25)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'NED'), (SELECT id FROM teams WHERE code = 'UB1'), '2026-06-25 15:00:00-05', 'Mercedes-Benz Stadium', 'Atlanta', 'F');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'JPN'), (SELECT id FROM teams WHERE code = 'TUN'), '2026-06-25 15:00:00-05', 'Lumen Field', 'Seattle', 'F');

-- Group G - Matchday 3 (June 26)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'BEL'), (SELECT id FROM teams WHERE code = 'IRN'), '2026-06-26 19:00:00-05', 'Gillette Stadium', 'Boston', 'G');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'NZL'), (SELECT id FROM teams WHERE code = 'EGY'), '2026-06-26 19:00:00-05', 'Levi''s Stadium', 'San Francisco', 'G');

-- Group H - Matchday 3 (June 26)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'ESP'), (SELECT id FROM teams WHERE code = 'CPV'), '2026-06-26 15:00:00-05', 'Hard Rock Stadium', 'Miami', 'H');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'URU'), (SELECT id FROM teams WHERE code = 'KSA'), '2026-06-26 15:00:00-05', 'BBVA Stadium', 'Monterrey', 'H');

-- Group I - Matchday 3 (June 27)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'FRA'), (SELECT id FROM teams WHERE code = 'IC2'), '2026-06-27 19:00:00-05', 'SoFi Stadium', 'Los Ángeles', 'I');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'NOR'), (SELECT id FROM teams WHERE code = 'SEN'), '2026-06-27 19:00:00-05', 'Arrowhead Stadium', 'Kansas City', 'I');

-- Group J - Matchday 3 (June 27)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'ARG'), (SELECT id FROM teams WHERE code = 'AUT'), '2026-06-27 15:00:00-05', 'Hard Rock Stadium', 'Miami', 'J');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'JOR'), (SELECT id FROM teams WHERE code = 'ALG'), '2026-06-27 15:00:00-05', 'Estadio Akron', 'Guadalajara', 'J');

-- Group K - Matchday 3 (June 28)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'POR'), (SELECT id FROM teams WHERE code = 'IC1'), '2026-06-28 19:00:00-05', 'MetLife Stadium', 'Nueva York', 'K');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'COL'), (SELECT id FROM teams WHERE code = 'UZB'), '2026-06-28 19:00:00-05', 'Levi''s Stadium', 'San Francisco', 'K');

-- Group L - Matchday 3 (June 28)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'ENG'), (SELECT id FROM teams WHERE code = 'GHA'), '2026-06-28 15:00:00-05', 'Mercedes-Benz Stadium', 'Atlanta', 'L');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code = 'CRO'), (SELECT id FROM teams WHERE code = 'PAN'), '2026-06-28 15:00:00-05', 'BC Place', 'Vancouver', 'L');

-- ============================================
-- VERIFY DATA
-- ============================================
-- Run these queries to verify:
-- SELECT group_letter, COUNT(*) FROM teams GROUP BY group_letter ORDER BY group_letter;
-- Should show 4 teams per group (12 groups x 4 = 48 teams)

-- SELECT group_letter, COUNT(*) FROM matches GROUP BY group_letter ORDER BY group_letter;
-- Should show 6 matches per group (12 groups x 6 = 72 matches)
