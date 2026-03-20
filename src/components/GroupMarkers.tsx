import { arcPath } from '../lib/layout'
import { GROUP_COLORS, GROUP_LABELS } from '../lib/colors'
import type { LayoutResult } from '../lib/layout'

interface GroupMarkersProps {
  layout: LayoutResult
  cx: number
  cy: number
}

export function GroupMarkers({ layout, cx, cy }: GroupMarkersProps) {
  return (
    <g transform={`translate(${cx},${cy})`}>
      {layout.groupArcs.map((groupArc) => {
        const color = GROUP_COLORS[groupArc.key]
        const label = GROUP_LABELS[groupArc.key]

        const path = arcPath(
          groupArc.innerR,
          groupArc.outerR,
          groupArc.startAngle,
          groupArc.endAngle,
        )

        const labelR = layout.R * 0.495
        const lx = labelR * Math.sin(groupArc.midAngle)
        const ly = -labelR * Math.cos(groupArc.midAngle)

        return (
          <g key={groupArc.key}>
            <path d={path} fill={color} opacity={0.8} />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={7}
              fill="#4a7fa8"
              letterSpacing={1.5}
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              style={{ userSelect: 'none' }}
            >
              {label}
            </text>
          </g>
        )
      })}
    </g>
  )
}
