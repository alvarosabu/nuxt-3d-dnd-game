<script setup lang="ts">
import { onKeyDown, onKeyUp } from '@vueuse/core'
import { type AnimationAction, type AnimationClip, type AnimationMixer, type AnimationObjectGroup, type Group, type Object3D, Quaternion, type StaticReadUsage, Vector3 } from 'three'

const { getResource } = useResourcePreloader()

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

const { scene, nodes, animations, materials } = getResource('models', 'paladin-storyblok')

const { scene: weapon } = getResource('models', 'hammer')

state.model = nodes.Rig

const handSlotR = findBoneByName(state.model, 'handslotr')

const weaponRef = shallowRef<Object3D>()

watch(weaponRef, (newVal) => {
  if (handSlotR && newVal) {
    newVal.position.set(0, 0, 0)
    newVal.rotation.set(0, 0, 0)
    handSlotR.add(newVal)
  }
})

const { actions: animActions } = useAnimations(animations, state.model)
state.actions = animActions
state.currentAction = animActions.Idle
state.currentAction.play()

// Movement

const { shift } = useMagicKeys()

onKeyDown(['w', 'W', 'ArrowUp'], (e) => {
  e.preventDefault()
  state.isMoving = true
  if (shift.value) {
    state.isRunning = true
  }
  state.direction = 'UP'
})

onKeyUp(['w', 'W', 'ArrowUp'], () => {
  state.isMoving = false
  state.isRunning = false
})

onKeyDown(['s', 'S', 'ArrowDown'], (e) => {
  e.preventDefault()
  state.isMoving = true
  if (shift.value) {
    state.isRunning = true
  }
  state.direction = 'DOWN'
})

onKeyUp(['s', 'S', 'ArrowDown'], () => {
  state.isMoving = false
  state.isRunning = false
})

onKeyDown(['a', 'A', 'ArrowLeft'], (e) => {
  e.preventDefault()
  state.isMoving = true
  state.direction = 'LEFT'
})

onKeyUp(['a', 'A', 'ArrowLeft'], () => {
  state.isMoving = false
})

onKeyDown(['d', 'D', 'ArrowRight'], (e) => {
  e.preventDefault()
  state.isMoving = true
  state.direction = 'RIGHT'
})

onKeyUp(['d', 'D', 'ArrowRight'], () => {
  state.isMoving = false
})

onKeyDown([' '], (e) => {
  e.preventDefault()
  if (state.isGrounded) {
    state.isJumping = true
    state.isGrounded = false // Character is now in the air
  }
})

const updateCurrentTime = () => {
  if (state.mixer && state.currentAction) {
    state.currentTime = state.currentAction.time // Get current time of the animation
  }
}

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
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
    const _R = state.model?.quaternion.clone()

    const acceleration = state.acceleration.clone()

    const currentSpeedMagnitude = speed.length()
    // Get the current speed magnitude

    // Set a base speed (the speed at which the animation timing was originally intended)
    const baseSpeed = 2.0 // This value might need tuning based on your original animation settings
    switch (state.direction) {
      case 'UP':
        speed.z = Math.min(speed.z + acceleration.z * delta, 10) + (state.isRunning ? 0.15 : 0)

        // Scale the animation speed based on the character's movement speed
        if (state.currentAction) {
          state.currentAction.timeScale = currentSpeedMagnitude / baseSpeed
        }

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

    state.model?.quaternion.copy(_R)

    const oldPosition = new Vector3()
    oldPosition.copy(state.model?.position)

    const forward = new Vector3(0, 0, 1)
    forward.applyQuaternion(state.model?.quaternion as Quaternion)
    forward.normalize()

    const sideways = new Vector3(1, 0, 0)
    sideways.applyQuaternion(state.model?.quaternion as Quaternion)
    sideways.normalize()

    forward.multiplyScalar(speed.z * delta)
    sideways.multiplyScalar(speed.x * delta)

    state.model?.position.add(forward)
    state.model?.position.add(sideways)

    oldPosition.copy(state.model?.position)
  }
  if (state.isJumping) {
    // Update the vertical position based on the current vertical velocity
    const gravity = GRAVITY // Gravity force, adjust as needed
    state.model.position.y += state.verticalVelocity * delta
    state.verticalVelocity += gravity * delta // Apply gravity to vertical velocity

    // Check if the character has landed
    if (state.model.position.y <= 0) {
      state.model.position.y = 0 // Reset position to ground level
      state.isJumping = false
      state.isGrounded = true
      state.verticalVelocity = JUMP_HEIGHT // Reset vertical velocity
    }
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
  <primitive name="model" :object="state.model" />
  <primitive ref="weaponRef" name="weapon" :object="weapon" />
  <TresSkeletonHelper :args="[state.model]" />
</template>
