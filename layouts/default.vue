<script setup lang="ts">
const { preloadResources, isLoading, progress } = useResourcePreloader()
const raceStore = useRaceStore()
const featureStore = useFeatureStore()
const actionStore = useActionStore()

onMounted(async () => {
  await preloadResources()
  await raceStore.loadRaces()
  await featureStore.loadFeatures()
  await actionStore.loadActions()
  await actionStore.loadActionResources()
})
</script>

<template>
  <div>
    <GameLoadingScreen
      v-if="isLoading"
      :progress="progress"
      message="Loading game assets..."
    />
    <slot v-else />
  </div>
</template>