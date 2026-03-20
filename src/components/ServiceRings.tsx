import { arcPath } from '../lib/layout'
import { SERVICE_DEFINITIONS, ABSENT_COLOR } from '../lib/colors'
import type { LayoutResult } from '../lib/layout'
import type { VizPhase } from '../App'

const RING_STAGGER_MS = 120

interface ServiceRingsProps {
  layout: LayoutResult
  cx: number
  cy: number
  vizPhase: VizPhase
  hoveredStationIndex: number | null
  hoveredRingIndex: number | null
  activeStationIndices: Set<number>
  isInteracting: boolean
  selectedStationIndex: number | null
  onStationEnter: (index: number) => void
  onStationLeave: () => void
  onStationSelect?: (index: number) => void
}

export function ServiceRings({
  layout,
  cx,
  cy,
  vizPhase,
  hoveredStationIndex,
  hoveredRingIndex,
  activeStationIndices,
  isInteracting,
  selectedStationIndex,
  onStationEnter,
  onStationLeave,
  onStationSelect,
}: ServiceRingsProps) {
  const isStationHover = hoveredStationIndex !== null
  const isRingHover = hoveredRingIndex !== null
  const isSearchActive = activeStationIndices.size > 0
  const isSelected = selectedStationIndex !== null
  const isInteractive = vizPhase === 'interactive'

  const groupClass = [
    isInteracting ? 'rings-interacting' : '',
    isInteractive ? 'rings-interactive' : '',
  ].filter(Boolean).join(' ') || undefined

  return (
    <g transform={`translate(${cx},${cy})`} className={groupClass}>
      {/* Ring separator lines */}
      {layout.rings.map((ring) => (
        <circle
          key={`sep-${ring.ringIndex}`}
          r={ring.innerR}
          fill="none"
          stroke="var(--viz-separator)"
          strokeWidth={0.5}
        />
      ))}

      {/* Arc segments */}
      {layout.stations.map((station) => {
        const isThisSelected = station.stationIndex === selectedStationIndex
        const isThisHovered = station.stationIndex === hoveredStationIndex

        let stationOpacity: number
        if (isSelected) {
          stationOpacity = isThisSelected ? 1 : 0.15
        } else if (isStationHover) {
          stationOpacity = isThisHovered ? 1 : 0.08
        } else if (isRingHover) {
          stationOpacity = 1
        } else if (isSearchActive) {
          stationOpacity = activeStationIndices.has(station.stationIndex) ? 1 : 0.08
        } else {
          stationOpacity = 0.85
        }

        return (
          <g key={`station-${station.stationIndex}`}>
            {SERVICE_DEFINITIONS.map((svc, ringIndex) => {
              const ring = layout.rings[ringIndex]
              const hasService = station.services[svc.field] === true

              let opacity: number
              if (isRingHover) {
                if (ringIndex === hoveredRingIndex) {
                  opacity = hasService ? 1 : 0.05
                } else {
                  opacity = 0.15
                }
              } else {
                opacity = stationOpacity
              }

              const fill = hasService ? svc.color : ABSENT_COLOR

              const stroke =
                (isSelected && isThisSelected && hasService) ||
                (isStationHover && isThisHovered && hasService)
                  ? 'var(--viz-stroke-hover)'
                  : 'none'

              const path = arcPath(ring.innerR, ring.outerR, station.fillStartAngle, station.fillEndAngle)

              // During reveal: ring-reveal class with ring-based delay
              // During interactive: ring-pulse class for brightness breath
              const arcClass = vizPhase === 'revealing'
                ? 'arc-path ring-reveal'
                : 'arc-path ring-pulse'

              const arcStyle = vizPhase === 'revealing'
                ? { animationDelay: `${ringIndex * RING_STAGGER_MS}ms` }
                : { animationDelay: `${ringIndex * 320}ms` }

              return (
                <path
                  key={`${station.stationIndex}-${ringIndex}`}
                  className={arcClass}
                  style={arcStyle}
                  d={path}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={0.5}
                  opacity={opacity}
                  onMouseEnter={isInteractive ? () => onStationEnter(station.stationIndex) : undefined}
                  onMouseLeave={isInteractive ? onStationLeave : undefined}
                  onClick={isInteractive ? (e) => {
                    e.stopPropagation()
                    onStationSelect?.(station.stationIndex)
                  } : undefined}
                  cursor={isInteractive ? 'pointer' : 'default'}
                />
              )
            })}
          </g>
        )
      })}
    </g>
  )
}
