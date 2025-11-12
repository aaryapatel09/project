import { useMemo } from 'react'
import { LinePath } from '@visx/shape'
import { Group } from '@visx/group'
import { scaleLinear } from '@visx/scale'
import { AxisLeft, AxisBottom } from '@visx/axis'
import { GridRows, GridColumns } from '@visx/grid'

interface GapData {
  lap: number
  [driver: string]: number
}

interface LiveGapChartProps {
  data: GapData[]
  drivers: string[]
  width: number
  height: number
  currentLap: number
}

const margin = { top: 20, right: 120, bottom: 40, left: 50 }

export default function LiveGapChart({
  data,
  drivers,
  width,
  height,
  currentLap,
}: LiveGapChartProps) {
  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

  const { xScale, yScale } = useMemo(() => {
    const maxLap = Math.max(...data.map((d) => d.lap))
    const maxGap = Math.max(
      ...data.flatMap((d) => drivers.map((driver) => d[driver] || 0))
    )

    return {
      xScale: scaleLinear({
        domain: [1, maxLap || 1],
        range: [0, xMax],
      }),
      yScale: scaleLinear({
        domain: [maxGap + 5, 0],
        range: [0, yMax],
      }),
    }
  }, [data, drivers, xMax, yMax])

  const colors = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#f97316',
  ]

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <GridRows
          scale={yScale}
          width={xMax}
          stroke="#374151"
          strokeOpacity={0.3}
        />
        <GridColumns
          scale={xScale}
          height={yMax}
          stroke="#374151"
          strokeOpacity={0.3}
        />

        {/* Gap lines */}
        {drivers.map((driver, i) => (
          <LinePath
            key={driver}
            data={data.filter((d) => d.lap <= currentLap)}
            x={(d) => xScale(d.lap) || 0}
            y={(d) => yScale(d[driver] || 0) || 0}
            stroke={colors[i % colors.length]}
            strokeWidth={2.5}
            strokeOpacity={0.9}
          />
        ))}

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
          tickLabelProps={() => ({
            fill: '#9ca3af',
            fontSize: 11,
            textAnchor: 'end',
            dy: '0.33em',
          })}
          label="Gap to Leader (seconds)"
          labelProps={{
            fill: '#9ca3af',
            fontSize: 12,
            textAnchor: 'middle',
          }}
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

        {/* Driver legend */}
        {drivers.map((driver, i) => (
          <g
            key={driver}
            transform={`translate(${xMax + 10}, ${i * 20})`}
          >
            <rect width={12} height={12} fill={colors[i % colors.length]} />
            <text
              x={18}
              y={10}
              fontSize={11}
              fill="#d1d5db"
              style={{ fontWeight: 500 }}
            >
              {driver.length > 15 ? driver.substring(0, 15) + '...' : driver}
            </text>
          </g>
        ))}
      </Group>
    </svg>
  )
}

