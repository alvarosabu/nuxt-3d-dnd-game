<script setup lang="ts">
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { useUIStore } from '~/stores/useUIStore'
import type { ContextMenuItem } from '~/types'

const uiStore = useUIStore()
const { contextMenu } = storeToRefs(uiStore)

const menuRef = ref<HTMLElement>()

// Close on click outside
onClickOutside(menuRef, () => {
  if (contextMenu.value.isOpen) {
    uiStore.handleContextMenuOpen(false)
  }
})

// Close on Escape key
onKeyStroke('Escape', () => {
  if (contextMenu.value.isOpen) {
    uiStore.handleContextMenuOpen(false)
  }
})

// Handle item click
function handleItemClick(item: ContextMenuItem) {
  if (item.onSelect) {
    item.onSelect()
  }
  uiStore.handleContextMenuOpen(false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="context-menu">
      <div
        v-if="contextMenu.isOpen"
        ref="menuRef"
        :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
        class="fixed z-50 rounded-md border border-gray-200/10 bg-gray-800 shadow-lg ring-1 ring-gray-200/10 p-1 overflow-hidden"
        @click.stop
      >
        <UButton
          v-for="(item, index) in contextMenu.items"
          :key="index"
          :label="item.label"
          :icon="item.icon"
          variant="ghost"
          color="neutral"
          size="xs"
          block
          @click="handleItemClick(item)"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.context-menu-enter-active,
.context-menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
