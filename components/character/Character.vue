<script setup lang="ts">
import { onKeyDown, onKeyUp } from '@vueuse/core'
import { type AnimationAction, type AnimationClip, type AnimationMixer, type Object3D, Quaternion, type SkinnedMesh, Vector3 } from 'three'
import { useMultiplayer } from '~/composables/game/useMultiplayer'
import type { Player } from '~/types'
import { Html } from '@tresjs/cientos'
import { useLobbyStore, useResourcePreloader } from '#imports'
import { computed } from 'vue'

const props = defineProps<{
  player: Player
  isCurrentPlayer: boolean
  index: number
}>()

const { getResource } = useResourcePreloader()
const lobbyStore = useLobbyStore()

// Inject websocket methods
const { send, data } = useMultiplayer()

const JUMP_HEIGHT = 5
const GRAVITY = -9.81

interface CharacterState {
  model: Object3D | null
  weapon: Object3D | null
  animations: AnimationClip[]
  actions: Record<string, AnimationAction>
  currentAction: AnimationAction | null
  mixer: AnimationMixer | null
  currentTime: number
  // Movement
  currentPressedKeys: Record<string, boolean>
  isMoving: boolean
  isRunning: boolean
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  acceleration: Vector3
  decceleration: Vector3
  velocity: Vector3
  isJumping: boolean
  verticalVelocity: number
  isGrounded: boolean
}

const state = shallowReactive<CharacterState>({
  model: null,
  weapon: null,
  animations: [],
  actions: {},
  currentAction: null,
  mixer: null,
  currentTime: 0,
  // Movement
  currentPressedKeys: {},
  isMoving: false,
  isRunning: false,
  direction: 'UP',
  acceleration: new Vector3(0.25, 0.25, 25.0),
  decceleration: new Vector3(-0.0005, -0.0001, -5.0),
  velocity: new Vector3(0, 0, 0),
  isJumping: false,
  verticalVelocity: JUMP_HEIGHT,
  isGrounded: true,
})

// Load character model and weapon
const characterResource = computed(() => {
  if (!props.player.character) { return null }
  return getResource('models', props.player.character) as unknown as {
    scene: Object3D
    nodes: Record<string, Object3D>
    animations: AnimationClip[]
    materials: Record<string, any>
  }
})

// Initialize model from character resource
if (characterResource.value) {
  const rigNode = Object.values(characterResource.value.nodes).find(node => node.name.includes('Rig'))
  if (rigNode) {
    state.model = rigNode as SkinnedMesh
    state.model.position.set(props.index * 1.5, 0, 0)
    state.animations = characterResource.value.animations
  }
}

// Function to send state updates
const sendStateUpdate = () => {
  if (!props.isCurrentPlayer) { return }

  send(JSON.stringify({
    type: 'UPDATE_PLAYER_STATE',
    lobbyId: lobbyStore.currentLobby?.id,
    state: {
      isMoving: state.isMoving,
      direction: state.direction,
      isRunning: state.isRunning,
      isJumping: state.isJumping,
      isGrounded: state.isGrounded,
    },
  }))
}

watch(data, (newData) => {
  if (!newData || props.isCurrentPlayer) { return }

  const data = JSON.parse(newData)
  if (data.type === 'PLAYER_UPDATE' && data.player.id === props.player.id && state.model) {
    // Handle position as array of components
    if (data.player.position) {
      state.model.position.set(
        data.player.position[0], // x
        data.player.position[1], // y
        data.player.position[2], // z
      )
    }
    // Handle rotation as array of components
    if (data.player.rotation) {
      state.model.quaternion.set(
        data.player.rotation[0], // x
        data.player.rotation[1], // y
        data.player.rotation[2], // z
        data.player.rotation[3], // w
      )
    }
    // Update character state
    if (typeof data.player.isMoving === 'boolean') { state.isMoving = data.player.isMoving }
    if (data.player.direction) { state.direction = data.player.direction }
    if (typeof data.player.isRunning === 'boolean') { state.isRunning = data.player.isRunning }
    if (typeof data.player.isJumping === 'boolean') { state.isJumping = data.player.isJumping }
    if (typeof data.player.isGrounded === 'boolean') { state.isGrounded = data.player.isGrounded }
  }
})

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

const sendRotation = (rotation: Quaternion) => {
  if (!props.isCurrentPlayer) { return }

  // Send rotation as array of components [x, y, z, w]
  send(JSON.stringify({
    type: 'UPDATE_PLAYER_ROTATION',
    lobbyId: lobbyStore.currentLobby?.id,
    rotation: [rotation.x, rotation.y, rotation.z, rotation.w],
  }))
}

const { actions: animActions } = useAnimations(state.animations, state.model)
state.actions = animActions
state.currentAction = animActions.Idle
state.currentAction.play()

// Movement

const { shift } = useMagicKeys()

onKeyDown(['w', 'W', 'ArrowUp'], (e) => {
  e.preventDefault()
  if (!props.isCurrentPlayer) { return }

  state.isMoving = true
  if (shift.value) {
    state.isRunning = true
  }
  state.direction = 'UP'
  sendStateUpdate()
})

