import { Highlight } from '../types/raceConfig'

interface HighlightsPanelProps {
  highlights: Highlight[]
  onJumpTo: (lap: number) => void
  currentLap: number
}

export default function HighlightsPanel({
  highlights,
  onJumpTo,
  currentLap,
}: HighlightsPanelProps) {
  const sortedHighlights = [...highlights].sort((a, b) => b.importance - a.importance)

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return 'text-red-400'
    if (importance >= 6) return 'text-orange-400'
    if (importance >= 4) return 'text-yellow-400'
    return 'text-gray-400'
  }

  const getImportanceStars = (importance: number) => {
    const stars = Math.min(5, Math.ceil(importance / 2))
    return '⭐'.repeat(stars)
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>🎬</span>
        <span>Race Highlights</span>
        <span className="text-sm text-gray-400 font-normal">
          ({sortedHighlights.length})
        </span>
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedHighlights.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No highlights yet. Race events will appear here.
          </div>
        ) : (
          sortedHighlights.map((highlight, index) => (
            <button
              key={index}
              onClick={() => onJumpTo(highlight.lap)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                currentLap === highlight.lap
                  ? 'bg-blue-900 bg-opacity-50 border-blue-600'
                  : 'bg-gray-900 bg-opacity-30 border-gray-700 hover:bg-gray-900 hover:bg-opacity-50 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{highlight.event.icon}</span>
                  <span className="text-xs text-gray-400">Lap {highlight.lap}</span>
                </div>
                <span
                  className={`text-xs ${getImportanceColor(highlight.importance)}`}
                >
                  {getImportanceStars(highlight.importance)}
                </span>
              </div>
              <div className="text-sm text-white font-medium mb-1">
                {highlight.event.description}
              </div>
              {highlight.event.driver && (
                <div className="text-xs text-gray-400">{highlight.event.driver}</div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

