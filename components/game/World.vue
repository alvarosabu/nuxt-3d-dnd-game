<script setup lang="ts">
import { Fog } from 'three'
import Level from '~/components/game/Level.vue'
import Item from '~/components/game/Item.vue'
import Floor from '~/components/game/Floor.vue'
const gameStore = useGameStore()
const { currentLevel } = storeToRefs(gameStore)

const { scene, renderer } = useTres()

watch(currentLevel, (newLevel) => {
  if (newLevel) {
    scene.value.fog = new Fog(newLevel.environment.fogColor, 0.001, 1000)
    renderer.value.setClearColor(newLevel.environment.clearColor)
  }
})
</script>
<template>
  <template v-if="currentLevel">
    <Suspense>
      <Environment
        :preset="currentLevel.environment.background"
        :background="!!currentLevel.environment.background"
        :blur="1" 
      />
    </Suspense>
    <TresAmbientLight :intensity="currentLevel.environment.ambientLight" />
    <template v-if="currentLevel">
      <template v-for="item in currentLevel.items" :key="item.id">
        <Item :id="item.id" />
      </template>
    </template>
    <Level v-if="currentLevel"/>
    <Floor v-if="currentLevel" />
  </template>
</template>