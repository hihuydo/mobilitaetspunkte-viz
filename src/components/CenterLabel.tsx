interface CenterLabelProps {
  cx: number
  cy: number
  r: number
  hoveredRingLabel: string | null // null = show title, string = show ring name
}

export function CenterLabel({ cx, cy, r, hoveredRingLabel }: CenterLabelProps) {
  const showTitle = hoveredRingLabel === null

  return (
    <g>
      {/* Center circle background */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="var(--viz-surface)"
        stroke="var(--viz-separator)"
        strokeWidth={1}
      />

      {/* Title text — fades out during ring-hover */}
      <g
        style={{
          opacity: showTitle ? 1 : 0,
          transition: 'opacity 150ms ease-out',
        }}
      >
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontSize={7}
          fill="var(--viz-text-muted)"
          letterSpacing={1.5}
        >
          MÜNCHEN
        </text>
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={8.5}
          fill="var(--viz-text-primary)"
          fontWeight={600}
        >
          Mobilitäts-
        </text>
        <text
          x={cx}
          y={cy + 15}
          textAnchor="middle"
          fontSize={8.5}
          fill="var(--viz-text-primary)"
          fontWeight={600}
        >
          punkte
        </text>
      </g>

      {/* Ring hover label — fades in during ring-hover */}
      <g
        style={{
          opacity: showTitle ? 0 : 1,
          transition: 'opacity 150ms ease-out',
        }}
      >
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={9}
          fill="var(--viz-text-primary)"
        >
          {hoveredRingLabel ?? ''}
        </text>
      </g>
    </g>
  )
}
