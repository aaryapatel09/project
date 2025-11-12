import { TrackElement, ElementType } from '../types/track'

interface ElementControlsProps {
  selectedElement: TrackElement | null
  onUpdate: (updates: Partial<TrackElement>) => void
  onDelete: () => void
}

export default function ElementControls({
  selectedElement,
  onUpdate,
  onDelete,
}: ElementControlsProps) {
  if (!selectedElement) {
    return (
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
        <p className="text-gray-400 text-center">
          Select a track element to edit its properties
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white capitalize">
          {selectedElement.type.replace('-', ' ')}
        </h3>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm"
        >
          Delete
        </button>
      </div>

      {/* Element Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Element Type
        </label>
        <select
          value={selectedElement.type}
          onChange={(e) => onUpdate({ type: e.target.value as ElementType })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="straight">Straight</option>
          <option value="corner-left">Corner Left</option>
          <option value="corner-right">Corner Right</option>
        </select>
      </div>

      {/* Length */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Length: {selectedElement.length}m
        </label>
        <input
          type="range"
          min="50"
          max="1000"
          step="10"
          value={selectedElement.length}
          onChange={(e) => onUpdate({ length: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>50m</span>
          <span>1000m</span>
        </div>
      </div>

      {/* Width */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Track Width: {selectedElement.width}m
        </label>
        <input
          type="range"
          min="10"
          max="30"
          step="1"
          value={selectedElement.width}
          onChange={(e) => onUpdate({ width: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>10m</span>
          <span>30m</span>
        </div>
      </div>

      {/* Banking */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Banking: {selectedElement.banking}°
        </label>
        <input
          type="range"
          min="0"
          max="30"
          step="1"
          value={selectedElement.banking}
          onChange={(e) => onUpdate({ banking: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0° (Flat)</span>
          <span>30° (Banked)</span>
        </div>
      </div>

      {/* Elevation */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Elevation: {selectedElement.elevation > 0 ? '+' : ''}
          {selectedElement.elevation}m
        </label>
        <input
          type="range"
          min="-50"
          max="50"
          step="1"
          value={selectedElement.elevation}
          onChange={(e) => onUpdate({ elevation: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>-50m (Down)</span>
          <span>+50m (Up)</span>
        </div>
      </div>

      {/* DRS Zone */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={selectedElement.isDRS}
            onChange={(e) => onUpdate({ isDRS: e.target.checked })}
            className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-green-500"
          />
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
            DRS Zone (Drag Reduction System)
          </span>
        </label>
      </div>

      {/* Sector Number */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Sector Number
        </label>
        <select
          value={selectedElement.sectorNumber ?? ''}
          onChange={(e) =>
            onUpdate({
              sectorNumber: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No Sector</option>
          <option value="1">Sector 1</option>
          <option value="2">Sector 2</option>
          <option value="3">Sector 3</option>
        </select>
      </div>
    </div>
  )
}

