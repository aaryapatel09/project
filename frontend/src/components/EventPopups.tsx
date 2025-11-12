import { RaceEvent } from '../types/raceConfig'

interface EventPopupsProps {
  events: RaceEvent[]
  maxVisible?: number
}

export default function EventPopups({ events, maxVisible = 5 }: EventPopupsProps) {
  const recentEvents = events.slice(-maxVisible).reverse()

  const getEventStyle = (type: string) => {
    const styles: { [key: string]: string } = {
      pit: 'bg-blue-900 border-blue-600',
      overtake: 'bg-green-900 border-green-600',
      incident: 'bg-yellow-900 border-yellow-600',
      safety_car: 'bg-red-900 border-red-600',
      weather: 'bg-purple-900 border-purple-600',
      fastest_lap: 'bg-pink-900 border-pink-600',
    }
    return styles[type] || 'bg-gray-900 border-gray-600'
  }

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2 pointer-events-none">
      {recentEvents.map((event, index) => (
        <div
          key={`${event.lap}-${index}`}
          className={`${getEventStyle(
            event.type
          )} bg-opacity-90 backdrop-blur-md border-2 rounded-xl p-4 shadow-2xl animate-slide-in max-w-sm`}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl">{event.icon}</span>
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">Lap {event.lap}</div>
              <div className="text-white font-medium">{event.description}</div>
              {event.driver && (
                <div className="text-sm text-gray-300 mt-1">{event.driver}</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

