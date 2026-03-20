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
        fill="#0a1220"
        stroke="#1a2a45"
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
          fill="#4a7fa8"
          letterSpacing={1.5}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        >
          MÜNCHEN
        </text>
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={8.5}
          fill="#c9d8e8"
          fontWeight={600}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        >
          Mobilitäts-
        </text>
        <text
          x={cx}
          y={cy + 15}
          textAnchor="middle"
          fontSize={8.5}
          fill="#c9d8e8"
          fontWeight={600}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
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
          fill="#c9d8e8"
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        >
          {hoveredRingLabel ?? ''}
        </text>
      </g>
    </g>
  )
}
