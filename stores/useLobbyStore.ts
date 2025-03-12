import { defineStore } from 'pinia'
import { useUserStore } from './useUserStore'
import { useGameStore } from './useGameStore'
import type { Character, Lobby } from '~/types'

/**
 * Store to manage multiplayer lobbies
 */
export const useLobbyStore = defineStore(
  'lobby',
  () => {
    // State
    const lobbies = ref<Record<string, Lobby>>({})
    const currentLobbyId = ref<string | null>(null)
    const gameStore = useGameStore()

    // Getters
    const availableLobbies = computed(() =>
      Object.values(lobbies.value)
        .filter(lobby => lobby.status === 'waiting' || lobby.status === 'playing'),
    )

    const currentLobby = computed(() =>
      currentLobbyId.value ? lobbies.value[currentLobbyId.value] : null,
    )

    // Additional getters
    const isCurrentPlayerHost = computed(() => {
      const userStore = useUserStore()

      // In single player mode, the current player is always the host
      if (!gameStore.isMultiplayer) {
        return true
      }

      // In multiplayer, check if the current user is the host of the lobby
      if (!currentLobby.value) { return false }
      return currentLobby.value.hostId === userStore.userId
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
        setCurrentLobby(syncedLobbies[0].id)
      }
    }

    const currentLobbyPlayers = computed(() => {
      if (!currentLobby.value) { return [] }
      return currentLobby.value.players.filter(player => player.character && player.character !== null && player.ready && player.status === 'in-game')
    })

    return {
      // State
      lobbies,
      currentLobbyId,
      currentLobbyPlayers,
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
