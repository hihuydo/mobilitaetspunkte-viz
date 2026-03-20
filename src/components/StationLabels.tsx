import type { LayoutResult } from '../lib/layout'

interface StationLabelsProps {
  layout: LayoutResult
  cx: number
  cy: number
  hoveredStationIndex: number | null
  isRingHover: boolean
  activeStationIndices: Set<number>
  onStationEnter: (index: number) => void
  onStationLeave: () => void
}

export function StationLabels({
  layout,
  cx,
  cy,
  hoveredStationIndex,
  isRingHover,
  activeStationIndices,
  onStationEnter,
  onStationLeave,
}: StationLabelsProps) {
  const R = layout.labelR
  const isSearchActive = activeStationIndices.size > 0

  return (
    <g transform={`translate(${cx},${cy})`}>
      {layout.stations.map((station) => {
        const isHovered = station.stationIndex === hoveredStationIndex

        let opacity: number
        let fill: string
        if (hoveredStationIndex !== null) {
          opacity = isHovered ? 1 : 0.2
          fill = isHovered ? '#c9d8e8' : '#6a94b0'
        } else if (isRingHover) {
          opacity = 0.3
          fill = '#6a94b0'
        } else if (isSearchActive) {
          const isMatch = activeStationIndices.has(station.stationIndex)
          opacity = isMatch ? 1 : 0.08
          fill = isMatch ? '#c9d8e8' : '#6a94b0'
        } else {
          opacity = 1
          fill = '#6a94b0'
        }

        // SVG transform strategy:
        // rotate(angleDeg) — spin to face the spoke
        // translate(R, 0)  — move out along the (now-rotated) x-axis
        // rotate(180)      — flip for left-half labels (text reads left-to-right)
        const angleDeg = (station.midAngle * 180) / Math.PI

        const transform = station.labelFlip
          ? `rotate(${angleDeg}) translate(${R}, 0) rotate(180)`
          : `rotate(${angleDeg}) translate(${R}, 0)`

        // midAngle starts at -π/2 (top) and sweeps clockwise to ~3π/2; +350ms after arcs
        const entryDelay = ((station.midAngle + Math.PI / 2) / (2 * Math.PI)) * 600 + 350

        return (
          <g
            key={station.stationIndex}
            className="station-entry"
            style={{ animationDelay: `${entryDelay}ms` }}
          >
            <text
              transform={transform}
              textAnchor={station.labelAnchor}
              dominantBaseline="middle"
              fontSize="clamp(5.5px, 0.8vw, 8px)"
              fontWeight={300}
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fill={fill}
              opacity={opacity}
              style={{
                transition: 'opacity 150ms ease-out, fill 150ms ease-out',
                cursor: 'default',
                userSelect: 'none',
              }}
              onMouseEnter={() => onStationEnter(station.stationIndex)}
              onMouseLeave={onStationLeave}
            >
              {station.name}
            </text>
          </g>
        )
      })}
    </g>
  )
}
