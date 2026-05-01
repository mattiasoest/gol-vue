<script setup lang="ts">
import GameHeader from '@/components/game/GameHeader.vue'
import GameHud from '@/components/game/GameHud.vue'
import GameLifeStage from '@/components/game/GameLifeStage.vue'
import ToolbarGridSize from '@/components/game/ToolbarGridSize.vue'
import ToolbarPatterns from '@/components/game/ToolbarPatterns.vue'
import ToolbarPlayback from '@/components/game/ToolbarPlayback.vue'
import ToolbarRandomize from '@/components/game/ToolbarRandomize.vue'
import ToolbarStagnation from '@/components/game/ToolbarStagnation.vue'
</script>

<template>
  <div class="life-game">
    <GameHeader />

    <section class="toolbar" aria-label="Simulation controls">
      <ToolbarPlayback />
      <ToolbarRandomize />
      <ToolbarGridSize />
      <ToolbarPatterns />
      <ToolbarStagnation />
    </section>

    <GameHud />
    <GameLifeStage />
  </div>
</template>

<style src="@/components/game/game-ui.css"></style>
