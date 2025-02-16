/* eslint-disable no-console */

import { Quaternion, Vector3 } from 'three'
import type { Lobby } from '~/stores/useLobbyStore'
import type { Character, Player } from '~/types'

interface PlayerStates {
  id: string
  name: string
  position: Vector3
  rotation: Quaternion
  lobbyId?: string
}
interface Peer {
  id: string
  send: (message: string) => void
  subscribe: (topic: string) => void
  publish: (topic: string, message: string) => void
}
const connectedPeers = new Map<string, any>()
const global = 'GLOBAL'
const lobbies = new Map<string, Lobby>()
// Add new Maps for player tracking
const players = new Map<string, PlayerStates>() // userId -> Player
const peerToPlayer = new Map<string, string>() // peerId -> userId

function handlePlayerConnection(peer: Peer, userId: string, username: string) {
  console.log(`[WS] Player connected: ${peer.id} - ${userId} - ${username}`)
  const player = players.get(userId) || {
    id: userId,
    name: username,
    position: new Vector3(0, 0, 0),
    rotation: new Quaternion(),
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

function handlePlayerDisconnection(peer: Peer) {
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

function createLobby(name: string, hostPeer: Peer, maxPlayers = 4) {
  const id = Math.random().toString(36).substring(7)
  const hostId = peerToPlayer.get(hostPeer.id)
  if (!hostId) {
    console.error('Host ID not found')
    return
  }
  const hostName = players.get(hostId)?.name
  const lobby: Lobby = {
    id,
    name,
    hostId,
    hostName,
    maxPlayers,
    players: [
      {
        id: hostId,
        name: hostName || '',
        character: null,
        isHost: true,
        ready: false,
      },
    ],
    status: 'waiting',
    createdAt: new Date().toISOString(),
  }
  lobbies.set(id, lobby)
  players.set(hostId, {
    id: hostId,
    name: hostName || '',
    position: new Vector3(0, 0, 0),
    rotation: new Quaternion(),
    lobbyId: id,
  })
  hostPeer.subscribe(lobby.id)
}

function deleteLobby(lobbyId: string) {
  lobbies.delete(lobbyId)
}

function flushLobbies() {
  lobbies.clear()
}

function joinLobby(lobbyId: string, peer: Peer) {
  const lobby = lobbies.get(lobbyId)
  const playerId = peerToPlayer.get(peer.id)
  if (lobby && playerId) {
    if (lobby.players.length < lobby.maxPlayers) {
      lobby.players.push({
        id: playerId,
        name: players.get(playerId)?.name || '',
        character: null,
        isHost: false,
        ready: false,
      })
      const player = players.get(playerId)
      if (player) {
        player.lobbyId = lobbyId
        player.position = new Vector3(0, 0, 0)
        player.rotation = new Quaternion()
      }
      peer.subscribe(lobbyId)
    }
  }
}

function leaveLobby(lobbyId: string, peerId: string) {
  const lobby = lobbies.get(lobbyId)
  if (lobby) {
    lobby.players = lobby.players.filter(player => player.id !== peerToPlayer.get(peerId))
  }
}

function playerReady(peer: Peer, lobbyId: string, value: boolean) {
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

function startGame(lobbyId: string) {
  const lobby = lobbies.get(lobbyId)
  if (lobby) {
    lobby.status = 'playing'
    broadcastMessage({
      type: 'GAME_STARTED',
      lobbyId,
    })
  }
}

function pauseGame(lobbyId: string) {
  const lobby = lobbies.get(lobbyId)
  if (lobby) {
    lobby.status = 'waiting'
    lobby.players.forEach((player) => {
      player.ready = false
    })
  }
}

function selectCharacter(peer: Peer, lobbyId: string, characterName: string, character: string) {
  const lobby = lobbies.get(lobbyId)
  if (lobby) {
    const player = lobby.players.find(player => player.id === peerToPlayer.get(peer.id))
    if (player) {
      player.character = character
      player.characterName = characterName
    }
  }
}

function updatePlayerPosition(peer: Peer, lobbyId: string, position: Vector3) {
  const lobby = lobbies.get(lobbyId)
  const playerId = peerToPlayer.get(peer.id)
  const player = players.get(playerId)
  if (player) {
    player.position.copy(position)
  }
  if (lobby) {
    broadcastMessage({
      type: 'PLAYER_UPDATE',
      player,
    })
  }
}

function updatePlayerRotation(peer: Peer, lobbyId: string, rotation: Quaternion) {
  const lobby = lobbies.get(lobbyId)
  const playerId = peerToPlayer.get(peer.id)
  const player = players.get(playerId)
  if (player) {
    player.rotation.copy(rotation)
  }
  if (lobby) {
    broadcastMessage({
      type: 'PLAYER_UPDATE',
      player,
    })
  }
}

function syncState() {
  console.log('Syncing state')
  broadcastMessage({
    type: 'SYNC_STATE',
    lobbies: Array.from(lobbies.values()),
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
    const messageHandlers: Record<string, (peer: Peer, data: any) => void | boolean> = {
      PLAYER_CONNECTION_REQUEST: (peer: Peer, data: { userId: string, username: string }) => {
        handlePlayerConnection(peer, data.userId, data.username)
      },
      PLAYER_DISCONNECTION_REQUEST: (peer: Peer) => {
        handlePlayerDisconnection(peer)
      },
      CREATE_LOBBY: (peer: Peer, data: { lobbyName: string, maxPlayers: number }) => {
        createLobby(data.lobbyName, peer, data.maxPlayers)
      },
      DELETE_LOBBY: (peer: Peer, data: { lobbyId: string }) => {
        deleteLobby(data.lobbyId)
      },
      JOIN_LOBBY_REQUEST: (peer: Peer, data: { lobbyId: string }) => {
        joinLobby(data.lobbyId, peer)
      },
      LEAVE_LOBBY: (peer: Peer, data: { lobbyId: string }) => {
        leaveLobby(data.lobbyId, peer.id)
      },
      FLUSH_LOBBIES: () => {
        flushLobbies()
      },
      PLAYER_READY: (peer: Peer, data: { lobbyId: string, value: boolean }) => {
        playerReady(peer, data.lobbyId, data.value)
      },
      START_GAME: (peer: Peer, data: { lobbyId: string }) => {
        startGame(data.lobbyId)
      },
      PAUSE_GAME: (peer: Peer, data: { lobbyId: string }) => {
        pauseGame(data.lobbyId)
      },
      SELECT_CHARACTER: (peer: Peer, data: { lobbyId: string, characterName: string, character: string }) => {
        selectCharacter(peer, data.lobbyId, data.characterName, data.character)
      },
      UPDATE_PLAYER_POSITION: (peer: Peer, data: { lobbyId: string, position: Vector3 }) => {
        updatePlayerPosition(peer, data.lobbyId, data.position)
        return true
      },
      UPDATE_PLAYER_ROTATION: (peer: Peer, data: { lobbyId: string, rotation: Quaternion }) => {
        updatePlayerRotation(peer, data.lobbyId, data.rotation)
        return true
      },
    }

    // Handle the message using the handler map
    const handler = messageHandlers[data.type]
    if (handler) {
      const skipSync = handler(peer, data)
      if (!skipSync) {
        // Sync state after any state-changing operation
        syncState()
      }
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
