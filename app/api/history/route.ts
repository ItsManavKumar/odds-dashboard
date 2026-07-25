import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const home = searchParams.get('home')
  const away = searchParams.get('away')

  if (!home || !away) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const snapshots = await prisma.oddsSnapshot.findMany({
    where: {
      homeTeam: home,
      awayTeam: away,
    },
    orderBy: { fetchedAt: 'asc' },
  })

  // Each fetch writes one row per bookmaker, so grouping by fetchedAt and
  // taking the best price per side turns the interleaved rows into a single
  // well-defined point per timestamp (same "best price" convention as /api/markets)
  const byFetch = new Map<number, typeof snapshots>()
  for (const snap of snapshots) {
    const key = snap.fetchedAt.getTime()
    const group = byFetch.get(key)
    if (group) {
      group.push(snap)
    } else {
      byFetch.set(key, [snap])
    }
  }

  const data = Array.from(byFetch.values()).map((group) => ({
    fetchedAt: group[0].fetchedAt,
    homeOdds: Math.max(...group.map((s) => s.homeOdds)),
    awayOdds: Math.max(...group.map((s) => s.awayOdds)),
  }))

  return NextResponse.json({ success: true, data })
}