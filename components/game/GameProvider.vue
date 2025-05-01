<script setup lang="ts">
import '@tresjs/leches/styles'
import ConfettiExplosion from 'vue-confetti-explosion'
import CommandPalette from '~/components/ui/CommandPalette.vue'
import DebugControls from '~/components/ui/DebugControls.vue'

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
    <CommandPalette />
    <DebugControls />
    <Hud />
    <ConfettiExplosion
      v-if="showConfetti"
      :particle-count="200"
      :force="0.3"
      :stage-height="height"
      :stage-width="width"
    />
    <UContextMenu
      :disabled="!contextMenu.enabled"
      size="sm"
      :items="contextMenu.items"
      @update:open="handleContextMenuOpen"
    >
      <slot/>
    </UContextMenu>
  </div>
</template>
