<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useGameOfLifeStore } from '@/stores/gameOfLife'

const store = useGameOfLifeStore()
const { autoPauseOnStagnant, stagnantThreshold } = storeToRefs(store)
</script>

<template>
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
