<script setup lang="ts">
const { progress, isLoading } = useResourcePreloader()

const { preloadResources } = useResourcePreloader()

// Start loading sequence
onMounted(async () => {
  // Actually load resources
  await preloadResources()
})

definePageMeta({
  middleware: 'game',
})
</script>

<template>
  <GameLoadingScreen
    v-if="isLoading"
    :progress="progress"
    message="Loading game assets..."
  />
  <div v-else>
    <GameProvider>
      <GameCanvas />
    </GameProvider>
  </div>
</template>
