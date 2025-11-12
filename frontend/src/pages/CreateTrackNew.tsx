import { useState, useEffect, useCallback, useRef } from 'react'
import { TrackElement, ElementType, TrackData } from '../types/track'
import { calculateTrackMetrics } from '../utils/trackMetrics'
import { useTrackHistory } from '../hooks/useTrackHistory'
import TrackEditor from '../components/TrackEditor'
import ElementControls from '../components/ElementControls'
import MetricsDisplay from '../components/MetricsDisplay'
import TrackToolbar from '../components/TrackToolbar'
import QuickTips from '../components/QuickTips'
import TrackAIDesigner from '../components/TrackAIDesigner'

function CreateTrackNew() {
  const [trackName, setTrackName] = useState('')
  const [laps, setLaps] = useState(3)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAIDesigner, setShowAIDesigner] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { currentElements, addToHistory, undo, redo, canUndo, canRedo, reset } =
    useTrackHistory([])

  const [elements, setElements] = useState<TrackElement[]>(currentElements)

  // Sync with history
  useEffect(() => {
    setElements(currentElements)
  }, [currentElements])

  const metrics = calculateTrackMetrics(elements)
  const selectedElement = elements.find((el) => el.id === selectedElementId) || null

  // Add new element
  const handleAddElement = useCallback(
    (type: ElementType) => {
      const newElement: TrackElement = {
        id: `element-${Date.now()}`,
        type,
        x: 400 + (elements.length * 20) % 200,
        y: 100 + (elements.length * 30) % 400,
        length: type === 'straight' ? 300 : 200,
        width: 15,
        banking: 0,
        elevation: 0,
        isDRS: false,
        sectorNumber: null,
      }
      const newElements = [...elements, newElement]
      setElements(newElements)
      addToHistory(newElements)
      setSelectedElementId(newElement.id)
    },
    [elements, addToHistory]
  )

  // Update elements
  const handleElementsChange = useCallback(
    (newElements: TrackElement[]) => {
      setElements(newElements)
      addToHistory(newElements)
    },
    [addToHistory]
  )

  // Update selected element
  const handleUpdateElement = useCallback(
    (updates: Partial<TrackElement>) => {
      if (!selectedElementId) return
      const newElements = elements.map((el) =>
        el.id === selectedElementId ? { ...el, ...updates } : el
      )
      setElements(newElements)
      addToHistory(newElements)
    },
    [selectedElementId, elements, addToHistory]
  )

  // Delete element
  const handleDeleteElement = useCallback(() => {
    if (!selectedElementId) return
    const newElements = elements.filter((el) => el.id !== selectedElementId)
    setElements(newElements)
    addToHistory(newElements)
    setSelectedElementId(null)
  }, [selectedElementId, elements, addToHistory])

  // Undo/Redo
  const handleUndo = useCallback(() => {
    const prevElements = undo()
    if (prevElements) {
      setElements(prevElements)
      setSelectedElementId(null)
    }
  }, [undo])

  const handleRedo = useCallback(() => {
    const nextElements = redo()
    if (nextElements) {
      setElements(nextElements)
      setSelectedElementId(null)
    }
  }, [redo])

  // Clear all
  const handleClear = useCallback(() => {
    if (confirm('Are you sure you want to clear all elements?')) {
      const newElements: TrackElement[] = []
      setElements(newElements)
      reset(newElements)
      setSelectedElementId(null)
    }
  }, [reset])

  // Export JSON
  const handleExport = useCallback(() => {
    const trackData: TrackData = {
      name: trackName || 'Untitled Track',
      elements,
      difficulty: metrics.difficultyScore < 25 ? 'easy' : metrics.difficultyScore < 50 ? 'medium' : metrics.difficultyScore < 75 ? 'hard' : 'extreme',
      laps,
      metrics,
    }

    const json = JSON.stringify(trackData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${trackName || 'track'}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setMessage('✅ Track exported successfully!')
    setTimeout(() => setMessage(''), 3000)
  }, [trackName, elements, laps, metrics])

  // Import JSON
  const handleImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const trackData: TrackData = JSON.parse(event.target?.result as string)
          setTrackName(trackData.name)
          setLaps(trackData.laps)
          setElements(trackData.elements)
          reset(trackData.elements)
          setSelectedElementId(null)
          setMessage('✅ Track imported successfully!')
          setTimeout(() => setMessage(''), 3000)
        } catch (error) {
          setMessage('❌ Error: Invalid track file')
          setTimeout(() => setMessage(''), 3000)
        }
      }
      reader.readAsText(file)
      e.target.value = '' // Reset input
    },
    [reset]
  )

  const handleAITrackGenerated = useCallback(
    (aiTrack: any) => {
      setTrackName(aiTrack.name)
      setLaps(aiTrack.laps)
      setElements(aiTrack.elements)
      reset(aiTrack.elements)
      setSelectedElementId(null)
      setShowAIDesigner(false)
      setMessage('✅ AI-generated track loaded!')
      setTimeout(() => setMessage(''), 3000)
    },
    [reset]
  )

  // Save track to backend
  const handleSaveTrack = async () => {
    if (!trackName.trim()) {
      setMessage('❌ Please enter a track name')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    if (elements.length === 0) {
      setMessage('❌ Please add track elements')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const trackData: TrackData = {
        name: trackName,
        elements,
        difficulty: metrics.difficultyScore < 25 ? 'easy' : metrics.difficultyScore < 50 ? 'medium' : metrics.difficultyScore < 75 ? 'hard' : 'extreme',
        laps,
        metrics,
      }

      const response = await fetch('/api/create-track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trackData.name,
          length: metrics.totalLength / 1000,
          difficulty: trackData.difficulty,
          laps: trackData.laps,
          trackData: JSON.stringify(trackData),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ Track "${data.track.name}" saved successfully!`)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Error: Failed to connect to the server')
    } finally {
      setIsLoading(false)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault()
          handleUndo()
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault()
          handleRedo()
        }
      } else if (e.key === 'Delete' && selectedElementId) {
        e.preventDefault()
        handleDeleteElement()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo, handleDeleteElement, selectedElementId])

  return (
    <div className="max-w-[1800px] mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">
          🏗️ Interactive Track Builder
        </h1>
        <p className="text-gray-400">
          Design your custom race track with drag-and-drop elements, real-time metrics, and advanced features
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-4">
        <TrackToolbar
          onAddElement={handleAddElement}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          onExport={handleExport}
          onImport={handleImport}
          canUndo={canUndo}
          canRedo={canRedo}
          elementCount={elements.length}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Sidebar - Element Controls */}
        <div className="col-span-3 space-y-4">
          <button
            onClick={() => setShowAIDesigner(!showAIDesigner)}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all"
          >
            {showAIDesigner ? '✕ Close AI Designer' : '🤖 AI Track Designer'}
          </button>

          {showAIDesigner ? (
            <TrackAIDesigner onTrackGenerated={handleAITrackGenerated} />
          ) : (
            <>
              <ElementControls
                selectedElement={selectedElement}
                onUpdate={handleUpdateElement}
                onDelete={handleDeleteElement}
              />
              <QuickTips />
            </>
          )}
        </div>

        {/* Center - Track Editor */}
        <div className="col-span-6">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-4 border border-gray-700">
            <div className="h-[600px]">
              <TrackEditor
                elements={elements}
                selectedElement={selectedElementId}
                onElementsChange={handleElementsChange}
                onElementSelect={setSelectedElementId}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Metrics */}
        <div className="col-span-3">
          <MetricsDisplay metrics={metrics} />
        </div>
      </div>

      {/* Bottom - Track Settings & Save */}
      <div className="mt-4 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Track Settings</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Track Name *
            </label>
            <input
              type="text"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter track name..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Laps: {laps}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={laps}
              onChange={(e) => setLaps(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 lap</span>
              <span>10 laps</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveTrack}
          disabled={isLoading || !trackName.trim() || elements.length === 0}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {isLoading ? 'Saving...' : '💾 Save Track to Database'}
        </button>

        {message && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              message.includes('✅')
                ? 'bg-green-900 bg-opacity-50 text-green-200'
                : 'bg-red-900 bg-opacity-50 text-red-200'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateTrackNew

