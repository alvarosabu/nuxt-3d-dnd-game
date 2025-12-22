<script setup lang="ts">
import ConfettiExplosion from 'vue-confetti-explosion'

const gameStore = useGameStore()
const { init, setCurrentLevel } = gameStore
const uiStore = useUIStore()

const { showConfetti } = storeToRefs(uiStore)

setCurrentLevel('test-level-a')

await init()

const { width, height } = useWindowSize()
</script>

<template>
  <div>
    <UiCommandPalette />
    <UiDebugControls />
    <Hud />
    <GameContextMenu />
    <ConfettiExplosion
      v-if="showConfetti"
      :particle-count="200"
      :force="0.3"
      :stage-height="height"
      :stage-width="width"
    />
    <slot/>
  </div>
</template>
