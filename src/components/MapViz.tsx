// src/components/MapViz.tsx
import { MapBackground } from './MapBackground'
import { MapDots } from './MapDots'
import type { MapStation } from '../lib/mapLayout'

interface MapVizProps {
  stations: MapStation[]
  width: number
  height: number
  activeGroupKeys: Set<string>
  hoveredIndex: number | null
  selectedIndex: number | null
  onHover: (index: number | null) => void
  onSelect: (index: number) => void
  onDeselect: () => void
}

// City centre sits roughly at 43% across, 52% down in the projected Munich bounding box
const CX_RATIO = 0.43
const CY_RATIO = 0.52

export function MapViz({
  stations, width, height,
  activeGroupKeys, hoveredIndex, selectedIndex,
  onHover, onSelect, onDeselect,
}: MapVizProps) {
  const cx = width * CX_RATIO
  const cy = height * CY_RATIO

  return (
    <svg
      width={width}
      height={height}
      style={{ display: 'block', background: 'var(--map-bg)' }}
      onClick={onDeselect}
    >
      <defs>
        <filter id="map-glow-dot" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="map-glow-selected" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="map-glow-line" x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="1.2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <MapBackground width={width} height={height} cx={cx} cy={cy} />
      <MapDots
        stations={stations}
        activeGroupKeys={activeGroupKeys}
        hoveredIndex={hoveredIndex}
        selectedIndex={selectedIndex}
        onHover={onHover}
        onSelect={onSelect}
      />
    </svg>
  )
}
