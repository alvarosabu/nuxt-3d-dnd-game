<script setup lang="ts">
import type { AnimationAction, AnimationClip, AnimationMixer, Object3D, Quaternion } from 'three'
import { SkinnedMesh, Vector3 } from 'three'
import { useMultiplayer } from '~/composables/game/useMultiplayer'
import type { Player } from '~/types'
import { Html } from '@tresjs/cientos'
import { useLobbyStore, useResourcePreloader } from '#imports'
import { SkeletonUtils } from 'three-stdlib'
import { dispose, type ThreeEvent } from '@tresjs/core'

const props = defineProps<{
  character: Character
  player: Player
  isCurrentPlayer: boolean
  index: number
}>()

const emit = defineEmits(['ready'])

const modelRef = ref<Object3D | null>(null)

const { getResource } = useResourcePreloader()
const lobbyStore = useLobbyStore()
const gameStore = useGameStore()
const { isMultiplayer } = storeToRefs(gameStore)

const MOVEMENT_SPEED = 0.032

// Inject websocket methods
const { send, data } = useMultiplayer()

const JUMP_HEIGHT = 5
const GRAVITY = -9.81
const nextPosition = ref<Vector3>(new Vector3(props.index * 1.5, 0, 0))

interface CharacterState {
  model: Object3D | null
  weapon: Object3D | null
  animations: AnimationClip[]
  actions: Record<string, AnimationAction>
  currentAction: AnimationAction | null
  mixer: AnimationMixer | null
  currentTime: number
  isMoving: boolean
  isJumping: boolean
  isGrounded: boolean
  verticalVelocity: number
}

const state = shallowReactive<CharacterState>({
  model: null,
  weapon: null,
  animations: [],
  actions: {},
  currentAction: null,
  mixer: null,
  currentTime: 0,
  isMoving: false,
  isJumping: false,
  isGrounded: true,
  verticalVelocity: JUMP_HEIGHT,
})

const { scene, animations } = getResource('models', props.player.character)

const clonedScene = SkeletonUtils.clone(scene)
const { nodes } = useGraph(clonedScene)

const rigNode = Object.values(nodes).find(node => node.name.includes('Rig'))
if (rigNode) {
  // Create a proper clone of the rigged mesh
  const clonedRig = rigNode // Deep clone

  // Ensure the skeleton is properly cloned and bound
  if (clonedRig instanceof SkinnedMesh) {
    clonedRig.skeleton = (rigNode as SkinnedMesh).skeleton.clone()
    clonedRig.bind(clonedRig.skeleton)
  }

  state.model = clonedRig
  emit('ready', state.model)
  state.model.position.set(props.index * 1.5, 0, 0)
  state.animations = animations
}

if (isMultiplayer.value) {
  watch(data, (newData) => {
    const data = JSON.parse(newData)
    if (data.type === 'PLAYER_UPDATE') {
    // Handle position as array of components
      if (data.player.position && data.player.id === props.player.id) {
        nextPosition.value.set(
          data.player.position[0], // x
          data.player.position[1], // y
          data.player.position[2], // z
        )
      }
    }
  })
}
else {
  watch(gameStore.state.players, (newPlayers) => {
    if (newPlayers[0].id === props.player.id) {
      nextPosition.value.set(newPlayers[0].position[0], newPlayers[0].position[1], newPlayers[0].position[2])
    }
  })
}

// Throttle position updates to reduce websocket messages
const sendPosition = (position: Vector3) => {
  if (!props.isCurrentPlayer) { return }

  // Send position as array of components [x, y, z]
  send(JSON.stringify({
    type: 'UPDATE_PLAYER_POSITION',
    lobbyId: lobbyStore.currentLobby?.id,
    position: [position.x, position.y, position.z],
  }))
}

const { actions: animActions } = useAnimations(state.animations, state.model)
state.actions = animActions
state.currentAction = animActions.Idle
state.currentAction.play()

const updateCurrentTime = () => {
  if (state.mixer && state.currentAction) {
    state.currentTime = state.currentAction.time // Get current time of the animation
  }
}

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  if (!state.model) { return }

  if (state.model.position.distanceTo(nextPosition.value) > 0.1) {
    const direction = state.model.position
      .clone()
      .sub(nextPosition.value)
      .normalize()
      .multiplyScalar(MOVEMENT_SPEED)

    state.model.position.sub(direction)
    state.model.lookAt(nextPosition.value)
    state.isMoving = true
  }
  else {
    state.isMoving = false
  }

  if (state.isJumping && state.model) {
    // Update the vertical position based on the current vertical velocity
    const gravity = GRAVITY
    state.model.position.y += state.verticalVelocity * delta
    state.verticalVelocity += gravity * delta

    // Check if the character has landed
    if (state.model.position.y <= 0) {
      state.model.position.y = 0
      state.isJumping = false
      state.isGrounded = true
      state.verticalVelocity = JUMP_HEIGHT
    }
    sendPosition(state.model.position)
  }

  if (state.mixer) {
    updateCurrentTime() // Update the time each frame
  }
})

watch(() => state.isMoving, (value) => {
  if (value) {
    state.currentAction?.fadeOut(0.5)
    state.currentAction = state.actions.Walking_A
  }
  else {
    state.currentAction?.fadeOut(0.5)
    state.currentAction = state.actions.Idle
  }
  state.currentAction.reset()
  state.currentAction.fadeIn(0.5)
  state.currentAction.play()
})

onBeforeUnmount(() => {
  state.currentAction?.stop()
  state.currentAction = null
  state.mixer?.stop()
  state.mixer = null
  dispose(state.model)
  state.model = null
  state.animations = []
  state.actions = {}
  state.currentAction = null
})

const handlePointerEnter = (event: ThreeEvent<PointerEvent>) => {
/*   console.log('pointer enter', event.object)
  gameStore.outlineCharacter(event.object)
  event.stopPropagation() */
}

const handlePointerLeave = (event: ThreeEvent<PointerEvent>) => {
  /* console.log('pointer leave', event.object)
  gameStore.removeCharacterOutline(event.object)
  event.stopPropagation() */
}
</script>

<template>
  <TresGroup>
    <primitive
      ref="modelRef"
      :name="player.name"
      :object="state.model"
      @pointerenter="handlePointerEnter"
      @pointerleave="handlePointerLeave"
    >
      <Html
        center
        :distance-factor="4"
        :scale="2"
        :position="[0, 3, 0]"
      >
        <div class="p-1 rounded-xl bg-white text-black text-lg">
          {{ player.name }}
        </div>
      </Html>
    </primitive>
  </TresGroup>
</template>
