import { useState } from 'react'

interface CalibrationData {
  circuit: string
  season: number
  realistic_lap_time: number
  incident_probability: number
  recommended_settings: {
    base_lap_time: number
    safety_car_prob: number
    difficulty_multiplier: number
  }
}

interface CircuitCalibrationProps {
  onApplyCalibration: (calibration: CalibrationData) => void
}

export default function CircuitCalibration({ onApplyCalibration }: CircuitCalibrationProps) {
  const [circuitName, setCircuitName] = useState('')
  const [season, setSeason] = useState(2023)
  const [calibration, setCalibration] = useState<CalibrationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCalibrate = async () => {
    if (!circuitName.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/f1/calibrate-track?circuit=${encodeURIComponent(circuitName)}&season=${season}`
      )
      const data = await response.json()
      setCalibration(data)
    } catch (error) {
      console.error('Error calibrating:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(3)
    return `${mins}:${secs.padStart(6, '0')}`
  }

  const famousCircuits = [
    'Monaco', 'Monza', 'Silverstone', 'Spa-Francorchamps', 'Suzuka',
    'Circuit of the Americas', 'Interlagos', 'Red Bull Ring', 'Singapore'
  ]

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🎯</span>
        <span>Circuit Calibration</span>
      </h3>

      <p className="text-sm text-gray-400 mb-4">
        Get realistic simulation parameters based on real F1 data
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Circuit Name
        </label>
        <input
          type="text"
          value={circuitName}
          onChange={(e) => setCircuitName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCalibrate()}
          list="circuits"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Monaco, Silverstone..."
        />
        <datalist id="circuits">
          {famousCircuits.map((circuit) => (
            <option key={circuit} value={circuit} />
          ))}
        </datalist>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Season</label>
        <select
          value={season}
          onChange={(e) => setSeason(parseInt(e.target.value))}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          {[2023, 2022, 2021, 2020, 2019].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleCalibrate}
        disabled={isLoading || !circuitName.trim()}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all mb-4"
      >
        {isLoading ? 'Calibrating...' : '📡 Fetch Real Data'}
      </button>

      {calibration && (
        <div className="space-y-3">
          <div className="bg-green-900 bg-opacity-30 border border-green-600 rounded-lg p-4">
            <div className="text-xs text-green-400 mb-1">✓ Calibration Complete</div>
            <div className="text-sm text-white font-semibold">
              {calibration.circuit} ({calibration.season})
            </div>
          </div>

          {calibration.realistic_lap_time && (
            <div className="bg-gray-900 bg-opacity-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Real Fastest Lap</div>
              <div className="text-lg font-bold text-purple-400">
                {formatTime(calibration.realistic_lap_time)}
              </div>
            </div>
          )}

          <div className="bg-gray-900 bg-opacity-50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Incident Probability</div>
            <div className="text-lg font-bold text-orange-400">
              {(calibration.incident_probability * 100).toFixed(2)}% per lap
            </div>
          </div>

          <div className="bg-gray-900 bg-opacity-50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-2">Recommended Settings</div>
            <div className="space-y-1 text-sm text-white">
              <div>Base Lap Time: {formatTime(calibration.recommended_settings.base_lap_time)}</div>
              <div>Safety Car Prob: {(calibration.recommended_settings.safety_car_prob * 100).toFixed(1)}%</div>
            </div>
          </div>

          <button
            onClick={() => onApplyCalibration(calibration)}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
          >
            ✓ Apply to Simulation
          </button>
        </div>
      )}
    </div>
  )
}

