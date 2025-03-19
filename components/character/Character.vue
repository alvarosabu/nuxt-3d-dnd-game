<script setup lang="ts">
import type { AnimationAction, AnimationClip, AnimationMixer, Object3D } from 'three'
import { LoopOnce, LoopRepeat, SkinnedMesh, Vector3 } from 'three'
import { useMultiplayer } from '~/composables/game/useMultiplayer'
import type { Player } from '~/types'
import { Html } from '@tresjs/cientos'
import { useLobbyStore, useResourcePreloader } from '#imports'
import { SkeletonUtils } from 'three-stdlib'
import { dispose } from '@tresjs/core'
import { onKeyStroke } from '@vueuse/core'

const props = defineProps<{
  character: Character
  player: Player
  isCurrentPlayer: boolean
  index: number
}>()

const emit = defineEmits(['ready'])

const modelRef = ref<Object3D | null>(null)
const weaponRef = shallowRef<Object3D | null>(null)
const { getResource } = useResourcePreloader()
const lobbyStore = useLobbyStore()
const gameStore = useGameStore()
const isHovering = ref(false)

const MOVEMENT_SPEED = 0.032

// Inject websocket methods
const { send, data } = useMultiplayer(gameStore.isMultiplayer)

const JUMP_HEIGHT = 5
const GRAVITY = -9.81
const nextPosition = ref<Vector3>(new Vector3(props.index * 1.5, 0, 0))

/**
 * Character states as constants
 */
const CharacterStates = {
  IDLE: 'IDLE',
  WALKING: 'WALKING',
  JUMPING: 'JUMPING',
  ATTACKING: 'ATTACKING',
  CHEER: 'CHEER',
} as const

type CharacterState = typeof CharacterStates[keyof typeof CharacterStates]

interface CharacterStateProps {
  model: Object3D | null
  weapon: Object3D | null
  animations: AnimationClip[]
  actions: Record<string, AnimationAction>
  currentAction: AnimationAction | null
  mixer: AnimationMixer | null
  currentTime: number
  isMoving: boolean
  isGrounded: boolean
  verticalVelocity: number
  currentState: CharacterState
}

const state = shallowReactive<CharacterStateProps>({
  model: null,
  weapon: null,
  animations: [],
  actions: {},
  currentAction: null,
  mixer: null,
  currentTime: 0,
  isMoving: false,
  isGrounded: true,
  verticalVelocity: JUMP_HEIGHT,
  currentState: CharacterStates.IDLE,
})

const { scene, animations, materials } = getResource('models', props.player.character)

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

Object.entries(materials).forEach(([key, material]) => {
  if (!key.includes('metallic')) {
    material.roughness = 1
  }
})

const handSlotR = findBoneByName(state.model, 'handslotr')

watch(() => props.player.weapon, (weapon) => {
  if (weapon && weaponRef.value && handSlotR) {
    const { scene: weaponScene } = getResource('models', weapon)
    state.weapon = weaponScene
    weaponRef.value.position.set(0, 0, 0)
    weaponRef.value.rotation.set(0, 0, 0)
    handSlotR.add(weaponRef.value)
  }
})

if (props.player.weapon) {
  const { scene: weaponScene } = getResource('models', props.player.weapon)
  state.weapon = weaponScene
  watch(weaponRef, (newVal) => {
    if (handSlotR && newVal) {
      newVal.position.set(0, 0, 0)
      newVal.rotation.set(0, 0, 0)
      handSlotR.add(newVal)
    }
  })
}

