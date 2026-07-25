/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns-tz'

interface Props {
  data: any[]
  homeTeam: string
  awayTeam: string
}

const TZ = 'Australia/Sydney'

export default function LineMovementChart({ data, homeTeam, awayTeam }: Props) {
  if (data.length === 0) return null

  // Convert decimal odds to implied probability so both teams sit on a
  // comparable 0-100 scale instead of a heavy favourite's odds being
  // unreadable next to a long-shot's on a shared linear odds axis
  const chartData = data.map((d) => ({
    ...d,
    homeProb: 100 / d.homeOdds,
    awayProb: 100 / d.awayOdds,
  }))

  // Thin out x-axis ticks so they don't overlap on small screens
  const tickCount = Math.min(6, chartData.length)
  const step = Math.max(1, Math.floor(chartData.length / tickCount))
  const ticks = chartData
    .filter((_, i) => i % step === 0)
    .map((d) => d.fetchedAt)

  // Pick a tick format based on how much time the data actually spans.
  // Over multiple days, "HH:mm" renders every tick as 00:00 and tells
  // you nothing; over a few hours, a date-only label is equally useless.
  const spanHours =
    (new Date(chartData[chartData.length - 1].fetchedAt).getTime() -
      new Date(chartData[0].fetchedAt).getTime()) /
    3_600_000
  const xTickFormat =
    spanHours > 48 ? 'd MMM' : spanHours > 12 ? 'd MMM ha' : 'HH:mm'

  // Build the y-axis domain and ticks explicitly, snapped to 5% steps.
  // A fixed [0, 100] domain wastes most of the chart when both lines sit
  // in a narrow band, flattening real line movement into a straight line —
  // but letting Recharts auto-generate ticks off a padded domain produces
  // uneven labels (31.25, 37.5...), so both are computed here.
  const probs = chartData.flatMap((d) => [d.homeProb, d.awayProb])
  const yLo = Math.max(0, Math.floor((Math.min(...probs) - 2) / 5) * 5)
  const yHi = Math.min(100, Math.ceil((Math.max(...probs) + 2) / 5) * 5)
  const yTicks = Array.from(
    { length: Math.round((yHi - yLo) / 5) + 1 },
    (_, i) => yLo + i * 5
  )

  return (
    <div className="mt-6 border-t border-gray-800 pt-4">
      <p className="text-xs sm:text-sm text-gray-400 mb-4">
        Line Movement — {homeTeam} vs {awayTeam}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <XAxis
            dataKey="fetchedAt"
            ticks={ticks}
            tickFormatter={(val) =>
              format(new Date(val), xTickFormat, { timeZone: TZ })
            }
            stroke="#6b7280"
            tick={{ fontSize: 10 }}
            interval={0}
          />
          <YAxis
            domain={[yLo, yHi]}
            ticks={yTicks}
            tickFormatter={(val) => `${val}%`}
            stroke="#6b7280"
            tick={{ fontSize: 10 }}
            width={46}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #374151',
              fontSize: 12,
            }}
            labelFormatter={(val) =>
              format(new Date(val), 'EEE d MMM, h:mm a', { timeZone: TZ })
            }
            formatter={(value: any, name: any, entry: any) => {
              const rawOdds =
                entry.dataKey === 'homeProb'
                  ? entry.payload.homeOdds
                  : entry.payload.awayOdds
              return [`${rawOdds.toFixed(2)} (${Number(value).toFixed(1)}%)`, name]
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="homeProb"
            stroke="#4ade80"
            dot={false}
            name={homeTeam}
          />
          <Line
            type="monotone"
            dataKey="awayProb"
            stroke="#60a5fa"
            dot={false}
            name={awayTeam}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}