interface Standing {
  position: number
  driver: string
  gap: number
  lastLap: number
  tire: string
  pitStops: number
}

interface LiveStandingsProps {
  standings: Standing[]
}

export default function LiveStandings({ standings }: LiveStandingsProps) {
  const getTireColor = (tire: string) => {
    const colors: { [key: string]: string } = {
      soft: 'bg-red-500',
      medium: 'bg-yellow-500',
      hard: 'bg-gray-400',
      intermediate: 'bg-green-500',
      wet: 'bg-blue-500',
    }
    return colors[tire] || 'bg-gray-500'
  }

  const formatGap = (gap: number) => {
    if (gap === 0) return '—'
    return `+${gap.toFixed(1)}s`
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">Live Standings</h3>

      <div className="space-y-2">
        {standings.map((standing, index) => (
          <div
            key={standing.driver}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              index === 0
                ? 'bg-yellow-900 bg-opacity-30 border-2 border-yellow-600'
                : index === 1
                ? 'bg-gray-700 bg-opacity-30 border border-gray-600'
                : index === 2
                ? 'bg-orange-900 bg-opacity-30 border border-orange-600'
                : 'bg-gray-900 bg-opacity-30'
            }`}
          >
            {/* Position */}
            <div className="w-8 text-center">
              <span className="text-xl font-bold text-white">{standing.position}</span>
            </div>

            {/* Driver Name */}
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold truncate">
                {standing.driver}
              </div>
              <div className="text-xs text-gray-400">
                Last lap: {standing.lastLap.toFixed(3)}s
              </div>
            </div>

            {/* Gap */}
            <div className="text-right min-w-[80px]">
              <div className="text-white font-mono text-sm">
                {formatGap(standing.gap)}
              </div>
            </div>

            {/* Tire */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full ${getTireColor(
                  standing.tire
                )} flex items-center justify-center`}
                title={standing.tire}
              >
                <span className="text-xs font-bold text-white">
                  {standing.tire.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-400">×{standing.pitStops}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

