import { defineStore } from 'pinia'
import type { Player, Session } from '~/types'

export const useMultiplayerStore = defineStore('multiplayer', () => {
  // State
  const sessionId = ref<string | null>(null)
  const players = ref<Player[]>([])
  const isHost = ref(false)
  const connected = ref(false)

  // Actions
  function setSessionId(id: string) {
    sessionId.value = id
  }

  function addPlayer(player: Player) {
    players.value.push(player)
  }

  function removePlayer(playerId: string) {
    players.value = players.value.filter(p => p.id !== playerId)
  }

  function setIsHost(value: boolean) {
    isHost.value = value
  }

  function setConnected(value: boolean) {
    connected.value = value
  }

  function setPlayers(newPlayers: Player[]) {
    players.value = newPlayers
  }

  // Return everything that should be exposed
  return {
    // State
    sessionId,
    players,
    isHost,
    connected,
    // Actions
    setSessionId,
    addPlayer,
    removePlayer,
    setIsHost,
    setConnected,
    setPlayers,
  }
})
