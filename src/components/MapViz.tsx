// src/components/MapViz.tsx
import { useRef, useEffect, useState, useCallback } from 'react'
import { zoom as d3Zoom, select, type ZoomTransform, zoomIdentity } from 'd3'
import { MapBackground } from './MapBackground'
import { MapDots } from './MapDots'
import type { MapStation } from '../lib/mapLayout'

interface MapVizProps {
  stations: MapStation[]
  width: number
  height: number
  isFiltering: boolean
  activeIndices: Set<number>
  hoveredIndex: number | null
  selectedIndex: number | null
  hoveredDistrict: string | null
  onHover: (index: number | null) => void
  onSelect: (index: number) => void
  onDeselect: () => void
  onDistrictHover: (name: string | null) => void
}

// City centre sits roughly at 43% across, 52% down in the projected Munich bounding box
const CX_RATIO = 0.43
const CY_RATIO = 0.52

export function MapViz({
  stations, width, height,
  isFiltering, activeIndices, hoveredIndex, selectedIndex,
  hoveredDistrict,
  onHover, onSelect, onDeselect, onDistrictHover,
}: MapVizProps) {
  const cx = width * CX_RATIO
  const cy = height * CY_RATIO

  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement>(null)
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity)

  // d3-zoom setup
  useEffect(() => {
    const svg = svgRef.current
    if (!svg || width === 0 || height === 0) return

    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 6])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        setTransform(event.transform)
      })

    const sel = select(svg)
    sel.call(zoomBehavior)

    // Prevent zoom from triggering deselect
    sel.on('click.zoom', null)

    return () => { sel.on('.zoom', null) }
  }, [width, height])

  const handleZoomIn = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return
    const sel = select(svg)
    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 6])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', (event) => setTransform(event.transform))
    sel.transition().duration(300).call(zoomBehavior.scaleBy, 1.5)
  }, [width, height])

  const handleZoomOut = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return
    const sel = select(svg)
    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 6])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', (event) => setTransform(event.transform))
    sel.transition().duration(300).call(zoomBehavior.scaleBy, 0.67)
  }, [width, height])

  const handleReset = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return
    const sel = select(svg)
    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 6])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', (event) => setTransform(event.transform))
    sel.transition().duration(300).call(zoomBehavior.transform, zoomIdentity)
  }, [width, height])

  const zoomScale = transform.k

  return (
    <>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block', background: 'var(--map-bg)' }}
        onClick={onDeselect}
      >
        <defs>
          <filter id="map-glow-line" x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur stdDeviation="1.2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <g ref={gRef} transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          <MapBackground width={width} height={height} cx={cx} cy={cy} hoveredDistrict={hoveredDistrict} onDistrictHover={onDistrictHover} />
          <MapDots
            stations={stations}
            isFiltering={isFiltering}
            activeIndices={activeIndices}
            hoveredIndex={hoveredIndex}
            selectedIndex={selectedIndex}
            onHover={onHover}
            onSelect={onSelect}
            zoomScale={zoomScale}
          />
        </g>
      </svg>

      {/* Zoom controls — larger touch targets on mobile */}
      <div className="absolute bottom-16 right-3 md:right-4 flex flex-col gap-1 z-10">
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 md:w-7 md:h-7 flex items-center justify-center rounded border text-sm md:text-xs font-bold"
          style={{ background: 'var(--map-surface)', borderColor: 'var(--map-border)', color: 'var(--map-text-muted)' }}
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 md:w-7 md:h-7 flex items-center justify-center rounded border text-sm md:text-xs font-bold"
          style={{ background: 'var(--map-surface)', borderColor: 'var(--map-border)', color: 'var(--map-text-muted)' }}
        >
          −
        </button>
        {zoomScale > 1.05 && (
          <button
            onClick={handleReset}
            className="w-9 h-9 md:w-7 md:h-7 flex items-center justify-center rounded border text-[9px] md:text-[8px] font-bold"
            style={{ background: 'var(--map-surface)', borderColor: 'var(--map-border)', color: 'var(--map-text-muted)' }}
          >
            1:1
          </button>
        )}
      </div>
    </>
  )
}
