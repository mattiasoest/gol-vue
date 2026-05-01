<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useSimulationLoop } from '@/composables/useSimulationLoop'
import { useGameOfLifeStore } from '@/stores/gameOfLife'

const CELL_CSS_PX = 4

const store = useGameOfLifeStore()
const { width, height, running, stepIntervalMs } = storeToRefs(store)

const canvasRef = useTemplateRef('canvas')

let ctx: CanvasRenderingContext2D | null = null
/** draw | erase | null */
let strokeMode: 'draw' | 'erase' | null = null
const strokeVisited = new Set<string>()
let lastLw = -1
let lastLh = -1
let lastDpr = -1

const logicalCssSize = computed(() => ({
  w: width.value * CELL_CSS_PX,
  h: height.value * CELL_CSS_PX,
}))

function syncBackingStore(canvas: HTMLCanvasElement): boolean {
  const dpr = window.devicePixelRatio || 1
  const { w: lw, h: lh } = logicalCssSize.value
  canvas.style.width = `${lw}px`
  canvas.style.height = `${lh}px`

  let changed = false
  const bw = Math.max(1, Math.floor(lw * dpr))
  const bh = Math.max(1, Math.floor(lh * dpr))
  if (
    lw !== lastLw ||
    lh !== lastLh ||
    dpr !== lastDpr ||
    canvas.width !== bw ||
    canvas.height !== bh
  ) {
    canvas.width = bw
    canvas.height = bh
    lastLw = lw
    lastLh = lh
    lastDpr = dpr
    changed = true
  }
  if (ctx && changed) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return changed
}

function paint(): void {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return

  syncBackingStore(canvas)

  const lw = logicalCssSize.value.w
  const lh = logicalCssSize.value.h

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, lw, lh)

  const cells = store.getCells()
  const gw = width.value
  const gh = height.value

  ctx.fillStyle = '#34d399'
  for (let y = 0; y < gh; y++) {
    const row = y * gw
    for (let x = 0; x < gw; x++) {
      if (cells[row + x]!) {
        ctx.fillRect(x * CELL_CSS_PX, y * CELL_CSS_PX, CELL_CSS_PX, CELL_CSS_PX)
      }
    }
  }
}

function clientToCell(clientX: number, clientY: number): { cx: number; cy: number } | null {
  const canvas = canvasRef.value
  if (!canvas) return null

  const rect = canvas.getBoundingClientRect()
  const x = Math.floor((clientX - rect.left) / CELL_CSS_PX)
  const y = Math.floor((clientY - rect.top) / CELL_CSS_PX)
  if (x < 0 || x >= width.value || y < 0 || y >= height.value) return null
  return { cx: x, cy: y }
}

function brushCell(cx: number, cy: number): void {
  const key = `${cx},${cy}`
  if (strokeVisited.has(key)) return
  strokeVisited.add(key)
  if (strokeMode === 'draw') store.setCell(cx, cy, true)
  else if (strokeMode === 'erase') store.setCell(cx, cy, false)
}

function onPointerDown(e: PointerEvent): void {
  if (e.pointerType === 'mouse' && e.button === 1) return

  strokeVisited.clear()

  const erase = e.pointerType === 'mouse' && (e.shiftKey || e.button === 2)
  strokeMode =
    e.pointerType === 'touch' || e.pointerType === 'pen'
      ? 'draw'
      : erase
        ? 'erase'
        : e.button === 0
          ? 'draw'
          : null

  if (strokeMode === null) return
  ;(e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId)

  const p = clientToCell(e.clientX, e.clientY)
  if (!p) return

  brushCell(p.cx, p.cy)
}

function onPointerMove(e: PointerEvent): void {
  if (strokeMode === null) return

  const p = clientToCell(e.clientX, e.clientY)
  if (!p) return

  brushCell(p.cx, p.cy)
}

function endStroke(e?: PointerEvent): void {
  strokeMode = null
  strokeVisited.clear()
  if (e?.currentTarget instanceof HTMLCanvasElement) {
    try {
      ;(e.currentTarget as HTMLCanvasElement).releasePointerCapture(e.pointerId)
    } catch {
      /* not captured */
    }
  }
}

const onResize = () => paint()

onMounted(() => {
  canvasRef.value?.addEventListener('contextmenu', (ev) => ev.preventDefault())

  ctx = canvasRef.value?.getContext('2d', { alpha: false }) ?? null
  paint()

  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})

watch([width, height], () => {
  lastLw = -1
})

useSimulationLoop({
  step: () => store.stepOnce(),
  isRunning: () => running.value,
  getStepIntervalMs: () => stepIntervalMs.value,
  onFrame: paint,
})
</script>

<template>
  <canvas
    ref="canvas"
    class="life-canvas"
    @pointercancel="endStroke"
    @pointerdown.prevent="onPointerDown"
    @pointermove.prevent="onPointerMove"
    @pointerup.prevent="endStroke"
    @contextmenu.prevent
  />
</template>

<style scoped>
.life-canvas {
  cursor: crosshair;
  touch-action: none;
  display: block;
  border-radius: 6px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
}
</style>
