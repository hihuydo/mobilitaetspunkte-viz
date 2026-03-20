import { useState, useEffect, useRef } from 'react'
import { SERVICE_DEFINITIONS } from '../lib/colors'
import type { StationGeometry } from '../lib/layout'

interface CenterLabelProps {
  cx: number
  cy: number
  r: number
  hoveredRingLabel: string | null
  hoveredStationName: string | null
  selectedStation: StationGeometry | null
  isIdle: boolean
  insights: string[]
  searchMatchCount: number
}

export function CenterLabel({
  cx,
  cy,
  r,
  hoveredRingLabel,
  hoveredStationName,
  selectedStation,
  isIdle,
  insights,
  searchMatchCount,
}: CenterLabelProps) {
  // Insight cycling state
  const [insightIndex, setInsightIndex] = useState(0)
  const [insightVisible, setInsightVisible] = useState(true)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start cycling after 5s of idle; stop when interaction begins
  useEffect(() => {
    // Clear any previous timers
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }

    if (!isIdle || insights.length === 0) return

    // Wait 5s then start cycling
    resumeTimerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setInsightVisible(false)
        setTimeout(() => {
          setInsightIndex((i) => (i + 1) % insights.length)
          setInsightVisible(true)
        }, 200)
      }, 4000)
    }, 5000)

    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isIdle, insights])

  // Display priority (highest → lowest):
  // 1. selectedStation  2. hoveredStationName  3. hoveredRingLabel
  // 4. searchMatchCount > 0  5. !isIdle (title)  6. isIdle (insights)
  const showSelected = selectedStation !== null
  const showHoveredStation = !showSelected && hoveredStationName !== null
  const showRingLabel = !showSelected && !showHoveredStation && hoveredRingLabel !== null
  const showSearchCount = !showSelected && !showHoveredStation && !showRingLabel && searchMatchCount > 0
  const showTitle = !isIdle && !showSelected && !showHoveredStation && !showRingLabel && !showSearchCount
  const showInsights = isIdle && !showSelected && !showHoveredStation && !showRingLabel && !showSearchCount

  // Station detail computed values
  const serviceCount = selectedStation
    ? SERVICE_DEFINITIONS.filter((svc) => selectedStation.services[svc.field] === true).length
    : 0

  const displayName = selectedStation
    ? (selectedStation.name.length > 20
        ? selectedStation.name.slice(0, 19) + '…'
        : selectedStation.name)
    : ''

  // Dot layout: 11 dots in 2 rows (6 + 5), centered
  const DOT_SPACING = 8
  const ROW_SIZE = 6
  const dot = (i: number) => {
    const col = i % ROW_SIZE
    const row = Math.floor(i / ROW_SIZE)
    const rowCount = i < ROW_SIZE ? Math.min(ROW_SIZE, SERVICE_DEFINITIONS.length) : SERVICE_DEFINITIONS.length - ROW_SIZE
    const startX = cx - (rowCount * DOT_SPACING) / 2 + DOT_SPACING / 2
    return { x: startX + col * DOT_SPACING, y: cy + 10 + row * 9 }
  }

  return (
    <g>
      {/* Center circle background */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="var(--viz-surface)"
        stroke="var(--viz-separator)"
        strokeWidth={1}
      />

      {/* 1. Selected station detail */}
      <g style={{ opacity: showSelected ? 1 : 0, transition: 'opacity 150ms ease-out' }}>
        <text
          x={cx}
          y={cy - 14}
          textAnchor="middle"
          fontSize={7.5}
          fontWeight={600}
          fill="var(--viz-text-primary)"
        >
          {displayName}
        </text>
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize={6.5}
          fill="var(--viz-text-muted)"
        >
          {serviceCount} von 11 Diensten
        </text>
        {SERVICE_DEFINITIONS.map((svc, i) => {
          const present = selectedStation?.services[svc.field] === true
          const { x, y } = dot(i)
          return (
            <circle
              key={svc.field}
              cx={x}
              cy={y}
              r={2.5}
              fill={present ? svc.color : 'var(--viz-separator)'}
              opacity={present ? 0.9 : 0.5}
            />
          )
        })}
      </g>

      {/* 2. Hovered station name */}
      <g style={{ opacity: showHoveredStation ? 1 : 0, transition: 'opacity 150ms ease-out' }}>
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={9}
          fill="var(--viz-text-primary)"
        >
          {hoveredStationName ?? ''}
        </text>
      </g>

      {/* 3. Ring hover label */}
      <g style={{ opacity: showRingLabel ? 1 : 0, transition: 'opacity 150ms ease-out' }}>
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={9}
          fill="var(--viz-text-primary)"
        >
          {hoveredRingLabel ?? ''}
        </text>
      </g>

      {/* 4. Search match count */}
      <g style={{ opacity: showSearchCount ? 1 : 0, transition: 'opacity 150ms ease-out' }}>
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={8}
          fill="var(--viz-text-muted)"
        >
          {searchMatchCount} Treffer
        </text>
      </g>

      {/* 5. Static title (during reveal / non-idle) */}
      <g style={{ opacity: showTitle ? 1 : 0, transition: 'opacity 150ms ease-out' }}>
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontSize={7}
          fill="var(--viz-text-muted)"
          letterSpacing={1.5}
        >
          MÜNCHEN
        </text>
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={8.5}
          fill="var(--viz-text-primary)"
          fontWeight={600}
        >
          Mobilitäts-
        </text>
        <text
          x={cx}
          y={cy + 15}
          textAnchor="middle"
          fontSize={8.5}
          fill="var(--viz-text-primary)"
          fontWeight={600}
        >
          punkte
        </text>
      </g>

      {/* 6. Cycling insights (idle state) */}
      <g style={{ opacity: showInsights ? 1 : 0, transition: 'opacity 200ms ease-out' }}>
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={6.5}
          fill="var(--viz-text-muted)"
          letterSpacing={0.3}
          style={{ opacity: insightVisible ? 1 : 0, transition: 'opacity 200ms ease-out' }}
        >
          {insights[insightIndex] ?? ''}
        </text>
      </g>
    </g>
  )
}
