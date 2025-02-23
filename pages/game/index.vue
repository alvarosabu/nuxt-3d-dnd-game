<script setup lang="ts">
import { useMultiplayer } from '~/composables/game/useMultiplayer'

const { progress, isLoading } = useResourcePreloader()

const { preloadResources } = useResourcePreloader()

// Start loading sequence
onMounted(async () => {
  // Actually load resources
  await preloadResources()
})

definePageMeta({
  colorMode: 'dark',
})

const { sendMsg, data } = useMultiplayer()

watch(data, (newData) => {
  const data = JSON.parse(newData)
  if (data.type === 'PLAYER_CONNECTION_RESPONSE') {
    sendMsg({
      type: 'UPDATE_PLAYER_STATUS',
      status: 'in-game',
    })
  }
})
onBeforeUnmount(() => {
  sendMsg({
    type: 'UPDATE_PLAYER_STATUS',
    status: 'offline',
  })
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
