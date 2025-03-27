import type { Session } from '~/types'

const connectedPeers = new Map<string, any>()
const sessions = new Map<string, Session>()

// Add new Maps for player tracking
const players = new Map<string, Player>() // userId -> Player
const peerToPlayer = new Map<string, string>() // peerId -> userId

function handlePlayerConnection(peerId: string, userId: string, username: string) {
  // Create or update player
  const player = players.get(userId) || {
    userId,
    username,
  }

  // Update player's peer connection
  player.peerId = peerId
  players.set(userId, player)
  peerToPlayer.set(peerId, userId)

  // Broadcast updated player list
  broadcastMessage(JSON.stringify({
    type: 'PLAYER_CONNECTED',
    player,
    players: Array.from(players.values()),
  }))
}

function handlePlayerDisconnection(peerId: string) {
  const userId = peerToPlayer.get(peerId)
  if (userId) {
    const player = players.get(userId)
    if (player) {
      player.peerId = undefined // Mark as disconnected
      players.set(userId, player)
    }
    peerToPlayer.delete(peerId)

    // Broadcast player disconnection
    broadcastMessage(JSON.stringify({
      type: 'PLAYER_DISCONNECTED',
      userId,
      players: Array.from(players.values()),
    }))
  }
}

function broadcastMessage(message: string) {
  connectedPeers.forEach((p) => {
    p.send(message)
  })
}

function flushSessions() {
  // Clear all sessions from the sessions Map
  sessions.clear()
  // Broadcast the empty sessions list to all connected peers
  broadcastMessage(JSON.stringify({
    type: 'SESSIONS_CLEARED',
    sessions: [],
  }))
}

function syncSessions() {
  const sessionsArray = Array.from(sessions.values())
  broadcastMessage(JSON.stringify({
    type: 'SYNC_SESSIONS',
    sessions: sessionsArray,
  }))
}

export default defineWebSocketHandler({
  open: (peer) => {
    console.warn(`[WS] Client connected: ${peer.id}`)
    connectedPeers.set(peer.id, peer)

    // Send confirmation message to the peer when they connect
    peer.send(JSON.stringify({
      type: 'CONNECTION_ESTABLISHED',
      message: 'Successfully connected to websocket server',
      peerId: peer.id,
    }))
    syncSessions()
  },
  message: (peer, message) => {
    console.warn(`[WS] Message from ${peer.id}:`, message)
    const data = JSON.parse(message as string)
    if (data.type === 'CREATE_SESSION') {
      const session = {
        id: data.id,
        name: data.name,
        hostName: data.hostName,
      }
      sessions.set(session.id, session)
      // Convert sessions Map to an array or object before sending
      // const sessionsArray = Array.from(sessions.values())
      /*         peer.send(JSON.stringify({
          type: 'SESSION_CREATED',
          session,
          sessions: sessionsArray,
        })) */
      peer.send(JSON.stringify({
        type: 'SESSION_CREATED',
        session,
      }))

      syncSessions()
    }
    else if (data.type === 'FLUSH_SESSIONS') {
      flushSessions()
      syncSessions()
    }
    else if (data.type === 'PLAYER_CONNECTION_REQUEST') {
      handlePlayerConnection(peer.id, data.userId, data.username)
    }
  },
  close: (peer) => {
    console.warn(`[WS] Client disconnected: ${peer.id}`)
    handlePlayerDisconnection(peer.id)
    connectedPeers.delete(peer.id)
  },
})
