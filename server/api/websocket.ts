/* eslint-disable no-console */

import { Quaternion, Vector3 } from 'three'
import type { Lobby } from '~/stores/useLobbyStore'
import type { Character, Player } from '~/types'

interface PlayerStates {
  id: string
  name: string
  position: number[] // [x, y, z]
  rotation: number[] // [x, y, z, w]
  lobbyId?: string
  // Character state
  isMoving: boolean
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  isRunning: boolean
  isJumping: boolean
  isGrounded: boolean
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
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    // Initial character state
    isMoving: false,
    direction: 'UP',
    isRunning: false,
    isJumping: false,
    isGrounded: true,
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
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    lobbyId: id,
    isMoving: false,
    direction: 'UP',
    isRunning: false,
    isJumping: false,
    isGrounded: true,
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
        player.position = [0, 0, 0]
        player.rotation = [0, 0, 0, 1]
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

function updatePlayerPosition(peer: Peer, lobbyId: string, position: number[]) {
  const lobby = lobbies.get(lobbyId)
  const playerId = peerToPlayer.get(peer.id)
  if (!playerId) { return }

  const player = players.get(playerId)
  if (player && position.length === 3) {
    if (position.every(component => Number.isFinite(component))) {
      player.position = position
    }
  }
  if (lobby) {
    broadcastMessage({
      type: 'PLAYER_UPDATE',
      player,
    })
  }
}

function updatePlayerRotation(peer: Peer, lobbyId: string, rotation: number[]) {
  const lobby = lobbies.get(lobbyId)
  const playerId = peerToPlayer.get(peer.id)
  if (!playerId) { return }

  const player = players.get(playerId)
  if (player && rotation.length === 4) {
    if (rotation.every(component => Number.isFinite(component))) {
      player.rotation = rotation
    }
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

// Add new function to handle character state updates
function updatePlayerState(peer: Peer, lobbyId: string, state: Partial<PlayerStates>) {
  const lobby = lobbies.get(lobbyId)
  const playerId = peerToPlayer.get(peer.id)
  if (!playerId) { return }

  const player = players.get(playerId)
  if (player) {
    // Update only the provided state properties
    if (typeof state.isMoving === 'boolean') { player.isMoving = state.isMoving }
    if (state.direction) { player.direction = state.direction }
    if (typeof state.isRunning === 'boolean') { player.isRunning = state.isRunning }
    if (typeof state.isJumping === 'boolean') { player.isJumping = state.isJumping }
    if (typeof state.isGrounded === 'boolean') { player.isGrounded = state.isGrounded }
  }
  if (lobby) {
    broadcastMessage({
      type: 'PLAYER_UPDATE',
      player,
    })
  }
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
      UPDATE_PLAYER_POSITION: (peer: Peer, data: { lobbyId: string, position: number[] }) => {
        updatePlayerPosition(peer, data.lobbyId, data.position)
        return true
      },
      UPDATE_PLAYER_ROTATION: (peer: Peer, data: { lobbyId: string, rotation: number[] }) => {
        updatePlayerRotation(peer, data.lobbyId, data.rotation)
        return true
      },
      UPDATE_PLAYER_STATE: (peer: Peer, data: { lobbyId: string, state: Partial<PlayerStates> }) => {
        updatePlayerState(peer, data.lobbyId, data.state)
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
