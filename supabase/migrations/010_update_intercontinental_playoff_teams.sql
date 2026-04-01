-- FIFA World Cup 2026 Intercontinental Playoff Results (March 31, 2026)
-- IC Path 1: Iraq beat Bolivia 2-1
-- IC Path 2: DR Congo beat Jamaica 1-0

-- IC Path 1 → Iraq (Group K)
UPDATE public.teams
SET name = 'Iraq',
    code = 'IRQ',
    flag_url = 'https://flagcdn.com/w80/iq.png'
WHERE code = 'IC1';

-- IC Path 2 → DR Congo (Group I)
UPDATE public.teams
SET name = 'DR Congo',
    code = 'COD',
    flag_url = 'https://flagcdn.com/w80/cd.png'
WHERE code = 'IC2';
