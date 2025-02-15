export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore()
  const lobbyStore = useLobbyStore()

  // Check if user is connected and in a lobby
  if (!userStore.isConnected || !lobbyStore.currentLobby) {
    return navigateTo('/multiplayer')
  }

  return true
})
