<script setup lang="ts">
import gsap from 'gsap'
import type { ThreeEvent } from '@tresjs/core'
import { Html } from '@tresjs/cientos'
import { useGameStore } from '~/stores/useGameStore'

const chestRef = ref()

const { getResource } = useResourcePreloader()
const { nodes } = getResource('models', 'chest') as { nodes: Record<string, any> }
const { setCursor, resetCursor } = useGameCursor()
const gameStore = useGameStore()

const isOpen = ref(false)
const isLocked = ref(true)
const isHovering = ref(false)

const chestBase = nodes.chest_large
const chestLid = nodes.chest_large_lid

/**
 * Handles the chest lid animation using GSAP
 * @param value - Whether the chest is open or closed
 */
watch(isOpen, (value) => {
  gsap.to(chestLid.rotation, {
    x: value ? -Math.PI / 2 : 0,
    duration: 0.5,
    ease: 'power2.out',
  })
})

/**
 * Handles the click event on the chest
 * @param e - The pointer event from TresJS
 */
const handleClick = (e: ThreeEvent<PointerEvent>) => {
  if (!isLocked.value) {
    isOpen.value = !isOpen.value
  }
  e.stopPropagation()
}

// Outline the chest
const { outlineObject, removeObjectOutline } = useOutlinedObjects()

/**
 * Handle pointer enter event
 * Sets the appropriate cursor and outline
 */
const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
  isHovering.value = true
  outlineObject(e.object)
  setCursor(isLocked.value ? 'locked' : 'pointer')
  gameStore.state.contextMenu.enabled = true
  gameStore.state.contextMenu.items = [{
    label: 'Lockpick',
    icon: 'i-lucide-lock',
  }]
  e.stopPropagation()
}

/**
 * Handle pointer leave event
 * Resets cursor and removes outline
 */
const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
  if (gameStore.state.contextMenu.isOpen === true) { return }
  isHovering.value = false
  removeObjectOutline(e.object)
  resetCursor()
  gameStore.state.contextMenu.items = []
  gameStore.state.contextMenu.enabled = false

  e.stopPropagation()
}

watch(() => gameStore.state.contextMenu.isOpen, (value) => {
  if (!value) {
    isHovering.value = false
    removeObjectOutline(chestRef.value)
    resetCursor()
  }
})
</script>

<template>
  <TresGroup
    ref="chestRef"
    @click="handleClick"
    @pointerenter="handlePointerEnter"
    @pointerleave="handlePointerLeave"
  >
    <Html
      center
      :distance-factor="4"
      :scale="2"
      :position="[0, 2, 0]"
    >
      <UBadge
        v-if="isHovering"
        label="Chest"
        color="neutral"
      />
    </Html>
    <primitive :object="chestBase" />
    <primitive :object="chestLid" />
  </TresGroup>
</template>
