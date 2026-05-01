<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useGameOfLifeStore } from '@/stores/gameOfLife'

const store = useGameOfLifeStore()
const { generation, population, stagnantGenerations } = storeToRefs(store)
</script>

<template>
  <section class="hud mono" aria-live="polite">
    Generation <strong>{{ generation }}</strong>
    <span aria-hidden="true">&middot;</span>
    Population <strong>{{ population }}</strong>
    <span aria-hidden="true">&middot;</span>
    Stagnant gens <strong>{{ stagnantGenerations }}</strong>
  </section>
</template>
