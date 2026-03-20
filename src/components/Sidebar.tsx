// src/components/Sidebar.tsx
import type { StationGeometry } from '../lib/layout'
import { SearchBar } from './SearchBar'
import { Legend } from './Legend'
import { Separator } from '@/components/ui/separator'

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
    <div className="w-[220px] shrink-0 h-full bg-card border-l border-border/10 p-4 flex flex-col overflow-y-auto">
      <SearchBar stations={stations} searchQuery={searchQuery} onSearch={onSearch} />
      <Separator className="my-4" />
      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2.5 select-none">
        SERVICE RINGS (inner → outer)
      </div>
      <Legend
        hoveredRingIndex={hoveredRingIndex}
        isStationHover={isStationHover}
        onRingEnter={onRingEnter}
        onRingLeave={onRingLeave}
      />
    </div>
  )
}
