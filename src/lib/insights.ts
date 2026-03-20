import { SERVICE_DEFINITIONS, GROUP_LABELS } from './colors'
import type { StationGeometry } from './layout'
import type { GroupKey } from './colors'

function toGermanDecimal(num: number, digits = 1): string {
  return num.toFixed(digits).replace('.', ',')
}

function countService(stations: StationGeometry[], field: string): number {
  return stations.filter((s) => s.services[field] === true).length
}

export function computeInsights(stations: StationGeometry[]): string[] {
  if (stations.length === 0) return []

  const total = stations.length
  const insights: string[] = []

  // 1. Total
  insights.push(`${total} Stationen · 11 Dienste`)

  // 2. Rarest service (lowest count)
  const serviceCounts = SERVICE_DEFINITIONS.map((svc) => ({
    label: svc.label,
    count: countService(stations, svc.field),
  }))
  const rarest = serviceCounts.reduce((min, cur) =>
    cur.count < min.count ? cur : min
  , serviceCounts[0])
  insights.push(`Nur ${rarest.count} ${rarest.count === 1 ? 'Station' : 'Stationen'} mit ${rarest.label}`)

  // 3. Most common service
  const mostCommon = serviceCounts.reduce((max, cur) =>
    cur.count > max.count ? cur : max
  , serviceCounts[0])
  insights.push(`${mostCommon.count} Stationen mit ${mostCommon.label}`)

  // 4. Best-connected group (highest avg service count)
  const groupKeys: GroupKey[] = ['s-bahn', 'u-bahn', 'tram', 'bus', 'none']
  const groupStats = groupKeys
    .map((key) => {
      const groupStations = stations.filter((s) => s.groupKey === key)
      if (groupStations.length === 0) return null
      const avg =
        groupStations.reduce(
          (sum, s) => sum + Object.values(s.services).filter(Boolean).length,
          0
        ) / groupStations.length
      return { key, avg }
    })
    .filter((g): g is { key: GroupKey; avg: number } => g !== null)

  if (groupStats.length > 0) {
    const best = groupStats.reduce((max, cur) => (cur.avg > max.avg ? cur : max), groupStats[0])
    insights.push(`${GROUP_LABELS[best.key]}-Stationen: ∅ ${toGermanDecimal(best.avg)} Dienste`)
  }

  // 5. Micro-mobility: Bikesharing + Leihscooter + Mietrad
  const microFields = ['gaf_bs_vorhanden', 'gaf_ls_vorhanden', 'gaf_ms_vorhanden']
  const microCount = stations.filter((s) =>
    microFields.every((f) => s.services[f] === true)
  ).length
  insights.push(
    `${microCount} ${microCount === 1 ? 'Station' : 'Stationen'} mit Bikesharing + Leihscooter + Mietrad`
  )

  // 6. Full service — all 11 services (omit if count is 0)
  const allFields = SERVICE_DEFINITIONS.map((svc) => svc.field)
  const fullCount = stations.filter((s) =>
    allFields.every((f) => s.services[f] === true)
  ).length
  if (fullCount > 0) {
    insights.push(
      `${fullCount} ${fullCount === 1 ? 'Station' : 'Stationen'} mit allen 11 Diensten`
    )
  }

  return insights
}
