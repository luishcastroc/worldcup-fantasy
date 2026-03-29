-- FIFA 2026 World Cup - Corrected Match Schedule
-- Source: Official FIFA schedule (fifa.com, NBC Sports, Fox Sports)
-- All 72 group stage matches with verified dates, times, and venues
--
-- WARNING: This truncates all existing matches AND predictions (cascade).
-- Existing predictions are invalidated because the previous schedule was incorrect.

TRUNCATE public.matches RESTART IDENTITY CASCADE;

-- ============================================
-- MATCHDAY 1 (June 11–17)
-- ============================================

-- Group A
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='MEX'),(SELECT id FROM teams WHERE code='RSA'),'2026-06-11 13:00:00-05','Estadio Azteca','Ciudad de México','A');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='KOR'),(SELECT id FROM teams WHERE code='UD1'),'2026-06-11 21:00:00-05','Estadio Akron','Guadalajara','A');

-- Group B
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='CAN'),(SELECT id FROM teams WHERE code='UA1'),'2026-06-12 15:00:00-04','BMO Field','Toronto','B');

-- Group D
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='USA'),(SELECT id FROM teams WHERE code='PAR'),'2026-06-12 18:00:00-07','SoFi Stadium','Los Ángeles','D');

-- Group D / B
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='AUS'),(SELECT id FROM teams WHERE code='UC1'),'2026-06-13 21:00:00-07','BC Place','Vancouver','D');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='QAT'),(SELECT id FROM teams WHERE code='SUI'),'2026-06-13 12:00:00-07','Levi''s Stadium','San Francisco','B');

-- Group C
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='BRA'),(SELECT id FROM teams WHERE code='MAR'),'2026-06-13 18:00:00-04','MetLife Stadium','Nueva York','C');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='HAI'),(SELECT id FROM teams WHERE code='SCO'),'2026-06-13 21:00:00-04','Gillette Stadium','Boston','C');

-- Group E / F
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='GER'),(SELECT id FROM teams WHERE code='CUR'),'2026-06-14 12:00:00-05','NRG Stadium','Houston','E');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='NED'),(SELECT id FROM teams WHERE code='JPN'),'2026-06-14 15:00:00-05','AT&T Stadium','Dallas','F');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='CIV'),(SELECT id FROM teams WHERE code='ECU'),'2026-06-14 18:00:00-04','Lincoln Financial Field','Filadelfia','E');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='UB1'),(SELECT id FROM teams WHERE code='TUN'),'2026-06-14 21:00:00-05','Estadio BBVA','Monterrey','F');

-- Group H / G
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='ESP'),(SELECT id FROM teams WHERE code='CPV'),'2026-06-15 12:00:00-04','Mercedes-Benz Stadium','Atlanta','H');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='BEL'),(SELECT id FROM teams WHERE code='EGY'),'2026-06-15 15:00:00-07','Lumen Field','Seattle','G');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='KSA'),(SELECT id FROM teams WHERE code='URU'),'2026-06-15 18:00:00-04','Hard Rock Stadium','Miami','H');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='IRN'),(SELECT id FROM teams WHERE code='NZL'),'2026-06-15 21:00:00-07','SoFi Stadium','Los Ángeles','G');

-- Group I / J
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='FRA'),(SELECT id FROM teams WHERE code='SEN'),'2026-06-16 15:00:00-04','MetLife Stadium','Nueva York','I');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='IC2'),(SELECT id FROM teams WHERE code='NOR'),'2026-06-16 18:00:00-04','Gillette Stadium','Boston','I');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='ARG'),(SELECT id FROM teams WHERE code='ALG'),'2026-06-16 21:00:00-05','Arrowhead Stadium','Kansas City','J');

-- Group J / K / L
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='POR'),(SELECT id FROM teams WHERE code='IC1'),'2026-06-17 13:00:00-05','NRG Stadium','Houston','K');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='ENG'),(SELECT id FROM teams WHERE code='CRO'),'2026-06-17 15:00:00-05','AT&T Stadium','Dallas','L');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='GHA'),(SELECT id FROM teams WHERE code='PAN'),'2026-06-17 19:00:00-04','BMO Field','Toronto','L');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='AUT'),(SELECT id FROM teams WHERE code='JOR'),'2026-06-17 21:00:00-07','Levi''s Stadium','San Francisco','J');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='UZB'),(SELECT id FROM teams WHERE code='COL'),'2026-06-17 21:00:00-05','Estadio Azteca','Ciudad de México','K');

