import { useLobbyStore } from '~/stores/useLobbyStore'
import UiJoinRequestModal from '~/components/ui/JoinRequestModal.vue'

interface JoinRequest {
  player: {
    id: string
    name: string
    isHost: boolean
  }
}

const { data, send, status } = useWebSocket('/api/websocket', {
  autoReconnect: true,
  immediate: true,
})

export function useMultiplayerSocket() {
  const lobbyStore = useLobbyStore()

  const pendingJoinRequest = ref<JoinRequest | null>(null)
  const modal = useModal()

  watchEffect(() => {
    console.log('Status', status.value)
    console.log('Data', data.value)
  })

  const handleJoinRequest = (sessionId: string, player: { id: string, name: string }) => {
    send(JSON.stringify({
      type: 'JOIN_SESSION',
      sessionId,
      player,
    }))
  }

  /**
   * Handles the join request response
   * @param accepted - Whether the request was accepted
   */
  const handleJoinResponse = (accepted: boolean) => {
    if (!pendingJoinRequest.value || !lobbyStore.currentLobby) { return }

    if (accepted && lobbyStore.currentLobby) {
      send(JSON.stringify({
        type: 'ACCEPT_PLAYER',
        sessionId: lobbyStore.currentLobby.id,
        player: pendingJoinRequest.value.player,
      }))
    }

    pendingJoinRequest.value = null
  }

  // Watch for websocket messages
  watch(data, (message) => {
    if (!message) { return }

    const parsedMessage = JSON.parse(message)
    console.log('[WS] Received:', parsedMessage)

    switch (parsedMessage.type) {
      case 'SESSION_CREATED':
        // updateLobbyFromSession(parsedMessage.session)
        break

      case 'SESSION_DELETED':
        break

      case 'JOIN_REQUEST':
        if (lobbyStore.isCurrentPlayerHost) {
          pendingJoinRequest.value = {
            player: parsedMessage.player,
          }
          modal.open(UiJoinRequestModal, {
            pendingJoinRequest: pendingJoinRequest.value,
            onAccept() {
              handleJoinResponse(true)
            },
            onReject() {
              handleJoinResponse(false)
            },
          })
        }
        break

      case 'JOIN_ACCEPTED':
        lobbyStore.updateLobbyFromSession(parsedMessage.session)
        break

      case 'PLAYER_JOINED':
        lobbyStore.updateLobbyFromSession(parsedMessage.session)
        break

      case 'PLAYER_LEFT':
        lobbyStore.removePlayer(parsedMessage.playerId)
        break
    }
  })

  const createSession = (lobby: Lobby) => {
    send(JSON.stringify({
      type: 'CREATE_SESSION',
      lobby,
    }))
  }

  /**
   * Sends a request to delete a session
   * @param sessionId - The ID of the session to delete
   */
  const deleteSession = (sessionId: string) => {
    send(JSON.stringify({
      type: 'DELETE_SESSION',
      sessionId,
    }))
  }

  return {
    status,
    send,
    pendingJoinRequest,
    handleJoinRequest,
    handleJoinResponse,
    deleteSession,
    createSession,
  }
}
