import { describe, it, expect } from 'vitest'
import { createProjection, MUNICH_BOUNDS } from '../mapProjection'

describe('createProjection', () => {
  it('projects the SW corner to (0, height) in screen space', () => {
    const proj = createProjection(1, 1)
    const pt = proj(MUNICH_BOUNDS.minX, MUNICH_BOUNDS.minY)
    expect(pt.sx).toBeCloseTo(0, 2)
    expect(pt.sy).toBeCloseTo(1, 2) // y is flipped (SVG top=0)
  })

  it('projects the NE corner to (width, 0) in screen space', () => {
    const proj = createProjection(1, 1)
    const pt = proj(MUNICH_BOUNDS.maxX, MUNICH_BOUNDS.maxY)
    expect(pt.sx).toBeCloseTo(1, 2)
    expect(pt.sy).toBeCloseTo(0, 2)
  })

  it('scales correctly to given SVG dimensions', () => {
    const proj = createProjection(800, 600)
    const pt = proj(MUNICH_BOUNDS.minX, MUNICH_BOUNDS.minY)
    expect(pt.sx).toBeCloseTo(0, 1)
    expect(pt.sy).toBeCloseTo(600, 1)
  })

  it('projects a midpoint to approximately centre of screen', () => {
    const proj = createProjection(800, 600)
    const midX = (MUNICH_BOUNDS.minX + MUNICH_BOUNDS.maxX) / 2
    const midY = (MUNICH_BOUNDS.minY + MUNICH_BOUNDS.maxY) / 2
    const pt = proj(midX, midY)
    expect(pt.sx).toBeCloseTo(400, 0)
    expect(pt.sy).toBeCloseTo(300, 0)
  })
})
