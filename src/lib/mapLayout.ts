import { scaleSqrt } from 'd3'
import proj4 from 'proj4'
import type { Station } from './parseData'
import { SERVICE_DEFINITIONS } from './colors'
import { createProjection } from './mapProjection'

const WGS84 = '+proj=longlat +datum=WGS84 +no_defs'
const EPSG25832 = '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'

export const DOT_MIN_R = 3
export const DOT_MAX_R = 11

export interface MapStation {
  stationIndex: number
  name: string
  adresse: string
  anzStellplCs: number
  groupKey: string
  services: Record<string, boolean>
  serviceCount: number
  sx: number
  sy: number
  r: number
  color: string
  lonlat: [number, number]
}

/** Neon hex values for SVG fills — CSS vars can't be used inside SVG filter references */
export const GROUP_NEON: Record<string, string> = {
  's-bahn': '#00ff88',
  'u-bahn': '#00b4ff',
  'tram':   '#ff4455',
  'bus':    '#ffd700',
  'none':   '#4488aa',
}

const GROUP_PRIORITY = [
  { key: 's-bahn', field: 's_bahn_vorhanden' },
  { key: 'u-bahn', field: 'u_bahn_vorhanden' },
  { key: 'tram',   field: 'tram_vorhanden' },
  { key: 'bus',    field: 'bus_vorhanden' },
] as const

function getGroupKey(services: Record<string, boolean>): string {
  for (const { key, field } of GROUP_PRIORITY) {
    if (services[field]) return key
  }
  return 'none'
}

const SERVICE_FIELDS = SERVICE_DEFINITIONS.map((s) => s.field)

const sizeScale = scaleSqrt().domain([0, 11]).range([DOT_MIN_R, DOT_MAX_R])

export function computeMapLayout(
  stations: Station[],
  svgWidth: number,
  svgHeight: number,
): MapStation[] {
  const project = createProjection(svgWidth, svgHeight)

  return stations
    .map((s, i): MapStation | null => {
      if (!s.coords) return null
      const { sx, sy } = project(s.coords.x, s.coords.y)
      const [lon, lat] = proj4(EPSG25832, WGS84, [s.coords.x, s.coords.y])
      const serviceCount = SERVICE_FIELDS.filter((f) => s.services[f]).length
      const groupKey = getGroupKey(s.services)
      return {
        stationIndex: i,
        name: s.name,
        adresse: s.adresse,
        anzStellplCs: s.anzStellplCs,
        groupKey,
        services: s.services,
        serviceCount,
        sx,
        sy,
        r: sizeScale(serviceCount),
        color: GROUP_NEON[groupKey] ?? GROUP_NEON['none'],
        lonlat: [lon, lat] as [number, number],
      }
    })
    .filter((s): s is MapStation => s !== null)
}
