// src/App.tsx
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRadialLayout } from './hooks/useRadialLayout'
import { RadialViz } from './components/RadialViz'
import { Sidebar } from './components/Sidebar'
import { Tooltip } from './components/Tooltip'
import { InfoPanel } from './components/InfoPanel'
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
  const [infoPanelVisible, setInfoPanelVisible] = useState(true)
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
      <div style={{ color: '#cc4444', padding: 32, fontFamily: 'monospace' }}>
        Error loading data: {error}
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        background: '#0f1b2d',
      }}
      onMouseMove={handleMouseMove}
    >
      {/* SVG container — flex:1, full height */}
      <div ref={svgContainerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {layout && svgDimensions.width > 0 && svgDimensions.height > 0 ? (
          <RadialViz
            layout={layout}
            groups={groups}
            width={svgDimensions.width}
            height={svgDimensions.height}
            hoveredRingIndex={hoveredRingIndex}
            hoveredStationIndex={hoveredStationIndex}
            activeStationIndices={activeStationIndices}
            onStationEnter={setHoveredStationIndex}
            onStationLeave={handleStationLeave}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4a7fa8',
              fontSize: 14,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
          >
            Lade Daten…
          </div>
        )}

        {/* Info panel overlay */}
        {infoPanelVisible ? (
          <InfoPanel onClose={handleInfoPanelClose} />
        ) : (
          <button
            onClick={handleInfoPanelOpen}
            title="Legende anzeigen"
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              width: 28,
              height: 28,
              background: 'rgba(10, 18, 32, 0.94)',
              border: '1px solid #1a2a45',
              borderRadius: '50%',
              color: '#4a7fa8',
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            ℹ
          </button>
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
