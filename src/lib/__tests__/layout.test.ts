import { describe, it, expect, beforeEach } from 'vitest'
import {
  computeLayout,
  degreesToRadians,
  arcPath,
} from '../layout'
import type { LayoutResult } from '../layout'
import type { StationGroup } from '../parseData'

// Minimal group fixture: 2 stations in s-bahn, 1 in bus (2 non-empty groups)
function makeGroups(counts: number[]): StationGroup[] {
  const keys = ['s-bahn', 'u-bahn', 'tram', 'bus', 'none'] as const
  return counts
    .map((count, i) => ({
      key: keys[i],
      stations: Array.from({ length: count }, (_, j) => ({
        name: `Station ${j}`,
        adresse: 'Test St',
        anzStellplCs: 0,
        services: {
          s_bahn_vorhanden: i === 0,
          u_bahn_vorhanden: i === 1,
          tram_vorhanden: i === 2,
          bus_vorhanden: i === 3,
          ods_vorhanden: false,
          gaf_ts_vorhanden: false,
          gaf_bs_vorhanden: false,
          gaf_ls_vorhanden: false,
          gaf_ms_vorhanden: false,
          radservicestation_vorhanden: false,
          radpumpe_vorhanden: false,
        },
      })),
    }))
    .filter((_, i) => counts[i] > 0)
}

describe('degreesToRadians', () => {
  it('converts 180 to PI', () => {
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI)
  })
  it('converts 0 to 0', () => {
    expect(degreesToRadians(0)).toBe(0)
  })
})

describe('computeLayout', () => {
  const R = 400
  // 2 non-empty groups (s-bahn: 2, bus: 1), 2 gaps x 5deg = 10deg, available = 350deg, total = 3
  const groups = makeGroups([2, 0, 0, 1, 0])

  let result: LayoutResult

  beforeEach(() => {
    result = computeLayout(groups, R)
  })

  it('returns one StationGeometry per station', () => {
    expect(result.stations).toHaveLength(3)
  })

  it('first station starts near -PI/2 (12 oclock)', () => {
    const first = result.stations[0]
    expect(first.midAngle).toBeGreaterThan(-Math.PI / 2)
    expect(first.midAngle).toBeLessThan(0)
  })

  it('11 rings with equal width between 18% and 46% of R', () => {
    expect(result.rings).toHaveLength(11)
    const expectedWidth = (0.46 - 0.18) * R / 11
    result.rings.forEach((ring, i) => {
      expect(ring.innerR).toBeCloseTo(0.18 * R + i * expectedWidth, 1)
      expect(ring.outerR).toBeCloseTo(0.18 * R + (i + 1) * expectedWidth, 1)
    })
  })

  it('centerR is 15% of R', () => {
    expect(result.centerR).toBeCloseTo(0.15 * R, 1)
  })

  it('labelR is 48% of R', () => {
    expect(result.labelR).toBeCloseTo(0.48 * R, 1)
  })

  it('one groupArc per non-empty group', () => {
    expect(result.groupArcs).toHaveLength(2)
  })

  it('group arc inner = 47% R, outer = 47.8% R', () => {
    result.groupArcs.forEach((arc) => {
      expect(arc.innerR).toBeCloseTo(0.47 * R, 1)
      expect(arc.outerR).toBeCloseTo(0.478 * R, 1)
    })
  })

  it('filled arc is narrower than slot arc', () => {
    result.stations.forEach((s) => {
      const slotWidth = s.endAngle - s.startAngle
      const fillWidth = s.fillEndAngle - s.fillStartAngle
      expect(fillWidth).toBeLessThan(slotWidth)
      expect(fillWidth).toBeGreaterThan(0)
    })
  })

  it('right-half station near top has labelFlip false', () => {
    const first = result.stations[0]
    expect(first.labelFlip).toBe(false)
    expect(first.labelAnchor).toBe('start')
  })

  it('25 star dots generated', () => {
    expect(result.starDots).toHaveLength(25)
  })

  it('stationIndex is sequential starting from 0', () => {
    result.stations.forEach((s, i) => {
      expect(s.stationIndex).toBe(i)
    })
  })
})

describe('arcPath', () => {
  it('returns a non-empty SVG path string starting with M', () => {
    const path = arcPath(50, 100, 0, Math.PI / 2)
    expect(typeof path).toBe('string')
    expect(path.length).toBeGreaterThan(0)
    expect(path).toMatch(/^M/)
  })
})
