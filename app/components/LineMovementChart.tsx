/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns-tz'

interface Props {
  data: any[]
  homeTeam: string
  awayTeam: string
}

export default function LineMovementChart({ data, homeTeam, awayTeam }: Props) {
  if (data.length === 0) return null

  return (
    <div className="mt-6 border-t border-gray-800 pt-4">
      <p className="text-sm text-gray-400 mb-4">Line Movement — {homeTeam} vs {awayTeam}</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis
            dataKey="fetchedAt"
            tickFormatter={(val) => format(new Date(val), 'HH:mm', { timeZone: 'Australia/Sydney' })}
            stroke="#6b7280"
            tick={{ fontSize: 11 }}
          />
          <YAxis
            domain={['auto', 'auto']}
            stroke="#6b7280"
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
            labelFormatter={(val) => format(new Date(val), 'EEE d MMM, h:mm a', { timeZone: 'Australia/Sydney' })}
          />
          <Legend />
          <Line type="monotone" dataKey="homeOdds" stroke="#4ade80" dot={false} name={homeTeam} />
          <Line type="monotone" dataKey="awayOdds" stroke="#60a5fa" dot={false} name={awayTeam} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}