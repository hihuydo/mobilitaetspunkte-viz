// src/App.tsx
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useMapData } from './hooks/useMapData'
import { MapViz } from './components/MapViz'
import { NavBar } from './components/NavBar'
import { ServiceFilter } from './components/ServiceFilter'
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

  // Service filter (AND logic: station must have ALL selected services)
  const [activeServiceFields, setActiveServiceFields] = useState<Set<string>>(new Set())
  const handleToggleService = useCallback((field: string) => {
    setActiveServiceFields((prev) => {
      const next = new Set(prev)
      if (next.has(field)) next.delete(field)
      else next.add(field)
      return next
    })
  }, [])
  const handleResetServices = useCallback(() => setActiveServiceFields(new Set()), [])

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

  // Unified filter: group + search + service → active station indices
  const isFiltering = activeGroupKeys.size > 0 || searchQuery !== '' || activeServiceFields.size > 0

  const activeIndices: Set<number> = useMemo(() => {
    if (!isFiltering) return new Set<number>()
    const searchLower = searchQuery.toLowerCase()
    const result = new Set<number>()
    for (const s of stations) {
      const matchesGroup = activeGroupKeys.size === 0 || activeGroupKeys.has(s.groupKey)
      const matchesSearch = searchQuery === '' || s.name.toLowerCase().includes(searchLower)
      const matchesServices = activeServiceFields.size === 0 ||
        [...activeServiceFields].every((field) => s.services[field])
      if (matchesGroup && matchesSearch && matchesServices) {
        result.add(s.stationIndex)
      }
    }
    return result
  }, [stations, activeGroupKeys, searchQuery, activeServiceFields, isFiltering])

  const matchCount = isFiltering ? activeIndices.size : stations.length

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

      <ServiceFilter
        activeServices={activeServiceFields}
        onToggle={handleToggleService}
        onReset={handleResetServices}
        matchCount={matchCount}
        totalCount={stations.length}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Map column */}
        <div ref={mapContainerRef} className="flex-1 relative overflow-hidden">
          {svgDimensions.width > 0 && svgDimensions.height > 0 && (
            <MapViz
              stations={stations}
              width={svgDimensions.width}
              height={svgDimensions.height}
              isFiltering={isFiltering}
              activeIndices={activeIndices}
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
