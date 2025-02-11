import type { Session } from '~/types'

const sessions = new Map<string, Session>()

// Track connected peers
const connectedPeers = new Map<string, any>()

export default defineWebSocketHandler({
  open: (peer) => {
    console.log('Client connected', peer.id)
    connectedPeers.set(peer.id, peer)
  },

  message: (peer, message) => {
    console.log('Received message from client:', message)
    const data = JSON.parse(message as string)

    switch (data.type) {
      case 'CREATE_SESSION':
        console.log('Creating new session for:', data.playerName)
        const session: Session = {
          id: Math.random().toString(36).substring(7),
          players: [{
            id: peer.id,
            name: data.playerName,
            isHost: true,
          }],
          hostId: peer.id,
        }
        sessions.set(session.id, session)
        peer.subscribe(session.id)
        peer.send(JSON.stringify({
          type: 'SESSION_CREATED',
          session,
        }))
        break

      case 'JOIN_SESSION':
        const existingSession = sessions.get(data.sessionId)
        if (existingSession) {
          // Subscribe the joining peer to the session
          peer.subscribe(data.sessionId)

          const joiningPlayer = {
            id: peer.id,
            name: data.playerName,
            isHost: false,
          }

          // Get host peer and send join request
          const hostPeer = connectedPeers.get(existingSession.hostId)
          if (hostPeer) {
            console.log('Sending join request to host:', existingSession.hostId)
            hostPeer.send(JSON.stringify({
              type: 'JOIN_REQUEST',
              player: joiningPlayer,
            }))
          }

          peer.send(JSON.stringify({
            type: 'SESSION_STATE',
            session: existingSession,
          }))
        }
        else {
          peer.send(JSON.stringify({
            type: 'ERROR',
            message: 'Session not found',
          }))
        }
        break

      case 'ACCEPT_PLAYER':
        const targetSession = sessions.get(data.sessionId)
        if (targetSession && peer.id === targetSession.hostId) {
          const newPlayer = data.player
          // Add player to session
          targetSession.players.push(newPlayer)

          // Broadcast updated session state to ALL players in the session
          const sessionUpdate = JSON.stringify({
            type: 'PLAYER_JOINED',
            player: newPlayer,
            session: targetSession,
          })

          // Send to all players including host
          targetSession.players.forEach((player) => {
            const playerPeer = connectedPeers.get(player.id)
            if (playerPeer) {
              playerPeer.send(sessionUpdate)
            }
          })

          // Also subscribe the new player to the session
          const joiningPeer = connectedPeers.get(newPlayer.id)
          if (joiningPeer) {
            joiningPeer.subscribe(targetSession.id)
            joiningPeer.send(JSON.stringify({
              type: 'JOIN_ACCEPTED',
              session: targetSession,
            }))
          }
        }
        break
    }
  },

  close: (peer) => {
    console.warn('Client disconnected', peer.id)
    connectedPeers.delete(peer.id)
    // Remove player from their session
    sessions.forEach((session, sessionId) => {
      const playerIndex = session.players.findIndex(p => p.id === peer.id)
      if (playerIndex > -1) {
        session.players.splice(playerIndex, 1)
        peer.publish(sessionId, JSON.stringify({
          type: 'PLAYER_LEFT',
          playerId: peer.id,
        }))
      }
    })
  },
})
