<script setup lang="ts">
import '@tresjs/leches/styles'

const gameStore = useGameStore()

await gameStore.init()

const handleContextMenuOpen = (open: boolean) => {
  gameStore.state.contextMenu.isOpen = open

  if (!open) {
    gameStore.state.contextMenu.items = []
    gameStore.state.contextMenu.enabled = false
  }
}
</script>

<template>
  <div>
    <!-- <TresLeches collapsed /> -->
    <UContextMenu
      :disabled="!gameStore.state.contextMenu.enabled"
      size="sm"
      :items="gameStore.state.contextMenu.items"
      @update:open="handleContextMenuOpen"
    >
      <slot></slot>
    </UContextMenu>
  </div>
</template>
