<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useGameOfLifeStore } from '@/stores/gameOfLife'

const store = useGameOfLifeStore()
const { width, height } = storeToRefs(store)

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
</script>

<template>
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
</template>
