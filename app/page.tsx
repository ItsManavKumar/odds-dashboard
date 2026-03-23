/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import GameCard from './components/GameCard'

export default function Home() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    fetch('/api/markets')
      .then(r => r.json())
      .then(d => {
        setGames(d.data)
        setLoading(false)
      })
  }, [])

  const handleGameClick = (game: any) => {
    const gameKey = `${game.homeTeam}-${game.awayTeam}`

    if (selectedGame === gameKey) {
      setSelectedGame(null)
      setChartData([])
      return
    }

    setSelectedGame(gameKey)

    fetch(`/api/history?home=${encodeURIComponent(game.homeTeam)}&away=${encodeURIComponent(game.awayTeam)}`)
      .then(r => r.json())
      .then(d => setChartData(d.data))
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">AFL Odds Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm">Markets Tracked</p>
          <p className="text-2xl font-bold mt-1">{games.length}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm">Bookmakers</p>
          <p className="text-2xl font-bold mt-1">11</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm">Sport</p>
          <p className="text-2xl font-bold mt-1">AFL</p>
        </div>
      </div>
      {loading ? (
        <p className="text-gray-400">Loading markets</p>
      ) : (
        <div className="space-y-4">
          {games.map((game: any, i) => (
            <GameCard
              key={i}
              game={game}
              isSelected={selectedGame === `${game.homeTeam}-${game.awayTeam}`}
              chartData={selectedGame === `${game.homeTeam}-${game.awayTeam}` ? chartData : []}
              onClick={() => handleGameClick(game)}
            />
          ))}
        </div>
      )}
    </main>
  )
}