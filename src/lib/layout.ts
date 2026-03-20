import { arc as d3arc } from 'd3'
import type { StationGroup } from './parseData'
import type { GroupKey } from './colors'

export interface RingGeometry {
  innerR: number
  outerR: number
  ringIndex: number
}

export interface GroupArcGeometry {
  key: GroupKey
  innerR: number
  outerR: number
  startAngle: number
  endAngle: number
  midAngle: number
}

export interface StationGeometry {
  stationIndex: number
  groupKey: GroupKey
  name: string
  adresse: string
  anzStellplCs: number
  services: Record<string, boolean>
  startAngle: number
  endAngle: number
  fillStartAngle: number
  fillEndAngle: number
  midAngle: number
  labelFlip: boolean
  labelAnchor: 'start' | 'end'
}

export interface StarDot {
  x: number
  y: number
  r: number
  opacity: number
}

export interface LayoutResult {
  R: number
  centerR: number
  ringZoneInnerR: number
  ringZoneOuterR: number
  labelR: number
  groupArcInnerR: number
  groupArcOuterR: number
  rings: RingGeometry[]
  groupArcs: GroupArcGeometry[]
  stations: StationGeometry[]
  starDots: StarDot[]
}

export function degreesToRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

const GAP_DEG = 5
const PADDING_DEG = 0.15

const STAR_SEEDS: [number, number, number, number][] = [
  [0.12, 0.91, 1.1, 0.35], [0.67, 0.93, 0.9, 0.22], [0.34, 0.95, 1.4, 0.45],
  [0.89, 0.92, 0.8, 0.28], [0.23, 0.96, 1.5, 0.50], [0.56, 0.94, 1.0, 0.38],
  [0.78, 0.98, 1.2, 0.20], [0.45, 0.93, 0.8, 0.42], [0.01, 0.95, 1.3, 0.30],
  [0.90, 0.97, 0.9, 0.25], [0.19, 0.92, 1.5, 0.48], [0.62, 0.96, 1.1, 0.33],
  [0.37, 0.94, 0.8, 0.40], [0.81, 0.93, 1.4, 0.22], [0.50, 0.98, 1.0, 0.35],
  [0.13, 0.97, 1.2, 0.27], [0.72, 0.91, 0.9, 0.44], [0.28, 0.99, 1.5, 0.50],
  [0.95, 0.92, 0.8, 0.30], [0.41, 0.96, 1.3, 0.38], [0.06, 0.94, 1.1, 0.20],
  [0.85, 0.95, 0.9, 0.45], [0.57, 0.93, 1.4, 0.32], [0.30, 0.98, 0.8, 0.48],
  [0.74, 0.97, 1.2, 0.25],
]

export function computeLayout(groups: StationGroup[], R: number): LayoutResult {
  const totalStations = groups.reduce((s, g) => s + g.stations.length, 0)
  const numGroups = groups.length
  const availableDeg = 360 - numGroups * GAP_DEG
  const slotDeg = availableDeg / totalStations

  const centerR    = 0.15 * R
  const ringInner  = 0.18 * R
  const ringOuter  = 0.46 * R
  const groupInner = 0.47 * R
  const groupOuter = 0.478 * R
  const labelR     = 0.48 * R
  const ringWidth  = (ringOuter - ringInner) / 11

  const rings: RingGeometry[] = Array.from({ length: 11 }, (_, i) => ({
    ringIndex: i,
    innerR: ringInner + i * ringWidth,
    outerR: ringInner + (i + 1) * ringWidth,
  }))

  const stations: StationGeometry[] = []
  const groupArcs: GroupArcGeometry[] = []

  let curDeg = -90
  let stationIndex = 0

  for (const group of groups) {
    const groupStartDeg = curDeg

    for (const station of group.stations) {
      const startDeg = curDeg
      const endDeg   = curDeg + slotDeg
      const midDeg   = curDeg + slotDeg / 2

      const startRad     = degreesToRadians(startDeg)
      const endRad       = degreesToRadians(endDeg)
      const midRad       = degreesToRadians(midDeg)
      const fillStartRad = degreesToRadians(startDeg + PADDING_DEG)
      const fillEndRad   = degreesToRadians(endDeg - PADDING_DEG)

      const labelFlip = Math.cos(midRad) < 0

      stations.push({
        stationIndex,
        groupKey: group.key,
        name: station.name,
        adresse: station.adresse,
        anzStellplCs: station.anzStellplCs,
        services: station.services,
        startAngle: startRad,
        endAngle: endRad,
        fillStartAngle: fillStartRad,
        fillEndAngle: fillEndRad,
        midAngle: midRad,
        labelFlip,
        labelAnchor: labelFlip ? 'end' : 'start',
      })

      curDeg = endDeg
      stationIndex++
    }

    const groupEndDeg = curDeg

    groupArcs.push({
      key: group.key,
      innerR: groupInner,
      outerR: groupOuter,
      startAngle: degreesToRadians(groupStartDeg),
      endAngle: degreesToRadians(groupEndDeg),
      midAngle: degreesToRadians((groupStartDeg + groupEndDeg) / 2),
    })

    curDeg += GAP_DEG
  }

  const starDots: StarDot[] = STAR_SEEDS.map(([angleFrac, radFrac, r, opacity]) => {
    const angle  = angleFrac * 2 * Math.PI
    const radius = R * (0.92 + (radFrac - 0.9) * 0.8)
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      r,
      opacity,
    }
  })

  return {
    R,
    centerR,
    ringZoneInnerR: ringInner,
    ringZoneOuterR: ringOuter,
    labelR,
    groupArcInnerR: groupInner,
    groupArcOuterR: groupOuter,
    rings,
    groupArcs,
    stations,
    starDots,
  }
}

const arcGenerator = d3arc()

export function arcPath(
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
): string {
  return arcGenerator({
    innerRadius: innerR,
    outerRadius: outerR,
    startAngle,
    endAngle,
  }) ?? ''
}
