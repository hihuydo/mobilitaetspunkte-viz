import { useState, useCallback } from 'react'
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
  onStationEnter,
  onStationLeave,
}: RadialVizProps) {
  const [hoveredStationIndexInternal, setHoveredStationIndexInternal] = useState<number | null>(null)

  // Use controlled value if provided, otherwise fall back to internal state
  const hoveredStationIndex = hoveredStationIndexProp !== undefined ? hoveredStationIndexProp : hoveredStationIndexInternal

  const handleStationEnter = useCallback((index: number) => {
    setHoveredStationIndexInternal(index)
    onStationEnter?.(index)
  }, [onStationEnter])

  const handleStationLeave = useCallback(() => {
    setHoveredStationIndexInternal(null)
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
      style={{ display: 'block', background: '#0f1b2d' }}
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
