import { describe, it, expect, beforeEach } from 'vitest'
import { parseCSV, groupStations } from '../parseData'
import type { Station } from '../parseData'

const MINIMAL_CSV = `FID,objectid,mp_id,name,adresse,anz_stellpl_cs,anz_stellpl_taxi,anzahl_ladepunkte_ac,anzahl_ladepunkte_dc,gaf_ts_vorhanden,gaf_bs_vorhanden,gaf_ls_vorhanden,gaf_ms_vorhanden,ods_vorhanden,bus_vorhanden,tram_vorhanden,u_bahn_vorhanden,s_bahn_vorhanden,radservicestation_vorhanden,radpumpe_vorhanden,bearbeitung_datum,shape
id1,1,101,Hauptbahnhof,Bahnhofplatz 1,4,Nein,0,0,Ja,Ja,Nein,Nein,Nein,Nein,Nein,Nein,Ja,Ja,Nein,20260224,POINT (0 0)
id2,2,102,Marienplatz,"Marienplatz 1, 80331",0,Nein,0,0,Nein,Nein,Nein,Nein,Nein,Ja,Nein,Ja,Nein,Nein,Nein,20260224,POINT (0 0)
id3,3,103,Implerstraße,Implerstraße 36,6,Nein,0,0,Ja,Ja,Ja,Ja,Nein,Ja,Nein,Ja,Nein,Nein,Nein,20260224,POINT (0 0)`

describe('parseCSV', () => {
  it('returns one Station per data row', () => {
    const stations = parseCSV(MINIMAL_CSV)
    expect(stations).toHaveLength(3)
  })

  it('maps name and adresse correctly', () => {
    const stations = parseCSV(MINIMAL_CSV)
    expect(stations[0].name).toBe('Hauptbahnhof')
    expect(stations[0].adresse).toBe('Bahnhofplatz 1')
  })

  it('parses anz_stellpl_cs as a number', () => {
    const stations = parseCSV(MINIMAL_CSV)
    expect(stations[0].anzStellplCs).toBe(4)
    expect(stations[1].anzStellplCs).toBe(0)
  })

  it('parses boolean fields as true/false', () => {
    const stations = parseCSV(MINIMAL_CSV)
    // Hauptbahnhof: s_bahn=Ja, gaf_ts=Ja, tram=Nein
    expect(stations[0].services.s_bahn_vorhanden).toBe(true)
    expect(stations[0].services.gaf_ts_vorhanden).toBe(true)
    expect(stations[0].services.tram_vorhanden).toBe(false)
  })

  it('handles comma in quoted address fields', () => {
    const stations = parseCSV(MINIMAL_CSV)
    expect(stations[1].adresse).toBe('Marienplatz 1, 80331')
  })
})

describe('groupStations', () => {
  let stations: Station[]

  beforeEach(() => {
    stations = parseCSV(MINIMAL_CSV)
  })

  it('assigns S-Bahn group to station with s_bahn_vorhanden=true', () => {
    const groups = groupStations(stations)
    const sbahn = groups.find((g) => g.key === 's-bahn')
    expect(sbahn?.stations.some((s) => s.name === 'Hauptbahnhof')).toBe(true)
  })

  it('assigns U-Bahn group (not S-Bahn) when only u_bahn=true', () => {
    const groups = groupStations(stations)
    const ubahn = groups.find((g) => g.key === 'u-bahn')
    expect(ubahn?.stations.some((s) => s.name === 'Marienplatz')).toBe(true)
  })

  it('sorts stations alphabetically within each group', () => {
    const csv = `FID,objectid,mp_id,name,adresse,anz_stellpl_cs,anz_stellpl_taxi,anzahl_ladepunkte_ac,anzahl_ladepunkte_dc,gaf_ts_vorhanden,gaf_bs_vorhanden,gaf_ls_vorhanden,gaf_ms_vorhanden,ods_vorhanden,bus_vorhanden,tram_vorhanden,u_bahn_vorhanden,s_bahn_vorhanden,radservicestation_vorhanden,radpumpe_vorhanden,bearbeitung_datum,shape
x,1,1,Zentraler Ort,Z 1,0,Nein,0,0,Nein,Nein,Nein,Nein,Nein,Ja,Nein,Nein,Nein,Nein,Nein,20260224,POINT (0 0)
y,2,2,Anfang Straße,A 1,0,Nein,0,0,Nein,Nein,Nein,Nein,Nein,Ja,Nein,Nein,Nein,Nein,Nein,20260224,POINT (0 0)`
    const parsed = parseCSV(csv)
    const groups = groupStations(parsed)
    const bus = groups.find((g) => g.key === 'bus')!
    expect(bus.stations[0].name).toBe('Anfang Straße')
    expect(bus.stations[1].name).toBe('Zentraler Ort')
  })

  it('skips empty groups', () => {
    const groups = groupStations(stations)
    // none group has no stations in minimal CSV
    expect(groups.find((g) => g.key === 'none')).toBeUndefined()
  })

  it('returns groups in priority order: s-bahn, u-bahn, tram, bus, none', () => {
    const groups = groupStations(stations)
    const keys = groups.map((g) => g.key)
    // minimal CSV has s-bahn and u-bahn only
    expect(keys.indexOf('s-bahn')).toBeLessThan(keys.indexOf('u-bahn'))
  })

  it('total stations across all groups equals input count', () => {
    const groups = groupStations(stations)
    const total = groups.reduce((sum, g) => sum + g.stations.length, 0)
    expect(total).toBe(stations.length)
  })
})
