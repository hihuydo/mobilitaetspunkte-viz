import { arcPath } from '../lib/layout'
import { SERVICE_DEFINITIONS, ABSENT_COLOR } from '../lib/colors'
import type { LayoutResult } from '../lib/layout'

interface ServiceRingsProps {
  layout: LayoutResult
  cx: number
  cy: number
  hoveredStationIndex: number | null
  hoveredRingIndex: number | null
  activeStationIndices: Set<number>
  onStationEnter: (index: number) => void
  onStationLeave: () => void
}

export function ServiceRings({
  layout,
  cx,
  cy,
  hoveredStationIndex,
  hoveredRingIndex,
  activeStationIndices,
  onStationEnter,
  onStationLeave,
}: ServiceRingsProps) {
  const isStationHover = hoveredStationIndex !== null
  const isRingHover = hoveredRingIndex !== null
  const isSearchActive = activeStationIndices.size > 0

  return (
    <g transform={`translate(${cx},${cy})`}>
      {/* Ring separator lines */}
      {layout.rings.map((ring) => (
        <circle
          key={`sep-${ring.ringIndex}`}
          r={ring.innerR}
          fill="none"
          stroke="#1a2a45"
          strokeWidth={0.5}
        />
      ))}

      {/* Arc segments: iterate stations, each wrapped in a <g> */}
      {layout.stations.map((station) => {
        let stationOpacity: number
        if (isStationHover) {
          stationOpacity = station.stationIndex === hoveredStationIndex ? 1 : 0.08
        } else if (isRingHover) {
          stationOpacity = 1 // per-ring opacity handled per segment below
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
                isStationHover && station.stationIndex === hoveredStationIndex && hasService
                  ? 'rgba(255,255,255,0.5)'
                  : 'none'

              const path = arcPath(ring.innerR, ring.outerR, station.fillStartAngle, station.fillEndAngle)

              return (
                <path
                  key={`${station.stationIndex}-${ringIndex}`}
                  className="arc-path"
                  d={path}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={0.5}
                  opacity={opacity}
                  onMouseEnter={() => onStationEnter(station.stationIndex)}
                  onMouseLeave={onStationLeave}
                  cursor="crosshair"
                />
              )
            })}
          </g>
        )
      })}
    </g>
  )
}
