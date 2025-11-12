import { useState, useRef, useEffect } from 'react'
import { TrackElement, ElementType } from '../types/track'
import { calculateTrackMetrics } from '../utils/trackMetrics'

interface TrackEditorProps {
  elements: TrackElement[]
  selectedElement: string | null
  onElementsChange: (elements: TrackElement[]) => void
  onElementSelect: (id: string | null) => void
}

export default function TrackEditor({
  elements,
  selectedElement,
  onElementsChange,
  onElementSelect,
}: TrackEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    const element = elements.find((el) => el.id === elementId)
    if (!element) return

    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return

    setIsDragging(true)
    setDragOffset({
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y,
    })
    onElementSelect(elementId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return

    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return

    const newX = Math.max(0, Math.min(800 - 100, e.clientX - rect.left - dragOffset.x))
    const newY = Math.max(0, Math.min(600 - 100, e.clientY - rect.top - dragOffset.y))

    const updatedElements = elements.map((el) =>
      el.id === selectedElement ? { ...el, x: newX, y: newY } : el
    )
    onElementsChange(updatedElements)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSvgClick = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      onElementSelect(null)
    }
  }

  const renderElement = (element: TrackElement) => {
    const isSelected = element.id === selectedElement
    const isHovered = element.id === hoveredElement

    let path = ''
    let width = element.width || 60
    let height = element.length / 5 // Scale for display

    switch (element.type) {
      case 'straight':
        path = `M ${element.x} ${element.y} L ${element.x} ${element.y + height}`
        break
      case 'corner-left':
        path = `M ${element.x} ${element.y} Q ${element.x - width} ${element.y + height / 2} ${element.x} ${element.y + height}`
        break
      case 'corner-right':
        path = `M ${element.x} ${element.y} Q ${element.x + width} ${element.y + height / 2} ${element.x} ${element.y + height}`
        break
    }

    return (
      <g
        key={element.id}
        onMouseDown={(e) => handleMouseDown(e, element.id)}
        onMouseEnter={() => setHoveredElement(element.id)}
        onMouseLeave={() => setHoveredElement(null)}
        style={{ cursor: 'move' }}
      >
        <path
          d={path}
          fill="none"
          stroke={element.isDRS ? '#10b981' : '#3b82f6'}
          strokeWidth={isSelected ? 12 : isHovered ? 10 : 8}
          strokeLinecap="round"
          opacity={isSelected ? 1 : isHovered ? 0.9 : 0.7}
          className="transition-all duration-200"
        />
        {isSelected && (
          <>
            <circle
              cx={element.x}
              cy={element.y}
              r={6}
              fill="#ef4444"
              className="animate-pulse"
            />
            <circle
              cx={element.x}
              cy={element.y + height}
              r={6}
              fill="#ef4444"
              className="animate-pulse"
            />
          </>
        )}
        {element.isDRS && (
          <text
            x={element.x + 10}
            y={element.y + height / 2}
            fill="#10b981"
            fontSize="12"
            fontWeight="bold"
          >
            DRS
          </text>
        )}
        {element.sectorNumber !== null && (
          <text
            x={element.x - 10}
            y={element.y + 5}
            fill="#f59e0b"
            fontSize="14"
            fontWeight="bold"
          >
            S{element.sectorNumber}
          </text>
        )}
      </g>
    )
  }

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-xl border-2 border-gray-700 overflow-hidden">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleSvgClick}
        className="cursor-default"
      >
        {/* Grid background */}
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="#374151"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="800" height="600" fill="url(#grid)" />

        {/* Start/Finish Line */}
        {elements.length > 0 && (
          <g>
            <line
              x1={elements[0].x - 30}
              y1={elements[0].y}
              x2={elements[0].x + 30}
              y2={elements[0].y}
              stroke="#ffffff"
              strokeWidth="3"
              strokeDasharray="10,5"
            />
            <text
              x={elements[0].x}
              y={elements[0].y - 10}
              fill="#ffffff"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
            >
              START/FINISH
            </text>
          </g>
        )}

        {/* Track elements */}
        {elements.map(renderElement)}

        {/* Empty state */}
        {elements.length === 0 && (
          <text
            x="400"
            y="300"
            fill="#9ca3af"
            fontSize="20"
            textAnchor="middle"
          >
            Add track elements to begin
          </text>
        )}
      </svg>

      {/* Tooltip */}
      {hoveredElement && (
        <div className="absolute top-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-white shadow-xl">
          {(() => {
            const el = elements.find((e) => e.id === hoveredElement)
            if (!el) return null
            return (
              <>
                <div className="font-bold mb-1 capitalize">
                  {el.type.replace('-', ' ')}
                </div>
                <div>Length: {el.length}m</div>
                <div>Banking: {el.banking}°</div>
                <div>Elevation: {el.elevation > 0 ? '+' : ''}{el.elevation}m</div>
                {el.isDRS && <div className="text-green-400">DRS Zone</div>}
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}

