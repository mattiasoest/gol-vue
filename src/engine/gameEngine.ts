/** Row-major Uint8Array: index = y * width + x */

export interface StepOptions {
  /** If true, grid edges wrap (toroidal). If false, out-of-bound neighbors count as dead. */
  toroidal?: boolean
}

export function computeNextGeneration(
  current: Uint8Array,
  next: Uint8Array,
  width: number,
  height: number,
  options: StepOptions = {},
): void {
  const toroidal = options.toroidal ?? false
  if (current.length !== width * height || next.length !== width * height) {
    throw new Error('buffer length must equal width * height')
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const neighbors = countMooreNeighbors(current, width, height, x, y, toroidal)
      const alive = current[idx]!
      if (alive) {
        next[idx] = neighbors === 2 || neighbors === 3 ? 1 : 0
      } else {
        next[idx] = neighbors === 3 ? 1 : 0
      }
    }
  }
}

export function countMooreNeighbors(
  cells: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
  toroidal: boolean,
): number {
  let count = 0
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue
      let nx = x + dx
      let ny = y + dy
      if (toroidal) {
        nx = ((nx % width) + width) % width
        ny = ((ny % height) + height) % height
      } else if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
        continue
      }
      count += cells[ny * width + nx]!
    }
  }
  return count
}

export function createEmptyGrid(width: number, height: number): Uint8Array {
  return new Uint8Array(width * height)
}

export function populationCount(cells: Uint8Array): number {
  let n = 0
  for (let i = 0; i < cells.length; i++) {
    if (cells[i]) n++
  }
  return n
}
