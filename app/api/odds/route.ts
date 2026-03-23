/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import axios from "axios";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const BASE_URL = "https://api.the-odds-api.com/v4";

const SPORTS = [
  { key: "aussierules_afl", region: "au" },
  { key: "rugbyleague_nrl", region: "au" },
  { key: "soccer_epl", region: "uk" },
  { key: "soccer_spain_la_liga", region: "eu" },
  { key: "soccer_italy_serie_a", region: "eu" },
  { key: "soccer_uefa_champs_league", region: "eu" },
];

export async function GET() {
  try {
    let totalSaved = 0;

    for (const sport of SPORTS) {
      try {
        const response = await axios.get(
          `${BASE_URL}/sports/${sport.key}/odds`,
          {
            params: {
              apiKey: ODDS_API_KEY,
              regions: sport.region,
              markets: "h2h",
              oddsFormat: "decimal",
            },
          },
        );

        const games = response.data;
        const records = [];

        for (const game of games) {
          for (const bookmaker of game.bookmakers) {
            const h2h = bookmaker.markets.find((m: any) => m.key === "h2h");
            if (!h2h) continue;

            const homeOutcome = h2h.outcomes.find(
              (o: any) => o.name === game.home_team,
            );
            const awayOutcome = h2h.outcomes.find(
              (o: any) => o.name === game.away_team,
            );

            if (!homeOutcome || !awayOutcome) continue;

            records.push({
              sport: game.sport_key,
              homeTeam: game.home_team,
              awayTeam: game.away_team,
              commenceTime: new Date(game.commence_time),
              bookmaker: bookmaker.title,
              market: "h2h",
              homeOdds: homeOutcome.price,
              awayOdds: awayOutcome.price,
            });
          }
        }

        await prisma.oddsSnapshot.createMany({ data: records });
        totalSaved += records.length;
      } catch (err: any) {
        console.error(`Failed to fetch ${sport.key}:`, err.message);
      }
    }

    return NextResponse.json({ success: true, saved: true, totalSaved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
