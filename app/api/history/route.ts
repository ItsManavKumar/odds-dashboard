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

  return NextResponse.json({ success: true, data: snapshots })
}