/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { format } from "date-fns-tz";
import LineMovementChart from "./LineMovementChart";

interface Props {
  game: any;
  isSelected: boolean;
  chartData: any[];
  onClick: () => void;
}

const PREVIEW_COUNT = 4;

export default function GameCard({
  game,
  isSelected,
  chartData,
  onClick,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const now = Date.now();

  const getOddsAge = (lastUpdated: string) => {
    const mins = Math.floor((now - new Date(lastUpdated).getTime()) / 60000);
    if (mins < 1) return "Just updated";
    if (mins < 60) return `Updated ${mins} min${mins === 1 ? "" : "s"} ago`;
    const hours = Math.floor(mins / 60);
    return `Updated ${hours} hour${hours === 1 ? "" : "s"} ago`;
  };

  const getBestBookmaker = () => {
    let bestBookmaker = "";
    let bestTotal = 0;
    Object.entries(game.bookmakers).forEach(([bookmaker, odds]: any) => {
      const total = odds.homeOdds + odds.awayOdds;
      if (total > bestTotal) {
        bestTotal = total;
        bestBookmaker = bookmaker;
      }
    });
    return bestBookmaker;
  };

  const homeLastWord = game.homeTeam.split(" ").pop();
  const awayLastWord = game.awayTeam.split(" ").pop();

  const allBookmakers = Object.entries(game.bookmakers);
  const visibleBookmakers = expanded ? allBookmakers : allBookmakers.slice(0, PREVIEW_COUNT);
  const remainingCount = allBookmakers.length - PREVIEW_COUNT;

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  return (
    <div
      className={`bg-gray-900 rounded-xl border border-gray-800 transition-all ${
        isSelected ? "border-green-700" : "hover:border-gray-600"
      }`}
    >
      {/* Tappable header */}
      <div onClick={onClick} className="p-4 sm:p-6 cursor-pointer">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base sm:text-lg font-semibold leading-snug">
              {game.homeTeam} vs {game.awayTeam}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              {format(new Date(game.commenceTime), "EEE d MMM, h:mm a zzz", {
                timeZone: "Australia/Sydney",
              })}
            </p>
            <p className="text-gray-600 text-xs mt-0.5">
              {getOddsAge(game.lastUpdated)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-400 text-xs">🏆</span>
              <span className="text-yellow-400 text-xs font-medium">
                Best value: {getBestBookmaker()}
              </span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <div className="bg-green-900/40 border border-green-700 rounded-lg px-3 py-2 text-center min-w-[56px]">
              <p className="text-xs text-gray-400 truncate max-w-[56px]">{homeLastWord}</p>
              <p className="text-green-400 font-bold text-sm">{game.bestHome}</p>
            </div>
            <div className="bg-green-900/40 border border-green-700 rounded-lg px-3 py-2 text-center min-w-[56px]">
              <p className="text-xs text-gray-400 truncate max-w-[56px]">{awayLastWord}</p>
              <p className="text-green-400 font-bold text-sm">{game.bestAway}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmakers — always visible, 3 by default */}
      <div className="px-4 sm:px-6 pb-2 border-t border-gray-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-4">
          {visibleBookmakers.map(([bookmaker, odds]: any) => (
            <div
              key={bookmaker}
              className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2"
            >
              <p className="text-gray-400 text-xs sm:text-sm truncate flex-1 mr-2">
                {bookmaker}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`font-mono text-sm font-semibold ${
                    odds.homeOdds === game.bestHome ? "text-green-400" : "text-white"
                  }`}
                >
                  {odds.homeOdds.toFixed(2)}
                </span>
                <span className="text-gray-600 text-xs">|</span>
                <span
                  className={`font-mono text-sm font-semibold ${
                    odds.awayOdds === game.bestAway ? "text-green-400" : "text-white"
                  }`}
                >
                  {odds.awayOdds.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Show more / less pill */}
        {remainingCount > 0 && (
          <div className="flex justify-center mt-3 mb-2">
            <button
              onClick={handleExpandToggle}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white active:bg-gray-700 active:text-white border border-gray-700 transition-all"
            >
              {expanded ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Show less
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  +{remainingCount} more bookmakers
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Line movement chart */}
      {isSelected && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-800">
          <LineMovementChart
            data={chartData}
            homeTeam={game.homeTeam}
            awayTeam={game.awayTeam}
          />
        </div>
      )}
    </div>
  );
}