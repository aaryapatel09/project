import { useState } from 'react'
import { DriverConfig, WeatherProfile, RaceScenario } from '../types/raceConfig'

interface Track {
  id: number
  name: string
  length: number
  difficulty: string
  laps: number
}

interface RaceWizardProps {
  tracks: Track[]
  onComplete: (scenario: RaceScenario) => void
  onCancel: () => void
}

export default function RaceWizard({ tracks, onComplete, onCancel }: RaceWizardProps) {
  const [step, setStep] = useState(1)
  const [selectedTrack, setSelectedTrack] = useState('')
  const [drivers, setDrivers] = useState<DriverConfig[]>([
    {
      name: 'Lewis Hamilton',
      skill: 0.95,
      aggression: 0.6,
      tireStrategy: 'balanced',
      pitStrategy: 'adaptive',
      riskLevel: 'normal',
      undercut: false,
      preferredTire: 'medium',
    },
    {
      name: 'Max Verstappen',
      skill: 0.93,
      aggression: 0.8,
      tireStrategy: 'aggressive',
      pitStrategy: 'adaptive',
      riskLevel: 'risky',
      undercut: true,
      preferredTire: 'soft',
    },
  ])
  const [weather, setWeather] = useState<WeatherProfile>({
    startCondition: 'dry',
    changeChance: 0.1,
    rainIntensity: 'medium',
  })
  const [safetyCarProb, setSafetyCarProb] = useState(0.05)
  const [enableDRS, setEnableDRS] = useState(true)
  const [enableVSC, setEnableVSC] = useState(true)

  const addDriver = () => {
    setDrivers([
      ...drivers,
      {
        name: `Driver ${drivers.length + 1}`,
        skill: 0.75,
        aggression: 0.5,
        tireStrategy: 'balanced',
        pitStrategy: 'two-stop',
        riskLevel: 'normal',
        undercut: false,
        preferredTire: 'medium',
      },
    ])
  }

  const removeDriver = (index: number) => {
    setDrivers(drivers.filter((_, i) => i !== index))
  }

  const updateDriver = (index: number, updates: Partial<DriverConfig>) => {
    const updated = [...drivers]
    updated[index] = { ...updated[index], ...updates }
    setDrivers(updated)
  }

  const handleComplete = () => {
    onComplete({
      trackName: selectedTrack,
      drivers,
      weather,
      safetyCarProb,
      enableDRS,
      enableVSC,
    })
  }

  const totalSteps = 4

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Race Scenario Wizard</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          {/* Progress Bar */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  s <= step ? 'bg-blue-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-400">
            Step {step} of {totalSteps}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Select Track</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => setSelectedTrack(track.name)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedTrack === track.name
                        ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                        : 'border-gray-700 bg-gray-900 bg-opacity-30 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-xl font-bold text-white mb-2">{track.name}</div>
                    <div className="text-sm text-gray-400">
                      {track.length}km • {track.laps} laps • {track.difficulty}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Configure Drivers</h3>
                <button
                  onClick={addDriver}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  + Add Driver
                </button>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {drivers.map((driver, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 bg-opacity-50 rounded-xl p-4 border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <input
                        type="text"
                        value={driver.name}
                        onChange={(e) => updateDriver(index, { name: e.target.value })}
                        className="text-lg font-bold bg-transparent text-white border-b border-gray-600 focus:outline-none focus:border-blue-500 px-2 py-1"
                      />
                      <button
                        onClick={() => removeDriver(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          Skill: {(driver.skill * 100).toFixed(0)}%
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="1.0"
                          step="0.01"
                          value={driver.skill}
                          onChange={(e) =>
                            updateDriver(index, { skill: parseFloat(e.target.value) })
                          }
                          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          Aggression: {(driver.aggression * 100).toFixed(0)}%
                        </label>
                        <input
                          type="range"
                          min="0.0"
                          max="1.0"
                          step="0.01"
                          value={driver.aggression}
                          onChange={(e) =>
                            updateDriver(index, { aggression: parseFloat(e.target.value) })
                          }
                          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          Tire Strategy
                        </label>
                        <select
                          value={driver.tireStrategy}
                          onChange={(e) =>
                            updateDriver(index, {
                              tireStrategy: e.target.value as any,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                        >
                          <option value="conservative">Conservative</option>
                          <option value="balanced">Balanced</option>
                          <option value="aggressive">Aggressive</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          Pit Strategy
                        </label>
                        <select
                          value={driver.pitStrategy}
                          onChange={(e) =>
                            updateDriver(index, { pitStrategy: e.target.value as any })
                          }
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                        >
                          <option value="one-stop">One-Stop</option>
                          <option value="two-stop">Two-Stop</option>
                          <option value="three-stop">Three-Stop</option>
                          <option value="adaptive">Adaptive</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Risk Level</label>
                        <select
                          value={driver.riskLevel}
                          onChange={(e) =>
                            updateDriver(index, { riskLevel: e.target.value as any })
                          }
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                        >
                          <option value="safe">Safe</option>
                          <option value="normal">Normal</option>
                          <option value="risky">Risky</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          Preferred Tire
                        </label>
                        <select
                          value={driver.preferredTire}
                          onChange={(e) =>
                            updateDriver(index, { preferredTire: e.target.value as any })
                          }
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                        >
                          <option value="soft">Soft</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={driver.undercut}
                          onChange={(e) =>
                            updateDriver(index, { undercut: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded"
                        />
                        Undercut Strategy
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Weather & Conditions</h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Starting Condition
                    </label>
                    <select
                      value={weather.startCondition}
                      onChange={(e) =>
                        setWeather({ ...weather, startCondition: e.target.value as any })
                      }
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="dry">☀️ Dry</option>
                      <option value="rain">🌧️ Rain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Weather Change Chance: {(weather.changeChance * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="0.3"
                      step="0.01"
                      value={weather.changeChance}
                      onChange={(e) =>
                        setWeather({ ...weather, changeChance: parseFloat(e.target.value) })
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rain Intensity
                    </label>
                    <select
                      value={weather.rainIntensity}
                      onChange={(e) =>
                        setWeather({ ...weather, rainIntensity: e.target.value as any })
                      }
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="light">Light Rain</option>
                      <option value="medium">Medium Rain</option>
                      <option value="heavy">Heavy Rain</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Safety Car Probability: {(safetyCarProb * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="0.2"
                      step="0.01"
                      value={safetyCarProb}
                      onChange={(e) => setSafetyCarProb(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={enableDRS}
                        onChange={(e) => setEnableDRS(e.target.checked)}
                        className="w-5 h-5 text-blue-500 bg-gray-700 border-gray-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                        Enable DRS (Drag Reduction System)
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={enableVSC}
                        onChange={(e) => setEnableVSC(e.target.checked)}
                        className="w-5 h-5 text-blue-500 bg-gray-700 border-gray-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                        Enable Virtual Safety Car
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Review Configuration</h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-900 bg-opacity-50 rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">Track</div>
                    <div className="text-lg font-bold text-white">{selectedTrack}</div>
                  </div>

                  <div className="bg-gray-900 bg-opacity-50 rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">Drivers</div>
                    <div className="text-lg font-bold text-white">{drivers.length}</div>
                  </div>

                  <div className="bg-gray-900 bg-opacity-50 rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">Weather</div>
                    <div className="text-lg font-bold text-white capitalize">
                      {weather.startCondition}
                      {weather.changeChance > 0 && ' (Variable)'}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 bg-opacity-50 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-3">Driver Summary</div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {drivers.map((driver, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-white">{driver.name}</span>
                        <span className="text-gray-400">
                          {driver.pitStrategy} • {driver.tireStrategy}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !selectedTrack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              🏁 Start Simulation
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

