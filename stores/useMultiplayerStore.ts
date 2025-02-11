import { defineStore } from 'pinia'

interface Player {
  id: string
  name: string
  isHost: boolean
}

interface MultiplayerState {
  sessionId: string | null
  players: Player[]
  isHost: boolean
  connected: boolean
}

export const useMultiplayerStore = defineStore('multiplayer', {
  state: (): MultiplayerState => ({
    sessionId: null,
    players: [],
    isHost: false,
    connected: false,
  }),

  actions: {
    setSessionId(id: string) {
      this.sessionId = id
    },
    addPlayer(player: Player) {
      this.players.push(player)
    },
    removePlayer(playerId: string) {
      this.players = this.players.filter(p => p.id !== playerId)
    },
    setIsHost(isHost: boolean) {
      this.isHost = isHost
    },
    setConnected(connected: boolean) {
      this.connected = connected
    },
  },
})
