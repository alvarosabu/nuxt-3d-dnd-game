<script setup lang="ts">
import '@tresjs/leches/styles'

const gameStore = useGameStore()
const { init } = gameStore
const uiStore = useUIStore()
const { handleContextMenuOpen, contextMenu } = uiStore

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
