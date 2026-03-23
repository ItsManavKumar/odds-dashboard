/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'aussierules_afl'

  try {
    const snapshots = await prisma.oddsSnapshot.findMany({
      where: { sport },
      orderBy: { fetchedAt: 'desc' },
    })

    const gamesMap: Record<string, any> = {}

    for (const snap of snapshots) {
      const gameKey = `${snap.homeTeam}-${snap.awayTeam}`

      if (!gamesMap[gameKey]) {
        gamesMap[gameKey] = {
          homeTeam: snap.homeTeam,
          awayTeam: snap.awayTeam,
          commenceTime: snap.commenceTime,
          sport: snap.sport,
          lastUpdated: snap.fetchedAt,
          bookmakers: {}
        }
      }

      if (!gamesMap[gameKey].bookmakers[snap.bookmaker]) {
        gamesMap[gameKey].bookmakers[snap.bookmaker] = {
          homeOdds: snap.homeOdds,
          awayOdds: snap.awayOdds,
        }
      }
    }

    const games = Object.values(gamesMap).map((game: any) => {
      const bookmakerList = Object.entries(game.bookmakers)
      const bestHome = Math.max(...bookmakerList.map(([, b]: any) => b.homeOdds))
      const bestAway = Math.max(...bookmakerList.map(([, b]: any) => b.awayOdds))
      return { ...game, bestHome, bestAway }
    })

    games.sort((a, b) => new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime())

    return NextResponse.json({ success: true, data: games })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
