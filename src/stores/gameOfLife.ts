import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'

import { computeNextGeneration, createEmptyGrid, populationCount } from '@/engine/gameEngine'
import { bboxOfCells } from '@/engine/presets'
import { decodeRLE } from '@/engine/rle'

const DEFAULT_WIDTH = 200
const DEFAULT_HEIGHT = 120

/** Row-major Uint8Array; swaps each step. Current buffer is authoritative for rendering. */
export const useGameOfLifeStore = defineStore('gameOfLife', () => {
  const width = ref(DEFAULT_WIDTH)
  const height = ref(DEFAULT_HEIGHT)

  /** Double buffer: canonical live state reads from current */
  const bufferA = shallowRef(createEmptyGrid(width.value, height.value))
  const bufferB = shallowRef(createEmptyGrid(width.value, height.value))

  let currentIsA = true
  function currentBuffer(): Uint8Array {
    return currentIsA ? bufferA.value : bufferB.value
  }
  function nextBuffer(): Uint8Array {
    return currentIsA ? bufferB.value : bufferA.value
  }
  function swapBuffers(): void {
    currentIsA = !currentIsA
  }

  const toroidal = ref(false)
  const running = ref(false)
  /** Milliseconds between generations while running */
  const stepIntervalMs = ref(80)

  const generation = ref(0)
  /** Bump on grid edit or simulation step so renderers/population recomputed even when buffers swap internally. */
  const revision = ref(0)

  /** Monotonic stagnant generations (population unchanged across steps) */
  const stagnantGenerations = ref(0)
  const stagnantThreshold = ref(250)
  const autoPauseOnStagnant = ref(true)

  let lastPopulation = 0

  const population = computed(() => {
    void revision.value
    return populationCount(currentBuffer())
  })

  function reallocate(w: number, h: number, preserveCenter = false): void {
    if (w < 8 || h < 8 || w > 4096 || h > 4096) return
    const oldW = width.value
    const oldH = height.value
    const oldCurr = createEmptyGrid(w, h)
    if (preserveCenter) {
      const copyW = Math.min(oldW, w)
      const copyH = Math.min(oldH, h)
      const src = currentBuffer()
      const ox = Math.floor((w - copyW) / 2)
      const oy = Math.floor((h - copyH) / 2)
      const sx = Math.floor((oldW - copyW) / 2)
      const sy = Math.floor((oldH - copyH) / 2)
      for (let y = 0; y < copyH; y++) {
        for (let x = 0; x < copyW; x++) {
          const si = (sy + y) * oldW + (sx + x)
          const di = (oy + y) * w + (ox + x)
          oldCurr[di] = si >= 0 && si < src.length ? (src[si] ?? 0) : 0
        }
      }
    }

    bufferA.value = preserveCenter ? oldCurr : createEmptyGrid(w, h)
    bufferB.value = createEmptyGrid(w, h)
    currentIsA = true
    width.value = w
    height.value = h
    generation.value = 0
    revision.value++
    lastPopulation = populationCount(currentBuffer())
    stagnantGenerations.value = 0
  }

  function clear(): void {
    currentBuffer().fill(0)
    generation.value = 0
    lastPopulation = 0
    stagnantGenerations.value = 0
    revision.value++
  }

  /** Renderer may read stale frame if toggling mid-paint — acceptable at this scale */
  function toggleCell(atX: number, atY: number): void {
    const w = width.value
    const h = height.value
    if (atX < 0 || atX >= w || atY < 0 || atY >= h) return
    const idx = atY * w + atX
    const cur = currentBuffer()
    cur[idx] = cur[idx] ? 0 : 1
    lastPopulation = populationCount(cur)
    stagnantGenerations.value = 0
    revision.value++
  }

  function setCell(atX: number, atY: number, alive: boolean): void {
    const w = width.value
    const h = height.value
    if (atX < 0 || atX >= w || atY < 0 || atY >= h) return
    currentBuffer()[atY * w + atX] = alive ? 1 : 0
    lastPopulation = populationCount(currentBuffer())
    stagnantGenerations.value = 0
    revision.value++
  }

  function seedRandom(density01: number): void {
    const w = width.value
    const h = height.value
    const cells = currentBuffer()
    cells.fill(0)
    const p = Math.min(1, Math.max(0, density01))
    for (let i = 0; i < cells.length; i++) {
      cells[i] = Math.random() < p ? 1 : 0
    }
    generation.value = 0
    lastPopulation = populationCount(cells)
    stagnantGenerations.value = 0
    revision.value++
  }

  /** Removes all cells then stamps `coords`, centered using their bounding box. */
  function seedPatternCentered(
    coords: readonly { readonly x: number; readonly y: number }[],
  ): void {
    clear()
    if (!coords.length) return
    const { minX, minY, width: pw, height: ph } = bboxOfCells(coords)
    if (pw <= 0 || ph <= 0) return

    const ox = Math.max(0, Math.floor((width.value - pw) / 2) - minX)
    const oy = Math.max(0, Math.floor((height.value - ph) / 2) - minY)

    placePattern(coords as { x: number; y: number }[], ox, oy)
  }

  /** Clears grid and loads LifeWiki RLE into the centered region. */
  function loadPatternFromRLE(rleSource: string): void {
    const { cells } = decodeRLE(rleSource)
    seedPatternCentered(cells)
  }

  function placePattern(
    coords: readonly { x: number; y: number }[],
    originX: number,
    originY: number,
  ): void {
    const w = width.value
    const h = height.value
    const cells = currentBuffer()
    let changed = false
    for (const { x, y } of coords) {
      const atX = originX + x
      const atY = originY + y
      if (atX < 0 || atX >= w || atY < 0 || atY >= h) continue
      cells[atY * w + atX] = 1
      changed = true
    }
    if (changed) {
      revision.value++
      lastPopulation = populationCount(cells)
      stagnantGenerations.value = 0
    }
  }

  function stepOnce(): boolean {
    const w = width.value
    const h = height.value
    const cur = currentBuffer()
    const nxt = nextBuffer()
    computeNextGeneration(cur, nxt, w, h, { toroidal: toroidal.value })

    swapBuffers()

    generation.value++
    const pop = populationCount(currentBuffer())

    if (pop === lastPopulation) {
      stagnantGenerations.value++
      if (
        autoPauseOnStagnant.value &&
        stagnantThreshold.value > 0 &&
        stagnantGenerations.value >= stagnantThreshold.value
      ) {
        running.value = false
      }
    } else {
      stagnantGenerations.value = 0
    }
    lastPopulation = pop
    revision.value++
    return true
  }

  function setRunning(on: boolean): void {
    running.value = on
  }

  function setToroidal(on: boolean): void {
    toroidal.value = on
  }

  function setAutoPauseOnStagnant(on: boolean): void {
    autoPauseOnStagnant.value = on
  }

  /** Read-only view for renderer */
  function getCells(): Uint8Array {
    return currentBuffer()
  }

  return {
    width,
    height,
    toroidal,
    running,
    stepIntervalMs,
    generation,
    revision,
    population,
    stagnantGenerations,
    stagnantThreshold,
    autoPauseOnStagnant,
    stepOnce,
    clear,
    toggleCell,
    setCell,
    seedRandom,
    placePattern,
    seedPatternCentered,
    loadPatternFromRLE,
    reallocate,
    setRunning,
    setToroidal,
    setAutoPauseOnStagnant,
    getCells,
  }
})
