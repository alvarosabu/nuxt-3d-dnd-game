import { defineStore } from 'pinia'
import { watch } from 'vue'

export interface Lobby {
  id: string
  name: string
  hostId: string
  hostName: string
  players: {
    id: string
    name: string
    isHost: boolean
  }[]
  maxPlayers: number
  status: 'waiting' | 'full' | 'in-game'
  createdAt: string
}

/**
 * Store to manage multiplayer lobbies
 */
export const useLobbyStore = defineStore(
  'lobby',
  () => {
    // State
    const lobbies = ref<Record<string, Lobby>>({})
    const currentLobbyId = ref<string | null>(null)
    const { createSession } = useMultiplayerSocket()

    // Getters
    const availableLobbies = computed(() =>
      Object.values(lobbies.value)
        .filter(lobby => lobby.status === 'waiting')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    )

    const currentLobby = computed(() =>
      currentLobbyId.value ? lobbies.value[currentLobbyId.value] : null,
    )

    // Additional getters
    const isCurrentPlayerHost = computed(() => {
      if (!currentLobby.value) { return false }
      return currentLobby.value.hostId === currentLobby.value.players.find(p => p.isHost)?.id
    })

    // Actions
    const createLobby = (name: string, host: { id: string, name: string }, maxPlayers = 4) => {
      const id = Math.random().toString(36).substring(7)
      const lobby: Lobby = {
        id,
        name,
        hostId: host.id,
        hostName: host.name,
        players: [{
          id: host.id,
          name: host.name,
          isHost: true,
        }],
        maxPlayers,
        status: 'waiting',
        createdAt: new Date().toISOString(),
      }
      lobbies.value[id] = lobby
      currentLobbyId.value = id
      return lobby
    }

    const joinLobby = (lobbyId: string, player: { id: string, name: string }) => {
      const lobby = lobbies.value[lobbyId]
      if (!lobby) { return false }

      if (lobby.players.length >= lobby.maxPlayers) {
        lobby.status = 'full'
        return false
      }

      lobby.players.push({
        id: player.id,
        name: player.name,
        isHost: false,
      })
      currentLobbyId.value = lobbyId
      return true
    }

    const leaveLobby = (playerId: string) => {
      if (!currentLobbyId.value) { return }

      const lobby = lobbies.value[currentLobbyId.value]
      if (!lobby) { return }

      lobby.players = lobby.players.filter(p => p.id !== playerId)

      if (lobby.players.length === 0) {
        delete lobbies.value[currentLobbyId.value]
      }
      else if (playerId === lobby.hostId) {
        // Promote next player to host
        const newHost = lobby.players[0]
        lobby.hostId = newHost.id
        lobby.hostName = newHost.name
        newHost.isHost = true
      }

      currentLobbyId.value = null
    }

    /**
     * Updates the lobby state from a session
     */
    const updateLobbyFromSession = (session: any) => {
      const lobby: Lobby = {
        id: session.id,
        name: session.name || `Lobby ${session.id}`,
        hostId: session.hostId,
        hostName: session.players.find((p: any) => p.isHost)?.name || '',
        players: session.players,
        maxPlayers: session.maxPlayers || 4,
        status: 'waiting',
        createdAt: new Date().toISOString(),
      }
      lobbies.value[lobby.id] = lobby
      currentLobbyId.value = lobby.id
    }

    /**
     * Removes a player from their current lobby
     */
    const removePlayer = (playerId: string) => {
      if (!currentLobbyId.value) { return }

      const lobby = lobbies.value[currentLobbyId.value]
      if (!lobby) { return }

      lobby.players = lobby.players.filter(p => p.id !== playerId)

      if (lobby.players.length === 0) {
        delete lobbies.value[currentLobbyId.value]
        currentLobbyId.value = null
      }
    }

    /**
     * Deletes a lobby and notifies all players
     * @param lobbyId - The ID of the lobby to delete
     */
    const deleteLobby = (lobbyId: string) => {
      const lobby = lobbies.value[lobbyId]
      if (!lobby) { return }

      delete lobbies.value[lobbyId]
      if (currentLobbyId.value === lobbyId) {
        currentLobbyId.value = null
      }
    }

    const setCurrentLobby = (lobbyId: string) => {
      currentLobbyId.value = lobbyId
    }

    watch(currentLobby, (lobby: Lobby | null) => {
      if (lobby) {
        createSession(lobby)
      }
    })

    return {
      // State
      lobbies,
      currentLobbyId,
      // Getters
      availableLobbies,
      currentLobby,
      isCurrentPlayerHost,
      // Actions
      createLobby,
      joinLobby,
      leaveLobby,
      updateLobbyFromSession,
      removePlayer,
      deleteLobby,
      setCurrentLobby,
    }
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.sessionStorage(),
    },
  },
)
