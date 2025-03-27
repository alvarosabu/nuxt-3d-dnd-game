export default defineNuxtRouteMiddleware((to) => {
  /* const userStore = useUserStore()
  const lobbyStore = useLobbyStore()

  console.log('character middleware', userStore.isConnected, lobbyStore.currentLobby)

  // Check if user is connected and in a lobby
  if (!userStore.isConnected || !lobbyStore.currentLobby) {
    return navigateTo('/multiplayer')
  } */

  return true
})
