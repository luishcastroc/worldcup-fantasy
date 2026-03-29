# FIFA 2026 World Cup Fantasy

A prediction game for the FIFA 2026 World Cup. Predict match results and compete with friends!

## Features

- Google Authentication via Supabase
- Predict scores for all 72 group stage matches
- Earn points for correct predictions
- Real-time leaderboard rankings
- Responsive design for mobile and desktop

## Scoring System

| Prediction Type | Points |
|-----------------|--------|
| Exact score match | **3 points** |
| Correct outcome (win/lose/draw) | **1 point** |
| Wrong prediction | **0 points** |

### Tiebreaker Rules
1. Total points (higher wins)
2. Number of exact predictions (higher wins)
3. Goals scored in exact predictions (higher wins)

## Tech Stack

- **Framework**: Angular 20 (standalone components, signals)
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth (Google OAuth)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Setup

### Prerequisites

- Node.js 22+
- npm
- Supabase account

### 1. Clone and Install

```bash
git clone https://github.com/luishcastroc/worldcup-fantasy.git
cd worldcup-fantasy
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PREDICTION_DEADLINE=2026-06-11T00:00:00Z
```

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the migrations in order via the **SQL Editor**:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_update_scoring.sql`
   - `supabase/migrations/003_fix_match_schedule.sql`

3. Seed the database with teams and matches:
   - Run `supabase/seed.sql` in the SQL Editor

4. Enable Google Auth:
   - Go to **Authentication → Providers → Google**
   - Enable Google provider and add your OAuth credentials

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:4200](http://localhost:4200)

### 5. Run Tests

```bash
npm test
```

## Deployment (Vercel)

1. Connect the GitHub repo to your Vercel project
2. Add the following environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PREDICTION_DEADLINE`
3. Vercel will build and deploy automatically on every push to `main`

Build output is in `dist/worldcup-fantasy/browser/`.

## License

MIT
