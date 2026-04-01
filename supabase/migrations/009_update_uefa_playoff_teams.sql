-- UEFA World Cup 2026 Playoff Finals Results (March 31, 2026)
-- Path A: Bosnia and Herzegovina (beat Italy on pens)
-- Path B: Sweden (beat Poland)
-- Path C: Türkiye (beat Kosovo)
-- Path D: Czechia (beat Denmark on pens)

-- UEFA Path A → Bosnia and Herzegovina (Group B)
UPDATE public.teams
SET name = 'Bosnia and Herzegovina',
    code = 'BIH',
    flag_url = 'https://flagcdn.com/w80/ba.png'
WHERE code = 'UA1';

-- UEFA Path B → Sweden (Group F)
UPDATE public.teams
SET name = 'Sweden',
    code = 'SWE',
    flag_url = 'https://flagcdn.com/w80/se.png'
WHERE code = 'UB1';

-- UEFA Path C → Türkiye (Group D)
UPDATE public.teams
SET name = 'Türkiye',
    code = 'TUR',
    flag_url = 'https://flagcdn.com/w80/tr.png'
WHERE code = 'UC1';

-- UEFA Path D → Czechia (Group A)
UPDATE public.teams
SET name = 'Czechia',
    code = 'CZE',
    flag_url = 'https://flagcdn.com/w80/cz.png'
WHERE code = 'UD1';
