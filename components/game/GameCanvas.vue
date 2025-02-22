<script setup lang="ts">
import { useMultiplayer } from '~/composables/game/useMultiplayer'
import type { ThreeEvent } from '@tresjs/core'
import { ref, shallowRef } from 'vue'
import type { Object3D } from 'three'
import { findCharacterRig } from '~/utils/three'

const userStore = useUserStore()
const lobbyStore = useLobbyStore()
const gameStore = useGameStore()
const { currentLobbyPlayers } = storeToRefs(lobbyStore)
const { outlinedObjects, isMultiplayer, state } = storeToRefs(gameStore)

const characters = computed(() => {
  if (isMultiplayer.value) {
    return currentLobbyPlayers.value
  }
  return state.value.players
})

const { sendMsg } = useMultiplayer()
const orbitControlsRef = ref()
const showIndicator = ref(false)
const hoverIndicatorRef = shallowRef()
const testMeshRef = ref()

useControls('fpsgraph')
useControls({
  showCharacter: true,
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
  if (isMultiplayer.value) {
    sendMsg({
      type: 'UPDATE_PLAYER_POSITION',
      lobbyId: lobbyStore.currentLobbyId,
      position: [e.point.x, 0, e.point.z],
    })
  }
  else {
    gameStore.setPlayerPosition(state.value.players[0], [e.point.x, 0, e.point.z])
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

watch(testMeshRef, (newVal) => {
  if (newVal) {
    outlinedObjects.value.push(newVal)
  }
})
</script>

<template>
  <TresLeches>
    <pre>
      {{ outlinedObjects.map(obj => obj.name) }}
    </pre>
  </TresLeches>
  <TresCanvas
    clear-color="#ffffff"
    window-size
    :class="{ 'cursor-pointer': showIndicator }"
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

    <TresMesh
      :position-y="2"
      @pointerenter="handlePointerEnter"
      @pointerleave="handlePointerLeave"
    >
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshNormalMaterial />
    </TresMesh>

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
        :outlined-objects="outlinedObjects"
        :blur="false"
        :edge-strength="20000"
        :pulse-speed="0"
        visible-edge-color="#ffff00"
        :kernel-size="3"
      />
    </EffectComposerPmndrs>
  </TresCanvas>
</template>
