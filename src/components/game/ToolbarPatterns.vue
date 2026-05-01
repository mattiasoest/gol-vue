<script setup lang="ts">
import { ref } from 'vue'

import { LIFE_PRESETS } from '@/engine/presets'
import { useGameOfLifeStore } from '@/stores/gameOfLife'

import { presetSelectOptions, type PresetId } from './presetSelect'

const store = useGameOfLifeStore()
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
</template>
