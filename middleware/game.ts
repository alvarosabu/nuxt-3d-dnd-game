export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore()
  const lobbyStore = useLobbyStore()

  // Check if user is authenticated and in a lobby
  if (!userStore.isConnected || !lobbyStore.currentLobby) {
    return navigateTo('/multiplayer')
  }

  // If user doesn't have a character, redirect to character select
  const player = lobbyStore.currentLobby.players.find(player => player.id === userStore.userId)
  if (!player?.character) {
    return navigateTo('/character/select', {
      query: {
        redirect: to.fullPath,
        lobbyId: lobbyStore.currentLobby.id,
      },
    })
  }

  return true
})
