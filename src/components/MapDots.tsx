// src/components/MapDots.tsx
import { memo, useCallback } from 'react'
import type { MapStation } from '../lib/mapLayout'

interface MapDotsProps {
  stations: MapStation[]
  isFiltering: boolean
  activeIndices: Set<number>
  hoveredIndex: number | null
  selectedIndex: number | null
  onHover: (index: number | null) => void
  onSelect: (index: number) => void
  zoomScale?: number
}

export const MapDots = memo(function MapDots({
  stations,
  isFiltering,
  activeIndices,
  hoveredIndex,
  selectedIndex,
  onHover,
  onSelect,
  zoomScale = 1,
}: MapDotsProps) {
  // Inverse scale so dots don't grow when zoomed in
  const inv = 1 / zoomScale

  const handleMouseLeave = useCallback(() => onHover(null), [onHover])

  return (
    <g>
      {stations.map((s) => {
        const isSelected = s.stationIndex === selectedIndex
        const isHovered  = s.stationIndex === hoveredIndex
        const isActive   = !isFiltering || activeIndices.has(s.stationIndex)

        let opacity = isActive ? 0.88 : 0.12
        if (isSelected || isHovered) opacity = 1

        return (
          <g key={s.stationIndex}>
            {/* Subtle glow ring — larger soft circle behind the dot, no blur */}
            {isActive && (
              <circle
                cx={s.sx} cy={s.sy}
                r={(s.r + (isSelected ? 7 : isHovered ? 5 : 3)) * inv}
                fill={s.color}
                opacity={isSelected ? 0.18 : isHovered ? 0.14 : 0.08}
                style={{ transition: 'opacity 150ms ease-out, r 150ms ease-out' }}
                pointerEvents="none"
              />
            )}

            {/* Selected outer ring accent — stronger than hover */}
            {isSelected && (
              <>
                <circle cx={s.sx} cy={s.sy} r={(s.r + 5) * inv} fill="none" stroke={s.color} strokeWidth={1.5 * inv} opacity={0.6} pointerEvents="none" />
                <circle cx={s.sx} cy={s.sy} r={(s.r + 2) * inv} fill="none" stroke="white" strokeWidth={0.8 * inv} opacity={0.35} pointerEvents="none" />
              </>
            )}

            {/* Selected station name label */}
            {isSelected && (
              <g pointerEvents="none" transform={`translate(${s.sx},${s.sy}) scale(${inv}) translate(${-s.sx},${-s.sy})`}>
                <rect
                  x={s.sx + s.r + 8}
                  y={s.sy - 8}
                  width={s.name.length * 5.8 + 12}
                  height={16}
                  rx={3}
                  fill="var(--map-surface)"
                  stroke="var(--map-border)"
                  strokeWidth={0.5}
                  opacity={0.92}
                />
                <text
                  x={s.sx + s.r + 14}
                  y={s.sy + 3}
                  fill="var(--map-text-primary)"
                  fontSize={10}
                  fontWeight={600}
                >
                  {s.name}
                </text>
              </g>
            )}

            {/* Station dot — sharp, no filter */}
            <circle
              cx={s.sx}
              cy={s.sy}
              r={s.r * inv}
              fill={s.color}
              opacity={opacity}
              style={{ cursor: 'pointer', transition: 'opacity 150ms ease-out' }}
              onMouseEnter={() => onHover(s.stationIndex)}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => { e.stopPropagation(); onSelect(s.stationIndex) }}
            />
          </g>
        )
      })}
    </g>
  )
})
