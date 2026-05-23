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
    // Show games from the last 7 days so the dashboard isn't empty while API quota is reset
    const gameCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const snapshots = await prisma.oddsSnapshot.findMany({
      where: {
        sport,
        commenceTime: { gt: gameCutoff },
      },
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
          drawOdds: snap.drawOdds ?? null,
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

    // Warn only when there ARE active games but the fetch data is old (cron failure)
    // Threshold is 5 hours to account for the 3-hour cron interval + buffer
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000)
    const mostRecentFetch = snapshots[0]?.fetchedAt
    const staleWarning = mostRecentFetch != null && new Date(mostRecentFetch) < fiveHoursAgo

    return NextResponse.json({ success: true, data: games, staleWarning })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
