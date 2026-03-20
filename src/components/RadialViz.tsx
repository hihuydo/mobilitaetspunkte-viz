import { useCallback } from 'react'
import type { StationGroup } from '../lib/parseData'
import { SERVICE_DEFINITIONS } from '../lib/colors'
import type { LayoutResult, StationGeometry } from '../lib/layout'
import type { VizPhase } from '../App'
import { ServiceRings } from './ServiceRings'
import { StationLabels } from './StationLabels'
import { GroupMarkers } from './GroupMarkers'
import { CenterLabel } from './CenterLabel'

interface RadialVizProps {
  layout: LayoutResult
  groups: StationGroup[]
  width: number
  height: number
  vizPhase: VizPhase
  hoveredRingIndex: number | null
  hoveredStationIndex?: number | null
  activeStationIndices: Set<number>
  isInteracting?: boolean
  selectedStationIndex?: number | null
  selectedStation?: StationGeometry | null
  hoveredStationName?: string | null
  isIdle?: boolean
  insights?: string[]
  searchMatchCount?: number
  onStationEnter?: (index: number) => void
  onStationLeave?: () => void
  onStationSelect?: (index: number) => void
  onDeselect?: () => void
}

export function RadialViz({
  layout,
  groups: _groups,
  width,
  height,
  vizPhase,
  hoveredRingIndex,
  hoveredStationIndex: hoveredStationIndexProp,
  activeStationIndices,
  isInteracting = false,
  selectedStationIndex = null,
  selectedStation = null,
  hoveredStationName = null,
  isIdle = false,
  insights = [],
  searchMatchCount = 0,
  onStationEnter,
  onStationLeave,
  onStationSelect,
  onDeselect,
}: RadialVizProps) {
  const hoveredStationIndex = hoveredStationIndexProp ?? null

  const handleStationEnter = useCallback((index: number) => {
    onStationEnter?.(index)
  }, [onStationEnter])

  const handleStationLeave = useCallback(() => {
    onStationLeave?.()
  }, [onStationLeave])

  const cx = width / 2
  const cy = height / 2

  const hoveredRingLabel =
    hoveredRingIndex !== null
      ? (SERVICE_DEFINITIONS[hoveredRingIndex]?.label ?? null)
      : null

  return (
    <svg
      width={width}
      height={height}
      style={{ display: 'block', background: 'var(--viz-bg)' }}
      onClick={onDeselect}
    >
      {/* Star field */}
      <g transform={`translate(${cx},${cy})`}>
        {layout.starDots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={dot.r}
            fill="white"
            opacity={dot.opacity}
          />
        ))}
      </g>

      {/* Group markers (behind rings) */}
      <GroupMarkers layout={layout} cx={cx} cy={cy} />

      {/* Service rings */}
      <ServiceRings
        layout={layout}
        cx={cx}
        cy={cy}
        vizPhase={vizPhase}
        hoveredStationIndex={hoveredStationIndex}
        hoveredRingIndex={hoveredRingIndex}
        activeStationIndices={activeStationIndices}
        isInteracting={isInteracting}
        selectedStationIndex={selectedStationIndex}
        onStationEnter={handleStationEnter}
        onStationLeave={handleStationLeave}
        onStationSelect={onStationSelect}
      />

      {/* Station labels */}
      <StationLabels
        layout={layout}
        cx={cx}
        cy={cy}
        vizPhase={vizPhase}
        hoveredStationIndex={hoveredStationIndex}
        isRingHover={hoveredRingIndex !== null}
        activeStationIndices={activeStationIndices}
        selectedStationIndex={selectedStationIndex}
        onStationEnter={handleStationEnter}
        onStationLeave={handleStationLeave}
      />

      {/* Center label */}
      <CenterLabel
        cx={cx}
        cy={cy}
        r={layout.centerR}
        hoveredRingLabel={hoveredRingLabel}
        hoveredStationName={hoveredStationName}
        selectedStation={selectedStation}
        isIdle={isIdle}
        insights={insights}
        searchMatchCount={searchMatchCount}
      />
    </svg>
  )
}