-- ============================================
-- MATCHDAY 2 (June 18–23)
-- ============================================

-- Group A / B
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='UD1'),(SELECT id FROM teams WHERE code='RSA'),'2026-06-18 12:00:00-04','Mercedes-Benz Stadium','Atlanta','A');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='SUI'),(SELECT id FROM teams WHERE code='UA1'),'2026-06-18 12:00:00-07','SoFi Stadium','Los Ángeles','B');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='CAN'),(SELECT id FROM teams WHERE code='QAT'),'2026-06-18 15:00:00-07','BC Place','Vancouver','B');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='MEX'),(SELECT id FROM teams WHERE code='KOR'),'2026-06-18 20:00:00-05','Estadio Akron','Guadalajara','A');

-- Group D / C
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='USA'),(SELECT id FROM teams WHERE code='AUS'),'2026-06-19 15:00:00-07','Lumen Field','Seattle','D');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='SCO'),(SELECT id FROM teams WHERE code='MAR'),'2026-06-19 18:00:00-04','Gillette Stadium','Boston','C');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='BRA'),(SELECT id FROM teams WHERE code='HAI'),'2026-06-19 21:00:00-04','Lincoln Financial Field','Filadelfia','C');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='UC1'),(SELECT id FROM teams WHERE code='PAR'),'2026-06-19 21:00:00-07','Levi''s Stadium','San Francisco','D');

-- Group F / E
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='NED'),(SELECT id FROM teams WHERE code='UB1'),'2026-06-20 12:00:00-05','NRG Stadium','Houston','F');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='GER'),(SELECT id FROM teams WHERE code='CIV'),'2026-06-20 16:00:00-04','BMO Field','Toronto','E');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='ECU'),(SELECT id FROM teams WHERE code='CUR'),'2026-06-20 20:00:00-05','Arrowhead Stadium','Kansas City','E');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='TUN'),(SELECT id FROM teams WHERE code='JPN'),'2026-06-20 22:00:00-05','Estadio BBVA','Monterrey','F');

-- Group H / G
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='ESP'),(SELECT id FROM teams WHERE code='KSA'),'2026-06-21 12:00:00-04','Mercedes-Benz Stadium','Atlanta','H');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='BEL'),(SELECT id FROM teams WHERE code='IRN'),'2026-06-21 15:00:00-07','SoFi Stadium','Los Ángeles','G');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='URU'),(SELECT id FROM teams WHERE code='CPV'),'2026-06-21 18:00:00-04','Hard Rock Stadium','Miami','H');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='NZL'),(SELECT id FROM teams WHERE code='EGY'),'2026-06-21 21:00:00-07','BC Place','Vancouver','G');

-- Group J / I
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='ARG'),(SELECT id FROM teams WHERE code='AUT'),'2026-06-22 13:00:00-05','AT&T Stadium','Dallas','J');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='FRA'),(SELECT id FROM teams WHERE code='IC2'),'2026-06-22 17:00:00-04','Lincoln Financial Field','Filadelfia','I');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='NOR'),(SELECT id FROM teams WHERE code='SEN'),'2026-06-22 20:00:00-04','MetLife Stadium','Nueva York','I');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='JOR'),(SELECT id FROM teams WHERE code='ALG'),'2026-06-22 23:00:00-07','Levi''s Stadium','San Francisco','J');

-- Group K / L
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='POR'),(SELECT id FROM teams WHERE code='UZB'),'2026-06-23 13:00:00-05','NRG Stadium','Houston','K');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='ENG'),(SELECT id FROM teams WHERE code='GHA'),'2026-06-23 16:00:00-04','Gillette Stadium','Boston','L');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='PAN'),(SELECT id FROM teams WHERE code='CRO'),'2026-06-23 19:00:00-04','BMO Field','Toronto','L');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='COL'),(SELECT id FROM teams WHERE code='IC1'),'2026-06-23 22:00:00-05','Estadio Akron','Guadalajara','K');

-- ============================================
-- MATCHDAY 3 (June 24–27) — simultaneous pairs per group
-- ============================================

