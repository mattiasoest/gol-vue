import { describe, expect, it } from 'vitest'
import {
  computeNextGeneration,
  countMooreNeighbors,
  createEmptyGrid,
  populationCount,
} from './gameEngine'

function setAlive(
  grid: Uint8Array,
  width: number,
  coords: readonly { x: number; y: number }[],
): void {
  for (const { x, y } of coords) {
    grid[y * width + x] = 1
  }
}

describe('computeNextGeneration', () => {
  it('still life: block unchanged', () => {
    const w = 10
    const h = 10
    const current = createEmptyGrid(w, h)
    const next = createEmptyGrid(w, h)
    setAlive(current, w, [
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
    ])

    computeNextGeneration(current, next, w, h)
    expect(next.every((v, i) => v === current[i])).toBe(true)
  })

  it('oscillator: horizontal blinker toggles orientation every generation', () => {
    const w = 15
    const h = 15
    const a = createEmptyGrid(w, h)
    const b = createEmptyGrid(w, h)
    setAlive(a, w, [
      { x: 5, y: 7 },
      { x: 6, y: 7 },
      { x: 7, y: 7 },
    ])

    computeNextGeneration(a, b, w, h)
    expect(populationCount(b)).toBe(3)

    computeNextGeneration(b, a, w, h)
    expect(populationCount(a)).toBe(3)
    expect(a[7 * w + 5]).toBe(1)
    expect(a[7 * w + 6]).toBe(1)
    expect(a[7 * w + 7]).toBe(1)
    expect(Array.from(a.entries()).filter(([, v]) => v === 1).length).toBe(3)
  })

  it('dead stays dead with toroidal default off', () => {
    const w = 5
    const h = 5
    const current = createEmptyGrid(w, h)
    const next = createEmptyGrid(w, h)
    computeNextGeneration(current, next, w, h)
    expect(populationCount(next)).toBe(0)
  })
})

describe('countMooreNeighbors', () => {
  it('bounds: corner cell only counts in-grid neighbors when not toroidal', () => {
    const w = 3
    const h = 3
    const g = createEmptyGrid(w, h)
    g[1 * w + 1] = 1
    expect(countMooreNeighbors(g, w, h, 0, 0, false)).toBe(1)
  })

  it('toroidal wraps so all eight neighbors contribute', () => {
    const w = 20
    const h = 20
    const g = createEmptyGrid(w, h)
    const centerX = 0
    const centerY = 0
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const nx = (centerX + dx + w) % w
        const ny = (centerY + dy + h) % h
        g[ny * w + nx] = 1
      }
    }
    expect(countMooreNeighbors(g, w, h, centerX, centerY, true)).toBe(8)
    expect(countMooreNeighbors(g, w, h, centerX, centerY, false)).toBe(3)
  })
})
