import { TrackMetrics } from '../types/track'
import { getDifficultyLabel, getSafetyLabel } from '../utils/trackMetrics'

interface MetricsDisplayProps {
  metrics: TrackMetrics
}

export default function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(1)
    return `${mins}:${secs.padStart(4, '0')}`
  }

  const getColorForScore = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const metricCards = [
    {
      label: 'Total Length',
      value: `${(metrics.totalLength / 1000).toFixed(2)} km`,
      icon: '📏',
      color: 'text-blue-400',
    },
    {
      label: 'Est. Lap Time',
      value: formatTime(metrics.estimatedLapTime),
      icon: '⏱️',
      color: 'text-purple-400',
    },
    {
      label: 'Difficulty',
      value: `${metrics.difficultyScore}/100`,
      subtitle: getDifficultyLabel(metrics.difficultyScore),
      icon: '🎯',
      color: getColorForScore(metrics.difficultyScore),
    },
    {
      label: 'Overtake Points',
      value: metrics.possibleOvertakes.toString(),
      icon: '🏎️',
      color: 'text-green-400',
    },
    {
      label: 'Safety Rating',
      value: `${metrics.safetyRating}/100`,
      subtitle: getSafetyLabel(metrics.safetyRating),
      icon: '🛡️',
      color: getColorForScore(metrics.safetyRating),
    },
    {
      label: 'Elevation Change',
      value: `${metrics.elevationChange}m`,
      icon: '⛰️',
      color: 'text-orange-400',
    },
  ]

  const elementStats = [
    {
      label: 'Corners',
      value: metrics.cornerCount,
      color: 'bg-blue-500',
    },
    {
      label: 'Straights',
      value: metrics.straightCount,
      color: 'bg-purple-500',
    },
    {
      label: 'DRS Zones',
      value: metrics.drsZoneCount,
      color: 'bg-green-500',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Main Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {metricCards.map((metric) => (
          <div
            key={metric.label}
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-gray-400 text-xs font-medium">
                {metric.label}
              </span>
              <span className="text-xl">{metric.icon}</span>
            </div>
            <div className={`text-2xl font-bold ${metric.color} mb-1`}>
              {metric.value}
            </div>
            {metric.subtitle && (
              <div className="text-xs text-gray-500">{metric.subtitle}</div>
            )}
          </div>
        ))}
      </div>

      {/* Element Stats */}
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Track Composition
        </h4>
        <div className="space-y-2">
          {elementStats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{stat.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${stat.color} h-full transition-all duration-500`}
                    style={{
                      width: `${Math.min(100, (stat.value / 10) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-bold text-white w-8 text-right">
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Performance Analysis
        </h4>
        <div className="space-y-2 text-xs">
          {metrics.drsZoneCount > 0 && (
            <div className="flex items-center gap-2 text-green-400">
              <span>✓</span>
              <span>DRS zones will increase overtaking opportunities</span>
            </div>
          )}
          {metrics.elevationChange > 30 && (
            <div className="flex items-center gap-2 text-orange-400">
              <span>⚠</span>
              <span>High elevation changes increase driver fatigue</span>
            </div>
          )}
          {metrics.safetyRating < 50 && (
            <div className="flex items-center gap-2 text-red-400">
              <span>⚠</span>
              <span>Low safety rating - consider adding run-off areas</span>
            </div>
          )}
          {metrics.possibleOvertakes < 2 && (
            <div className="flex items-center gap-2 text-yellow-400">
              <span>ℹ</span>
              <span>Few overtaking opportunities - add longer straights</span>
            </div>
          )}
          {metrics.cornerCount > metrics.straightCount * 2 && (
            <div className="flex items-center gap-2 text-blue-400">
              <span>ℹ</span>
              <span>Technical track - favors downforce setups</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

