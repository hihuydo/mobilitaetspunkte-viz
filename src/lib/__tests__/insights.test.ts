import { describe, it, expect } from 'vitest'
import { computeInsights } from '../insights'
import type { StationGeometry } from '../layout'

const makeStation = (
  index: number,
  name: string,
  groupKey: 's-bahn' | 'u-bahn' | 'tram' | 'bus' | 'none',
  services: Partial<Record<string, boolean>>
): StationGeometry => ({
  stationIndex: index,
  name,
  groupKey,
  adresse: '',
  anzStellplCs: 0,
  startAngle: 0, endAngle: 1, fillStartAngle: 0, fillEndAngle: 1,
  midAngle: 0.5, labelFlip: false, labelAnchor: 'start',
  services: {
    's_bahn_vorhanden': false, 'u_bahn_vorhanden': false, 'tram_vorhanden': false,
    'bus_vorhanden': false, 'ods_vorhanden': false, 'gaf_ts_vorhanden': false,
    'gaf_bs_vorhanden': false, 'gaf_ls_vorhanden': false, 'gaf_ms_vorhanden': false,
    'radservicestation_vorhanden': false, 'radpumpe_vorhanden': false,
    ...services,
  },
})

const stations: StationGeometry[] = [
  makeStation(0, 'Hauptbahnhof', 's-bahn', {
    's_bahn_vorhanden': true, 'bus_vorhanden': true, 'gaf_ts_vorhanden': true,
    'gaf_bs_vorhanden': true, 'gaf_ls_vorhanden': true, 'gaf_ms_vorhanden': true,
  }),
  makeStation(1, 'Marienplatz', 'u-bahn', {
    'u_bahn_vorhanden': true, 'bus_vorhanden': true,
  }),
  makeStation(2, 'Isartor', 'bus', {
    'bus_vorhanden': true,
  }),
]

describe('computeInsights', () => {
  it('returns between 5 and 6 strings', () => {
    const insights = computeInsights(stations)
    expect(insights.length).toBeGreaterThanOrEqual(5)
    expect(insights.length).toBeLessThanOrEqual(6)
  })

  it('insight 0 shows total station count', () => {
    const insights = computeInsights(stations)
    expect(insights[0]).toBe('3 Stationen · 11 Dienste')
  })

  it('insight 1 shows rarest service dynamically', () => {
    const insights = computeInsights(stations)
    expect(insights[1]).toMatch(/Nur \d+ Stationen? mit /)
  })

  it('insight 2 shows most common service (bus — all 3 stations)', () => {
    const insights = computeInsights(stations)
    expect(insights[2]).toMatch(/3 Stationen mit Bus/)
  })

  it('insight 3 uses German decimal comma not period', () => {
    const insights = computeInsights(stations)
    expect(insights[3]).not.toMatch(/\d\.\d/)
    expect(insights[3]).toMatch(/∅ [\d,]+ Dienste/)
  })

  it('insight 4 counts micro-mobility stations (only Hauptbahnhof has all three)', () => {
    const insights = computeInsights(stations)
    expect(insights[4]).toContain('1 Station ')
  })

  it('omits insight 6 (full-service) when count is 0', () => {
    // No station in our fixture has all 11 services
    const insights = computeInsights(stations)
    expect(insights).toHaveLength(5)
    const fullServiceInsight = insights.find((s) => s.includes('allen 11 Diensten'))
    expect(fullServiceInsight).toBeUndefined()
  })

  it('includes insight 6 when a station has all 11 services', () => {
    const allServices: Partial<Record<string, boolean>> = {
      's_bahn_vorhanden': true, 'u_bahn_vorhanden': true, 'tram_vorhanden': true,
      'bus_vorhanden': true, 'ods_vorhanden': true, 'gaf_ts_vorhanden': true,
      'gaf_bs_vorhanden': true, 'gaf_ls_vorhanden': true, 'gaf_ms_vorhanden': true,
      'radservicestation_vorhanden': true, 'radpumpe_vorhanden': true,
    }
    const richStation = makeStation(3, 'Superstation', 's-bahn', allServices)
    const insights = computeInsights([...stations, richStation])
    expect(insights).toHaveLength(6)
    expect(insights[5]).toContain('allen 11 Diensten')
  })

  it('returns empty array for empty input', () => {
    expect(computeInsights([])).toHaveLength(0)
  })
})
