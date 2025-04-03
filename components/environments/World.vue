<script setup lang="ts">
import type { Group } from 'three'
import { MeshBasicMaterial } from 'three'
const { getResource } = useResourcePreloader()
const gameStore = useGameStore()

const { scene: model_dungeon } = getResource('models', 'dungeon')
const { scene: model_lights } = getResource('models', 'lights')
const { scene: model_chests } = getResource('models', 'chests')
const { scene: model_doors } = getResource('models', 'doors')
const { scene: model_spikes } = getResource('models', 'spikes')
const { scene: model_visual_blocker, nodes: model_visual_blocker_nodes } = getResource('models', 'visual_blocker')

const floor = model_visual_blocker_nodes['room1001'].clone()

floor.material = new MeshBasicMaterial({
  transparent: true,
  opacity: 0,
})
const model_dungeon_ref = ref()
const model_lights_ref = ref()
const model_chests_ref = ref()
const model_doors_ref = ref()
const model_spikes_ref = ref()
const model_visual_blocker_ref = shallowRef()

// Hide the visual blocker for the starting room for now - just for demonstration purposes
const { stop } = watch(model_visual_blocker_ref, (newValue: Group | undefined) => {
  if (!newValue) {
    return
  }
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


const handleFloorClick = (e: ThreeEvent<PointerEvent>) => {
  const newPosition = { x: e.point.x, y: 0, z: e.point.z }
  gameStore.setPlayerPosition(gameStore.players[0], newPosition)

}

const handleFloorHover = (e: ThreeEvent<PointerEvent>) => {
  showIndicator.value = true
  console.log('hoverIndicatorRef', hoverIndicatorRef.value)
  if (hoverIndicatorRef.value) {
    hoverIndicatorRef.value.position.set(e.point.x, 0.2, e.point.z)
  }
}

const handleFloorLeave = () => {
  showIndicator.value = false
}

watch(hoverIndicatorRef, (newValue) => {
  console.log('hoverIndicatorRef',newValue)
})
</script>

<template>
  
  <primitive
    v-if="model_dungeon"
    ref="model_dungeon_ref"
    :name="model_dungeon"
    :object="model_dungeon"
  />
  <primitive
    v-if="model_lights"
    ref="model_lights_ref"
    :name="model_lights"
    :object="model_lights"
  />
  <primitive
    v-if="model_chests"
    ref="model_chests_ref"
    :name="model_chests"
    :object="model_chests"
  />
  <primitive
    v-if="model_doors"
    ref="model_doors_ref"
    :name="model_doors"
    :object="model_doors"
  />
  <primitive
    v-if="model_spikes"
    ref="model_spikes_ref"
    :name="model_spikes"
    :object="model_spikes"
  />
  <primitive
    v-if="model_visual_blocker"
    ref="model_visual_blocker_ref"
    :name="model_visual_blocker"
    :object="model_visual_blocker"
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
