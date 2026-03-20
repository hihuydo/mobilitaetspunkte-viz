// src/App.tsx
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useRadialLayout } from './hooks/useRadialLayout'
import { RadialViz } from './components/RadialViz'
import { Sidebar } from './components/Sidebar'
import { Tooltip } from './components/Tooltip'
import { InfoPanel } from './components/InfoPanel'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import type { StationGeometry } from './lib/layout'
import { computeInsights } from './lib/insights'

export type VizPhase = 'loading' | 'revealing' | 'interactive'

export default function App() {
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = svgContainerRef.current
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

  const { layout, groups, error } = useRadialLayout(svgDimensions.width, svgDimensions.height)

  // VizPhase state machine: loading → revealing → interactive
  const [vizPhase, setVizPhase] = useState<VizPhase>('loading')
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (layout && vizPhase === 'loading') {
      setVizPhase('revealing')
      phaseTimerRef.current = setTimeout(() => {
        setVizPhase('interactive')
      }, 2400)
    }
    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current)
    }
  }, [layout, vizPhase])

  // Hover state (gated on vizPhase)
  const [hoveredRingIndex, setHoveredRingIndex] = useState<number | null>(null)
  const [hoveredStationIndex, setHoveredStationIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleStationEnter = useCallback((index: number) => {
    if (vizPhase !== 'interactive') return
    setHoveredStationIndex(index)
  }, [vizPhase])

  const handleRingEnter = useCallback((index: number) => {
    if (vizPhase !== 'interactive') return
    setHoveredRingIndex(index)
  }, [vizPhase])

  const handleStationLeave = useCallback(() => setHoveredStationIndex(null), [])
  const handleRingLeave = useCallback(() => setHoveredRingIndex(null), [])

  // Selected station state
  const [selectedStationIndex, setSelectedStationIndex] = useState<number | null>(null)

  const handleStationSelect = useCallback((index: number) => {
    if (vizPhase !== 'interactive') return
    setSelectedStationIndex((prev) => prev === index ? null : index)
  }, [vizPhase])

  const handleDeselect = useCallback(() => setSelectedStationIndex(null), [])

  // Esc key to deselect
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedStationIndex(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Info panel state
  const [infoPanelVisible, setInfoPanelVisible] = useState(false)
  const handleInfoPanelClose = useCallback(() => setInfoPanelVisible(false), [])
  const handleInfoPanelOpen = useCallback(() => setInfoPanelVisible(true), [])

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStationIndices, setActiveStationIndices] = useState<Set<number>>(new Set())

  const handleSearch = useCallback((query: string, indices: Set<number>) => {
    setSearchQuery(query)
    setActiveStationIndices(indices)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }, [])

  // Derived: hovered + selected station objects
  const hoveredStation: StationGeometry | null =
    hoveredStationIndex !== null && layout
      ? (layout.stations.find((s) => s.stationIndex === hoveredStationIndex) ?? null)
      : null

  const selectedStation: StationGeometry | null =
    selectedStationIndex !== null && layout
      ? (layout.stations.find((s) => s.stationIndex === selectedStationIndex) ?? null)
      : null

  const hoveredStationName: string | null = hoveredStation?.name ?? null

  // Idle state: no hover, no selection, no search, fully interactive
  const isIdle =
    vizPhase === 'interactive' &&
    selectedStationIndex === null &&
    hoveredStationIndex === null &&
    hoveredRingIndex === null &&
    searchQuery === ''

  const searchMatchCount = activeStationIndices.size

  // Insights — computed once when layout is available
  const insights = useMemo(() => {
    if (!layout) return []
    return computeInsights(layout.stations)
  }, [layout])

  if (error) {
    return (
      <div className="p-8 text-destructive font-mono">
        Error loading data: {error}
      </div>
    )
  }

  return (
    <div className="flex flex-row h-screen bg-background" onMouseMove={handleMouseMove}>
      {/* SVG container — flex:1, full height */}
      <div ref={svgContainerRef} className="flex-1 relative overflow-hidden">
        {layout && svgDimensions.width > 0 && svgDimensions.height > 0 ? (
          <RadialViz
            layout={layout}
            groups={groups}
            width={svgDimensions.width}
            height={svgDimensions.height}
            vizPhase={vizPhase}
            hoveredRingIndex={hoveredRingIndex}
            hoveredStationIndex={hoveredStationIndex}
            activeStationIndices={activeStationIndices}
            isInteracting={hoveredStationIndex !== null || hoveredRingIndex !== null}
            selectedStationIndex={selectedStationIndex}
            selectedStation={selectedStation}
            hoveredStationName={hoveredStationName}
            isIdle={isIdle}
            insights={insights}
            searchMatchCount={searchMatchCount}
            onStationEnter={handleStationEnter}
            onStationLeave={handleStationLeave}
            onStationSelect={handleStationSelect}
            onDeselect={handleDeselect}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Lade Daten…
          </div>
        )}

        {/* Info panel overlay */}
        {infoPanelVisible ? (
          <InfoPanel onClose={handleInfoPanelClose} />
        ) : (
          <Button
            variant="outline"
            size="icon"
            onClick={handleInfoPanelOpen}
            title="Legende anzeigen"
            className="absolute top-4 left-4 z-10"
          >
            <Info size={18} />
          </Button>
        )}
      </div>

      {/* Right sidebar */}
      <Sidebar
        stations={layout ? layout.stations : []}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        hoveredRingIndex={hoveredRingIndex}
        isStationHover={hoveredStationIndex !== null}
        onRingEnter={handleRingEnter}
        onRingLeave={handleRingLeave}
      />

      {/* Tooltip */}
      <Tooltip station={hoveredStation} mouseX={mousePos.x} mouseY={mousePos.y} />
    </div>
  )
}
