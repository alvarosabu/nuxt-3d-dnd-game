<script setup lang="ts">
import { Vector3 } from 'three';

const { cameraPosition, cameraLookAt } = useControls('🎥 camera', {
  position: new Vector3(25, 25, 25),
  lookAt: new Vector3(0, 0, 0),
})

const uiStore = useUIStore()
const { contextMenu } = storeToRefs(uiStore)
</script>
<template>
  <TresPerspectiveCamera
    :position="[cameraPosition.x, cameraPosition.y, cameraPosition.z]"
    :look-at="[cameraLookAt.x, cameraLookAt.y, cameraLookAt.z]"
    :fov="45"
    :near="0.1"
    :far="1000"
  />
  <OrbitControls
    ref="orbitControlsRef"
    make-default
    :enable-damping="true"
    :damping-factor="0.05"
    :enabled="!contextMenu.isOpen"
  />
</template>
