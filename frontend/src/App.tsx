import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import CreateTrackNew from './pages/CreateTrackNew'
import SimulateRaceWizard from './pages/SimulateRaceWizard'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <nav className="bg-gray-800 bg-opacity-50 backdrop-blur-md border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                  🏁 Racing App
                </span>
              </div>
              <div className="flex space-x-4">
                <Link
                  to="/create-track"
                  className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                >
                  Create Track
                </Link>
                <Link
                  to="/simulate-race"
                  className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                >
                  Simulate Race
                </Link>
                <Link
                  to="/leaderboard"
                  className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                >
                  Leaderboard
                </Link>
                <Link
                  to="/profile"
                  className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                >
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<CreateTrackNew />} />
            <Route path="/create-track" element={<CreateTrackNew />} />
            <Route path="/simulate-race" element={<SimulateRaceWizard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

