import { defineStore } from 'pinia'
import type { Character } from '~/types'

export interface Lobby {
  id: string
  name: string
  hostId: string | undefined
  hostName: string | undefined
  players: {
    id: string
    name: string
    isHost: boolean
    character: Character | null
    ready: boolean
  }[]
  maxPlayers: number
  status: 'waiting' | 'playing '
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
      lobbies.value = {}
      if (syncedLobbies.length > 0) {
        syncedLobbies.forEach((lobby) => {
          lobbies.value[lobby.id] = lobby
        })
      }
      setCurrentLobby(syncedLobbies[0].id)
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
