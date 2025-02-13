import { defineStore } from 'pinia'

export interface Lobby {
  id: string
  name: string
  hostId: string
  hostName: string
  players: {
    id: string
    name: string
    isHost: boolean
    character: 'paladin'
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

    const setCurrentLobby = (lobbyId: string) => {
      currentLobbyId.value = lobbyId
    }

    const setLobbies = (syncedLobbies: Lobby[]) => {
      if (syncedLobbies.length > 0) {
        syncedLobbies.forEach((lobby) => {
          lobbies.value[lobby.id] = lobby
        })
      }
    }

    return {
      // State
      lobbies,
      currentLobbyId,
      // Getters
      availableLobbies,
      currentLobby,
      isCurrentPlayerHost,
      // Actions
      setCurrentLobby,
      setLobbies,
    }
  },
)
