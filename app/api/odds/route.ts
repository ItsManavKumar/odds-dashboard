/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import axios from 'axios'
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const ODDS_API_KEY = process.env.ODDS_API_KEY
const BASE_URL = 'https://api.the-odds-api.com/v4'

export async function GET() {
  try {
    const response = await axios.get(`${BASE_URL}/sports/aussierules_afl/odds`, {
      params: {
        apiKey: ODDS_API_KEY,
        regions: 'au',
        markets: 'h2h',
        oddsFormat: 'decimal',
      }
    })

    const games = response.data

    for (const game of games) {
      for (const bookmaker of game.bookmakers) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const h2h = bookmaker.markets.find((m: any) => m.key === 'h2h')
        if (!h2h) continue

        const homeOutcome = h2h.outcomes.find((o: any) => o.name === game.home_team)
        const awayOutcome = h2h.outcomes.find((o: any) => o.name === game.away_team)

        if (!homeOutcome || !awayOutcome) continue

        await prisma.oddsSnapshot.create({
          data: {
            sport: game.sport_key,
            homeTeam: game.home_team,
            awayTeam: game.away_team,
            commenceTime: new Date(game.commence_time),
            bookmaker: bookmaker.title,
            market: 'h2h',
            homeOdds: homeOutcome.price,
            awayOdds: awayOutcome.price,
          }
        })
      }
    }

    return NextResponse.json({ success: true, saved: true, gamesCount: games.length })
  } catch (error: any) {
    console.error('Error:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}