if (gameStore.isMultiplayer) {
  watch(data, (newData) => {
    const data = JSON.parse(newData)
    if (data.type === 'PLAYER_UPDATE' && data.player.id === props.player.id) {
      // Handle position as array of components
      if (data.player.position) {
        nextPosition.value.set(
          data.player.position[0], // x
          data.player.position[1], // y
          data.player.position[2], // z
        )
      }
      // Handle state updates from other players
      if (data.player.currentState && !props.isCurrentPlayer) {
        transitionToState(data.player.currentState, false) // Don't re-sync received state
      }
    }
  })
}
else {
  const playerPosition = gameStore.players[0]?.position
  if (playerPosition) {
    state.model?.position.set(playerPosition[0], playerPosition[1], playerPosition[2])
    nextPosition.value.set(playerPosition[0], playerPosition[1], playerPosition[2])
  }

  watch(() => gameStore.players, (newPlayers) => {
    const player = newPlayers[0]
    if (player?.id === props.player.id) {
      nextPosition.value.set(player.position[0], player.position[1], player.position[2])
    }
  }, { deep: true })
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

/**
 * Handles state transitions and animation changes
 */
function transitionToState(newState: CharacterState, shouldSync = true) {
  if (state.currentState === newState) { return }

  // Handle exit
  if (state.currentAction) {
    state.currentAction.fadeOut(0.5)
  }

  // Update state
  state.currentState = newState

  // Sync state over network if this is the current player
  if (shouldSync && props.isCurrentPlayer && gameStore.isMultiplayer) {
    send(JSON.stringify({
      type: 'UPDATE_PLAYER_STATE',
      lobbyId: lobbyStore.currentLobby?.id,
      state: {
        currentState: newState,
      },
    }))
  }

  // Handle enter - directly use animations based on state
  let nextAnimation: AnimationAction | null = null

  switch (newState) {
    case CharacterStates.WALKING:
      nextAnimation = state.actions.Walking_A
      if (nextAnimation) {
        // Walking is looped
        nextAnimation.setLoop(LoopRepeat, Infinity)
      }
      break
    case CharacterStates.CHEER:
      nextAnimation = state.actions.Cheer
      if (nextAnimation) {
        // Cheer plays once
        nextAnimation.setLoop(LoopOnce, 1)
        nextAnimation.clampWhenFinished = true
      }
      break
    case CharacterStates.ATTACKING:
      nextAnimation = state.actions.Attack
      if (nextAnimation) {
        // Attack plays once
        nextAnimation.setLoop(LoopOnce, 1)
        nextAnimation.clampWhenFinished = true
      }
      break
    case CharacterStates.JUMPING:
    case CharacterStates.IDLE:
    default:
      nextAnimation = state.actions.Idle
      if (nextAnimation) {
        // Idle is looped
        nextAnimation.setLoop(LoopRepeat, Infinity)
      }
      break
  }

  if (nextAnimation) {
    state.currentAction = nextAnimation
    state.currentAction.reset()
    state.currentAction.fadeIn(0.5)
    state.currentAction.play()

    // For non-looped animations, return to idle when they finish
    if (nextAnimation.loop === LoopOnce) {
      nextAnimation.reset()
      nextAnimation.play()

      // Use the finished callback to return to idle
      nextAnimation.getMixer().addEventListener('finished', () => {
        if (state.currentState === newState) {
          transitionToState(CharacterStates.IDLE, false) // Don't sync auto-return to idle
        }
      })
    }
  }
}

/**
 * Updates the character state based on current conditions
 */
const updateCharacterState = () => {
  // Movement takes precedence over idle
  if (state.isMoving) {
    transitionToState(CharacterStates.WALKING)
    return
  }

  // If we're not moving and in a non-interruptible state, keep the current state
  switch (state.currentState) {
    case CharacterStates.JUMPING:
    case CharacterStates.ATTACKING:
    case CharacterStates.CHEER:
      return
    default:
      transitionToState(CharacterStates.IDLE)
  }
}

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

  if (state.currentState === CharacterStates.JUMPING && state.model) {
    // Update the vertical position based on the current vertical velocity
    const gravity = GRAVITY
    state.model.position.y += state.verticalVelocity * delta
    state.verticalVelocity += gravity * delta

    // Check if the character has landed
    if (state.model.position.y <= 0) {
      state.model.position.y = 0
      state.isGrounded = true
      state.verticalVelocity = JUMP_HEIGHT
      transitionToState(CharacterStates.IDLE)
    }
    sendPosition(state.model.position)
  }

  if (state.mixer) {
    updateCurrentTime() // Update the time each frame
  }

  // Update character state
  updateCharacterState()
})

/**
 * Character action handlers
 */
const handleCheer = () => {
  if (!props.isCurrentPlayer) { return }
  transitionToState(CharacterStates.CHEER)
}

const handleAttack = () => {
  if (!props.isCurrentPlayer) { return }
  transitionToState(CharacterStates.ATTACKING)
}

const handleJump = () => {
  if (!props.isCurrentPlayer || !state.isGrounded) { return }
  state.isGrounded = false
  transitionToState(CharacterStates.JUMPING)
}

// Keyboard shortcuts
onKeyStroke('c', () => handleCheer())
onKeyStroke('x', () => handleAttack())
onKeyStroke('space', () => handleJump())

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
</script>

<template>
  <TresGroup>
    <primitive
      ref="modelRef"
      :name="player.name"
      :object="state.model"
    >
      <Html
        center
        :distance-factor="8"
        :position="[0, 3, 0]"
      >
        <div class="flex flex-col items-center gap-1">
          <UBadge
            :label="player.name"
            size="xl"
            color="neutral"
            :variant="isHovering ? 'solid' : 'soft'"
          />
        </div>
      </Html>
    </primitive>
    <primitive
      v-if="state.weapon"
      ref="weaponRef"
      :name="player.weapon"
      :object="state.weapon"
    />
  </TresGroup>
</template>
