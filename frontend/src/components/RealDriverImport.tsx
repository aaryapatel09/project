import { useState, useEffect } from 'react'

interface RealDriver {
  name: string
  code: string
  team: string
  skill: number
  aggression: number
  championship_position: number
  points: number
  wins: number
}

interface RealDriverImportProps {
  onImport: (drivers: RealDriver[]) => void
}

export default function RealDriverImport({ onImport }: RealDriverImportProps) {
  const [season, setSeason] = useState(2023)
  const [seasons, setSeasons] = useState<number[]>([])
  const [drivers, setDrivers] = useState<RealDriver[]>([])
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchSeasons()
  }, [])

  useEffect(() => {
    if (season) {
      fetchDrivers()
    }
  }, [season])

  const fetchSeasons = async () => {
    try {
      const response = await fetch('/api/f1/seasons?limit=5')
      const data = await response.json()
      const seasonYears = data.seasons.map((s: any) => s.season)
      setSeasons(seasonYears)
      if (seasonYears.length > 0) {
        setSeason(seasonYears[0])
      }
    } catch (error) {
      console.error('Error fetching seasons:', error)
    }
  }

  const fetchDrivers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/f1/import-real-drivers/${season}`)
      const data = await response.json()
      setDrivers(data.drivers || [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDriver = (driverName: string) => {
    const newSelected = new Set(selectedDrivers)
    if (newSelected.has(driverName)) {
      newSelected.delete(driverName)
    } else {
      newSelected.add(driverName)
    }
    setSelectedDrivers(newSelected)
  }

  const handleImport = () => {
    const selected = drivers.filter((d) => selectedDrivers.has(d.name))
    onImport(selected)
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🏎️</span>
        <span>Import Real F1 Drivers</span>
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Season</label>
        <select
          value={season}
          onChange={(e) => setSeason(parseInt(e.target.value))}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          {seasons.map((s) => (
            <option key={s} value={s}>
              {s} Season
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 mt-2">Loading drivers...</p>
        </div>
      ) : (
        <>
          <div className="mb-4 max-h-96 overflow-y-auto space-y-2">
            {drivers.map((driver) => (
              <label
                key={driver.name}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  selectedDrivers.has(driver.name)
                    ? 'bg-blue-900 bg-opacity-40 border-2 border-blue-600'
                    : 'bg-gray-900 bg-opacity-30 border border-gray-700 hover:bg-gray-900 hover:bg-opacity-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedDrivers.has(driver.name)}
                  onChange={() => toggleDriver(driver.name)}
                  className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{driver.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-300">
                      {driver.code}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">{driver.team}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">
                    P{driver.championship_position}
                  </div>
                  <div className="text-xs text-green-400">
                    Skill: {(driver.skill * 100).toFixed(0)}%
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <span className="text-sm text-gray-400">
              {selectedDrivers.size} driver{selectedDrivers.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleImport}
              disabled={selectedDrivers.size === 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all"
            >
              Import Selected
            </button>
          </div>
        </>
      )}
    </div>
  )
}