onKeyUp(['w', 'W', 'ArrowUp'], () => {
  if (!props.isCurrentPlayer) { return }

  state.isMoving = false
  state.isRunning = false
  sendStateUpdate()
})

onKeyDown(['s', 'S', 'ArrowDown'], (e) => {
  e.preventDefault()
  if (!props.isCurrentPlayer) { return }

  state.isMoving = true
  if (shift.value) {
    state.isRunning = true
  }
  state.direction = 'DOWN'
  sendStateUpdate()
})

onKeyUp(['s', 'S', 'ArrowDown'], () => {
  if (!props.isCurrentPlayer) { return }

  state.isMoving = false
  state.isRunning = false
  sendStateUpdate()
})

onKeyDown(['a', 'A', 'ArrowLeft'], (e) => {
  e.preventDefault()
  if (!props.isCurrentPlayer) { return }

  state.isMoving = true
  state.direction = 'LEFT'
  sendStateUpdate()
})

onKeyUp(['a', 'A', 'ArrowLeft'], (e) => {
  e.preventDefault()
  if (!props.isCurrentPlayer) { return }

  state.isMoving = false
  sendStateUpdate()
})

onKeyDown(['d', 'D', 'ArrowRight'], (e) => {
  e.preventDefault()
  if (!props.isCurrentPlayer) { return }

  state.isMoving = true
  state.direction = 'RIGHT'
  sendStateUpdate()
})

onKeyUp(['d', 'D', 'ArrowRight'], (e) => {
  e.preventDefault()
  if (!props.isCurrentPlayer) { return }

  state.isMoving = false
  sendStateUpdate()
})

onKeyDown([' '], (e) => {
  e.preventDefault()
  if (!props.isCurrentPlayer) { return }
  if (state.isGrounded) {
    state.isJumping = true
    state.isGrounded = false
    sendStateUpdate()
  }
})

const updateCurrentTime = () => {
  if (state.mixer && state.currentAction) {
    state.currentTime = state.currentAction.time // Get current time of the animation
  }
}

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  if (!state.model) { return }

  if (state.isMoving) {
    const speed = state.velocity
    const frameDecceleration = new Vector3(
      speed.x * state.decceleration.x,
      speed.y * state.decceleration.y,
      speed.z * state.decceleration.z,
    )
    frameDecceleration.multiplyScalar(delta)
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(Math.abs(frameDecceleration.z), Math.abs(speed.z))
    speed.add(frameDecceleration)

    const _Q = new Quaternion()
    const _A = new Vector3()
    const _R = state.model.quaternion.clone()

    const acceleration = state.acceleration.clone()

    switch (state.direction) {
      case 'UP':
        speed.z = Math.min(speed.z + acceleration.z * delta, 10) + (state.isRunning ? 0.15 : 0)
        break
      case 'DOWN':
        speed.z = Math.max(speed.z - acceleration.z * delta / 2, -10)
        break
      case 'LEFT':
        _A.set(0, 1, 0)
        _Q.setFromAxisAngle(_A, 4.0 * Math.PI * delta * acceleration.y)
        _R.multiply(_Q)
        break
      case 'RIGHT':
        _A.set(0, 1, 0)
        _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * delta * acceleration.y)
        _R.multiply(_Q)
        break
    }

    // Ensure quaternion is valid before applying
    if (_R && Number.isFinite(_R.w) && Number.isFinite(_R.x)
      && Number.isFinite(_R.y) && Number.isFinite(_R.z)) {
      state.model.quaternion.copy(_R.normalize())
    }

    const forward = new Vector3(0, 0, 1)
    forward.applyQuaternion(state.model.quaternion)
    forward.normalize()

    const sideways = new Vector3(1, 0, 0)
    sideways.applyQuaternion(state.model.quaternion)
    sideways.normalize()

    forward.multiplyScalar(speed.z * delta)
    sideways.multiplyScalar(speed.x * delta)

    state.model.position.add(forward)
    state.model.position.add(sideways)

    sendPosition(state.model.position)
    sendRotation(state.model.quaternion)
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
      sendStateUpdate() // Send state update when landing
    }
    sendPosition(state.model.position)
  }

  if (state.mixer) {
    updateCurrentTime() // Update the time each frame
  }
})

watch(() => state.isMoving, (value) => {
  if (value && state.isGrounded) {
    state.currentAction?.fadeOut(0.5)
    if (state.direction === 'DOWN') {
      state.currentAction = state.actions.Walking_Backwards
    }
    else {
      if (state.isRunning) {
        state.currentAction = state.actions.Running_A
      }
      else {
        state.currentAction = state.actions.Walking_A
      }
    }
  }
  else {
    state.currentAction?.fadeOut(0.5)
    state.currentAction = state.actions.Idle
  }
  state.currentAction.reset()
  state.currentAction.fadeIn(0.5)
  state.currentAction.play()
})
</script>

<template>
  <TresGroup>
    <primitive name="modelRef" :object="state.model">
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
    <!--  <primitive ref="weaponRef" name="weapon" :object="weapon" /> -->
    <TresSkeletonHelper :args="[state.model]" />
  </TresGroup>
</template>
