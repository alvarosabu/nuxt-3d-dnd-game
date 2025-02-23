<script setup lang="ts">
import { useUserStore } from '~/stores/useUserStore'

import { useClipboard } from '@vueuse/core'
import type { Player } from '~/types'
import { useMultiplayer } from '~/composables/game/useMultiplayer'

// For Nuxt 3
definePageMeta({
  colorMode: 'dark',
})

const userStore = useUserStore()
const lobbyStore = useLobbyStore()

const gameStore = useGameStore()
gameStore.setMode('multiplayer')
const { availableLobbies, currentLobby } = storeToRefs(lobbyStore)
// Websocket
const { data, sendMsg } = useMultiplayer()

userStore.isConnected = false

const handleUserConnection = () => {
  sendMsg({
    type: 'PLAYER_CONNECTION_REQUEST',
    userId: userStore.userId,
    username: userStore.username,
  })
}

const handleUserDisconnection = () => {
  sendMsg({
    type: 'PLAYER_DISCONNECTION_REQUEST',
  })
  userStore.isConnected = false
}

const handleLeaveLobby = () => {
  sendMsg({
    type: 'LEAVE_LOBBY',
    lobbyId: currentLobby.value?.id,
  })
}

watch(data, (newData) => {
  const data = JSON.parse(newData)
  if (data.type === 'PLAYER_CONNECTION_RESPONSE') {
    sendMsg({
      type: 'UPDATE_PLAYER_STATUS',
      status: 'lobby',
    })
  }
  if (data.type === 'GAME_STARTED') {
    const player = lobbyStore.currentLobby?.players.find(player => player.id === userStore.userId)
    if (player?.character) {
      navigateTo('/game')
    }
    else {
      navigateTo('/character/select')
    }
  }
})

// Clipboard handling
const { copy, copied } = useClipboard()

// Form state
const lobbyFormState = reactive({
  lobbyName: '',
  maxPlayers: 4,
})

const lobbyIdToJoin = reactive({
  lobbyId: '',
})

// Add loading states
const isCreatingLobby = ref(false)
const isJoiningLobby = ref(false)

const isCurrentPlayerHost = ref(false)

/**
 * Creates a new lobby with current user as host
 */
const handleCreateLobby = () => {
  sendMsg({
    type: 'CREATE_LOBBY',
    lobbyName: lobbyFormState.lobbyName,
    maxPlayers: lobbyFormState.maxPlayers,
  })
}

const handleFlushLobbies = () => {
  sendMsg({
    type: 'FLUSH_LOBBIES',
  })
}

/**
 * Joins an existing lobby by ID
 */
const handleJoinLobby = (lobbyId: string) => {
  sendMsg({
    type: 'JOIN_LOBBY_REQUEST',
    lobbyId,
  })
}

const handleJoinLobbyRequest = () => {
  sendMsg({
    type: 'JOIN_LOBBY_REQUEST',
    lobbyId: lobbyIdToJoin.lobbyId,
  })
}

const handleDeleteLobby = (lobbyId: string) => {
  sendMsg({
    type: 'DELETE_LOBBY',
    lobbyId,
  })
}

const togglePlayerReady = (player: Player) => {
  sendMsg({
    type: 'PLAYER_READY',
    value: !player.ready,
    lobbyId: currentLobby.value?.id,
  })
}

const selectCurrentLobby = (lobbyId: string) => {
  lobbyStore.setCurrentLobby(lobbyId)
}

const handleStartGame = () => {
  sendMsg({
    type: 'START_GAME',
    lobbyId: currentLobby.value?.id,
  })
}

const showStartGameButton = computed(() => {
  return currentLobby.value?.status === 'waiting'
    && currentLobby.value?.players.filter(player => player.ready).length === currentLobby.value?.maxPlayers
    && currentLobby.value?.hostId === userStore.userId
})

const showJoinStartedGameButton = computed(() => {
  return currentLobby.value?.status === 'playing'
})

const handleJoinStartedGame = () => {
  const player = lobbyStore.currentLobby?.players.find(player => player.id === userStore.userId)
  if (player?.character) {
    navigateTo('/game')
  }
  else {
    navigateTo('/character/select')
  }
}

onBeforeUnmount(() => {
  sendMsg({
    type: 'UPDATE_PLAYER_STATUS',
    status: 'offline',
  })
})
</script>

