<script setup lang="ts">
const { preloadResources, isLoading, progress } = useResourcePreloader()

onMounted(async () => {
  await preloadResources()
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