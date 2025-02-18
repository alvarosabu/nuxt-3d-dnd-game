export const useMultiplayer = () => {
  // Create a singleton instance of the WebSocket connection
  let wsInstance
  if (!wsInstance) {
    wsInstance = useWebSocket('/api/websocket', {
      immediate: true,
      autoReconnect: true,
    })

    const userStore = useUserStore()
    userStore.isConnected = false

    const handleUserConnection = () => {
      wsInstance.send(JSON.stringify({
        type: 'PLAYER_CONNECTION_REQUEST',
        userId: userStore.userId,
        username: userStore.username,
      }))
    }

    const lobbyStore = useLobbyStore()

    watch(wsInstance.data, (newData) => {
      const data = JSON.parse(newData)
      if (data.type === 'CONNECTION_ESTABLISHED') {
        userStore.setPeerId(data.peerId)
        handleUserConnection()
      }
      if (data.type === 'PLAYER_CONNECTION_RESPONSE') {
        userStore.isConnected = true
      }
      if (data.type === 'PLAYER_DISCONNECTED') {
        console.log('PLAYER_DISCONNECTED', data)
      }
      if (data.type === 'SYNC_STATE') {
        console.log('SYNC_STATE', data)
        lobbyStore.setLobbies(data.lobbies)
      }
    })
  }

  return wsInstance
}
