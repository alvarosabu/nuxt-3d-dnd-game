import type { UseWebSocketReturn } from '@vueuse/core'

export const useMultiplayer = (enabled: boolean = true) => {
  // Create a singleton instance of the WebSocket connection
  let wsInstance: UseWebSocketReturn<any>

  if (!wsInstance) {
    wsInstance = useWebSocket('/api/websocket', {
      immediate: true,
      autoReconnect: true,
    })

    const userStore = useUserStore()
    userStore.isConnected = false

    const handleUserConnection = () => {
      if (!enabled) { return }
      wsInstance.send(JSON.stringify({
        type: 'PLAYER_CONNECTION_REQUEST',
        userId: userStore.userId,
        username: userStore.username,
      }))
    }

    const lobbyStore = useLobbyStore()

    watch(wsInstance.data, (newData) => {
      if (!enabled) { return }
      const data = JSON.parse(newData)
      if (data.type === 'CONNECTION_ESTABLISHED') {
        userStore.setPeerId(data.peerId)
        handleUserConnection()
      }
      if (data.type === 'PLAYER_CONNECTION_RESPONSE') {
        userStore.isConnected = true
      }
      if (data.type === 'PLAYER_DISCONNECTED') {
      }
      if (data.type === 'SYNC_STATE') {
        lobbyStore.setLobbies(data.lobbies)
      }
    })
  }

  function sendMsg(message: Record<string, any>) {
    if (!enabled) { return }
    wsInstance.send(JSON.stringify(message))
  }

  return {
    send: wsInstance.send,
    on: wsInstance.on,
    off: wsInstance.off,
    data: wsInstance.data,
    sendMsg,
  }
}
