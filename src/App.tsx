// src/App.tsx
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRadialLayout } from './hooks/useRadialLayout'
import { RadialViz } from './components/RadialViz'
import { Sidebar } from './components/Sidebar'
import { Tooltip } from './components/Tooltip'
import { InfoPanel } from './components/InfoPanel'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import type { StationGeometry } from './lib/layout'

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

  // Hover state
  const [hoveredRingIndex, setHoveredRingIndex] = useState<number | null>(null)
  const [hoveredStationIndex, setHoveredStationIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Info panel state
  const [infoPanelVisible, setInfoPanelVisible] = useState(false)
  const handleInfoPanelClose = useCallback(() => setInfoPanelVisible(false), [])
  const handleInfoPanelOpen = useCallback(() => setInfoPanelVisible(true), [])

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStationIndices, setActiveStationIndices] = useState<Set<number>>(new Set())

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }, [])

  const handleRingLeave = useCallback(() => setHoveredRingIndex(null), [])
  const handleStationLeave = useCallback(() => setHoveredStationIndex(null), [])

  const handleSearch = useCallback((query: string, indices: Set<number>) => {
    setSearchQuery(query)
    setActiveStationIndices(indices)
  }, [])

  const hoveredStation: StationGeometry | null =
    hoveredStationIndex !== null && layout
      ? (layout.stations.find((s) => s.stationIndex === hoveredStationIndex) ?? null)
      : null

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
            hoveredRingIndex={hoveredRingIndex}
            hoveredStationIndex={hoveredStationIndex}
            activeStationIndices={activeStationIndices}
            isInteracting={hoveredStationIndex !== null || hoveredRingIndex !== null}
            onStationEnter={setHoveredStationIndex}
            onStationLeave={handleStationLeave}
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
        onRingEnter={setHoveredRingIndex}
        onRingLeave={handleRingLeave}
      />

      {/* Tooltip */}
      <Tooltip station={hoveredStation} mouseX={mousePos.x} mouseY={mousePos.y} />
    </div>
  )
}
