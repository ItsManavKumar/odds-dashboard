# Odds Dashboard

A live sports betting odds dashboard built with Next.js. It pulls head-to-head (h2h) odds from [The Odds API](https://the-odds-api.com/), stores snapshots in Postgres, and displays the best available prices across bookmakers with historical line movement charts.

## Features

- **Live odds board** across AFL, NRL, EPL, La Liga, Serie A, UCL, and the FIFA World Cup
- **Best price highlighting** — automatically surfaces the best home/away odds across all tracked bookmakers
- **Line movement charts** showing how odds have shifted over time for a selected game
- **Team search** to quickly filter games by team name
- **Stale data warning** if odds haven't refreshed recently (cron failure detection)
- **Automatic history pruning** — snapshots older than 30 days are purged; the dashboard shows games from the last 7 days so it isn't empty right after a data reset
- Mobile-responsive UI

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19
- [Prisma 7](https://www.prisma.io/) with the `pg` adapter, targeting PostgreSQL
- [Recharts](https://recharts.org/) for line movement visualization
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Axios](https://axios-http.com/) for calling The Odds API
- [date-fns](https://date-fns.org/) / [date-fns-tz](https://github.com/marnusw/date-fns-tz) for date formatting

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database
- An API key from [The Odds API](https://the-odds-api.com/)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with:

   ```env
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ODDS_API_KEY=your_odds_api_key
   CRON_SECRET=some_random_secret
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. Run Prisma migrations to set up the database schema:

   ```bash
   npx prisma migrate deploy
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## How It Works

- **`GET /api/odds`** — fetches current h2h odds for all tracked sports from The Odds API and saves a snapshot per bookmaker/game to Postgres. Also purges snapshots for games that commenced more than 30 days ago.
- **`GET /api/markets?sport=<sport_key>`** — returns the latest games and bookmaker odds for a given sport (last 7 days), including a `staleWarning` flag if the most recent fetch is more than 5 hours old.
- **`GET /api/history?home=<team>&away=<team>`** — returns the full odds snapshot history for a specific matchup, used to render the line movement chart.
- **`GET /api/cron`** — protected endpoint (requires `Authorization: Bearer <CRON_SECRET>`) that triggers `/api/odds` on a schedule. Intended to be called by an external scheduler (e.g. [cron-job.org](https://cron-job.org/)) to periodically refresh odds data.

## Database Schema

Odds are stored in a single `OddsSnapshot` table (see [prisma/schema.prisma](prisma/schema.prisma)), with one row per bookmaker/market snapshot per game, indexed by sport/commence time and fetch time for efficient querying.

## Scripts

| Command         | Description                     |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the development server     |
| `npm run build` | Build for production             |
| `npm run start` | Start the production server      |
| `npm run lint`  | Run ESLint                       |
