import { scaleLinear } from 'd3'

/** Bounding box of all 137 Munich Mobilitätspunkte (EPSG:25832, with 2% padding) */
export const MUNICH_BOUNDS = {
  minX: 677000,
  maxX: 703000,
  minY: 5323000,
  maxY: 5348000,
} as const

export interface ScreenPoint {
  sx: number  // screen x in pixels
  sy: number  // screen y in pixels
}

/**
 * Returns a projection function that maps EPSG:25832 (x, y) → screen (sx, sy).
 * Y axis is flipped: higher northing = lower screen y (SVG convention).
 */
export function createProjection(
  svgWidth: number,
  svgHeight: number,
): (x: number, y: number) => ScreenPoint {
  const scaleX = scaleLinear()
    .domain([MUNICH_BOUNDS.minX, MUNICH_BOUNDS.maxX])
    .range([0, svgWidth])

  const scaleY = scaleLinear()
    .domain([MUNICH_BOUNDS.minY, MUNICH_BOUNDS.maxY])
    .range([svgHeight, 0]) // flip: north = top

  return (x: number, y: number): ScreenPoint => ({
    sx: scaleX(x),
    sy: scaleY(y),
  })
}
