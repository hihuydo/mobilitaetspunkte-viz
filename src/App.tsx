// src/App.tsx
import { useState, useCallback, useEffect, useRef } from 'react'
import { useMapData } from './hooks/useMapData'
import { MapViz } from './components/MapViz'
import { NavBar } from './components/NavBar'
import { DetailPanel } from './components/DetailPanel'
import { InfoOverlay } from './components/InfoOverlay'
import { MapLegend } from './components/MapLegend'
import type { MapStation } from './lib/mapLayout'

export default function App() {
  // SVG container sizing
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = mapContainerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        const { width, height } = entry.contentRect
        setSvgDimensions({ width, height })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Data
  const { stations, error } = useMapData(svgDimensions.width, svgDimensions.height)

  // Search
  const [searchQuery, setSearchQuery] = useState('')
  const handleSearch = useCallback((q: string) => setSearchQuery(q), [])

  // Group filter
  const [activeGroupKeys, setActiveGroupKeys] = useState<Set<string>>(new Set())
  const handleToggleGroup = useCallback((key: string) => {
    setActiveGroupKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  // Hover / select
  const [hoveredIndex, setHoveredIndex]   = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleHover    = useCallback((i: number | null) => setHoveredIndex(i), [])
  const handleSelect   = useCallback((i: number) => {
    setSelectedIndex((prev) => (prev === i ? null : i))
  }, [])
  const handleDeselect = useCallback(() => setSelectedIndex(null), [])

  // Esc to deselect
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedIndex(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // When searching, build a synthetic activeGroupKeys from matching stations only.
  // MapDots dims stations whose groupKey is NOT in activeGroupKeys — so we
  // populate it with only the groups that have search matches.
  const dotActiveKeys: Set<string> = (() => {
    if (searchQuery === '') return activeGroupKeys
    const searchLower = searchQuery.toLowerCase()
    const matchingGroups = new Set(
      stations
        .filter((s) => {
          const matchesGroup = activeGroupKeys.size === 0 || activeGroupKeys.has(s.groupKey)
          return matchesGroup && s.name.toLowerCase().includes(searchLower)
        })
        .map((s) => s.groupKey)
    )
    // If nothing matches, return a non-empty set with a dummy key so all dots dim
    return matchingGroups.size > 0 ? matchingGroups : new Set(['__none__'])
  })()

  const selectedStation: MapStation | null =
    selectedIndex !== null
      ? (stations.find((s) => s.stationIndex === selectedIndex) ?? null)
      : null

  if (error) {
    return (
      <div className="p-8 font-mono" style={{ color: 'var(--map-dot-tram)' }}>
        Error loading data: {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--map-bg)' }}>
      <NavBar
        searchQuery={searchQuery}
        onSearch={handleSearch}
        activeGroupKeys={activeGroupKeys}
        onToggleGroup={handleToggleGroup}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Map column */}
        <div ref={mapContainerRef} className="flex-1 relative overflow-hidden">
          {svgDimensions.width > 0 && svgDimensions.height > 0 && (
            <MapViz
              stations={stations}
              width={svgDimensions.width}
              height={svgDimensions.height}
              activeGroupKeys={dotActiveKeys}
              hoveredIndex={hoveredIndex}
              selectedIndex={selectedIndex}
              onHover={handleHover}
              onSelect={handleSelect}
              onDeselect={handleDeselect}
            />
          )}
          <InfoOverlay />
          <MapLegend />
        </div>

        {/* Detail panel */}
        <DetailPanel station={selectedStation} allStations={stations} />
      </div>
    </div>
  )
}
