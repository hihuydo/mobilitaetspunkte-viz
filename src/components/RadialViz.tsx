import { useCallback } from 'react'
import type { StationGroup } from '../lib/parseData'
import { SERVICE_DEFINITIONS } from '../lib/colors'
import type { LayoutResult } from '../lib/layout'
import { ServiceRings } from './ServiceRings'
import { StationLabels } from './StationLabels'
import { GroupMarkers } from './GroupMarkers'
import { CenterLabel } from './CenterLabel'

interface RadialVizProps {
  layout: LayoutResult
  groups: StationGroup[]
  width: number
  height: number
  hoveredRingIndex: number | null
  hoveredStationIndex?: number | null
  activeStationIndices: Set<number>
  isInteracting?: boolean
  onStationEnter?: (index: number) => void
  onStationLeave?: () => void
}

export function RadialViz({
  layout,
  groups: _groups,
  width,
  height,
  hoveredRingIndex,
  hoveredStationIndex: hoveredStationIndexProp,
  activeStationIndices,
  isInteracting = false,
  onStationEnter,
  onStationLeave,
}: RadialVizProps) {
  // Fully controlled: parent always passes hoveredStationIndex
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
        hoveredStationIndex={hoveredStationIndex}
        hoveredRingIndex={hoveredRingIndex}
        activeStationIndices={activeStationIndices}
        isInteracting={isInteracting}
        onStationEnter={handleStationEnter}
        onStationLeave={handleStationLeave}
      />

      {/* Station labels */}
      <StationLabels
        layout={layout}
        cx={cx}
        cy={cy}
        hoveredStationIndex={hoveredStationIndex}
        isRingHover={hoveredRingIndex !== null}
        activeStationIndices={activeStationIndices}
        onStationEnter={handleStationEnter}
        onStationLeave={handleStationLeave}
      />

      {/* Center label */}
      <CenterLabel
        cx={cx}
        cy={cy}
        r={layout.centerR}
        hoveredRingLabel={hoveredRingLabel}
      />
    </svg>
  )
}
