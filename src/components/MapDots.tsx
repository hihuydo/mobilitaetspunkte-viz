// src/components/MapDots.tsx
import { useCallback } from 'react'
import type { MapStation } from '../lib/mapLayout'

interface MapDotsProps {
  stations: MapStation[]
  activeGroupKeys: Set<string>
  hoveredIndex: number | null
  selectedIndex: number | null
  onHover: (index: number | null) => void
  onSelect: (index: number) => void
}

export function MapDots({
  stations,
  activeGroupKeys,
  hoveredIndex,
  selectedIndex,
  onHover,
  onSelect,
}: MapDotsProps) {
  const isFiltering = activeGroupKeys.size > 0

  const handleMouseLeave = useCallback(() => onHover(null), [onHover])

  return (
    <g>
      {stations.map((s) => {
        const isSelected = s.stationIndex === selectedIndex
        const isHovered  = s.stationIndex === hoveredIndex
        const isActive   = !isFiltering || activeGroupKeys.has(s.groupKey)

        let opacity = isActive ? 0.88 : 0.12
        if (isSelected || isHovered) opacity = 1

        return (
          <g key={s.stationIndex}>
            {/* Selected halo */}
            {isSelected && (
              <>
                <circle cx={s.sx} cy={s.sy} r={s.r + 8} fill={s.color} opacity={0.06} />
                <circle cx={s.sx} cy={s.sy} r={s.r + 4} fill="none" stroke={s.color} strokeWidth={1} opacity={0.25} />
              </>
            )}

            {/* Station dot */}
            <circle
              cx={s.sx}
              cy={s.sy}
              r={s.r}
              fill={s.color}
              opacity={opacity}
              filter={isSelected ? 'url(#map-glow-selected)' : isActive ? 'url(#map-glow-dot)' : undefined}
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
