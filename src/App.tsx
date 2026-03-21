// src/App.tsx
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useMapData } from './hooks/useMapData'
import { MapViz } from './components/MapViz'
import { NavBar } from './components/NavBar'
import { ServiceFilter } from './components/ServiceFilter'
import { DetailPanel } from './components/DetailPanel'
import { InfoOverlay } from './components/InfoOverlay'
import { MapLegend } from './components/MapLegend'
import MapTooltip from './components/MapTooltip'
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
  const handleResetServices = useCallback(() => {
    setActiveServiceFields(new Set())
    setActiveGroupKeys(new Set())
  }, [])

  // Hover / select
  const [hoveredIndex, setHoveredIndex]   = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Restore selection from URL on mount (after stations load)
  useEffect(() => {
    if (stations.length === 0) return
    const params = new URLSearchParams(window.location.search)
    const name = params.get('station')
    if (!name) return
    const match = stations.find((s) => s.name.toLowerCase() === name.toLowerCase())
    if (match) setSelectedIndex(match.stationIndex)
  }, [stations])

  const handleHover    = useCallback((i: number | null) => setHoveredIndex(i), [])
  const handleSelect   = useCallback((i: number) => {
    setSelectedIndex((prev) => {
      const next = prev === i ? null : i
      const station = stations.find((s) => s.stationIndex === i)
      if (next !== null && station) {
        window.history.replaceState(null, '', `?station=${encodeURIComponent(station.name)}`)
      } else {
        window.history.replaceState(null, '', window.location.pathname)
      }
      return next
    })
  }, [stations])
  const handleDeselect = useCallback(() => {
    setSelectedIndex(null)
    window.history.replaceState(null, '', window.location.pathname)
  }, [])

  // Mouse position for tooltip
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }, [])

  // District hover
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)
  const handleDistrictHover = useCallback((name: string | null) => setHoveredDistrict(name), [])

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

  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of stations) {
      counts[s.groupKey] = (counts[s.groupKey] ?? 0) + 1
    }
    return counts
  }, [stations])

  const selectedStation: MapStation | null =
    selectedIndex !== null
      ? (stations.find((s) => s.stationIndex === selectedIndex) ?? null)
      : null

  const hoveredStation: MapStation | null =
    hoveredIndex !== null
      ? (stations.find((s) => s.stationIndex === hoveredIndex) ?? null)
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
        stationCount={stations.length}
        matchCount={matchCount}
        isFiltering={isFiltering}
      />

      <ServiceFilter
        activeGroupKeys={activeGroupKeys}
        onToggleGroup={handleToggleGroup}
        activeServices={activeServiceFields}
        onToggleService={handleToggleService}
        onReset={handleResetServices}
        matchCount={matchCount}
        totalCount={stations.length}
        isFiltering={isFiltering}
        groupCounts={groupCounts}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Map column */}
        <div
          ref={mapContainerRef}
          className="flex-1 relative overflow-hidden"
          onMouseMove={handleMouseMove}
        >
          {svgDimensions.width > 0 && svgDimensions.height > 0 && (
            <MapViz
              stations={stations}
              width={svgDimensions.width}
              height={svgDimensions.height}
              isFiltering={isFiltering}
              activeIndices={activeIndices}
              hoveredIndex={hoveredIndex}
              selectedIndex={selectedIndex}
              hoveredDistrict={hoveredDistrict}
              onHover={handleHover}
              onSelect={handleSelect}
              onDeselect={handleDeselect}
              onDistrictHover={handleDistrictHover}
            />
          )}
          <InfoOverlay />
          <MapLegend />
          {isFiltering && activeIndices.size === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div
                className="flex flex-col items-center gap-2 p-5 rounded-xl border text-center pointer-events-auto"
                style={{ background: 'var(--map-surface)', borderColor: 'var(--map-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
              >
                <p className="text-[13px] font-semibold" style={{ color: 'var(--map-text-primary)' }}>
                  Keine Stationen gefunden
                </p>
                <p className="text-[11px]" style={{ color: 'var(--map-text-dim)' }}>
                  Filterkombination ergibt keine Treffer
                </p>
                <button
                  onClick={handleResetServices}
                  className="mt-1 text-[10px] px-3 py-1 rounded border transition-colors"
                  style={{ borderColor: 'var(--map-border)', color: 'var(--map-text-muted)' }}
                >
                  Filter zurücksetzen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <DetailPanel station={selectedStation} allStations={stations} onClose={handleDeselect} onFilterService={handleToggleService} />
      </div>

      {/* Hover tooltip */}
      <MapTooltip station={hoveredStation} mouseX={mousePos.x} mouseY={mousePos.y} />
    </div>
  )
}
