// src/components/MapBackground.tsx
// Static decorative SVG layer: city rings, radial roads, Isar river, transit lines.
// Wrapped in a low-opacity group so station dots have visual priority.

interface MapBackgroundProps {
  width: number
  height: number
  cx: number
  cy: number
}

export function MapBackground({ cx, cy }: MapBackgroundProps) {
  const r1 = 92
  const r2 = 185

  const radialEndpoints: [number, number][] = [
    [cx - 285, cy - 212], [cx + 285, cy - 212],
    [cx - 295, cy + 213], [cx + 295, cy + 213],
    [cx,       cy - 244], [cx,       cy + 244],
    [cx - 345, cy],       [cx + 345, cy],
  ]

  const isarD = `M ${cx + 80} ${cy - 242} Q ${cx + 96} ${cy - 140} Q ${cx + 92} ${cy - 67} Q ${cx + 88} ${cy} Q ${cx + 102} ${cy + 76} Q ${cx + 112} ${cy + 138} Q ${cx + 108} ${cy + 244}`

  return (
    <g opacity={0.35}>
      {/* City rings */}
      <circle cx={cx} cy={cy} r={r1} fill="none" stroke="var(--map-ring)" strokeWidth={10} />
      <circle cx={cx} cy={cy} r={r2} fill="none" stroke="var(--map-ring)" strokeWidth={14} />

      {/* Radial roads */}
      {radialEndpoints.map(([x2, y2], i) => (
        <line key={i} x1={cx} y1={cy} x2={x2} y2={y2}
          stroke="var(--map-road)" strokeWidth={4} />
      ))}

      {/* Isar river — three-pass for depth */}
      <path d={isarD} stroke="#003344" strokeWidth={16} fill="none" />
      <path d={isarD} stroke="#005566" strokeWidth={5}  fill="none" opacity={0.5} />
      <path d={isarD} stroke="var(--map-isar)" strokeWidth={1.5} fill="none" opacity={0.25} />

      {/* S-Bahn east–west line */}
      <path
        d={`M ${cx - 345} ${cy + 5} Q ${cx - 120} ${cy + 3} ${cx} ${cy} Q ${cx + 165} ${cy + 1} ${cx + 345} ${cy + 3}`}
        stroke="var(--map-dot-sbahn)" strokeWidth={3} fill="none" opacity={0.5}
        filter="url(#map-glow-line)"
      />

      {/* U-Bahn north–south line */}
      <path
        d={`M ${cx} ${cy - 240} Q ${cx} ${cy - 120} ${cx} ${cy} Q ${cx} ${cy + 120} ${cx} ${cy + 240}`}
        stroke="var(--map-dot-ubahn)" strokeWidth={2.5} fill="none" opacity={0.4}
        filter="url(#map-glow-line)"
      />
      {/* U-Bahn east–west line */}
      <path
        d={`M ${cx - 210} ${cy} Q ${cx - 100} ${cy - 2} ${cx} ${cy} Q ${cx + 100} ${cy + 2} ${cx + 320} ${cy}`}
        stroke="var(--map-dot-ubahn)" strokeWidth={2} fill="none" opacity={0.3}
        filter="url(#map-glow-line)"
      />
    </g>
  )
}
