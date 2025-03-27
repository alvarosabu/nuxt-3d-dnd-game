/* eslint-disable no-console */
import type { Peer } from '~~/shared/server/types/websocket'
import type { Character, Lobby, Player } from '~~/shared/types'

const connectedPeers = new Map<string, any>()
const global = 'GLOBAL'
const lobbies = new Map<string, Lobby>()
// Add new Maps for player tracking
const players = new Map<string, Player>() // userId -> Player
const peerToPlayer = new Map<string, string>() // peerId -> userId

function handlePlayerConnection(peer: Peer, userId: string, username: string) {
  console.log(`[WS] Player connected: ${peer.id} - ${userId} - ${username}`)
  const player = players.get(userId) || {
    // Base data
    id: userId,
    name: username,
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    ready: false,
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
  players.set(hostId, {
    id: hostId,
    isHost: true,
    ready: false,
    name: hostName || '',
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    lobbyId: id,
    isMoving: false,
    isJumping: false,
    isGrounded: true,
  })
  const lobby: Lobby = {
    id,
    name,
    hostId,
    hostName,
    maxPlayers,
    playersIds: [hostId],
    status: 'waiting',
    createdAt: new Date().toISOString(),
  }
  lobbies.set(id, lobby)

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
    if (lobby.playersIds.length < lobby.maxPlayers) {
      lobby.playersIds.push(playerId)

      const player = players.get(playerId)
      if (player) {
        player.lobbyId = lobbyId
      }
      peer.subscribe(lobbyId)
    }
  }
}

function leaveLobby(lobbyId: string, peerId: string) {
  const lobby = lobbies.get(lobbyId)
  if (lobby) {
    lobby.playersIds = lobby.playersIds.filter(playerId => playerId !== peerToPlayer.get(peerId))
  }
}

function playerReady(peer: Peer, lobbyId: string, value: boolean) {
  const lobby = lobbies.get(lobbyId)
  if (lobby) {
    const playerId = peerToPlayer.get(peer.id)
    if (playerId) {
      const player = players.get(playerId)
      if (player) {
        player.ready = value
      }
    }
  }
}

function broadcastMessage(message: Record<string, any>) {
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
    lobby.playersIds.forEach((playerId) => {
      const player = players.get(playerId)
      if (player) {
        player.ready = false
      }
    })
  }
}

function selectCharacter(peer: Peer, lobbyId: string, characterName: string, character: string, weapon: string) {
  const lobby = lobbies.get(lobbyId)
  if (lobby) {
    const playerId = peerToPlayer.get(peer.id)
    if (playerId) {
      const player = players.get(playerId)
      if (player) {
        player.character = character
        player.characterName = characterName
        player.weapon = weapon
      }
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

function updatePlayerState(peer: Peer, lobbyId: string, state: Record<string, any>) {
  const lobby = lobbies.get(lobbyId)
  const playerId = peerToPlayer.get(peer.id)

  if (!playerId) { return }

  const player = players.get(playerId)
  if (player) {
    Object.assign(player, state)
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
    lobbies: Array.from(lobbies.values()).map(lobby => ({
      ...lobby,
      players: lobby.playersIds.map(playerId => players.get(playerId)),
    })),
    players: Array.from(players.values()),
  })
}

function updatePlayerStatus(peer: Peer, status: string) {
  const playerId = peerToPlayer.get(peer.id)
  if (playerId) {
    const player = players.get(playerId)
    if (player) {
      player.status = status as 'offline' | 'lobby' | 'in-game'
    }
  }
}

function updateItemState(peer: Peer, data: {
  itemId: string
  itemType: string
  state: Record<string, any>
  position?: number[]
}) {
  const playerId = peerToPlayer.get(peer.id)
  if (!playerId) { return }

  broadcastMessage({
    type: 'ITEM_STATE_UPDATE',
    itemId: data.itemId,
    itemType: data.itemType,
    state: data.state,
    position: data.position,
    playerId,
  })
}

function handleDiceRollStart(peer: Peer, data: { modalArgs: any }) {
  const playerId = peerToPlayer.get(peer.id)
  if (!playerId) { return }

  broadcastMessage({
    type: 'DICE_ROLL_START',
    playerId,
    modalArgs: data.modalArgs,
  })
}

function handleDiceRollResult(peer: Peer, data: { result: number, success: boolean }) {
  const playerId = peerToPlayer.get(peer.id)
  if (!playerId) { return }

  broadcastMessage({
    type: 'DICE_ROLL_RESULT',
    playerId,
    result: data.result,
    success: data.success,
  })
}

function handleDiceRollClose(peer: Peer) {
  const playerId = peerToPlayer.get(peer.id)
  if (!playerId) { return }

  broadcastMessage({
    type: 'DICE_ROLL_CLOSE',
    playerId,
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
      SELECT_CHARACTER: (peer: Peer, data: { lobbyId: string, characterName: string, character: string, weapon: string }) => {
        selectCharacter(peer, data.lobbyId, data.characterName, data.character, data.weapon)
      },
      UPDATE_PLAYER_POSITION: (peer: Peer, data: { lobbyId: string, position: number[] }) => {
        updatePlayerPosition(peer, data.lobbyId, data.position)
        return true
      },
      UPDATE_PLAYER_STATE: (peer: Peer, data: { lobbyId: string, state: Record<string, any> }) => {
        updatePlayerState(peer, data.lobbyId, data.state)
        return true
      },
      UPDATE_PLAYER_STATUS: (peer: Peer, data: { status: string }) => {
        updatePlayerStatus(peer, data.status)
      },
      UPDATE_ITEM_STATE: (peer: Peer, data: {
        itemId: string
        itemType: string
        state: Record<string, any>
        position?: number[]
      }) => {
        updateItemState(peer, data)
      },
      DICE_ROLL_START: (peer: Peer, data: { modalArgs: any }) => {
        handleDiceRollStart(peer, data)
      },
      DICE_ROLL_RESULT: (peer: Peer, data: { result: number, success: boolean }) => {
        handleDiceRollResult(peer, data)
      },
      DICE_ROLL_CLOSE: (peer: Peer) => {
        handleDiceRollClose(peer)
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