<template>
  <main class="min-h-screen bg-slate-900 bg-gradient-to-b from-slate-900 to-slate-950">
    <UContainer class="py-8">
      <!-- Header with improved styling -->
      <div class="flex justify-between items-center mb-12">
        <div>
          <h1 class="text-5xl font-bold text-gold-500 font-serif mb-2">
            Multiplayer
          </h1>
          <p class="text-slate-400">
            Create or join a game session
          </p>
        </div>
        <!-- User Card with improved styling -->
        <UCard
          class="bg-slate-800/50 backdrop-blur ring-slate-700  border-slate-700"
        >
          <div class="flex items-center gap-3">
            <UChip
              color="success"
              :show="userStore.isConnected"
              inset
            >
              <UAvatar
                :src="userStore.avatar"
                size="sm"
                class="ring-2 ring-gold-500/50"
              />
            </UChip>

            <div class="flex flex-col">
              <span class="text-sm text-slate-300">Playing as</span>
              <span class="text-gold-500 font-medium">{{ userStore.username }}</span>
            </div>
            <UButton
              color="primary"
              variant="soft"
              :icon="userStore.isConnected ? 'i-mdi-lan-disconnect' : 'i-mdi-lan-connect'"
              @click="userStore.isConnected ? handleUserDisconnection() : handleUserConnection()"
            />
          </div>
        </UCard>
      </div>

      <!-- Main Content with improved grid and cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <!-- Left Column: Lobbies List -->
        <div class="space-y-4">
          <UCard
            class="bg-slate-800/50 backdrop-blur ring-slate-700"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="i-heroicons-users-20-solid text-xl text-gold-500"></span>
                  <h2 class="text-xl font-bold text-slate-200">
                    Available Lobbies
                  </h2>
                </div>
                <UBadge
                  :color="availableLobbies?.length ? 'warning' : 'error'"
                  variant="subtle"
                  class="px-3 py-1"
                >
                  {{ availableLobbies?.length }} Active
                </UBadge>
                <UButton
                  color="primary"
                  variant="ghost"
                  icon="i-heroicons-trash"
                  @click="handleFlushLobbies"
                />
              </div>
            </template>

            <div class="space-y-3">
              <template v-if="availableLobbies?.length">
                <UCard
                  v-for="lobby in availableLobbies"
                  :key="lobby.id"
                  class="bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer ring-slate-700 hover:ring-gold-500/50 transition-all duration-300"
                  @click="selectCurrentLobby(lobby.id)"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-medium text-gold-500 mb-1">
                        {{ lobby.name }}
                      </h3>
                      <div class="flex items-center gap-2 text-sm text-slate-400">
                        <span>{{ lobby.hostName }}</span>
                      </div>
                    </div>
                    <UAvatarGroup v-if="lobby.players.length > 0">
                      <UAvatar
                        v-for="player in lobby.players"
                        :key="player.id"
                        :src="`https://api.dicebear.com/9.x/thumbs/svg?seed=${player.name}`"
                        :alt="player.name"
                      />
                    </UAvatarGroup>
                    <div class="flex items-center gap-3">
                      <UBadge color="warning" variant="subtle" class="px-2">
                        {{ lobby.players.length }}/{{ lobby.maxPlayers }}
                      </UBadge>
                      <div class="flex items-center gap-2">
                        <UButton
                          v-if="userStore.username === lobby.hostName"
                          color="primary"
                          variant="ghost"
                          icon="i-heroicons-trash-20-solid"
                          size="xs"
                          @click="handleDeleteLobby(lobby.id)"
                        />
                        <UButton
                          color="primary"
                          variant="ghost"
                          icon="i-heroicons-arrow-right-20-solid"
                          size="xs"
                          @click="handleJoinLobby(lobby.id)"
                        />
                      </div>
                    </div>
                  </div>
                </UCard>
              </template>
              <div
                v-else
                class="text-center py-12 px-4"
              >
                <UIcon
                  name="i-mdi-lan"
                  class="text-4xl text-slate-600 mb-2 mx-auto"
                />
                <p class="text-slate-400 mb-1">
                  No active lobbies found
                </p>
                <p class="text-sm text-slate-500">
                  Create one to start playing!
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Right Column: Actions -->
        <div class="space-y-6">
          <!-- Create Lobby Form -->
          <UCard class="bg-slate-800/50 backdrop-blur ring-slate-700">
            <template #header>
              <div class="flex items-center gap-2">
                <span class="i-heroicons-plus-circle-20-solid text-xl text-gold-500"></span>
                <h2 class="text-xl font-bold text-slate-200">
                  Create New Lobby
                </h2>
              </div>
            </template>

            <UForm :state="lobbyFormState" class="space-y-4 w-2/3" @submit="handleCreateLobby">
              <UFormField name="lobbyName" class="text-slate-300">
                <UInput
                  v-model="lobbyFormState.lobbyName"
                  placeholder="Enter a name for your lobby"
                  class="bg-slate-900/50 ring-slate-700 w-full"
                  icon="i-heroicons-tag"
                />
              </UFormField>

              <UFormField name="maxPlayers" class="text-slate-300">
                <USelect
                  v-model="lobbyFormState.maxPlayers"
                  :items="[
                    {
                      label: '1',
                      value: 1,
                    },
                    {
                      label: '2',
                      value: 2,
                    },
                    {
                      label: '3',
                      value: 3,
                    },
                    {
                      label: '4',
                      value: 4,
                    },
                  ]"
                  placeholder="Select max players"
                  class="bg-slate-900/50 w-full"
                  icon="i-heroicons-users"
                />
              </UFormField>

              <UButton
                type="submit"
                color="primary"
                variant="outline"
                :loading="isCreatingLobby"
                :disabled="!lobbyFormState.lobbyName.trim()"
                block
              >
                Create Lobby
              </UButton>
            </UForm>
          </UCard>

          <!-- Join by ID Form -->
          <UCard class="bg-slate-800/50 backdrop-blur ring-slate-700">
            <template #header>
              <div class="flex items-center gap-2">
                <span class="i-heroicons-arrow-right-circle-20-solid text-xl text-gold-500"></span>
                <h2 class="text-xl font-bold text-slate-200">
                  Join by Lobby ID
                </h2>
              </div>
            </template>

            <UForm :state="lobbyIdToJoin" class="space-y-4 w-2/3" @submit="handleJoinLobbyRequest">
              <UFormField name="lobbyId" class="text-slate-300">
                <UInput
                  v-model="lobbyIdToJoin.lobbyId"
                  placeholder="Enter lobby ID"
                  class="bg-slate-900/50 w-full"
                  icon="i-heroicons-key"
                />
              </UFormField>

              <UButton
                type="submit"
                color="primary"
                variant="outline"
                :loading="isJoiningLobby"
                :disabled="!lobbyIdToJoin.lobbyId.trim()"
                block
              >
                Join Lobby
              </UButton>
            </UForm>
          </UCard>
        </div>
      </div>

      <!-- Current Lobby Modal with improved styling -->
      <UCard v-if="currentLobby" class="bg-slate-800/95 backdrop-blur ring-slate-700">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="i-heroicons-shield-check text-xl text-gold-500"></span>
              <h3 class="text-xl font-bold text-slate-200">
                {{ currentLobby?.name }}
              </h3>
            </div>
            <div class="flex gap-2">
              <UButton
                color="primary"
                variant="soft"
                icon="i-heroicons-link"
                @click="copy(currentLobby?.id ?? '')"
              >
                {{ copied ? 'Copied!' : `${currentLobby?.id}` }}
              </UButton>
              <UButton
                v-if="isCurrentPlayerHost"
                color="error"
                variant="soft"
                icon="i-heroicons-trash"
              >
                Delete Lobby
              </UButton>
              <UButton
                color="error"
                variant="soft"
                icon="i-heroicons-arrow-left-on-rectangle"
                @click="handleLeaveLobby"
              >
                Leave
              </UButton>
            </div>
          </div>
        </template>

        <div class="space-y-6">
          <div>
            <h4 class="text-sm font-medium text-slate-400 mb-3">
              Players
            </h4>
            <div v-if="currentLobby" class="grid grid-cols-4 gap-2">
              <UBadge
                v-for="player in currentLobby?.players"
                :key="player.id"
                :color="player.isHost ? 'primary' : player.id === userStore.userId ? 'success' : 'secondary'"
                variant="subtle"
                class="px-3 py-1"
              >
                <div class="w-full flex flex-col justify-start items-center gap-2 p-8">
                  <UAvatar :src="`https://api.dicebear.com/9.x/thumbs/svg?seed=${player.name}`" size="xl" />
                  <div class="flex items-center gap-2">
                    {{ player.name }} <span v-if="player.id === userStore.userId">(You)</span>
                    <UIcon
                      v-if="player.isHost"
                      name="i-mdi-crown"
                      class="text-primary"
                    />
                  </div>
                  <UButton
                    v-if="player.id === userStore.userId"
                    color="primary"
                    label="Ready"
                    :icon="player.ready ? 'i-heroicons-check' : null"
                    size="sm"
                    @click="togglePlayerReady(player)"
                  />
                  <UBadge
                    v-else
                    color="primary"
                    variant="subtle"
                    class="px-3 py-1"
                    :icon="player.ready ? 'i-heroicons-check' : null"
                  >
                    Ready
                  </UBadge>
                </div>
              </UBadge>
              <UBadge
                v-for="player in Array.from({ length: currentLobby?.maxPlayers - (currentLobby?.players?.length || 0) }, () => ({
                  name: 'Open',
                }))"
                :key="player"
                color="primary"
                variant="subtle"
                class="px-3 py-1"
              >
                <div class="w-full flex flex-col items-center gap-2 p-8">
                  <UAvatar :src="`https://api.dicebear.com/9.x/thumbs/svg?seed=${player.name}`" size="xl" />
                  <div class="flex items-center gap-2">
                    {{ player.name }} <span v-if="player.id === userStore.userId">(You)</span>
                    <UIcon
                      v-if="player.isHost"
                      name="i-mdi-crown"
                      class="text-primary"
                    />
                  </div>
                </div>
              </UBadge>
            </div>
          </div>
        </div>
        <div class="space-y-4 p-8 flex items-center justify-center">
          <UButton
            v-if="showStartGameButton"
            size="lg"
            color="primary"
            variant="soft"
            icon="i-heroicons-arrow-left-on-rectangle"
            @click="handleStartGame"
          >
            Start Game
          </UButton>
          <UButton
            v-if="showJoinStartedGameButton"
            size="lg"
            color="primary"
            variant="soft"
            icon="i-heroicons-arrow-left-on-rectangle"
            @click="handleJoinStartedGame"
          >
            Join Started Game
          </UButton>
        </div>
      </UCard>
    </UContainer>
  </main>
</template>
