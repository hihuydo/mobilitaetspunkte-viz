// src/components/Sidebar.tsx
import type { StationGeometry } from '../lib/layout'
import { SearchBar } from './SearchBar'
import { Legend } from './Legend'

interface SidebarProps {
  stations: StationGeometry[]
  searchQuery: string
  onSearch: (query: string, matchingIndices: Set<number>) => void
  hoveredRingIndex: number | null
  isStationHover: boolean
  onRingEnter: (index: number) => void
  onRingLeave: () => void
}

export function Sidebar({
  stations,
  searchQuery,
  onSearch,
  hoveredRingIndex,
  isStationHover,
  onRingEnter,
  onRingLeave,
}: SidebarProps) {
  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        height: '100%',
        background: '#0a1220',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        boxSizing: 'border-box',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Search */}
      <SearchBar stations={stations} searchQuery={searchQuery} onSearch={onSearch} />

      {/* Divider */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          margin: '16px 0',
          flexShrink: 0,
        }}
      />

      {/* Service rings label */}
      <div
        style={{
          fontSize: 10,
          color: '#4a7fa8',
          letterSpacing: 1,
          marginBottom: 10,
          userSelect: 'none',
        }}
      >
        SERVICE RINGS (inner → outer)
      </div>

      {/* Legend */}
      <Legend
        hoveredRingIndex={hoveredRingIndex}
        isStationHover={isStationHover}
        onRingEnter={onRingEnter}
        onRingLeave={onRingLeave}
      />
    </div>
  )
}
