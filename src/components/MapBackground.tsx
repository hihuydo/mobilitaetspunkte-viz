// src/components/MapBackground.tsx
// Map background: Munich district outlines + decorative overlays (Isar, transit schematic).
import { useMemo, useState, useEffect, useCallback } from 'react'
import { geoPath, geoTransform, geoCentroid, geoContains } from 'd3'
import proj4 from 'proj4'
import type { FeatureCollection } from 'geojson'
import districtsUrl from '../../data/munich-districts.geojson?url'
import { createProjection } from '../lib/mapProjection'
import type { MapStation } from '../lib/mapLayout'

// Coordinate system definitions
const WGS84 = '+proj=longlat +datum=WGS84 +no_defs'
const EPSG25832 = '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'

interface MapBackgroundProps {
  width: number
  height: number
  cx: number
  cy: number
  hoveredDistrict: string | null
  onDistrictHover: (name: string | null) => void
  stations: MapStation[]
}

export function MapBackground({ width, height, cx, cy, hoveredDistrict, onDistrictHover, stations }: MapBackgroundProps) {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    fetch(districtsUrl)
      .then((r) => r.json())
      .then(setGeojson)
      .catch(console.error)
  }, [])

  // Build a D3 geo path generator that projects WGS84 → EPSG:25832 → screen coords
  const districtPaths = useMemo(() => {
    if (!geojson || width === 0 || height === 0) return []
    const project = createProjection(width, height)

    const customProjection = geoTransform({
      point(lon: number, lat: number) {
        const [x, y] = proj4(WGS84, EPSG25832, [lon, lat])
        const { sx, sy } = project(x, y)
        this.stream.point(sx, sy)
      },
    })

    const pathGen = geoPath(customProjection)

    return geojson.features.map((feature) => {
      const name = (feature.properties as { name: string }).name
      // Compute centroid for label placement
      const centroid = geoCentroid(feature as GeoJSON.Feature)
      const [cx, cy] = proj4(WGS84, EPSG25832, centroid)
      const { sx, sy } = project(cx, cy)
      return { d: pathGen(feature) ?? '', name, labelX: sx, labelY: sy, feature }
    })
  }, [geojson, width, height])

  // Station count per district (computed once per geojson+stations change)
  const districtCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const { name, feature } of districtPaths) {
      counts[name] = stations.filter((s) => geoContains(feature as GeoJSON.Feature, s.lonlat)).length
    }
    return counts
  }, [districtPaths, stations])

  const handleDistrictLeave = useCallback(() => onDistrictHover(null), [onDistrictHover])

  const r1 = 92
  const r2 = 185

  const radialEndpoints: [number, number][] = [
    [cx - 285, cy - 212], [cx + 285, cy - 212],
    [cx - 295, cy + 213], [cx + 295, cy + 213],
    [cx,       cy - 244], [cx,       cy + 244],
    [cx - 345, cy],       [cx + 345, cy],
  ]

  // Isar river path — quadratic Bézier segments (Q controlX controlY endX endY)
  const isarD = [
    `M ${cx + 80} ${cy - 242}`,
    `Q ${cx + 96} ${cy - 140} ${cx + 92} ${cy - 67}`,
    `Q ${cx + 88} ${cy + 10} ${cx + 88} ${cy}`,
    `Q ${cx + 95} ${cy + 40} ${cx + 102} ${cy + 76}`,
    `Q ${cx + 108} ${cy + 110} ${cx + 112} ${cy + 138}`,
    `Q ${cx + 110} ${cy + 190} ${cx + 108} ${cy + 244}`,
  ].join(' ')

  return (
    <>
      {/* Munich district outlines */}
      <g>
        {districtPaths.map(({ d, name, labelX, labelY }) => {
          const isHovered = hoveredDistrict === name
          return (
            <g key={name}>
              <path
                d={d}
                fill={isHovered ? 'rgba(255,255,255,0.03)' : 'none'}
                stroke="var(--map-district)"
                strokeWidth={isHovered ? 1.2 : 0.8}
                opacity={isHovered ? 0.8 : 0.45}
                style={{ cursor: 'pointer', transition: 'opacity 150ms, stroke-width 150ms' }}
                onMouseEnter={() => onDistrictHover(name)}
                onMouseLeave={handleDistrictLeave}
              />
              {isHovered && (
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fill="var(--map-text-muted)"
                  fontSize={9}
                  fontWeight={500}
                  opacity={0.7}
                  pointerEvents="none"
                >
                  {name} · {districtCounts[name] ?? 0}
                </text>
              )}
            </g>
          )
        })}
      </g>

      {/* Decorative overlay: rings, roads, Isar, transit schematic */}
      <g opacity={0.28}>
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
    </>
  )
}
