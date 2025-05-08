<script setup lang="ts">
import { useUserStore } from '~/stores/useUserStore'
import { useGameStore } from '~/stores/useGameStore'

definePageMeta({
  colorMode: 'dark',
})

const { progress, isLoading } = useResourcePreloader()

const userStore = useUserStore()
const gameStore = useGameStore()

const { preloadResources } = useResourcePreloader()

// Start loading sequence
onMounted(async () => {
  // Actually load resources
  await preloadResources()
  gameStore.clearGame()
  gameStore.setMode('single')
  gameStore.addPlayer({
    id: userStore.userId,
    name: userStore.username,
    status: 'in-game',
  })
  // Add a random character
  const templates = gameStore.characterTemplates
  if (templates.length > 0) {
    const randomCharacter = templates[Math.floor(Math.random() * templates.length)]
    gameStore.addCharacter({
      name: 'Tav',
      key: randomCharacter.key,
    })
  }
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
