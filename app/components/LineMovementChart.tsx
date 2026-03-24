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

// Shorten team name to last word for legend on mobile
const shortName = (name: string) => name.split(' ').pop() ?? name

export default function LineMovementChart({ data, homeTeam, awayTeam }: Props) {
  if (data.length === 0) return null

  // Thin out x-axis ticks so they don't overlap on small screens
  const tickCount = Math.min(6, data.length)
  const step = Math.max(1, Math.floor(data.length / tickCount))
  const ticks = data
    .filter((_, i) => i % step === 0)
    .map((d) => d.fetchedAt)

  return (
    <div className="mt-6 border-t border-gray-800 pt-4">
      <p className="text-xs sm:text-sm text-gray-400 mb-4">
        Line Movement — {homeTeam} vs {awayTeam}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
          <XAxis
            dataKey="fetchedAt"
            ticks={ticks}
            tickFormatter={(val) =>
              format(new Date(val), 'HH:mm', { timeZone: 'Australia/Sydney' })
            }
            stroke="#6b7280"
            tick={{ fontSize: 10 }}
            interval={0}
          />
          <YAxis
            domain={['auto', 'auto']}
            stroke="#6b7280"
            tick={{ fontSize: 10 }}
            width={36}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #374151',
              fontSize: 12,
            }}
            labelFormatter={(val) =>
              format(new Date(val), 'EEE d MMM, h:mm a', {
                timeZone: 'Australia/Sydney',
              })
            }
          />
          <Legend
            formatter={(value) =>
              value === homeTeam ? shortName(homeTeam) : shortName(awayTeam)
            }
            wrapperStyle={{ fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="homeOdds"
            stroke="#4ade80"
            dot={false}
            name={homeTeam}
          />
          <Line
            type="monotone"
            dataKey="awayOdds"
            stroke="#60a5fa"
            dot={false}
            name={awayTeam}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}