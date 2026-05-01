/** Named presets as relative `{x,y}` coordinates (minimal bounding box anchored top-left). */

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

export function bboxOfCells(
  coords: readonly { readonly x: number; readonly y: number }[],
): BoundingBox {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const c of coords) {
    minX = Math.min(minX, c.x)
    minY = Math.min(minY, c.y)
    maxX = Math.max(maxX, c.x)
    maxY = Math.max(maxY, c.y)
  }
  if (!coords.length || minX === Infinity) {
    return { minX: 0, minY: 0, maxX: -1, maxY: -1, width: 0, height: 0 }
  }
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
}

export const LIFE_PRESETS: Record<
  string,
  { label: string; cells: readonly { readonly x: number; readonly y: number }[] }
> = {
  glider: {
    label: 'Glider',
    cells: [
      { x: 1, y: 0 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
  },
  blinker: {
    label: 'Blinker',
    cells: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
  },
  beacon: {
    label: 'Beacon',
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
    ],
  },
  rpentomino: {
    label: 'R-pentomino',
    cells: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
  },
}
