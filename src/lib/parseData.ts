import Papa from 'papaparse'
import type { GroupKey } from './colors'

export interface Station {
  name: string
  adresse: string
  anzStellplCs: number
  coords: { x: number; y: number } | null
  services: Record<string, boolean>
}

export interface StationGroup {
  key: GroupKey
  stations: Station[]
}

const BOOL_FIELDS = [
  'gaf_ts_vorhanden',
  'gaf_bs_vorhanden',
  'gaf_ls_vorhanden',
  'gaf_ms_vorhanden',
  'ods_vorhanden',
  'bus_vorhanden',
  'tram_vorhanden',
  'u_bahn_vorhanden',
  's_bahn_vorhanden',
  'radservicestation_vorhanden',
  'radpumpe_vorhanden',
] as const

const GROUP_PRIORITY: { key: GroupKey; field: string }[] = [
  { key: 's-bahn', field: 's_bahn_vorhanden' },
  { key: 'u-bahn', field: 'u_bahn_vorhanden' },
  { key: 'tram',   field: 'tram_vorhanden' },
  { key: 'bus',    field: 'bus_vorhanden' },
  { key: 'none',   field: '' },
]

export function parseCSV(csvText: string): Station[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  return result.data.map((row) => {
    const services: Record<string, boolean> = {}
    for (const field of BOOL_FIELDS) {
      services[field] = row[field] === 'Ja'
    }
    const shape = row['shape'] ?? ''
    const match = shape.match(/POINT \(([0-9.]+) ([0-9.]+)\)/)
    const coords = match
      ? { x: parseFloat(match[1]), y: parseFloat(match[2]) }
      : null

    return {
      name: row['name'] ?? '',
      adresse: row['adresse'] ?? '',
      anzStellplCs: parseInt(row['anz_stellpl_cs'] ?? '0', 10) || 0,
      coords,
      services,
    }
  })
}

export function groupStations(stations: Station[]): StationGroup[] {
  const buckets: Map<GroupKey, Station[]> = new Map()

  for (const station of stations) {
    const match = GROUP_PRIORITY.find(
      ({ key, field }) => key === 'none' || station.services[field] === true,
    )
    const key = match?.key ?? 'none'
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key)!.push(station)
  }

  // Sort each group alphabetically, then return in priority order, skipping empty
  const result: StationGroup[] = []
  for (const { key } of GROUP_PRIORITY) {
    const group = buckets.get(key)
    if (!group || group.length === 0) continue
    group.sort((a, b) => a.name.localeCompare(b.name, 'de'))
    result.push({ key, stations: group })
  }

  return result
}
