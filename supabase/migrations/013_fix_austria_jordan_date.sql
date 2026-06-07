-- Fix Austria vs Jordan group-stage date
-- =======================================
-- Migration 003 scheduled Austria vs Jordan (Group J, Levi's Stadium,
-- Santa Clara) on 2026-06-17, but the official FIFA 2026 schedule places it on
-- 2026-06-16 (Match 20, 9:00 PM PT). The kickoff time and venue are unchanged;
-- only the calendar day moves back one day.
--
-- A full cross-check of all 72 group-stage matches against the official FIFA /
-- ESPN fixture list found this to be the only incorrect date.
--
-- Updating the existing match row (rather than re-inserting) preserves every
-- prediction attached to this fixture.
-- Source: ESPN / FIFA official 2026 World Cup fixture list.

UPDATE public.matches
SET match_date = '2026-06-16 21:00:00-07'
WHERE home_team_id = (SELECT id FROM public.teams WHERE code = 'AUT')
  AND away_team_id = (SELECT id FROM public.teams WHERE code = 'JOR')
  AND match_date = '2026-06-17 21:00:00-07';
