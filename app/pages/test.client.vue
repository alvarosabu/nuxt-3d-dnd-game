<script setup lang="ts">
const { data, send, message, error, status } = useWebSocket('/api/test-websocket', {
  immediate: true,
  autoReconnect: true,
})

const route = useRoute()

const state = reactive({
  sessions: [],
  players: [],
})

const user = reactive({
  name: route.query.player,
  peerId: '',
  connected: false,
})

watch(data, (newData) => {
  const data = JSON.parse(newData)
  if (data.type === 'SYNC_SESSIONS') {
    console.log('SYNC_SESSIONS', data.sessions)
    state.sessions = data.sessions
  }
  if (data.type === 'CONNECTION_ESTABLISHED') {
    user.peerId = data.peerId
    user.connected = true

    send(JSON.stringify({
      type: 'PLAYER_CONNECTION_REQUEST',
      userId: user.name,
      username: user.name,
    }))
  }
  if (data.type === 'PLAYER_CONNECTED') {
    state.players.push(data.player)
  }
  if (data.type === 'PLAYER_DISCONNECTED') {
    state.players = state.players.filter(player => player.id !== data.userId)
  }
})

const createSession = () => {
  send(JSON.stringify({
    type: 'CREATE_SESSION',
    id: Math.random().toString(36).substring(2, 15),
    name: 'Test Session',
    hostName: route.query.player,
  }))
}

const flushSessions = () => {
  send(JSON.stringify({
    type: 'FLUSH_SESSIONS',
  }))
}
</script>

<template>
  <div class="p-4">
    <header class="text-2xl font-bold">
      {{ user.name }} {{ user.peerId }}
      <span class="text-sm text-gray-500">
        status: {{ user.connected ? 'connected' : 'disconnected' }}
      </span>
    </header>
    <pre class="p-4 bg-slate-500 text-xs font-mono break-word">{{ JSON.parse(data) }}</pre>
    <div class="flex gap-4">
      <UButton @click="createSession">
        Create Session
      </UButton>
      <UButton @click="flushSessions">
        Flush Sessions
      </UButton>
    </div>
    <div v-for="session in state.sessions" :key="session.id">
      <pre class="p-4 bg-slate-500 text-xs font-mono break-word">{{ JSON.stringify(session, null, 2) }}</pre>
    </div>
  </div>
</template>
