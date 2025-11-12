import { ElementType } from '../types/track'

interface TrackToolbarProps {
  onAddElement: (type: ElementType) => void
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  onExport: () => void
  onImport: () => void
  canUndo: boolean
  canRedo: boolean
  elementCount: number
}

export default function TrackToolbar({
  onAddElement,
  onUndo,
  onRedo,
  onClear,
  onExport,
  onImport,
  canUndo,
  canRedo,
  elementCount,
}: TrackToolbarProps) {
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-4 border border-gray-700">
      <div className="flex flex-wrap gap-3">
        {/* Add Elements */}
        <div className="flex gap-2">
          <button
            onClick={() => onAddElement('straight')}
            className="group relative px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium text-sm shadow-lg hover:shadow-xl"
            title="Add Straight"
          >
            <span className="flex items-center gap-2">
              <span>➖</span>
              <span>Straight</span>
            </span>
          </button>

          <button
            onClick={() => onAddElement('corner-left')}
            className="group relative px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all font-medium text-sm shadow-lg hover:shadow-xl"
            title="Add Left Corner"
          >
            <span className="flex items-center gap-2">
              <span>↰</span>
              <span>Corner L</span>
            </span>
          </button>

          <button
            onClick={() => onAddElement('corner-right')}
            className="group relative px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all font-medium text-sm shadow-lg hover:shadow-xl"
            title="Add Right Corner"
          >
            <span className="flex items-center gap-2">
              <span>↱</span>
              <span>Corner R</span>
            </span>
          </button>
        </div>

        <div className="w-px bg-gray-600" />

        {/* History Controls */}
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium text-sm"
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium text-sm"
            title="Redo (Ctrl+Y)"
          >
            ↷ Redo
          </button>
        </div>

        <div className="w-px bg-gray-600" />

        {/* File Operations */}
        <div className="flex gap-2">
          <button
            onClick={onImport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-medium text-sm shadow-lg hover:shadow-xl"
            title="Import Track JSON"
          >
            📂 Import
          </button>

          <button
            onClick={onExport}
            disabled={elementCount === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium text-sm shadow-lg hover:shadow-xl"
            title="Export Track JSON"
          >
            💾 Export
          </button>

          <button
            onClick={onClear}
            disabled={elementCount === 0}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium text-sm"
            title="Clear All Elements"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Element Count */}
        <div className="ml-auto flex items-center px-4 py-2 bg-gray-700 rounded-lg">
          <span className="text-sm text-gray-300">
            Elements: <span className="font-bold text-white">{elementCount}</span>
          </span>
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
          <span><kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Ctrl+Z</kbd> Undo</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Ctrl+Y</kbd> Redo</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Delete</kbd> Remove selected</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Drag</kbd> Move elements</span>
        </div>
      </div>
    </div>
  )
}

