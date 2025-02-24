<script setup lang="ts">
import '@tresjs/leches/styles'

const gameStore = useGameStore()
const { init, setCurrentLevel } = gameStore
const uiStore = useUIStore()
const { handleContextMenuOpen, contextMenu } = uiStore

setCurrentLevel('test-level-a')

await init()
</script>

<template>
  <div>
    <!-- <TresLeches collapsed /> -->
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
