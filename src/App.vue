<script setup lang="ts">
import GameHeader from '@/components/game/GameHeader.vue'
import GameHud from '@/components/game/GameHud.vue'
import GameLifeStage from '@/components/game/GameLifeStage.vue'
import Toolbar from '@/components/game/Toolbar.vue'
</script>

<template>
  <div class="life-game">
    <GameHeader />

    <section class="toolbar" aria-label="Simulation controls">
      <Toolbar />
    </section>

    <GameHud />
    <GameLifeStage />
  </div>
</template>

<style src="@/components/game/game-ui.css"></style>
