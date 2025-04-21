export default defineNuxtRouteMiddleware(() => {
  // Single player only
  const gameStore = useGameStore()
  const { currentUserCharacters } = storeToRefs(gameStore)
  const customCharacters = computed(() => currentUserCharacters.value.filter(character => character.custom))
  if (customCharacters.value.length === 0) {
    return navigateTo('/character/select')
  }

  return true
})
