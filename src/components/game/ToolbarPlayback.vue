<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useGameOfLifeStore } from '@/stores/gameOfLife'

const store = useGameOfLifeStore()
const { toroidal, running, stepIntervalMs } = storeToRefs(store)

function toggleRun(): void {
  store.setRunning(!running.value)
}
</script>

<template>
  <div class="cluster">
    <button type="button" class="primary" @click="toggleRun">
      {{ running ? 'Pause' : 'Run' }}
    </button>
    <button type="button" @click="store.stepOnce()">Step</button>
    <button type="button" @click="store.clear()">Clear</button>
  </div>

  <label class="field">
    <span>Speed (interval ms)</span>
    <input v-model.number="stepIntervalMs" type="range" min="15" max="520" />
    <small class="muted mono">{{ Math.round(stepIntervalMs) }}</small>
  </label>

  <div class="cluster">
    <label class="field inline">
      <input v-model="toroidal" type="checkbox" />
      Toroidal bounds
    </label>
  </div>
</template>