-- Group B (simultaneous, 22:00 UTC)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='SUI'),(SELECT id FROM teams WHERE code='CAN'),'2026-06-24 15:00:00-07','BC Place','Vancouver','B');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='UA1'),(SELECT id FROM teams WHERE code='QAT'),'2026-06-24 15:00:00-07','Lumen Field','Seattle','B');

-- Group C (simultaneous, 22:00 UTC)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='SCO'),(SELECT id FROM teams WHERE code='BRA'),'2026-06-24 18:00:00-04','Hard Rock Stadium','Miami','C');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='MAR'),(SELECT id FROM teams WHERE code='HAI'),'2026-06-24 18:00:00-04','Mercedes-Benz Stadium','Atlanta','C');

-- Group A (simultaneous, 01:00+1 UTC)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='UD1'),(SELECT id FROM teams WHERE code='MEX'),'2026-06-24 20:00:00-05','Estadio Azteca','Ciudad de México','A');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='RSA'),(SELECT id FROM teams WHERE code='KOR'),'2026-06-24 20:00:00-05','Estadio BBVA','Monterrey','A');

-- Group E (simultaneous, 20:00 UTC)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='CUR'),(SELECT id FROM teams WHERE code='CIV'),'2026-06-25 16:00:00-04','Lincoln Financial Field','Filadelfia','E');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='ECU'),(SELECT id FROM teams WHERE code='GER'),'2026-06-25 16:00:00-04','MetLife Stadium','Nueva York','E');

-- Group F (simultaneous, 00:00+1 UTC)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='JPN'),(SELECT id FROM teams WHERE code='UB1'),'2026-06-25 19:00:00-05','AT&T Stadium','Dallas','F');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='TUN'),(SELECT id FROM teams WHERE code='NED'),'2026-06-25 19:00:00-05','Arrowhead Stadium','Kansas City','F');

-- Group D (simultaneous, 02:00+1 UTC)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='UC1'),(SELECT id FROM teams WHERE code='USA'),'2026-06-25 19:00:00-07','SoFi Stadium','Los Ángeles','D');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='PAR'),(SELECT id FROM teams WHERE code='AUS'),'2026-06-25 19:00:00-07','Levi''s Stadium','San Francisco','D');

-- Group I (simultaneous, 19:00 UTC)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='NOR'),(SELECT id FROM teams WHERE code='FRA'),'2026-06-26 15:00:00-04','Gillette Stadium','Boston','I');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='SEN'),(SELECT id FROM teams WHERE code='IC2'),'2026-06-26 15:00:00-04','BMO Field','Toronto','I');

-- Group H (simultaneous, 01:00+1 UTC)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='CPV'),(SELECT id FROM teams WHERE code='KSA'),'2026-06-26 20:00:00-05','NRG Stadium','Houston','H');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='URU'),(SELECT id FROM teams WHERE code='ESP'),'2026-06-26 20:00:00-05','Estadio Akron','Guadalajara','H');

-- Group G (simultaneous, 03:00+1 UTC)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='EGY'),(SELECT id FROM teams WHERE code='IRN'),'2026-06-26 20:00:00-07','Lumen Field','Seattle','G');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='NZL'),(SELECT id FROM teams WHERE code='BEL'),'2026-06-26 20:00:00-07','BC Place','Vancouver','G');

-- Group L (simultaneous, 21:00 UTC)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='PAN'),(SELECT id FROM teams WHERE code='ENG'),'2026-06-27 17:00:00-04','MetLife Stadium','Nueva York','L');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='CRO'),(SELECT id FROM teams WHERE code='GHA'),'2026-06-27 17:00:00-04','Lincoln Financial Field','Filadelfia','L');

-- Group K (simultaneous, 23:30 UTC)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='COL'),(SELECT id FROM teams WHERE code='POR'),'2026-06-27 19:30:00-04','Hard Rock Stadium','Miami','K');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='IC1'),(SELECT id FROM teams WHERE code='UZB'),'2026-06-27 19:30:00-04','Mercedes-Benz Stadium','Atlanta','K');

-- Group J (simultaneous, 03:00+1 UTC)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='ALG'),(SELECT id FROM teams WHERE code='AUT'),'2026-06-27 22:00:00-05','Arrowhead Stadium','Kansas City','J');
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, city, group_letter) VALUES
((SELECT id FROM teams WHERE code='JOR'),(SELECT id FROM teams WHERE code='ARG'),'2026-06-27 22:00:00-05','AT&T Stadium','Dallas','J');
