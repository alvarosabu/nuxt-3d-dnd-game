export default defineNuxtRouteMiddleware((to) => {
  /* const userStore = useUserStore()
  const lobbyStore = useLobbyStore() */

  // Check if user is authenticated and in a lobby
  /*   if (!userStore.isConnected || !lobbyStore.currentLobby) {
    console.log('redirecting to multiplayer')
    return navigateTo('/multiplayer')
  }

  // If user doesn't have a character, redirect to character select
  const player = lobbyStore.currentLobby.players.find(player => player.id === userStore.userId)
  if (!player?.character) {
    console.log('redirecting to character select')
    return navigateTo('/character/select')
  } */

  return true
})
