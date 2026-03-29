# FIFA 2026 World Cup Fantasy

A prediction game for the FIFA 2026 World Cup. Predict match results and compete with friends!

## Features

- 🔐 Google Authentication via Supabase
- ⚽ Predict scores for all 72 group stage matches
- 🏆 Earn points for correct predictions
- 📊 Real-time leaderboard rankings
- 📱 Responsive design for mobile and desktop

## Scoring System

| Prediction Type | Points |
|-----------------|--------|
| Exact score match | **2 points** |
| Correct outcome (win/lose/draw) | **1 point** |
| Wrong prediction | **0 points** |

### Tiebreaker Rules
1. Total points (higher wins)
2. Number of exact predictions (higher wins)
3. Goals scored in exact predictions (higher wins)

## Tech Stack

- **Framework**: Angular 21 with Analog.js
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth (Google OAuth)
- **Database**: Supabase (PostgreSQL)
- **State Management**: Angular Signals

## Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### 1. Clone and Install

```bash
cd worldcup-fantasy
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Go to **SQL Editor** and run the migration:
   - Copy contents from `supabase/migrations/001_initial_schema.sql`
   - Run in SQL Editor

3. Seed the database with teams and matches:
   - Copy contents from `supabase/seed.sql`
   - Run in SQL Editor

4. Enable Google Auth:
   - Go to **Authentication > Providers > Google**
   - Enable Google provider
   - Add your Google OAuth credentials

5. Get your API keys:
   - Go to **Settings > API**
   - Copy your **Project URL** and **anon public** key

### 3. Configure Environment

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_PROJECT_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
  predictionDeadline: '2026-06-10T23:59:59Z',
};
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:4200](http://localhost:4200)

## Project Structure

```
src/
├── app/
│   ├── components/        # Reusable UI components
│   │   ├── countdown.component.ts
│   │   ├── match-card.component.ts
│   │   ├── navbar.component.ts
│   │   ├── prediction-form.component.ts
│   │   └── team-flag.component.ts
│   │
│   ├── guards/            # Route guards
│   │   └── auth.guard.ts
│   │
│   ├── models/            # TypeScript interfaces
│   │   ├── match.model.ts
│   │   ├── prediction.model.ts
│   │   ├── ranking.model.ts
│   │   └── team.model.ts
│   │
│   ├── pages/             # Page components
│   │   ├── auth/callback.page.ts
│   │   ├── login.page.ts
│   │   ├── matches.page.ts
│   │   ├── my-predictions.page.ts
│   │   ├── profile.page.ts
│   │   ├── rankings.page.ts
│   │   └── results.page.ts
│   │
│   ├── services/          # Data services
│   │   ├── auth.service.ts
│   │   ├── matches.service.ts
│   │   ├── predictions.service.ts
│   │   ├── rankings.service.ts
│   │   └── supabase.service.ts
│   │
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
└── styles.scss
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Build for Production

```bash
npm run build
```

Output will be in `dist/analog/`

## License

MIT
