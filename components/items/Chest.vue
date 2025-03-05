<script setup lang="ts">
import gsap from 'gsap'
import type { ThreeEvent } from '@tresjs/core'
import { Html } from '@tresjs/cientos'
import { useUIStore } from '~/stores/useUIStore'
import { useGameStore } from '~/stores/useGameStore'
import { useMultiplayer } from '~/composables/game/useMultiplayer'
import { calculateSkillCheckModifiers } from '~/utils/dice'

// Props for the chest
const props = defineProps<{
  id: string
  position?: [number, number, number]
}>()
const chestRef = ref()
const vueLogoRef = ref()
const { getResource } = useResourcePreloader()
const { nodes } = getResource('models', 'chest') as unknown as { nodes: Record<string, any> }
const { nodes: vueNodes } = getResource('models', 'vue') as unknown as { nodes: Record<string, any> }

const { setCursor, resetCursor } = useGameCursor()
const uiStore = useUIStore()
const gameStore = useGameStore()
const { data, sendMsg } = useMultiplayer(gameStore.isMultiplayer)

// Get chest state from the store
const item = computed(() => gameStore.getItemById(props.id))
const chestState = computed(() => item.value?.state ?? { isLocked: true, isOpen: false })
const chestPosition = computed(() => {
  // First try to get position from store
  if (item.value?.position) {
    return item.value.position
  }
  // Fallback to props position or default
  return props.position ?? [0, 0, 0]
})

const isOpen = computed({
  get: () => chestState.value.isOpen,
  set: (value) => {
    gameStore.updateItemState(props.id, { isOpen: value })
  },
})
const isLocked = computed({
  get: () => chestState.value.isLocked,
  set: (value) => {
    gameStore.updateItemState(props.id, { isLocked: value })
  },
})

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

  if (value) {
    uiStore.triggerConfetti()
  }
})

/**
 * Syncs the chest state with other players
 */
const syncChestState = () => {
  if (!gameStore.isMultiplayer) { return }

  sendMsg({
    type: 'UPDATE_ITEM_STATE',
    itemId: props.id,
    itemType: 'chest',
    state: {
      isOpen: isOpen.value,
      isLocked: isLocked.value,
    },
    position: [chestPosition.value.x, chestPosition.value.y, chestPosition.value.z],
  })
}

const lockpickAction = () => {
  uiStore.openDiceRollModal({
    title: 'Dexterity Check',
    subtitle: 'Sleight of Hand',
    difficultyClass: 18,
    diceType: 'd20',
    skillCheck: {
      ability: 'dexterity',
      skill: 'sleightOfHand',
    },
    onSuccess: () => {
      isLocked.value = false
      syncChestState()
    },
  }, true)
}

/**
 * Handles the click event on the chest
 * @param e - The pointer event from TresJS
 */
const handleClick = (e: ThreeEvent<PointerEvent>) => {
  if (!isLocked.value) {
    isOpen.value = !isOpen.value
    syncChestState()
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
  uiStore.contextMenu.enabled = true
  uiStore.setContextMenuItems(isLocked.value
    ? [{
        label: 'Lockpick',
        icon: 'i-lucide-lock',
        onSelect: lockpickAction,
      }]
    : [
        {
          label: 'Open',
          onSelect: () => {
            isOpen.value = true
            syncChestState()
          },
        },
      ])
  e.stopPropagation()
}

/**
 * Handle pointer leave event
 * Resets cursor and removes outline
 */
const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
  if (uiStore.contextMenu.isOpen) { return }
  isHovering.value = false
  uiStore.contextMenu.enabled = false
  removeObjectOutline(e.object)
  resetCursor()
  uiStore.setContextMenuItems([])
  isOpen.value = false
  e.stopPropagation()
}

watch(() => uiStore.contextMenu.isOpen, (value) => {
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

// Add watch for remote state updates only in multiplayer mode
watch(data, (newData) => {
  if (!newData) { return }

  const data = JSON.parse(newData)
  if (data.type === 'ITEM_STATE_UPDATE'
    && data.itemId === props.id
    && data.itemType === 'chest') {
    // Update local chest state
    isOpen.value = data.state.isOpen
    isLocked.value = data.state.isLocked
    if (data.position) {
      gameStore.updateItemPosition(props.id, data.position)
    }
  }
})

// Initialize the item in the store with props position if provided
onMounted(() => {
  if (props.position && !item.value?.position) {
    gameStore.updateItemPosition(props.id, props.position)
  }
})
</script>

<template>
  <TresGroup
    ref="chestRef"
    :name="item.id"
    :position="chestPosition"
    @click="handleClick"
    @pointerenter="handlePointerEnter"
    @pointerleave="handlePointerLeave"
  >
    <Html
      center
      :distance-factor="4"
      :scale="[2, 2, 2]"
      :position="[0, 2, 0]"
    >
      <UBadge
        v-if="isHovering"
        label="Chest"
        size="lg"
        color="neutral"
      />
    </Html>
    <primitive :object="chestBase" />
    <primitive :object="chestLid" />
    <primitive ref="vueLogoRef" :object="vue" />
  </TresGroup>
</template>
