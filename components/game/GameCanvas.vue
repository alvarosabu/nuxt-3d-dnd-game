<script setup lang="ts">
import { useMultiplayer } from '~/composables/game/useMultiplayer'
import type { ThreeEvent } from '@tresjs/core'
import { ref, shallowRef } from 'vue'
import type { Object3D } from 'three'
import { useOutlinedObjects } from '~/composables/useOutlinedObjects'
import { BlendFunction, KernelSize } from 'postprocessing'
import Chest from '~/components/items/Chest.vue'

const userStore = useUserStore()
const lobbyStore = useLobbyStore()
const gameStore = useGameStore()
const { currentLobbyPlayers } = storeToRefs(lobbyStore)

// Initialize outline objects composable
const { outlinedObjects } = useOutlinedObjects()

// Compute characters based on game mode
const characters = computed(() => {
  if (gameStore.isMultiplayer) {
    return currentLobbyPlayers.value
  }
  return gameStore.players
})

const { sendMsg } = useMultiplayer(gameStore.isMultiplayer)
const orbitControlsRef = ref()
const showIndicator = ref(false)
const hoverIndicatorRef = shallowRef()

useControls('fpsgraph')

const { edgeStrength, pulseSpeed, visibleEdgeColor, blur } = useControls({
  edgeStrength: 2000,
  pulseSpeed: {
    value: 0,
    min: 0,
    max: 2,
    step: 0.01,
  },
  visibleEdgeColor: '#FFFF00',
  blur: false,
  kernelSize: {
    value: 3,
    min: KernelSize.VERY_SMALL,
    max: KernelSize.VERY_LARGE,
    step: 1,
  },
})

// Custom shader for gradient cylinder
const cylinderShader = {
  uniforms: {
    color: { value: { r: 1.0, g: 1.0, b: 1.0 } },
  },
  vertexShader: `
    varying float vY;
    void main() {
      vY = position.y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    varying float vY;
    void main() {
      float alpha = 1.0 - (vY + 0.5); // Gradient from bottom to top
      gl_FragColor = vec4(color, alpha * 0.5); // Semi-transparent
    }
  `,
}

const handleFloorClick = (e: ThreeEvent<PointerEvent>) => {
  const newPosition = { x: e.point.x, y: 0, z: e.point.z }
  if (gameStore.isMultiplayer) {
    sendMsg({
      type: 'UPDATE_PLAYER_POSITION',
      lobbyId: lobbyStore.currentLobbyId,
      position: [newPosition.x, newPosition.y, newPosition.z],
    })
  }
  else {
    gameStore.setPlayerPosition(gameStore.players[0], newPosition)
  }
}

const handleFloorHover = (e: ThreeEvent<PointerEvent>) => {
  showIndicator.value = true
  if (hoverIndicatorRef.value) {
    hoverIndicatorRef.value.position.set(e.point.x, 0, e.point.z)
  }
}

const handleFloorLeave = () => {
  showIndicator.value = false
}

const outlineRef = ref()

watch(outlineRef, ({ effect }) => {
  effect.blurPass.kernelSize = 4
})

const { cursor } = useGameCursor()

// Temporary
/* gameStore.openDiceRollModal({
  title: 'Dexterity Check',
  subtitle: 'Sleight of Hand',
  difficultyClass: 10,
  diceType: 20,
}) */
</script>

<template>
  <TresCanvas
    clear-color="#2f2f2f"
    window-size
    class="cursor-game"
    :class="[`custom-cursor-${cursor}`]"
  >
    <Suspense>
      <Environment preset="sunset" :blur="1" background />
    </Suspense>
    <TresPerspectiveCamera
      :position="[20, 20, 20]"
      :look-at="[0, 0, 0]"
      :fov="45"
      :near="0.1"
      :far="1000"
    />

    <OrbitControls ref="orbitControlsRef" make-default />

    <!-- Environment -->
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[10, 10, 10]" :intensity="1" />

    <TresGridHelper :args="[100, 100]" :position-y="0.001" />

    <Suspense>
      <template v-for="(player, index) in characters" :key="player.id">
        <Character
          :character="player.character"
          :player="player"
          :is-current-player="player.id === userStore.userId"
          :index="index"
        />
      </template>
    </Suspense>
    <!-- Hover Indicator -->
    <TresMesh
      v-if="showIndicator"
      ref="hoverIndicatorRef"
    >
      <TresCylinderGeometry :args="[0.5, 0.5, 1, 32]" />
      <TresShaderMaterial
        transparent
        :vertex-shader="cylinderShader.vertexShader"
        :fragment-shader="cylinderShader.fragmentShader"
        :uniforms="cylinderShader.uniforms"
      />
    </TresMesh>

    <Suspense>
      <Chest />
    </Suspense>

    <!-- Floor -->
    <TresMesh
      :rotation-x="-Math.PI / 2"
      class="cursor-pointer"
      @click="handleFloorClick"
      @pointer-move="handleFloorHover"
      @pointer-leave="handleFloorLeave"
    >
      <TresPlaneGeometry :args="[100, 100]" />
      <TresMeshBasicMaterial color="#4f4f4f" />
    </TresMesh>

    <!-- Postprocessing -->
    <EffectComposerPmndrs>
      <OutlinePmndrs
        ref="outlineRef"
        :outlined-objects="outlinedObjects"
        :blur="blur"
        :edge-strength="edgeStrength"
        :pulse-speed="pulseSpeed"
        :visible-edge-color="visibleEdgeColor"
        :kernel-size="4"
      />
    </EffectComposerPmndrs>
  </TresCanvas>
</template>

<style>
@import '~/assets/css/cursors.css';
</style>
