import { useState } from 'react'
import { BarChart } from '@visx/shape'
import { Group } from '@visx/group'
import { scaleBand, scaleLinear } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'

interface ComparisonData {
  realism_score: number
  lap_time_accuracy: number
  dnf_comparison: {
    simulated: number
    real: number
    difference: number
  }
  insights: string[]
}

interface RealDataComparisonProps {
  simulatedData: any
  onCompare: (season: number, round: number) => void
}

export default function RealDataComparison({
  simulatedData,
  onCompare,
}: RealDataComparisonProps) {
  const [season, setSeason] = useState(2023)
  const [round, setRound] = useState(1)
  const [races, setRaces] = useState<any[]>([])
  const [comparison, setComparison] = useState<ComparisonData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchRaces = async (selectedSeason: number) => {
    try {
      const response = await fetch(`/api/f1/races/${selectedSeason}`)
      const data = await response.json()
      setRaces(data.races || [])
    } catch (error) {
      console.error('Error fetching races:', error)
    }
  }

  const handleSeasonChange = (newSeason: number) => {
    setSeason(newSeason)
    fetchRaces(newSeason)
  }

  const handleCompare = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/f1/compare?season=${season}&round=${round}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(simulatedData),
        }
      )
      const data = await response.json()
      setComparison(data.comparison)
      onCompare(season, round)
    } catch (error) {
      console.error('Error comparing:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-yellow-400'
    if (score >= 60) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>📊</span>
        <span>Compare to Real F1 Race</span>
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Season</label>
          <select
            value={season}
            onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          >
            {[2023, 2022, 2021, 2020, 2019].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Race</label>
          <select
            value={round}
            onChange={(e) => setRound(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          >
            {races.map((race) => (
              <option key={race.round} value={race.round}>
                {race.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={isLoading}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg transition-all mb-4"
      >
        {isLoading ? 'Comparing...' : 'Compare Results'}
      </button>

      {comparison && (
        <div className="space-y-4">
          {/* Realism Score */}
          <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Realism Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(comparison.realism_score)}`}>
                {comparison.realism_score}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${comparison.realism_score}%` }}
              />
            </div>
          </div>

          {/* Lap Time Accuracy */}
          <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Lap Time Accuracy</span>
              <span className={`text-lg font-bold ${getScoreColor(comparison.lap_time_accuracy)}`}>
                {comparison.lap_time_accuracy.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* DNF Comparison */}
          {comparison.dnf_comparison && (
            <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Retirements</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-gray-500">Simulated</div>
                  <div className="text-white font-bold">{comparison.dnf_comparison.simulated}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Real</div>
                  <div className="text-white font-bold">{comparison.dnf_comparison.real}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Difference</div>
                  <div className="text-white font-bold">{comparison.dnf_comparison.difference}</div>
                </div>
              </div>
            </div>
          )}

          {/* Insights */}
          {comparison.insights && comparison.insights.length > 0 && (
            <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Insights</div>
              <div className="space-y-1">
                {comparison.insights.map((insight, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white">
                    <span>•</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

