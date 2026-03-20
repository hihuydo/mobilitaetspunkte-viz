import { describe, it, expect } from 'vitest'
import { SERVICE_DEFINITIONS, GROUP_COLORS, ABSENT_COLOR, BG_COLOR } from '../colors'

describe('SERVICE_DEFINITIONS', () => {
  it('has exactly 11 entries', () => {
    expect(SERVICE_DEFINITIONS).toHaveLength(11)
  })

  it('maps gaf_ts_vorhanden to Carsharing at ring index 5 (0-based)', () => {
    expect(SERVICE_DEFINITIONS[5].field).toBe('gaf_ts_vorhanden')
    expect(SERVICE_DEFINITIONS[5].label).toBe('Carsharing')
    expect(SERVICE_DEFINITIONS[5].color).toBe('var(--viz-service-carsharing)')
  })

  it('first ring is S-Bahn', () => {
    expect(SERVICE_DEFINITIONS[0].field).toBe('s_bahn_vorhanden')
    expect(SERVICE_DEFINITIONS[0].color).toBe('var(--viz-service-s-bahn)')
  })

  it('last ring (index 10) is Bike Pump', () => {
    expect(SERVICE_DEFINITIONS[10].field).toBe('radpumpe_vorhanden')
    expect(SERVICE_DEFINITIONS[10].color).toBe('var(--viz-service-bike-pump)')
  })

  it('each entry has field, label, color as CSS custom property', () => {
    SERVICE_DEFINITIONS.forEach((def) => {
      expect(typeof def.field).toBe('string')
      expect(typeof def.label).toBe('string')
      expect(def.color).toMatch(/^var\(--viz-service-/)
    })
  })
})

describe('GROUP_COLORS', () => {
  it('has CSS custom property for all 5 groups', () => {
    expect(GROUP_COLORS['s-bahn']).toBe('var(--viz-group-s-bahn)')
    expect(GROUP_COLORS['u-bahn']).toBe('var(--viz-group-u-bahn)')
    expect(GROUP_COLORS['tram']).toBe('var(--viz-group-tram)')
    expect(GROUP_COLORS['bus']).toBe('var(--viz-group-bus)')
    expect(GROUP_COLORS['none']).toBe('var(--viz-group-none)')
  })
})

describe('constants', () => {
  it('ABSENT_COLOR references viz-surface token', () => {
    expect(ABSENT_COLOR).toBe('var(--viz-surface)')
  })

  it('BG_COLOR references viz-bg token', () => {
    expect(BG_COLOR).toBe('var(--viz-bg)')
  })
})
