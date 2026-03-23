/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { format } from 'date-fns-tz'
import LineMovementChart from './LineMovementChart'

interface Props {
  game: any
  isSelected: boolean
  chartData: any[]
  onClick: () => void
}

export default function GameCard({ game, isSelected, chartData, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-900 rounded-xl border border-gray-800 p-6 mb-4 cursor-pointer transition-all ${
        isSelected ? 'border-green-700' : 'hover:border-gray-600'
      }`}
    >
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold">
            {game.homeTeam} vs {game.awayTeam}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {format(new Date(game.commenceTime), 'EEE d MMM, h:mm a zzz', {
              timeZone: 'Australia/Sydney',
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-green-900/40 border border-green-700 rounded-lg px-4 py-2 text-center">
            <p className="text-xs text-gray-400">{game.homeTeam.split(' ').pop()}</p>
            <p className="text-green-400 font-bold">{game.bestHome}</p>
          </div>
          <div className="bg-green-900/40 border border-green-700 rounded-lg px-4 py-2 text-center">
            <p className="text-xs text-gray-400">{game.awayTeam.split(' ').pop()}</p>
            <p className="text-green-400 font-bold">{game.bestAway}</p>
          </div>
        </div>
      </div>

      {/* Bookmakers Grid */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {Object.entries(game.bookmakers).map(([bookmaker, odds]: any) => (
          <div
            key={bookmaker}
            className="flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-2"
          >
            <p className="text-gray-400 text-sm w-32 truncate">{bookmaker}</p>
            <div className="flex gap-4">
              <span className={`font-mono text-sm font-semibold ${odds.homeOdds === game.bestHome ? 'text-green-400' : 'text-white'}`}>
                {odds.homeOdds.toFixed(2)}
              </span>
              <span className="text-gray-600">|</span>
              <span className={`font-mono text-sm font-semibold ${odds.awayOdds === game.bestAway ? 'text-green-400' : 'text-white'}`}>
                {odds.awayOdds.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Line Movement Chart */}
      {isSelected && (
        <LineMovementChart
          data={chartData}
          homeTeam={game.homeTeam}
          awayTeam={game.awayTeam}
        />
      )}
    </div>
  )
}