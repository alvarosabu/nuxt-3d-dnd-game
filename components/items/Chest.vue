<script setup lang="ts">
import gsap from 'gsap'
import type { ThreeEvent } from '@tresjs/core'
import { Html } from '@tresjs/cientos'
import { useGameStore } from '~/stores/useGameStore'

const chestRef = ref()
const vueLogoRef = ref()
const { getResource } = useResourcePreloader()
const { nodes } = getResource('models', 'chest') as { nodes: Record<string, any> }
const { nodes: vueNodes } = getResource('models', 'vue') as { nodes: Record<string, any> }

const { setCursor, resetCursor } = useGameCursor()
const gameStore = useGameStore()

const isOpen = ref(true)
const isLocked = ref(true)
const isHovering = ref(false)

const chestBase = nodes.chest_large
const chestLid = nodes.chest_large_lid
const vue = vueNodes.Vue
// Set initial scale and position
vue.scale.set(0, 0, 0)
vue.position.set(0, 0, 0)

/**
 * Handles the chest lid animation using GSAP
 * @param value - Whether the chest is open or closed
 */
watch(isOpen, (value) => {
  // Animate chest lid
  gsap.to(chestLid.rotation, {
    x: value ? -Math.PI / 2 : 0,
    duration: 0.5,
    ease: 'power2.out',
  })

  // Animate Vue logo
  gsap.to(vue.scale, {
    x: value ? 3 : 0,
    y: value ? 3 : 0,
    z: value ? 3 : 0,
    duration: 0.5,
    ease: 'back.out(1.7)',
  })

  gsap.to(vue.position, {
    y: value ? 1.5 : 0,
    duration: 0.5,
    ease: 'back.out(1.7)',
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
  gameStore.state.contextMenu.items = isLocked.value
    ? [{
        label: 'Lockpick',
        icon: 'i-lucide-lock',
        onSelect: () => {
          gameStore.openDiceRollModal({
            title: 'Dexterity Check',
            subtitle: 'Sleight of Hand',
            difficultyClass: 10,
            diceType: 20,
            onSuccess: () => {
              isLocked.value = false
            },
          })
        },
      }]
    : [
        {
          label: 'Open',
          onSelect: () => {
            isOpen.value = true
          },
        },
      ]
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
  isOpen.value = false
  e.stopPropagation()
}

watch(() => gameStore.state.contextMenu.isOpen, (value) => {
  if (!value) {
    isHovering.value = false
    removeObjectOutline(chestRef.value)
    resetCursor()
  }
})

const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  if (vueLogoRef.value) {
    vueLogoRef.value.rotation.y = Math.sin(elapsed * 0.5) * 0.5
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
    <primitive ref="vueLogoRef" :object="vue" />
  </TresGroup>
</template>
