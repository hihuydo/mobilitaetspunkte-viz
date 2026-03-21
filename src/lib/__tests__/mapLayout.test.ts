import { describe, it, expect } from 'vitest'
import { computeMapLayout, DOT_MIN_R, DOT_MAX_R } from '../mapLayout'
import type { Station } from '../parseData'

const makeStation = (services: Partial<Record<string, boolean>>): Station => ({
  name: 'Test',
  adresse: '',
  anzStellplCs: 0,
  coords: { x: 690000, y: 5335000 },
  services: {
    s_bahn_vorhanden: false, u_bahn_vorhanden: false, tram_vorhanden: false,
    bus_vorhanden: false, ods_vorhanden: false, gaf_ts_vorhanden: false,
    gaf_bs_vorhanden: false, gaf_ls_vorhanden: false, gaf_ms_vorhanden: false,
    radservicestation_vorhanden: false, radpumpe_vorhanden: false,
    ...services,
  },
})

describe('computeMapLayout', () => {
  it('filters out stations with null coords', () => {
    const noCoords: Station = { ...makeStation({}), coords: null }
    const result = computeMapLayout([noCoords], 800, 600)
    expect(result).toHaveLength(0)
  })

  it('assigns minimum radius to station with 0 services', () => {
    const result = computeMapLayout([makeStation({})], 800, 600)
    expect(result[0].r).toBe(DOT_MIN_R)
  })

  it('assigns maximum radius to station with all 11 services', () => {
    const all = Object.fromEntries(
      ['s_bahn_vorhanden','u_bahn_vorhanden','tram_vorhanden','bus_vorhanden',
       'ods_vorhanden','gaf_ts_vorhanden','gaf_bs_vorhanden','gaf_ls_vorhanden',
       'gaf_ms_vorhanden','radservicestation_vorhanden','radpumpe_vorhanden']
      .map((k) => [k, true])
    )
    const result = computeMapLayout([makeStation(all)], 800, 600)
    expect(result[0].r).toBe(DOT_MAX_R)
  })

  it('includes stationIndex matching input array position', () => {
    const s1 = makeStation({})
    const s2 = makeStation({ bus_vorhanden: true })
    const result = computeMapLayout([s1, s2], 800, 600)
    expect(result[0].stationIndex).toBe(0)
    expect(result[1].stationIndex).toBe(1)
  })

  it('assigns correct groupKey by priority (s-bahn beats u-bahn)', () => {
    const result = computeMapLayout([makeStation({ s_bahn_vorhanden: true, u_bahn_vorhanden: true })], 800, 600)
    expect(result[0].groupKey).toBe('s-bahn')
  })

  it('assigns none groupKey when no transit service present', () => {
    const result = computeMapLayout([makeStation({})], 800, 600)
    expect(result[0].groupKey).toBe('none')
  })
})
