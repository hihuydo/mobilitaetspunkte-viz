import { useState, useCallback, useEffect, useRef } from 'react'
import { useRadialLayout } from './hooks/useRadialLayout'
import { RadialViz } from './components/RadialViz'
import { Legend } from './components/Legend'
import { Tooltip } from './components/Tooltip'
import { InfoPanel } from './components/InfoPanel'
import type { StationGeometry } from './lib/layout'

export default function App() {
  // Measure SVG container dimensions here in App — hook accepts them as params
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

  // Hover state — lifted here so Legend and RadialViz can share it
  const [hoveredRingIndex, setHoveredRingIndex] = useState<number | null>(null)
  const [hoveredStationIndex, setHoveredStationIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [infoPanelVisible, setInfoPanelVisible] = useState(true)

  // Track mouse position for tooltip
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }, [])

  const handleRingLeave = useCallback(() => setHoveredRingIndex(null), [])
  const handleStationLeave = useCallback(() => setHoveredStationIndex(null), [])
  const handleInfoPanelClose = useCallback(() => setInfoPanelVisible(false), [])

  // Find hovered station geometry for tooltip
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
        flexDirection: 'column',
        height: '100vh',
        background: '#0f1b2d',
      }}
      onMouseMove={handleMouseMove}
    >
      {/* SVG container — flex:1, takes all space above legend */}
      <div ref={svgContainerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {layout && svgDimensions.width > 0 && svgDimensions.height > 0 ? (
          <RadialViz
            layout={layout}
            groups={groups}
            width={svgDimensions.width}
            height={svgDimensions.height}
            hoveredRingIndex={hoveredRingIndex}
            hoveredStationIndex={hoveredStationIndex}
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
        {infoPanelVisible && (
          <InfoPanel onClose={handleInfoPanelClose} />
        )}
      </div>

      {/* Legend strip */}
      <Legend
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
