import type { Lobby } from '~/stores/useLobbyStore'
import type { Player } from '~/types'

const connectedPeers = new Map<string, any>()
const global = 'GLOBAL'
const lobbies = new Map<string, Lobby>()
// Add new Maps for player tracking
const players = new Map<string, Player>() // userId -> Player
const peerToPlayer = new Map<string, string>() // peerId -> userId

function handlePlayerConnection(peer: any, userId: string, username: string) {
  console.log(`[WS] Player connected: ${peer.id} - ${userId} - ${username}`)
  const player = players.get(userId) || {
    userId,
    username,
  }
  // Update player's peer connection
  players.set(userId, player)
  peerToPlayer.set(peer.id, userId)

  // Send player connection response to the peer
  peer.send(JSON.stringify({
    type: 'PLAYER_CONNECTION_RESPONSE',
    player,
  }))
}

function handlePlayerDisconnection(peer: any) {
  const userId = peerToPlayer.get(peer.id)
  if (userId) {
    const player = players.get(userId)
    if (player) {
      players.set(userId, player)
    }
    peerToPlayer.delete(peer.id)

    // Broadcast player disconnection
    broadcastMessage({
      type: 'PLAYER_DISCONNECTED',
      userId,
      players: Array.from(players.values()),
    })
  }
}

function createLobby(name: string, hostPeerId: string, maxPlayers = 4) {
  const id = Math.random().toString(36).substring(7)
  const lobby: Lobby = {
    id,
    name,
    hostId: peerToPlayer.get(hostPeerId),
    hostName: players.get(peerToPlayer.get(hostPeerId))?.username,
    maxPlayers,
    players: [
      {
        id: peerToPlayer.get(hostPeerId),
        name: players.get(peerToPlayer.get(hostPeerId))?.username,
        character: null,
        isHost: true,
        ready: false,
      },
    ],
    status: 'waiting',
    createdAt: new Date().toISOString(),
  }
  lobbies.set(id, lobby)
}

function deleteLobby(lobbyId: string) {
  lobbies.delete(lobbyId)
}

function flushLobbies() {
  lobbies.clear()
}

function joinLobby(lobbyId: string, peerId: string) {
  const lobby = lobbies.get(lobbyId)
  if (lobby) {
    if (lobby.players.length < lobby.maxPlayers) {
      lobby.players.push({
        id: peerToPlayer.get(peerId),
        name: players.get(peerToPlayer.get(peerId))?.username,
        character: null,
        isHost: false,
        ready: false,
      })
    }
  }
}

function leaveLobby(lobbyId: string, peerId: string) {
  const lobby = lobbies.get(lobbyId)
  if (lobby) {
    lobby.players = lobby.players.filter(player => player.id !== peerToPlayer.get(peerId))
  }
}

function playerReady(peer: any, lobbyId: string, value: boolean) {
  const lobby = lobbies.get(lobbyId)
  if (lobby) {
    const player = lobby.players.find(player => player.id === peerToPlayer.get(peer.id))
    if (player) {
      player.ready = value
    }
  }
}
function broadcastMessage(message) {
  connectedPeers.forEach((p) => {
    p.send(JSON.stringify(message))
  })
}

function syncState() {
  console.log('Syncing state')
  broadcastMessage({
    type: 'SYNC_STATE',
    lobbies: Array.from(lobbies.values()),
    players: Array.from(players.values()),
  })
}
export default defineWebSocketHandler({
  open: (peer) => {
    console.warn(`[WS] Client connected: ${peer.id}`)
    connectedPeers.set(peer.id, peer)
    peer.subscribe(global)
    // Send confirmation message to the peer when they connect
    peer.send(JSON.stringify({
      type: 'CONNECTION_ESTABLISHED',
      message: 'Successfully connected to websocket server',
      peerId: peer.id,
    }))
    syncState()
  },
  message: (peer, message) => {
    console.log(`[WS] Message from ${peer.id}:`, message.text())

    const data = JSON.parse(message.text())
    // Create a map of message handlers for better organization and maintainability
    const messageHandlers = {
      PLAYER_CONNECTION_REQUEST: (peer: any, data: any) => {
        handlePlayerConnection(peer, data.userId, data.username)
      },
      PLAYER_DISCONNECTION_REQUEST: (peer: any) => {
        handlePlayerDisconnection(peer)
      },
      CREATE_LOBBY: (peer: any, data: any) => {
        createLobby(data.lobbyName, peer.id, data.maxPlayers)
      },
      DELETE_LOBBY: (peer: any, data: any) => {
        deleteLobby(data.lobbyId)
      },
      JOIN_LOBBY_REQUEST: (peer: any, data: any) => {
        joinLobby(data.lobbyId, peer.id)
      },
      LEAVE_LOBBY: (peer: any, data: any) => {
        leaveLobby(data.lobbyId, peer.id)
      },
      FLUSH_LOBBIES: () => {
        flushLobbies()
      },
      PLAYER_READY: (peer: any, data: any) => {
        playerReady(peer, data.lobbyId, data.value)
      },
    }

    // Handle the message using the handler map
    const handler = messageHandlers[data.type]
    if (handler) {
      handler(peer, data)
      // Sync state after any state-changing operation
      syncState()
    }
    else {
      console.warn(`[WS], ${messageHandlers}`)
      console.warn(`[WS] Unknown message type: ${data.type}`)
    }
  },
  close: (peer) => {
    console.warn(`[WS] Client disconnected: ${peer.id}`)
    connectedPeers.delete(peer.id)
  },
  error: (peer, error) => {
    console.error(`[WS] Error from ${peer.id}:`, error)
  },
})
