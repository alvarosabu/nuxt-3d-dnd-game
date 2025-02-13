const connectedPeers = new Map<string, any>()

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
  },
  message: (peer, message) => {
    console.warn(`[WS] Message from ${peer.id}:`, message)
  },
  close: (peer) => {
    console.warn(`[WS] Client disconnected: ${peer.id}`)
    connectedPeers.delete(peer.id)
  },
  error: (peer, error) => {
    console.error(`[WS] Error from ${peer.id}:`, error)
  },
})
