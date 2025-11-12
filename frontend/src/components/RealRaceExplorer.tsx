import { useState, useEffect } from 'react'

interface RaceResult {
  position: number
  driver: string
  driver_code: string
  constructor: string
  laps: number
  status: string
  time?: number
  fastest_lap?: string
  points: number
}

interface RealRace {
  race_name: string
  circuit: string
  date: string
  results: RaceResult[]
}

export default function RealRaceExplorer() {
  const [season, setSeason] = useState(2023)
  const [races, setRaces] = useState<any[]>([])
  const [selectedRound, setSelectedRound] = useState<number | null>(null)
  const [raceData, setRaceData] = useState<RealRace | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchRaces()
  }, [season])

  const fetchRaces = async () => {
    try {
      const response = await fetch(`/api/f1/races/${season}`)
      const data = await response.json()
      setRaces(data.races || [])
    } catch (error) {
      console.error('Error fetching races:', error)
    }
  }

  const fetchRaceResults = async (round: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/f1/race/${season}/${round}`)
      const data = await response.json()
      setRaceData(data)
      setSelectedRound(round)
    } catch (error) {
      console.error('Error fetching race results:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(3)
    return `${mins}:${secs.padStart(6, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Season Selector */}
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Real F1 Race Data</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Season</label>
          <select
            value={season}
            onChange={(e) => setSeason(parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            {[2023, 2022, 2021, 2020, 2019, 2018].map((s) => (
              <option key={s} value={s}>
                {s} Season
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {races.map((race) => (
            <button
              key={race.round}
              onClick={() => fetchRaceResults(race.round)}
              className={`p-3 rounded-lg text-left transition-all ${
                selectedRound === race.round
                  ? 'bg-blue-900 bg-opacity-50 border-2 border-blue-600'
                  : 'bg-gray-900 bg-opacity-30 border border-gray-700 hover:bg-gray-900 hover:bg-opacity-50'
              }`}
            >
              <div className="text-xs text-gray-400">Round {race.round}</div>
              <div className="text-sm text-white font-semibold truncate">{race.name}</div>
              <div className="text-xs text-gray-500">{race.circuit}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Race Results */}
      {isLoading ? (
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-12 border border-gray-700 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 mt-4">Loading race data...</p>
        </div>
      ) : raceData ? (
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-2">{raceData.race_name}</h4>
          <div className="text-sm text-gray-400 mb-4">
            {raceData.circuit} • {raceData.date}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-300">Pos</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-300">Driver</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-300">Team</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-300">Laps</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-300">Status</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-300">Fastest</th>
                </tr>
              </thead>
              <tbody>
                {raceData.results.map((result, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-700 ${
                      i === 0
                        ? 'bg-yellow-900 bg-opacity-20'
                        : i === 1
                        ? 'bg-gray-700 bg-opacity-20'
                        : i === 2
                        ? 'bg-orange-900 bg-opacity-20'
                        : ''
                    }`}
                  >
                    <td className="px-3 py-2 text-white font-bold">{result.position}</td>
                    <td className="px-3 py-2 text-white">{result.driver}</td>
                    <td className="px-3 py-2 text-gray-400 text-sm">{result.constructor}</td>
                    <td className="px-3 py-2 text-center text-gray-300">{result.laps}</td>
                    <td className="px-3 py-2 text-center text-sm">
                      <span
                        className={
                          result.status === 'Finished'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }
                      >
                        {result.status === 'Finished' ? '✓' : result.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center text-purple-400 text-sm font-mono">
                      {result.fastest_lap || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}

