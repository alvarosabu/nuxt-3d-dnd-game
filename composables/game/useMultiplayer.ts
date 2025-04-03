import { createSharedComposable } from '@vueuse/core'

const _useMultiplayer = (enabled: boolean = true) => {
  const wsInstance = useWebSocket('/api/websocket', {
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
      // Handle player disconnection if needed
    }
    if (data.type === 'SYNC_STATE') {
      lobbyStore.setLobbies(data.lobbies)
    }
    if (data.type === 'ITEM_STATE_UPDATE') {
      const gameStore = useGameStore()
      const position = data.position ? [data.position.x, data.position.y, data.position.z] as [number, number, number] : undefined
      gameStore.handleRemoteItemUpdate(data.itemId, data.state, position)
    }
  })

  function sendMsg(message: Record<string, unknown>) {
    if (!enabled) { return }
    wsInstance.send(JSON.stringify(message))
  }

  return {
    send: wsInstance.send,
    data: wsInstance.data,
    sendMsg,
  }
}

// Export the shared version of the composable
export const useMultiplayer = createSharedComposable(_useMultiplayer)
