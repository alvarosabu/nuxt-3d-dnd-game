<script setup lang="ts">
const gameStore = useGameStore()
const { currentLevel, isDebug, currentLevelSlug } = storeToRefs(gameStore)

const { levelActive } = useControls('level', {
  active: {
    options: gameStore.levels.map(level => level.slug),
    value: currentLevelSlug.value,
  },
})

watch(levelActive, (newLevelSlug) => {
  gameStore.setCurrentLevel(newLevelSlug)
})
</script>

<template>  
  <TresGridHelper 
    v-if="currentLevel && isDebug"
    :args="[1000, 1000, 1]" 
    :position-y="0.001"
  />
</template>
