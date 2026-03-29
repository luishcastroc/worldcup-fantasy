# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server (ng serve)
npm run dev        # Dev server with auto-open in browser
npm run build      # Production build → dist/worldcup-fantasy/browser/
```

No lint or test scripts are configured in this project.

## Architecture

**FIFA 2026 World Cup prediction game** — Angular 19 SPA with Supabase backend, deployed on Vercel.

**Tech stack:** Angular 19 (standalone components + signals), Tailwind CSS, Supabase (Postgres + Google OAuth), deployed as SPA via Vercel with rewrite rules.

### Data flow

1. `SupabaseService` — owns the Supabase client, auth session signals (`currentUser`, `session`)
2. `AuthService` — wraps SupabaseService, adds profile management and display helpers
3. Feature services (`MatchesService`, `PredictionsService`, `RankingsService`) — query Supabase tables and expose data via Angular signals
4. Pages consume services via signals; components receive data via `@Input()`

### Routing & auth

Routes live in `src/app/app.routes.ts`. All routes except `/login` and `/auth/callback` are protected by `authGuard`. The OAuth callback is handled by `src/app/pages/auth/callback.page.ts`.

### Database (Supabase)

Migrations in `supabase/migrations/`:
- Core tables: `profiles`, `teams`, `matches`, `predictions`, `settings`
- `user_rankings` — a Postgres view used for leaderboard queries (avoid recomputing ranking logic in the frontend)

**Scoring:** 3 pts for exact score, 1 pt for correct outcome (win/draw/loss), 0 pts otherwise. Tiebreaker: most exact predictions → most total goals in exact predictions. Scoring logic lives in `src/app/models/prediction.model.ts` (`calculatePoints`, `getPredictionOutcome`).

### State management

Angular Signals throughout — no NgRx or other state library. Derived/computed state uses `computed()`. Services hold signal-based state that pages subscribe to reactively.

### Styling

Tailwind CSS with a custom FIFA-themed palette defined in `tailwind.config.js`:
- `gold` → `#D4AF37`
- `dark` → `#1a1a2e`
- `accent` → `#e94560`

### Environment

Supabase URL and anon key live in `src/environments/environment.ts`. The prediction deadline is `2026-06-11T00:00:00Z` (also stored in the `settings` Supabase table).
