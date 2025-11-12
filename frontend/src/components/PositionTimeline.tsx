import { useMemo } from 'react'
import { Group } from '@visx/group'
import { scaleLinear, scaleOrdinal } from '@visx/scale'
import { Circle } from '@visx/shape'
import { AxisLeft, AxisBottom } from '@visx/axis'

interface PositionData {
  lap: number
  positions: { [driver: string]: number }
}

interface PositionTimelineProps {
  data: PositionData[]
  drivers: string[]
  width: number
  height: number
  currentLap: number
}

const margin = { top: 20, right: 20, bottom: 40, left: 60 }

export default function PositionTimeline({
  data,
  drivers,
  width,
  height,
  currentLap,
}: PositionTimelineProps) {
  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

  const { xScale, yScale, colorScale } = useMemo(() => {
    const maxLap = Math.max(...data.map((d) => d.lap), 1)
    const maxPosition = drivers.length

    return {
      xScale: scaleLinear({
        domain: [1, maxLap],
        range: [0, xMax],
      }),
      yScale: scaleLinear({
        domain: [maxPosition, 1],
        range: [yMax, 0],
      }),
      colorScale: scaleOrdinal({
        domain: drivers,
        range: [
          '#3b82f6',
          '#ef4444',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
          '#06b6d4',
          '#f97316',
        ],
      }),
    }
  }, [data, drivers, xMax, yMax])

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {/* Grid lines for positions */}
        {Array.from({ length: drivers.length }, (_, i) => i + 1).map(
          (pos) => (
            <line
              key={pos}
              x1={0}
              x2={xMax}
              y1={yScale(pos)}
              y2={yScale(pos)}
              stroke="#374151"
              strokeOpacity={0.3}
            />
          )
        )}

        {/* Position paths */}
        {drivers.map((driver) => {
          const driverData = data
            .filter((d) => d.lap <= currentLap && d.positions[driver])
            .map((d) => ({
              lap: d.lap,
              position: d.positions[driver],
            }))

          if (driverData.length < 2) return null

          const pathData = driverData
            .map((d, i) => {
              const x = xScale(d.lap)
              const y = yScale(d.position)
              return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
            })
            .join(' ')

          return (
            <g key={driver}>
              <path
                d={pathData}
                fill="none"
                stroke={colorScale(driver)}
                strokeWidth={2}
                strokeOpacity={0.6}
              />
              {/* Position markers */}
              {driverData.map((d, i) => (
                <Circle
                  key={i}
                  cx={xScale(d.lap)}
                  cy={yScale(d.position)}
                  r={3}
                  fill={colorScale(driver)}
                />
              ))}
            </g>
          )
        })}

        {/* Current lap indicator */}
        {currentLap > 0 && (
          <line
            x1={xScale(currentLap)}
            x2={xScale(currentLap)}
            y1={0}
            y2={yMax}
            stroke="#fbbf24"
            strokeWidth={2}
            strokeDasharray="4,4"
          />
        )}

        {/* Axes */}
        <AxisLeft
          scale={yScale}
          stroke="#9ca3af"
          tickStroke="#9ca3af"
          numTicks={drivers.length}
          tickFormat={(v) => `P${v}`}
          tickLabelProps={() => ({
            fill: '#9ca3af',
            fontSize: 11,
            textAnchor: 'end',
            dy: '0.33em',
          })}
        />
        <AxisBottom
          top={yMax}
          scale={xScale}
          stroke="#9ca3af"
          tickStroke="#9ca3af"
          tickLabelProps={() => ({
            fill: '#9ca3af',
            fontSize: 11,
            textAnchor: 'middle',
          })}
          label="Lap"
          labelProps={{
            fill: '#9ca3af',
            fontSize: 12,
            textAnchor: 'middle',
          }}
        />
      </Group>
    </svg>
  )
}

