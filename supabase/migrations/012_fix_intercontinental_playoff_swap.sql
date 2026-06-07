-- Fix swapped intercontinental playoff teams
-- =========================================
-- Migration 010 assigned the two FIFA intercontinental play-off winners to the
-- wrong groups:
--   IC Path 1 -> Iraq    (Group K)   ❌
--   IC Path 2 -> DR Congo (Group I)  ❌
--
-- Per the official FIFA 2026 final draw + group-stage schedule the slots are
-- reversed:
--   IC Path 1 -> DR Congo (Group K, with Portugal, Uzbekistan, Colombia)  ✅
--   IC Path 2 -> Iraq     (Group I, with France, Senegal, Norway)         ✅
-- Sources: en.wikipedia.org/wiki/2026_FIFA_World_Cup_draw,
--          Sky Sports Group I & Group K guides.
--
-- The placeholder match slots (dates, venues, home/away) were already correct,
-- so only the team identities need to be swapped back. This rewrites just the
-- two team rows -- no match rows change, so every existing prediction (which
-- references match_id) is preserved and stays attached to the same fixture.
--
-- teams.code has a UNIQUE constraint that Postgres checks per row mid-statement,
-- so the two codes (IRQ <-> COD) are exchanged via a temporary code inside a
-- single transaction.

BEGIN;

-- id 83: DR Congo (Group I) -> Iraq; park its code temporarily to free 'COD'
-- (code is varchar(3); 'ZZZ' is an unused placeholder)
UPDATE public.teams
SET name = 'Iraq', code = 'ZZZ', flag_url = 'https://flagcdn.com/w80/iq.png'
WHERE id = 83 AND code = 'COD';

-- id 90: Iraq (Group K) -> DR Congo; this frees 'IRQ'
UPDATE public.teams
SET name = 'DR Congo', code = 'COD', flag_url = 'https://flagcdn.com/w80/cd.png'
WHERE id = 90 AND code = 'IRQ';

-- finalize id 83's code now that 'IRQ' is free
UPDATE public.teams
SET code = 'IRQ'
WHERE id = 83 AND code = 'ZZZ';

COMMIT;
