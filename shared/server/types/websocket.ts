export interface Peer {
  id: string
  send: (message: string) => void
  subscribe: (topic: string) => void
  publish: (topic: string, message: string) => void
}
