<script setup lang="ts">
import type { ThreeEvent } from '@tresjs/core'
import { Vector3 } from 'three'
import { useMultiplayer } from '~/composables/game/useMultiplayer'

const gameStore = useGameStore()
const { currentLevel } = storeToRefs(gameStore)
const lobbyStore = useLobbyStore()


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

const showIndicator = ref(false)
const hoverIndicatorRef = shallowRef()
const { sendMsg } = useMultiplayer(gameStore.isMultiplayer)

const handleFloorClick = (e: ThreeEvent<PointerEvent>) => {
  const newPosition = new Vector3(e.point.x, 0, e.point.z)
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
    hoverIndicatorRef.value.position.set(e.point.x, 0.2, e.point.z)
  }
}

const handleFloorLeave = () => {
  showIndicator.value = false
}
</script>

<template>
  <TresMesh
    v-if="currentLevel"
    name="floor"
    :rotation-x="-Math.PI / 2"
    @click="handleFloorClick"
    @pointer-move="handleFloorHover"
    @pointer-leave="handleFloorLeave"
  >
    <TresPlaneGeometry :args="[currentLevel.grid.size[0], currentLevel.grid.size[1]]" />
    <TresMeshBasicMaterial :opacity="0" transparent :color="'#C2D05C'" />
  </TresMesh>


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
</template>