import { onUnmounted } from 'vue'

export interface SimulationLoopParams {
  isRunning: () => boolean
  getStepIntervalMs: () => number
  step: () => void
  /** Runs every animation frame before stepping (paint here). */
  onFrame?: () => void
}

/**
 * Runs `step` according to cumulative time while running; always schedules `requestAnimationFrame`
 * until the owning component unmounts.
 */
export function useSimulationLoop(params: SimulationLoopParams): void {
  let rafId = 0
  let lastTs = performance.now()
  let accMs = 0

  function frame(ts: number): void {
    rafId = requestAnimationFrame(frame)
    let dtMs = ts - lastTs
    lastTs = ts
    /** Avoid spiral if tab was backgrounded */
    dtMs = Math.min(dtMs, 250)

    params.onFrame?.()

    if (params.isRunning()) {
      accMs += dtMs
      const interval = Math.max(1, params.getStepIntervalMs())
      while (accMs >= interval && params.isRunning()) {
        accMs -= interval
        params.step()
      }
    } else {
      accMs = 0
    }
  }

  rafId = requestAnimationFrame(frame)
  onUnmounted(() => {
    cancelAnimationFrame(rafId)
  })
}
