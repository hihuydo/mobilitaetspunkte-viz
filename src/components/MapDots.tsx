// src/components/MapDots.tsx
import { useCallback } from 'react'
import type { MapStation } from '../lib/mapLayout'

interface MapDotsProps {
  stations: MapStation[]
  isFiltering: boolean
  activeIndices: Set<number>
  hoveredIndex: number | null
  selectedIndex: number | null
  onHover: (index: number | null) => void
  onSelect: (index: number) => void
}

export function MapDots({
  stations,
  isFiltering,
  activeIndices,
  hoveredIndex,
  selectedIndex,
  onHover,
  onSelect,
}: MapDotsProps) {

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
                r={s.r + (isSelected ? 7 : isHovered ? 5 : 3)}
                fill={s.color}
                opacity={isSelected ? 0.18 : isHovered ? 0.14 : 0.08}
                style={{ transition: 'opacity 150ms ease-out, r 150ms ease-out' }}
                pointerEvents="none"
              />
            )}

            {/* Selected outer ring accent */}
            {isSelected && (
              <circle cx={s.sx} cy={s.sy} r={s.r + 5} fill="none" stroke={s.color} strokeWidth={1} opacity={0.3} pointerEvents="none" />
            )}

            {/* Station dot — sharp, no filter */}
            <circle
              cx={s.sx}
              cy={s.sy}
              r={s.r}
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
}
