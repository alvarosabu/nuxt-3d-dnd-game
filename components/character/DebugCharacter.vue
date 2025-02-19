<script setup lang="ts">
import { onKeyDown, onKeyUp } from '@vueuse/core'

import type { Object3D } from 'three'
import { Quaternion, Vector3 } from 'three'
import { useMultiplayer } from '~/composables/game/useMultiplayer'
import type { Player } from '~/types'
import { Html } from '@tresjs/cientos'

const props = defineProps<{
  player: Player
  isCurrentPlayer: boolean
  index: number
}>()

const { getResource } = useResourcePreloader()

const lobbyStore = useLobbyStore()

// Inject websocket methods
const { send, data } = useMultiplayer()

const model = shallowRef<Object3D>()

const JUMP_HEIGHT = 5
const GRAVITY = -9.81

const state = shallowReactive({
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
  if (data.type === 'PLAYER_UPDATE' && data.player.id === props.player.id && model.value) {
    // Handle position as array of components
    if (data.player.position) {
      model.value.position.set(
        data.player.position[0], // x
        data.player.position[1], // y
        data.player.position[2], // z
      )
    }
    // Handle rotation as array of components
    if (data.player.rotation) {
      model.value.quaternion.set(
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

watch(model, (newModel) => {
  if (!newModel) { return }
  newModel.position.set(props.index * 1.5, 0, 0)
  sendPosition(newModel.position)
})

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

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  if (!model.value) { return }

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
    const _R = model.value.quaternion.clone()

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
    if (Number.isFinite(_R.w) && Number.isFinite(_R.x)
      && Number.isFinite(_R.y) && Number.isFinite(_R.z)) {
      model.value.quaternion.copy(_R.normalize())
    }

    const forward = new Vector3(0, 0, 1)
    forward.applyQuaternion(model.value.quaternion)
    forward.normalize()

    const sideways = new Vector3(1, 0, 0)
    sideways.applyQuaternion(model.value.quaternion)
    sideways.normalize()

    forward.multiplyScalar(speed.z * delta)
    sideways.multiplyScalar(speed.x * delta)

    model.value.position.add(forward)
    model.value.position.add(sideways)

    sendPosition(model.value.position)
    sendRotation(model.value.quaternion)
  }

  if (state.isJumping && model.value) {
    // Update the vertical position based on the current vertical velocity
    const gravity = GRAVITY
    model.value.position.y += state.verticalVelocity * delta
    state.verticalVelocity += gravity * delta

    // Check if the character has landed
    if (model.value.position.y <= 0) {
      model.value.position.y = 0
      state.isJumping = false
      state.isGrounded = true
      state.verticalVelocity = JUMP_HEIGHT
      sendStateUpdate() // Send state update when landing
    }
    sendPosition(model.value.position)
  }
})
</script>

<template>
  <TresMesh ref="model">
    <TresBoxGeometry v-if="player.name === 'meteora_2590'" :args="[1, 1, 1]" />
    <TresSphereGeometry v-else :args="[0.5, 16, 16]" />
    <TresMeshStandardMaterial />
    <Html
      center
      transform
      :distance-factor="4"
      :position="[0, 1.5, 0]"
    >
      <div class="p-4 rounded-xl bg-white text-black">
        {{ player.name }} {{ index }} {{ player.character }}
      </div>
    </Html>
  </TresMesh>
</template>
