/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import GameCard from "./components/GameCard";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";

const SPORTS = [
  { key: "aussierules_afl", label: "AFL" },
  { key: "rugbyleague_nrl", label: "NRL" },
  { key: "soccer_epl", label: "EPL" },
  { key: "soccer_spain_la_liga", label: "La Liga" },
  { key: "soccer_italy_serie_a", label: "Serie A" },
  { key: "soccer_uefa_champs_league", label: "UCL" },
];

export default function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [chartData, setChartData] = useState([]);
  const [selectedSport, setSelectedSport] = useState("aussierules_afl");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    setSelectedGame(null);
    setChartData([]);
    setSearch("");
    fetch(`/api/markets?sport=${selectedSport}`)
      .then((r) => r.json())
      .then((d) => {
        setGames(d.data);
        setLoading(false);
      });
  }, [selectedSport]);

  const handleGameClick = (game: any) => {
    const gameKey = `${game.homeTeam}-${game.awayTeam}`;
    if (selectedGame === gameKey) {
      setSelectedGame(null);
      setChartData([]);
      return;
    }
    setSelectedGame(gameKey);
    fetch(
      `/api/history?home=${encodeURIComponent(game.homeTeam)}&away=${encodeURIComponent(game.awayTeam)}`,
    )
      .then((r) => r.json())
      .then((d) => setChartData(d.data));
  };

  const filteredGames = search.trim()
    ? games.filter((game: any) =>
        `${game.homeTeam} ${game.awayTeam}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : games;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pb-6 overflow-x-hidden">

        {/* Header */}
        <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">
          Sports Odds Dashboard
        </h1>

        {/* Sport Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 scrollbar-none">
          {SPORTS.map((sport) => (
            <button
              key={sport.key}
              onClick={() => setSelectedSport(sport.key)}
              className={`shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                selectedSport === sport.key
                  ? "bg-green-600 text-white"
                  : "bg-gray-800 text-gray-400 active:bg-gray-700 hover:bg-gray-700"
              }`}
            >
              {sport.label}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-800">
            <p className="text-gray-400 text-xs sm:text-sm">Markets</p>
            <p className="text-xl sm:text-2xl font-bold mt-1">{games.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-800">
            <p className="text-gray-400 text-xs sm:text-sm">Bookmakers</p>
            <p className="text-xl sm:text-2xl font-bold mt-1">
              {games.length > 0
                ? Object.keys((games[0] as any).bookmakers).length
                : 0}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-800">
            <p className="text-gray-400 text-xs sm:text-sm">Sport</p>
            <p className="text-xl sm:text-2xl font-bold mt-1 truncate">
              {SPORTS.find((s) => s.key === selectedSport)?.label}
            </p>
          </div>
        </div>

        {/* Search */}
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search teams..."
        />

        {/* Games */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading markets...</p>
        ) : filteredGames.length === 0 ? (
          <p className="text-gray-400 text-sm">
            {search ? `No games found for "${search}"` : "No markets available for this sport yet."}
          </p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredGames.map((game: any, i) => (
              <GameCard
                key={i}
                game={game}
                isSelected={selectedGame === `${game.homeTeam}-${game.awayTeam}`}
                chartData={
                  selectedGame === `${game.homeTeam}-${game.awayTeam}`
                    ? chartData
                    : []
                }
                onClick={() => handleGameClick(game)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}