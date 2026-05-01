<script setup lang="ts">
import { ref } from 'vue'

import { useGameOfLifeStore } from '@/stores/gameOfLife'

const store = useGameOfLifeStore()
const density = ref(0.28)
</script>

<template>
  <label class="field">
    Random density
    <input v-model.number="density" type="range" min="0.02" max="0.42" step="0.02" />
    <small class="muted mono">{{ density.toFixed(2) }}</small>
  </label>
  <button type="button" @click="store.seedRandom(density)">Randomize</button>

  <div class="divider" role="presentation" />
</template>
