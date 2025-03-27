<script setup lang="ts">
import '@tresjs/leches/styles'
import ConfettiExplosion from 'vue-confetti-explosion'

const gameStore = useGameStore()
const { init, setCurrentLevel } = gameStore
const uiStore = useUIStore()
const { handleContextMenuOpen, contextMenu } = uiStore

const { showConfetti } = storeToRefs(uiStore)

setCurrentLevel('test-level-a')

await init()

const { width, height } = useWindowSize()
</script>

<template>
  <div>
    <ConfettiExplosion
      v-if="showConfetti"
      :particleCount="200"
      :force="0.3"
      :stageHeight="height"
      :stageWidth="width"
    />
    <UContextMenu
      :disabled="!contextMenu.enabled"
      size="sm"
      :items="contextMenu.items"
      @update:open="handleContextMenuOpen"
    >
      <slot></slot>
    </UContextMenu>
  </div>
</template>
