import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  rank: number
  racer: string
  wins: number
  races: number
  bestTime: number
  winRate: number
}

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'wins' | 'winRate' | 'bestTime'>('wins')

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/leaderboard')
      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (sortBy === 'wins') return b.wins - a.wins
    if (sortBy === 'winRate') return b.winRate - a.winRate
    if (sortBy === 'bestTime') return a.bestTime - b.bestTime
    return 0
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-700">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">
            🏆 Leaderboard
          </h1>
          <button
            onClick={fetchLeaderboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSortBy('wins')}
            className={`px-4 py-2 rounded-lg transition-all ${
              sortBy === 'wins'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Sort by Wins
          </button>
          <button
            onClick={() => setSortBy('winRate')}
            className={`px-4 py-2 rounded-lg transition-all ${
              sortBy === 'winRate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Sort by Win Rate
          </button>
          <button
            onClick={() => setSortBy('bestTime')}
            className={`px-4 py-2 rounded-lg transition-all ${
              sortBy === 'bestTime'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Sort by Best Time
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No race data yet. Simulate some races to see the leaderboard!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Racer
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                    Wins
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                    Races
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                    Win Rate
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                    Best Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedLeaderboard.map((entry, index) => (
                  <tr
                    key={entry.racer}
                    className={`border-b border-gray-700 hover:bg-gray-700 hover:bg-opacity-30 transition-colors ${
                      index === 0
                        ? 'bg-yellow-900 bg-opacity-20'
                        : index === 1
                        ? 'bg-gray-700 bg-opacity-20'
                        : index === 2
                        ? 'bg-orange-900 bg-opacity-20'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">
                          {index + 1}
                        </span>
                        {index === 0 && <span className="text-2xl">🥇</span>}
                        {index === 1 && <span className="text-2xl">🥈</span>}
                        {index === 2 && <span className="text-2xl">🥉</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-semibold text-white">
                        {entry.racer}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-400 font-semibold">
                        {entry.wins}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-300">{entry.races}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-blue-400 font-semibold">
                        {entry.winRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-purple-400 font-mono">
                        {entry.bestTime.toFixed(2)}s
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard

