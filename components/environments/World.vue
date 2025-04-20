<script setup lang="ts">
import type { ThreeEvent, TresEvent } from '@tresjs/core'
import type { Group } from 'three'
import { MeshBasicMaterial } from 'three'
import { useMultiplayer } from '~/composables/game/useMultiplayer'
const { getResource } = useResourcePreloader()
const gameStore = useGameStore()

const { scene: modelDungeon } = getResource('models', 'dungeon')
const { scene: modelLights } = getResource('models', 'lights')
const { scene: modelChests } = getResource('models', 'chests')
const { scene: modelDoors } = getResource('models', 'doors')
const { scene: modelSpikes } = getResource('models', 'spikes')
const { scene: modelVisualBlocker, nodes: modelVisualBlockerNodes } = getResource('models', 'visual_blocker')
const lobbyStore = useLobbyStore()

const floor = modelVisualBlockerNodes['room1001'].clone()

floor.material = new MeshBasicMaterial({
  transparent: true,
  opacity: 0,
})
const modelDungeonRef = ref()
const modelLightsRef = ref()
const modelChestsRef = ref()
const modelDoorsRef = ref()
const modelSpikesRef = ref()
const modelVisualBlockerRef = shallowRef()

// Hide the visual blocker for the starting room for now - just for demonstration purposes
const { stop } = watch(modelVisualBlockerRef, (newValue: Group | undefined) => {
  if (!newValue) {
    return
  }
  newValue.position.set(0, -0.2, 0)
  const rooms = newValue.children.filter(child => child.name.startsWith('room1'))
  rooms.forEach((room) => {
    room.visible = false
  })
  stop()
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

const showIndicator = ref(false)
const hoverIndicatorRef = shallowRef()

const { sendMsg } = useMultiplayer(gameStore.isMultiplayer)

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
    hoverIndicatorRef.value.position.set(e.point.x, 0.2, e.point.z)
  }
}

const handleFloorLeave = () => {
  showIndicator.value = false
}

</script>

<template>
  
  <primitive
    v-if="modelDungeon"
    ref="modelDungeonRef"
    :name="modelDungeon"
    :object="modelDungeon"
  />
  <primitive
    v-if="modelLights"
    ref="modelLightsRef"
    :name="modelLights"
    :object="modelLights"
  />
  <primitive
    v-if="modelChests"
    ref="modelChestsRef"
    :name="modelChests"
    :object="modelChests"
  />
  <primitive
    v-if="modelDoors"
    ref="modelDoorsRef"
    :name="modelDoors"
    :object="modelDoors"
  />
  <primitive
    v-if="modelSpikes"
    ref="modelSpikesRef"
    :name="modelSpikes"
    :object="modelSpikes"
  />
  <primitive
    v-if="modelVisualBlocker"
    ref="modelVisualBlockerRef"
    name="modelVisualBlocker"
    :object="modelVisualBlocker"
  />
  <primitive
    v-if="floor"
    ref="floor_ref"
    :name="floor"
    :object="floor"
    :position-y="0.1"
    @click="handleFloorClick"
    @pointer-move="handleFloorHover"
    @pointer-leave="handleFloorLeave"
  />
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
