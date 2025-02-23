<script setup lang="ts">
import { useMultiplayer } from '~/composables/game/useMultiplayer'

const { progress, isLoading } = useResourcePreloader()

const { preloadResources } = useResourcePreloader()

definePageMeta({
  colorMode: 'dark',
})

// Start loading sequence
onMounted(async () => {
  // Actually load resources
  await preloadResources()
})

definePageMeta({
  middleware: 'game',
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
