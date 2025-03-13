<script setup lang="ts">
const gameStore = useGameStore()
const { getResource } = useResourcePreloader()
const { scene } = getResource('models', gameStore.currentLevel.model)

const modelRef = ref()
</script>

<template>
  <primitive
    v-if="scene"
    ref="modelRef"
    :name="scene"
    :object="scene"
  />
  <!-- <TresMesh
      :rotation-x="-Math.PI / 2"
      class="cursor-pointer"
    >
      <TresPlaneGeometry :args="[gameStore.currentLevel.grid.size[0], gameStore.currentLevel.grid.size[1]]" />
      <TresMeshBasicMaterial color="#4f4f4f" />
    </TresMesh> -->
</template>
