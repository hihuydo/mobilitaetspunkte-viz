import type { LayoutResult } from '../lib/layout'
import type { VizPhase } from '../App'

const LABEL_BASE_MS = 1800

interface StationLabelsProps {
  layout: LayoutResult
  cx: number
  cy: number
  vizPhase: VizPhase
  hoveredStationIndex: number | null
  isRingHover: boolean
  activeStationIndices: Set<number>
  selectedStationIndex: number | null
  onStationEnter: (index: number) => void
  onStationLeave: () => void
}

export function StationLabels({
  layout,
  cx,
  cy,
  vizPhase,
  hoveredStationIndex,
  isRingHover,
  activeStationIndices,
  selectedStationIndex,
  onStationEnter,
  onStationLeave,
}: StationLabelsProps) {
  const R = layout.labelR
  const connectorInnerR = layout.ringZoneOuterR
  const isSearchActive = activeStationIndices.size > 0
  const isSelected = selectedStationIndex !== null
  const isInteractive = vizPhase === 'interactive'

  return (
    <g transform={`translate(${cx},${cy})`}>
      {layout.stations.map((station) => {
        const isHovered = station.stationIndex === hoveredStationIndex
        const isThisSelected = station.stationIndex === selectedStationIndex

        let opacity: number
        let fill: string

        if (isSelected) {
          opacity = isThisSelected ? 1 : 0.08
          fill = isThisSelected ? 'var(--viz-text-primary)' : 'var(--viz-text-dimmed)'
        } else if (hoveredStationIndex !== null) {
          opacity = isHovered ? 1 : 0.2
          fill = isHovered ? 'var(--viz-text-primary)' : 'var(--viz-text-dimmed)'
        } else if (isRingHover) {
          opacity = 0.3
          fill = 'var(--viz-text-dimmed)'
        } else if (isSearchActive) {
          const isMatch = activeStationIndices.has(station.stationIndex)
          opacity = isMatch ? 1 : 0.08
          fill = isMatch ? 'var(--viz-text-primary)' : 'var(--viz-text-dimmed)'
        } else {
          opacity = 1
          fill = 'var(--viz-text-dimmed)'
        }

        const cos = Math.cos(station.midAngle)
        const sin = Math.sin(station.midAngle)

        const angleDeg = (station.midAngle * 180) / Math.PI
        const transform = station.labelFlip
          ? `rotate(${angleDeg}) translate(${R}, 0) rotate(180)`
          : `rotate(${angleDeg}) translate(${R}, 0)`

        // During revealing: use station-label-entry with deferred delay
        // During interactive: no animation class, normal opacity from state
        const entryDelay = Math.max(0, ((station.midAngle + Math.PI / 2) / (2 * Math.PI)) * 600) + LABEL_BASE_MS
        const isRevealing = vizPhase === 'revealing'

        const labelClass = isRevealing ? 'station-label-entry' : undefined
        const labelStyle = isRevealing
          ? { animationDelay: `${entryDelay}ms`, transition: 'opacity 150ms ease-out, fill 150ms ease-out' }
          : { transition: 'opacity 150ms ease-out, fill 150ms ease-out', cursor: 'default', userSelect: 'none' as const }

        const lineStyle = isRevealing
          ? { animationDelay: `${entryDelay}ms`, transition: 'opacity 150ms ease-out, stroke 150ms ease-out' }
          : { transition: 'opacity 150ms ease-out, stroke 150ms ease-out' }

        return (
          <g key={station.stationIndex}>
            {/* Connector line */}
            <line
              x1={connectorInnerR * cos}
              y1={connectorInnerR * sin}
              x2={R * cos}
              y2={R * sin}
              stroke={fill}
              strokeWidth={0.5}
              opacity={isRevealing ? undefined : opacity}
              className={labelClass}
              style={lineStyle}
              onMouseEnter={isInteractive ? () => onStationEnter(station.stationIndex) : undefined}
              onMouseLeave={isInteractive ? onStationLeave : undefined}
            />
            <text
              transform={transform}
              textAnchor={station.labelAnchor}
              dominantBaseline="middle"
              fontSize="clamp(5.5px, 0.8vw, 8px)"
              fontWeight={300}
              fill={fill}
              opacity={isRevealing ? undefined : opacity}
              className={labelClass}
              style={labelStyle}
              onMouseEnter={isInteractive ? () => onStationEnter(station.stationIndex) : undefined}
              onMouseLeave={isInteractive ? onStationLeave : undefined}
            >
              {station.name}
            </text>
          </g>
        )
      })}
    </g>
  )
}
