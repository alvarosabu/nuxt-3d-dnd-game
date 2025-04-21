export default defineNuxtRouteMiddleware(() => {
  // Single player only
  const gameStore = useGameStore()
  const { party } = storeToRefs(gameStore)
  const customCharacters = computed(() => party.value.filter(character => character.custom))
  if (customCharacters.value.length === 0) {
    return navigateTo('/character/select')
  }

  return true
})
