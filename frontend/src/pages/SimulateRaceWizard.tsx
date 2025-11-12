import { useState, useEffect, useMemo } from 'react'
import RaceWizard from '../components/RaceWizard'
import LiveGapChart from '../components/LiveGapChart'
import PositionTimeline from '../components/PositionTimeline'
import RacePlayback from '../components/RacePlayback'
import EventPopups from '../components/EventPopups'
import HighlightsPanel from '../components/HighlightsPanel'
import LiveStandings from '../components/LiveStandings'
import { RaceScenario, RaceEvent, Highlight } from '../types/raceConfig'

interface Track {
  id: number
  name: string
  length: number
  difficulty: string
  laps: number
}

interface RaceResultData {
  race_results: any[]
  winner: string
  total_laps: number
  commentary: any[]
}

export default function SimulateRaceWizard() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [showWizard, setShowWizard] = useState(false)
  const [raceData, setRaceData] = useState<RaceResultData | null>(null)
  const [currentLap, setCurrentLap] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchTracks()
  }, [])

  const fetchTracks = async () => {
    try {
      const response = await fetch('/api/tracks')
      const data = await response.json()
      setTracks(data.tracks || [])
    } catch (error) {
      console.error('Error fetching tracks:', error)
    }
  }

  const handleWizardComplete = async (scenario: RaceScenario) => {
    setShowWizard(false)
    setIsLoading(true)
    setMessage('')
    setRaceData(null)

    try {
      const response = await fetch('/api/simulate-race', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          track: scenario.trackName,
          drivers: scenario.drivers.map((d) => ({
            name: d.name,
            skill: d.skill,
            aggression: d.aggression,
            tireStrategy: d.tireStrategy,
            pitStrategy: d.pitStrategy,
            riskLevel: d.riskLevel,
            preferredTire: d.preferredTire,
          })),
          weather: scenario.weather.startCondition,
          safetyCarProbability: scenario.safetyCarProb,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setRaceData(data)
        setCurrentLap(1)
        setIsPlaying(true)
        setMessage('✅ Race simulation loaded!')
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Error: Failed to connect to the server')
    } finally {
      setIsLoading(false)
    }
  }

  // Process race data for visualizations
  const { gapData, positionData, events, highlights, standings } = useMemo(() => {
    if (!raceData) {
      return {
        gapData: [],
        positionData: [],
        events: [],
        highlights: [],
        standings: [],
      }
    }

    const drivers = raceData.race_results.map((r: any) => r.driver)
    const totalLaps = raceData.total_laps

    // Build gap data
    const gapData = []
    for (let lap = 1; lap <= totalLaps; lap++) {
      const lapData: any = { lap }
      raceData.race_results.forEach((result: any) => {
        if (result.gaps && result.gaps[lap - 1] !== undefined) {
          lapData[result.driver] = result.gaps[lap - 1]
        }
      })
      gapData.push(lapData)
    }

    // Build position data
    const positionData = []
    for (let lap = 1; lap <= totalLaps; lap++) {
      const positions: any = {}
      raceData.race_results.forEach((result: any) => {
        if (result.positions && result.positions[lap - 1] !== undefined) {
          positions[result.driver] = result.positions[lap - 1]
        }
      })
      positionData.push({ lap, positions })
    }

    // Convert commentary to events
    const events: RaceEvent[] = raceData.commentary.map((c: any) => ({
      lap: c.lap,
      type: c.type,
      description: c.text,
      icon: getEventIcon(c.type),
      color: getEventColor(c.type),
    }))

    // Generate highlights
    const highlights: Highlight[] = events
      .filter((e) => ['overtake', 'pit', 'safety_car', 'incident'].includes(e.type))
      .map((e) => ({
        lap: e.lap,
        event: e,
        importance: getEventImportance(e.type),
      }))

    // Get current standings
    const standings = raceData.race_results.map((result: any, index: number) => ({
      position: index + 1,
      driver: result.driver,
      gap: result.gap_to_leader || 0,
      lastLap:
        result.lap_times && result.lap_times[currentLap - 1]
          ? result.lap_times[currentLap - 1]
          : 0,
      tire: result.final_tire || 'medium',
      pitStops: result.pit_stops || 0,
    }))

    return { gapData, positionData, events, highlights, standings }
  }, [raceData, currentLap])

  const getEventIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      pit: '🔧',
      overtake: '🏎️',
      incident: '⚠️',
      safety_car: '🚨',
      weather: '🌧️',
      fastest_lap: '⚡',
    }
    return icons[type] || '📢'
  }

  const getEventColor = (type: string) => {
    const colors: { [key: string]: string } = {
      pit: 'blue',
      overtake: 'green',
      incident: 'yellow',
      safety_car: 'red',
      weather: 'purple',
      fastest_lap: 'pink',
    }
    return colors[type] || 'gray'
  }

  const getEventImportance = (type: string) => {
    const importance: { [key: string]: number } = {
      overtake: 7,
      safety_car: 9,
      incident: 6,
      pit: 4,
      weather: 8,
      fastest_lap: 5,
    }
    return importance[type] || 3
  }

  const visibleEvents = events.filter((e) => e.lap <= currentLap)

  return (
    <div className="max-w-[2000px] mx-auto relative">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">
          🏁 Race Simulation Studio
        </h1>
        <p className="text-gray-400">
          Configure complex race scenarios with live visualization and playback controls
        </p>
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <RaceWizard
          tracks={tracks}
          onComplete={handleWizardComplete}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {/* Event Popups */}
      {raceData && isPlaying && (
        <EventPopups events={visibleEvents} maxVisible={5} />
      )}

      {/* Main Content */}
      {!raceData ? (
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl p-12 border border-gray-700 text-center">
          {isLoading ? (
            <>
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-300 text-lg">Simulating race...</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-6">🏁</div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Create Your Race Scenario
              </h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Configure drivers with custom AI traits, set tire and pit strategies,
                adjust weather profiles, and watch the race unfold with live visualizations
              </p>
              <button
                onClick={() => setShowWizard(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all text-lg shadow-lg"
              >
                🎬 Launch Race Wizard
              </button>
              {message && (
                <div
                  className={`mt-6 p-4 rounded-lg max-w-md mx-auto ${
                    message.includes('✅')
                      ? 'bg-green-900 bg-opacity-50 text-green-200'
                      : 'bg-red-900 bg-opacity-50 text-red-200'
                  }`}
                >
                  {message}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Playback Controls */}
          <RacePlayback
            totalLaps={raceData.total_laps}
            currentLap={currentLap}
            onLapChange={setCurrentLap}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            speed={speed}
            onSpeedChange={setSpeed}
          />

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Visualizations */}
            <div className="col-span-8 space-y-6">
              {/* Gap Chart */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Gap to Leader</h3>
                <LiveGapChart
                  data={gapData}
                  drivers={raceData.race_results.map((r: any) => r.driver)}
                  width={900}
                  height={300}
                  currentLap={currentLap}
                />
              </div>

              {/* Position Timeline */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Position Changes</h3>
                <PositionTimeline
                  data={positionData}
                  drivers={raceData.race_results.map((r: any) => r.driver)}
                  width={900}
                  height={400}
                  currentLap={currentLap}
                />
              </div>
            </div>

            {/* Right Column - Info Panels */}
            <div className="col-span-4 space-y-6">
              {/* Live Standings */}
              <LiveStandings standings={standings} />

              {/* Highlights */}
              <HighlightsPanel
                highlights={highlights}
                onJumpTo={setCurrentLap}
                currentLap={currentLap}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setRaceData(null)
                setCurrentLap(1)
                setIsPlaying(false)
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
            >
              New Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

