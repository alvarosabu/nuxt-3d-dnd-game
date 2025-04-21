<script setup lang="ts">
import { Fog } from 'three'
import Level from '~/components/game/Level.vue'
import Item from '~/components/game/Item.vue'
import Floor from '~/components/game/Floor.vue'
const gameStore = useGameStore()
const { currentLevel, characters, activePlayer, players } = storeToRefs(gameStore)

const { scene, renderer } = useTres()

const getPlayer = (id: string) => {
  return players.value.find(player => player.id === id)
}

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

    <Suspense>
      <template v-for="(character, index) in characters" :key="character.id">
        <Character
          :character="character"
          :player="getPlayer(character.userId)"
          :is-current-player="character.id === activePlayer?.id"
          :index="index"
        />
      </template>
    </Suspense>
    <template v-for="item in currentLevel.items" :key="item.id">
      <Item :id="item.id" />
    </template>
    <Level />
    <Floor />
  </template>
</template>