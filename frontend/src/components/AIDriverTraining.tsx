import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AIDriver {
  driver_id?: string
  name: string
  races_completed: number
  total_wins: number
  total_podiums: number
  win_rate: number
  podium_rate: number
  avg_finish_position: number
  q_table_size: number
  exploration_rate: number
  is_trained: boolean
}

interface TrainingResult {
  race: number
  position: number
  q_table_size: number
}

export default function AIDriverTraining() {
  const [aiDrivers, setAiDrivers] = useState<AIDriver[]>([])
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null)
  const [newDriverName, setNewDriverName] = useState('')
  const [trainingRaces, setTrainingRaces] = useState(10)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState<TrainingResult[]>([])

  useEffect(() => {
    fetchAIDrivers()
  }, [])

  const fetchAIDrivers = async () => {
    try {
      const response = await fetch('/api/ai/drivers')
      const data = await response.json()
      setAiDrivers(data.drivers || [])
    } catch (error) {
      console.error('Error fetching AI drivers:', error)
    }
  }

  const createAIDriver = async () => {
    if (!newDriverName.trim()) return

    try {
      const response = await fetch('/api/ai/driver/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDriverName }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setNewDriverName('')
        fetchAIDrivers()
      }
    } catch (error) {
      console.error('Error creating AI driver:', error)
    }
  }

  const trainAIDriver = async (driverId: string) => {
    setIsTraining(true)
    setTrainingProgress([])

    try {
      const response = await fetch(`/api/ai/driver/${driverId}/batch-train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num_races: trainingRaces }),
      })

      const data = await response.json()

      if (response.ok) {
        setTrainingProgress(data.training_results || [])
        fetchAIDrivers()
      }
    } catch (error) {
      console.error('Error training AI driver:', error)
    } finally {
      setIsTraining(false)
    }
  }

  const saveAIDriver = async (driverId: string) => {
    try {
      await fetch(`/api/ai/driver/${driverId}/save`, {
        method: 'POST',
      })
      alert('AI driver saved successfully!')
    } catch (error) {
      console.error('Error saving AI driver:', error)
    }
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <span>🧠</span>
        <span>AI Driver Training</span>
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Train reinforcement learning AI drivers that adapt strategy across multiple races
      </p>

      {/* Create New AI Driver */}
      <div className="mb-6 p-4 bg-gray-900 bg-opacity-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Create New AI Driver
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newDriverName}
            onChange={(e) => setNewDriverName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createAIDriver()}
            placeholder="AI Driver Name..."
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={createAIDriver}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold"
          >
            Create
          </button>
        </div>
      </div>

      {/* AI Drivers List */}
      <div className="space-y-3 mb-6">
        {aiDrivers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No AI drivers yet. Create one to get started!
          </div>
        ) : (
          aiDrivers.map((driver) => (
            <div
              key={driver.driver_id}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedDriver === driver.driver_id
                  ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                  : 'border-gray-700 bg-gray-900 bg-opacity-30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                    AI
                  </div>
                  <div>
                    <div className="text-white font-bold">{driver.name}</div>
                    <div className="text-xs text-gray-400">
                      {driver.races_completed} races • {driver.is_trained ? '✓ Trained' : 'Untrained'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSelectedDriver(
                      selectedDriver === driver.driver_id ? null : driver.driver_id || null
                    )
                  }
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {selectedDriver === driver.driver_id ? 'Hide' : 'Details'}
                </button>
              </div>

              {selectedDriver === driver.driver_id && (
                <div className="space-y-3 pt-3 border-t border-gray-700">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-800 bg-opacity-50 rounded p-2 text-center">
                      <div className="text-xs text-gray-400">Wins</div>
                      <div className="text-lg font-bold text-green-400">
                        {driver.total_wins}
                      </div>
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 rounded p-2 text-center">
                      <div className="text-xs text-gray-400">Podiums</div>
                      <div className="text-lg font-bold text-yellow-400">
                        {driver.total_podiums}
                      </div>
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 rounded p-2 text-center">
                      <div className="text-xs text-gray-400">Avg Pos</div>
                      <div className="text-lg font-bold text-blue-400">
                        P{driver.avg_finish_position.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Learning Stats */}
                  <div className="bg-gray-800 bg-opacity-50 rounded p-3">
                    <div className="text-xs text-gray-400 mb-2">Learning Progress</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-gray-300">
                        <span>Q-Table Size:</span>
                        <span className="text-white">{driver.q_table_size} states</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Exploration Rate:</span>
                        <span className="text-white">
                          {(driver.exploration_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Win Rate:</span>
                        <span className="text-green-400">{driver.win_rate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Training Controls */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => driver.driver_id && trainAIDriver(driver.driver_id)}
                      disabled={isTraining}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg transition-all text-sm font-semibold"
                    >
                      {isTraining ? 'Training...' : `Train ${trainingRaces} Races`}
                    </button>
                    <button
                      onClick={() => driver.driver_id && saveAIDriver(driver.driver_id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all text-sm"
                    >
                      💾 Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Training Configuration */}
      <div className="mb-6 p-4 bg-gray-900 bg-opacity-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Training Races: {trainingRaces}
        </label>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={trainingRaces}
          onChange={(e) => setTrainingRaces(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>5 races</span>
          <span>100 races</span>
        </div>
      </div>

      {/* Training Progress Visualization */}
      {trainingProgress.length > 0 && (
        <div className="p-4 bg-gray-900 bg-opacity-50 rounded-lg">
          <h4 className="text-sm font-bold text-white mb-3">Training Progress</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trainingProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="race" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" reversed />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="position"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Finish Position"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="mt-6 p-4 bg-purple-900 bg-opacity-20 border border-purple-800 rounded-lg">
        <div className="text-xs text-purple-300 space-y-1">
          <div className="font-bold mb-2">🧠 How RL AI Works:</div>
          <div>• Learns from experience across multiple races</div>
          <div>• Adapts tire and pit strategy dynamically</div>
          <div>• Balances exploration vs exploitation</div>
          <div>• Q-learning algorithm for decision making</div>
          <div>• Improves with more training races</div>
        </div>
      </div>
    </div>
  )
}

