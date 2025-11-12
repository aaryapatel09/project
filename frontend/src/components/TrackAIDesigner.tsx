import { useState } from 'react'

interface GeneratedTrack {
  name: string
  elements: any[]
  metrics: any
  difficulty: string
  laps: number
  generated_for: string
  generation_stats: {
    generations: number
    population_size: number
  }
}

interface TrackAIDesignerProps {
  onTrackGenerated: (track: GeneratedTrack) => void
}

export default function TrackAIDesigner({ onTrackGenerated }: TrackAIDesignerProps) {
  const [targetMetric, setTargetMetric] = useState('balanced')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedTrack, setGeneratedTrack] = useState<GeneratedTrack | null>(null)

  const metricOptions = [
    {
      value: 'overtakes',
      name: 'Most Overtakes',
      icon: '🏎️',
      description: 'Maximize overtaking opportunities with long straights and DRS zones',
      color: 'from-green-500 to-emerald-600',
    },
    {
      value: 'speed',
      name: 'Fastest Lap Possible',
      icon: '⚡',
      description: 'Minimize lap time with high-speed straights and banked corners',
      color: 'from-yellow-500 to-orange-600',
    },
    {
      value: 'difficulty',
      name: 'Maximum Challenge',
      icon: '🎯',
      description: 'Create the most technical and challenging track',
      color: 'from-red-500 to-pink-600',
    },
    {
      value: 'safety',
      name: 'Safest Track',
      icon: '🛡️',
      description: 'Prioritize driver safety with run-off areas and gentle corners',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      value: 'balanced',
      name: 'Perfectly Balanced',
      icon: '⚖️',
      description: 'Create a well-rounded track with all characteristics',
      color: 'from-purple-500 to-indigo-600',
    },
  ]

  const handleGenerate = async () => {
    setIsGenerating(true)
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(95, prev + 5))
    }, 200)

    try {
      const response = await fetch('/api/ai/generate-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: targetMetric,
        }),
      })

      const data = await response.json()

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        setGeneratedTrack(data.track)
        setTimeout(() => {
          onTrackGenerated(data.track)
        }, 500)
      }
    } catch (error) {
      console.error('Generation error:', error)
      clearInterval(progressInterval)
    } finally {
      setIsGenerating(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <span>🤖</span>
        <span>Track AI Designer</span>
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Let AI generate the perfect track optimized for your target metric using genetic algorithms
      </p>

      {/* Target Metric Selection */}
      <div className="space-y-3 mb-6">
        <label className="block text-sm font-medium text-gray-300">
          Select Target Metric
        </label>
        {metricOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTargetMetric(option.value)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              targetMetric === option.value
                ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                : 'border-gray-700 bg-gray-900 bg-opacity-30 hover:border-gray-600 hover:bg-gray-900 hover:bg-opacity-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{option.icon}</span>
              <div className="flex-1">
                <div className="text-white font-bold mb-1">{option.name}</div>
                <div className="text-xs text-gray-400">{option.description}</div>
              </div>
              {targetMetric === option.value && (
                <span className="text-blue-400 text-xl">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Generation Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          isGenerating
            ? 'bg-gray-600'
            : `bg-gradient-to-r ${
                metricOptions.find((o) => o.value === targetMetric)?.color
              }`
        } hover:shadow-lg`}
      >
        {isGenerating ? '🧬 Evolving Track...' : '✨ Generate AI Track'}
      </button>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Genetic Algorithm Progress</span>
            <span className="text-sm text-blue-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Running {targetMetric === 'balanced' ? 50 : 50} generations...
          </div>
        </div>
      )}

      {/* Generated Track Preview */}
      {generatedTrack && !isGenerating && (
        <div className="mt-6 p-4 bg-green-900 bg-opacity-30 border-2 border-green-600 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">✨</span>
            <span className="text-white font-bold">Track Generated!</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Name:</span>
              <span className="text-white font-semibold">{generatedTrack.name}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Elements:</span>
              <span className="text-white">{generatedTrack.elements.length}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Length:</span>
              <span className="text-white">
                {(generatedTrack.metrics.totalLength / 1000).toFixed(2)} km
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Target Metric:</span>
              <span className="text-green-400 font-semibold capitalize">
                {generatedTrack.generated_for}
              </span>
            </div>
            {targetMetric === 'overtakes' && (
              <div className="flex justify-between text-gray-300">
                <span>Overtake Points:</span>
                <span className="text-green-400 font-bold">
                  {generatedTrack.metrics.possibleOvertakes}
                </span>
              </div>
            )}
            {targetMetric === 'speed' && (
              <div className="flex justify-between text-gray-300">
                <span>Est. Lap Time:</span>
                <span className="text-yellow-400 font-bold">
                  {generatedTrack.metrics.estimatedLapTime.toFixed(1)}s
                </span>
              </div>
            )}
            {targetMetric === 'difficulty' && (
              <div className="flex justify-between text-gray-300">
                <span>Difficulty:</span>
                <span className="text-red-400 font-bold">
                  {generatedTrack.metrics.difficultyScore}/100
                </span>
              </div>
            )}
            {targetMetric === 'safety' && (
              <div className="flex justify-between text-gray-300">
                <span>Safety Rating:</span>
                <span className="text-blue-400 font-bold">
                  {generatedTrack.metrics.safetyRating}/100
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg">
        <div className="text-xs text-blue-300 space-y-1">
          <div className="flex items-center gap-2">
            <span>🧬</span>
            <span>Uses genetic algorithm with 50 generations</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span>Population of 20 tracks per generation</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span>Auto-optimizes DRS zones and sectors</span>
          </div>
        </div>
      </div>
    </div>
  )
}

