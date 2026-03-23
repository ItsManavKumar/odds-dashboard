/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export async function GET() {
  try {
    // Get the most recent snapshot for each game + bookmaker combo
    const snapshots = await prisma.oddsSnapshot.findMany({
      orderBy: { fetchedAt: 'desc' },
    })

    // Group by game
    const gamesMap: Record<string, any> = {}

    for (const snap of snapshots) {
      const gameKey = `${snap.homeTeam}-${snap.awayTeam}`
      
      if (!gamesMap[gameKey]) {
        gamesMap[gameKey] = {
          homeTeam: snap.homeTeam,
          awayTeam: snap.awayTeam,
          commenceTime: snap.commenceTime,
          sport: snap.sport,
          bookmakers: {}
        }
      }

      // Only keep the most recent odds per bookmaker
      if (!gamesMap[gameKey].bookmakers[snap.bookmaker]) {
        gamesMap[gameKey].bookmakers[snap.bookmaker] = {
          homeOdds: snap.homeOdds,
          awayOdds: snap.awayOdds,
        }
      }
    }

    // Find best odds for each game
    const games = Object.values(gamesMap).map((game: any) => {
      const bookmakers = game.bookmakers
      const bookmakerList = Object.entries(bookmakers)

      const bestHome = Math.max(...bookmakerList.map(([, b]: any) => b.homeOdds))
      const bestAway = Math.max(...bookmakerList.map(([, b]: any) => b.awayOdds))

      return {
        ...game,
        bookmakers,
        bestHome,
        bestAway,
      }
    })

    // Sort by commence time
    games.sort((a, b) => new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime())

    return NextResponse.json({ success: true, data: games })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}