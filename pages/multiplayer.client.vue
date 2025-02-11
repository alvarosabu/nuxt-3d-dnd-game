<script setup lang="ts">
import { useMultiplayerStore } from '~/stores/useMultiplayerStore'
import UiJoinRequestModal from '~/components/ui/JoinRequestModal.vue'

const store = useMultiplayerStore()
const playerName = ref('')
const sessionId = ref('')
const isCreatingSession = ref(false)

// Join request modal state
const modal = useModal()
const pendingJoinRequest = ref<{ player: any, resolve: (value: boolean) => void } | null>(null)

const { status, send, data } = useWebSocket('ws://localhost:3000/api/websocket')

// Create new session when name is entered
watch(playerName, (newName) => {
  if (newName && isCreatingSession.value) {
    createSession()
    isCreatingSession.value = false
  }
})

// Handle join request response
const handleJoinResponse = (accepted: boolean) => {
  if (accepted && pendingJoinRequest.value) {
    send(JSON.stringify({
      type: 'ACCEPT_PLAYER',
      sessionId: store.sessionId,
      player: pendingJoinRequest.value.player,
    }))
  }
  pendingJoinRequest.value = null
}

// Handle incoming websocket messages
watch(data, (newData) => {
  if (!newData) { return }

  console.log('Received websocket message:', newData)
  const message = JSON.parse(newData)

  switch (message.type) {
    case 'SESSION_CREATED':
      console.log('Session created:', message.session)
      store.setSessionId(message.session.id)
      store.setIsHost(true)
      store.players = message.session.players
      store.setConnected(true)
      break

    case 'SESSION_STATE':
      console.log('Received session state:', message.session)
      store.setSessionId(message.session.id)
      store.players = message.session.players
      break

    case 'JOIN_REQUEST':
      if (store.isHost) {
        pendingJoinRequest.value = {
          player: message.player,
        }
        modal.open(UiJoinRequestModal, {
          pendingJoinRequest: pendingJoinRequest.value,
          onSuccess() {
            handleJoinResponse(true)
          },
          onClose() {
            handleJoinResponse(false)
          },
        })
      }
      break

    case 'PLAYER_JOINED':
      store.addPlayer(message.player)
      // Update full session state if provided
      if (message.session) {
        store.players = message.session.players
      }
      if (message.player.id === store.sessionId) {
        store.setConnected(true)
      }
      break

    case 'JOIN_ACCEPTED':
      store.players = message.session.players
      store.setConnected(true)
      break

    case 'PLAYER_LEFT':
      store.removePlayer(message.playerId)
      break

    case 'ERROR':
      console.error('Session error:', message.message)
      alert(message.message)
      break
  }
})

// Create new session
const createSession = () => {
  if (!playerName.value) {
    isCreatingSession.value = true
    return
  }

  console.log('Creating session with name:', playerName.value)
  send(JSON.stringify({
    type: 'CREATE_SESSION',
    playerName: playerName.value,
  }))
}

// Join existing session
const joinSession = () => {
  if (!playerName.value || !sessionId.value) { return }

  send(JSON.stringify({
    type: 'JOIN_SESSION',
    sessionId: sessionId.value,
    playerName: playerName.value,
  }))
}
</script>

<template>
  <div class="p-4">
    <!-- Connection Status -->
    <div class="mb-4">
      Connection Status: {{ status }}
    </div>

    <div v-if="!store.connected" class="space-y-4">
      <!-- Create or Join Session Form -->
      <div class="max-w-md mx-auto bg-gray-100 p-6 rounded-lg">
        <h2 class="text-xl font-bold mb-4">Join Multiplayer Session</h2>

        <UInput
          v-model="playerName"
          label="Your Name"
          placeholder="Enter your name"
          :help="isCreatingSession ? 'Enter your name to create session' : undefined"
          class="mb-4"
        />

        <div class="space-y-4">
          <!-- Host: Create New Session -->
          <div>
            <h3 class="text-sm font-medium mb-2">Host a New Session</h3>
            <UButton
              block
              color="primary"
              :loading="isCreatingSession"
              @click="createSession"
            >
              {{ isCreatingSession ? 'Enter Your Name...' : 'Create New Session' }}
            </UButton>
          </div>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-gray-100 text-gray-500">Or</span>
            </div>
          </div>

          <!-- Join Existing Session -->
          <div>
            <h3 class="text-sm font-medium mb-2">Join Existing Session</h3>
            <div class="flex gap-2">
              <UInput
                v-model="sessionId"
                placeholder="Enter Session ID"
                help="Ask the host for the Session ID"
              />
              <UButton
                color="primary"
                @click="joinSession"
              >
                Join
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Connected View -->
    <div v-else class="max-w-md mx-auto bg-gray-100 p-6 rounded-lg space-y-4">
      <div v-if="store.sessionId" class="bg-gray-200 p-3 rounded">
        <div class="text-sm text-gray-600">Session ID (Share with friends)</div>
        <div class="text-lg font-mono">{{ store.sessionId }}</div>
      </div>

      <div class="space-y-2">
        <h3 class="text-lg font-bold">Connected Players</h3>
        <ul class="space-y-1">
          <li
            v-for="player in store.players"
            :key="player.id"
            class="flex items-center gap-2 p-2 bg-white rounded"
          >
            <UAvatar :src="`https://api.dicebear.com/9.x/thumbs/svg?seed=${player.name}`" />
            {{ player.name }}
            <span
              v-if="player.isHost"
              class="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded"
            >
              Host
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
