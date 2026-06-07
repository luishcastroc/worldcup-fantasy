-- Correct group-stage kickoff times (timezone bugs)
-- ==================================================
-- Migration 003 stored several kickoff times with the wrong instant. Two
-- systematic bugs were found when cross-checking all 72 group-stage matches
-- against the official FIFA schedule (via Wikipedia's per-group match data):
--
--   1. Pacific-venue games (Santa Clara, Inglewood, Seattle, Vancouver) were
--      stored using the Eastern clock value with a Pacific (-07) offset, making
--      them 3 hours too late. Worst effect: Jordan vs Algeria landed at
--      06:00 UTC, which renders as June 23 in Mexico time (should be June 22).
--   2. Central / Mexican-venue games were off by one hour (e.g. Mexico City
--      stored as -05; Mexico City is UTC-6 with no DST since 2022).
--
-- This rewrites match_date for the 26 affected matches to the correct instant,
-- expressed in venue-local time with the venue's real UTC offset. Matches are
-- identified by their (home, away) team pair using CURRENT team codes (after
-- migrations 009/010/012). The other 46 group matches were already correct.
--
-- Only match_date changes. No status/score changes, so the points trigger
-- (fires only on scheduled->completed) does not run and predictions/results
-- are untouched. Every affected kickoff stays in the future (today is June 7),
-- so no per-match prediction lock is affected.
-- Source: en.wikipedia.org/wiki/2026_FIFA_World_Cup group-stage match data.

-- Helper note: WHERE clause matches the unique (home_team_id, away_team_id)
-- pair; each pairing is played once in the group stage.

-- Group A
UPDATE public.matches SET match_date = '2026-06-11 13:00:00-06'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='MEX')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='RSA');

-- Group B (Pacific 3h fix)
UPDATE public.matches SET match_date = '2026-06-24 12:00:00-07'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='SUI')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='CAN');
UPDATE public.matches SET match_date = '2026-06-24 12:00:00-07'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='BIH')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='QAT');

-- Group C
UPDATE public.matches SET match_date = '2026-06-19 20:30:00-04'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='BRA')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='HAI');

-- Group D (Pacific 3h / 1h fix)
UPDATE public.matches SET match_date = '2026-06-19 12:00:00-07'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='USA')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='AUS');
UPDATE public.matches SET match_date = '2026-06-19 20:00:00-07'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='TUR')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='PAR');

-- Group E
UPDATE public.matches SET match_date = '2026-06-14 19:00:00-04'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='CIV')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='ECU');
UPDATE public.matches SET match_date = '2026-06-20 19:00:00-05'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='ECU')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='CUR');

-- Group F
UPDATE public.matches SET match_date = '2026-06-20 22:00:00-06'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='TUN')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='JPN');
UPDATE public.matches SET match_date = '2026-06-25 18:00:00-05'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='JPN')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='SWE');
UPDATE public.matches SET match_date = '2026-06-25 18:00:00-05'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='TUN')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='NED');

-- Group G (Pacific 3h fix)
UPDATE public.matches SET match_date = '2026-06-15 12:00:00-07'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='BEL')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='EGY');
UPDATE public.matches SET match_date = '2026-06-15 18:00:00-07'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='IRN')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='NZL');
UPDATE public.matches SET match_date = '2026-06-21 12:00:00-07'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='BEL')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='IRN');
UPDATE public.matches SET match_date = '2026-06-21 18:00:00-07'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='NZL')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='EGY');

-- Group H
UPDATE public.matches SET match_date = '2026-06-26 19:00:00-05'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='CPV')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='KSA');
UPDATE public.matches SET match_date = '2026-06-26 18:00:00-06'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='URU')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='ESP');

-- Group J (J2 re-asserts the date fix from 013; J4 is the Jordan-Algeria 3h fix)
UPDATE public.matches SET match_date = '2026-06-16 20:00:00-05'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='ARG')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='ALG');
UPDATE public.matches SET match_date = '2026-06-16 21:00:00-07'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='AUT')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='JOR');
UPDATE public.matches SET match_date = '2026-06-22 12:00:00-05'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='ARG')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='AUT');
UPDATE public.matches SET match_date = '2026-06-22 20:00:00-07'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='JOR')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='ALG');
UPDATE public.matches SET match_date = '2026-06-27 21:00:00-05'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='ALG')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='AUT');
UPDATE public.matches SET match_date = '2026-06-27 21:00:00-05'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='JOR')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='ARG');

-- Group K
UPDATE public.matches SET match_date = '2026-06-17 12:00:00-05'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='POR')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='COD');
UPDATE public.matches SET match_date = '2026-06-23 12:00:00-05'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='POR')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='UZB');
UPDATE public.matches SET match_date = '2026-06-23 20:00:00-06'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code='COL')
  AND away_team_id = (SELECT id FROM public.teams WHERE code='COD');
