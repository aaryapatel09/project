import { useState, useEffect, useCallback } from 'react'

interface RacePlaybackProps {
  totalLaps: number
  currentLap: number
  onLapChange: (lap: number) => void
  isPlaying: boolean
  onPlayPause: () => void
  speed: number
  onSpeedChange: (speed: number) => void
}

export default function RacePlayback({
  totalLaps,
  currentLap,
  onLapChange,
  isPlaying,
  onPlayPause,
  speed,
  onSpeedChange,
}: RacePlaybackProps) {
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (isPlaying && currentLap < totalLaps) {
      const interval = setInterval(() => {
        onLapChange(currentLap + 1)
      }, 1000 / speed)
      return () => clearInterval(interval)
    }
  }, [isPlaying, currentLap, totalLaps, speed, onLapChange])

  const handleRewind = () => {
    onLapChange(Math.max(1, currentLap - 5))
  }

  const handleForward = () => {
    onLapChange(Math.min(totalLaps, currentLap + 5))
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLapChange(parseInt(e.target.value))
  }

  const speedOptions = [0.5, 1, 2, 4, 8]

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-6">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRewind}
            disabled={currentLap <= 1}
            className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Rewind 5 laps"
          >
            ⏪
          </button>

          <button
            onClick={onPlayPause}
            disabled={currentLap >= totalLaps && isPlaying}
            className="w-12 h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all text-xl disabled:opacity-30"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <button
            onClick={handleForward}
            disabled={currentLap >= totalLaps}
            className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Forward 5 laps"
          >
            ⏩
          </button>

          <button
            onClick={() => onLapChange(1)}
            disabled={currentLap === 1}
            className="px-4 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Lap {currentLap} / {totalLaps}
            </span>
            <span className="text-sm text-gray-400">
              {((currentLap / totalLaps) * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="1"
            max={totalLaps}
            value={currentLap}
            onChange={handleSliderChange}
            onMouseDown={() => setDragging(true)}
            onMouseUp={() => setDragging(false)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 whitespace-nowrap">Speed:</span>
          <div className="flex gap-1">
            {speedOptions.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-3 h-8 rounded-lg text-sm font-medium transition-all ${
                  speed === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Jump */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Quick Jump:</span>
          <div className="flex gap-2">
            <button
              onClick={() => onLapChange(1)}
              className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-all"
            >
              Start
            </button>
            <button
              onClick={() => onLapChange(Math.floor(totalLaps * 0.25))}
              className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-all"
            >
              25%
            </button>
            <button
              onClick={() => onLapChange(Math.floor(totalLaps * 0.5))}
              className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-all"
            >
              50%
            </button>
            <button
              onClick={() => onLapChange(Math.floor(totalLaps * 0.75))}
              className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-all"
            >
              75%
            </button>
            <button
              onClick={() => onLapChange(totalLaps)}
              className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-all"
            >
              Finish
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

