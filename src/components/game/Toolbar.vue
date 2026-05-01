<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { LIFE_PRESETS } from '@/engine/presets'
import { useGameOfLifeStore } from '@/stores/gameOfLife'

import { presetSelectOptions, type PresetId } from './presetSelect'

const store = useGameOfLifeStore()
const { toroidal, running, stepIntervalMs, width, height, autoPauseOnStagnant, stagnantThreshold } =
  storeToRefs(store)

function toggleRun(): void {
  store.setRunning(!running.value)
}

const density = ref(0.28)

const widthInput = ref(String(width.value))
const heightInput = ref(String(height.value))

watch(width, (v) => {
  widthInput.value = String(v)
})
watch(height, (v) => {
  heightInput.value = String(v)
})

function applyGridSize(): void {
  const w = Number.parseInt(widthInput.value, 10)
  const h = Number.parseInt(heightInput.value, 10)
  store.reallocate(w, h, true)
}

const presetKey = ref<PresetId>('glider')
const rlePaste = ref('')

function seedSelectedPreset(): void {
  store.seedPatternCentered(LIFE_PRESETS[presetKey.value]!.cells)
}

function importRLE(): void {
  store.loadPatternFromRLE(rlePaste.value)
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

  <label class="field">
    Random density
    <input v-model.number="density" type="range" min="0.02" max="0.42" step="0.02" />
    <small class="muted mono">{{ density.toFixed(2) }}</small>
  </label>
  <button type="button" @click="store.seedRandom(density)">Randomize</button>

  <div class="divider" role="presentation" />

  <div class="cluster grid-dims">
    <label class="field">
      Width
      <input v-model="widthInput" class="mono" inputmode="numeric" type="number" min="24" />
    </label>
    <label class="field">
      Height
      <input v-model="heightInput" class="mono" inputmode="numeric" type="number" min="24" />
    </label>
    <button type="button" class="stretch" @click="applyGridSize">Apply grid</button>
  </div>

  <div class="cluster">
    <label class="field">
      Presets
      <select v-model="presetKey">
        <option v-for="opt in presetSelectOptions()" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </label>
    <button type="button" @click="seedSelectedPreset">Load preset</button>
  </div>

  <div class="rle-stack">
    <label class="field">
      Paste RLE
      <textarea
        v-model="rlePaste"
        rows="5"
        spellcheck="false"
        placeholder="#C pasted pattern&#10;x = …"
      ></textarea>
    </label>
    <button type="button" class="stretch" @click="importRLE">Import RLE</button>
  </div>

  <div class="divider" role="presentation" />

  <label class="field inline">
    <input v-model="autoPauseOnStagnant" type="checkbox" />
    Auto pause if population flat for threshold
  </label>
  <label class="field">
    Flat generations before pause
    <input v-model.number="stagnantThreshold" type="range" min="10" max="800" />
    <small class="muted mono">{{ stagnantThreshold }}</small>
  </label>
</template>
