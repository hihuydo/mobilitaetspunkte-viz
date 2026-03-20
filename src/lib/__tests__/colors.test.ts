import { describe, it, expect } from 'vitest'
import { SERVICE_DEFINITIONS, GROUP_COLORS, ABSENT_COLOR, BG_COLOR } from '../colors'

describe('SERVICE_DEFINITIONS', () => {
  it('has exactly 11 entries', () => {
    expect(SERVICE_DEFINITIONS).toHaveLength(11)
  })

  it('maps gaf_ts_vorhanden to Carsharing at ring index 5 (0-based)', () => {
    expect(SERVICE_DEFINITIONS[5].field).toBe('gaf_ts_vorhanden')
    expect(SERVICE_DEFINITIONS[5].label).toBe('Carsharing')
    expect(SERVICE_DEFINITIONS[5].color).toBe('#E91E63')
  })

  it('first ring is S-Bahn', () => {
    expect(SERVICE_DEFINITIONS[0].field).toBe('s_bahn_vorhanden')
    expect(SERVICE_DEFINITIONS[0].color).toBe('#00A651')
  })

  it('last ring (index 10) is Bike Pump', () => {
    expect(SERVICE_DEFINITIONS[10].field).toBe('radpumpe_vorhanden')
    expect(SERVICE_DEFINITIONS[10].color).toBe('#B0BEC5')
  })

  it('each entry has field, label, color', () => {
    SERVICE_DEFINITIONS.forEach((def) => {
      expect(typeof def.field).toBe('string')
      expect(typeof def.label).toBe('string')
      expect(def.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })
})

describe('GROUP_COLORS', () => {
  it('has color for all 5 groups', () => {
    expect(GROUP_COLORS['s-bahn']).toBe('#00A651')
    expect(GROUP_COLORS['u-bahn']).toBe('#0072BC')
    expect(GROUP_COLORS['tram']).toBe('#CC0000')
    expect(GROUP_COLORS['bus']).toBe('#F7941D')
    expect(GROUP_COLORS['none']).toBe('#4a7fa8')
  })
})

describe('constants', () => {
  it('ABSENT_COLOR is the dark background filler', () => {
    expect(ABSENT_COLOR).toBe('#0a1220')
  })

  it('BG_COLOR is the page background', () => {
    expect(BG_COLOR).toBe('#0f1b2d')
  })
})
