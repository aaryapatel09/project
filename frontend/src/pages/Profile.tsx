import { useState, useEffect } from 'react'

interface RaceHistory {
  track: string
  position: number
  time: number
  date: string
}

interface UserStats {
  totalRaces: number
  totalWins: number
  totalPodiums: number
  winRate: number
  bestTime: number
  averagePosition: number
  favoriteTrack: string
}

function Profile() {
  const [username, setUsername] = useState('Guest Racer')
  const [isEditing, setIsEditing] = useState(false)
  const [tempUsername, setTempUsername] = useState('')
  const [stats, setStats] = useState<UserStats>({
    totalRaces: 0,
    totalWins: 0,
    totalPodiums: 0,
    winRate: 0,
    bestTime: 0,
    averagePosition: 0,
    favoriteTrack: 'N/A'
  })
  const [recentRaces, setRecentRaces] = useState<RaceHistory[]>([])

  useEffect(() => {
    // Load username from localStorage
    const savedUsername = localStorage.getItem('username')
    if (savedUsername) {
      setUsername(savedUsername)
    }
    
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentRaces(data.recentRaces || [])
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleSaveUsername = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim())
      localStorage.setItem('username', tempUsername.trim())
      setIsEditing(false)
      setTempUsername('')
    }
  }

  const handleEditClick = () => {
    setTempUsername(username)
    setIsEditing(true)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-700 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              {isEditing ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveUsername()}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter username..."
                    autoFocus
                  />
                  <button
                    onClick={handleSaveUsername}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-white">{username}</h1>
                  <button
                    onClick={handleEditClick}
                    className="text-blue-400 hover:text-blue-300 text-sm mt-1 transition-colors"
                  >
                    ✏️ Edit Username
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Total Races</div>
          <div className="text-3xl font-bold text-white">{stats.totalRaces}</div>
        </div>
        
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Total Wins</div>
          <div className="text-3xl font-bold text-green-400">{stats.totalWins}</div>
        </div>
        
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Win Rate</div>
          <div className="text-3xl font-bold text-blue-400">{stats.winRate.toFixed(1)}%</div>
        </div>
        
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Podium Finishes</div>
          <div className="text-3xl font-bold text-yellow-400">{stats.totalPodiums}</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Best Time</div>
          <div className="text-2xl font-bold text-purple-400">
            {stats.bestTime > 0 ? `${stats.bestTime.toFixed(2)}s` : 'N/A'}
          </div>
        </div>
        
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Average Position</div>
          <div className="text-2xl font-bold text-orange-400">
            {stats.averagePosition > 0 ? `#${stats.averagePosition.toFixed(1)}` : 'N/A'}
          </div>
        </div>
        
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Favorite Track</div>
          <div className="text-2xl font-bold text-pink-400">{stats.favoriteTrack}</div>
        </div>
      </div>

      {/* Recent Races */}
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Races</h2>
          <button
            onClick={fetchUserStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            🔄 Refresh
          </button>
        </div>

        {recentRaces.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏁</div>
            <p className="text-gray-400 text-lg">
              No races yet. Head over to "Simulate Race" to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentRaces.map((race, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-900 bg-opacity-50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${
                    race.position === 1 ? 'text-yellow-400' :
                    race.position === 2 ? 'text-gray-400' :
                    race.position === 3 ? 'text-orange-400' :
                    'text-gray-500'
                  }`}>
                    #{race.position}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{race.track}</div>
                    <div className="text-gray-400 text-sm">{race.date}</div>
                  </div>
                </div>
                <div className="text-gray-300 font-mono">{race.time.toFixed(2)}s</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile

