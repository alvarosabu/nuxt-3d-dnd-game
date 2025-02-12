<script setup lang="ts">
import { useUserStore } from '~/stores/useUserStore'
import { useLobbyStore } from '~/stores/useLobbyStore'
import { useClipboard } from '@vueuse/core'
import { useMultiplayerSocket } from '~/composables/useMultiplayerSocket'

const userStore = useUserStore()

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

const lobbyStore = useLobbyStore()
const {
  joinLobby,
  setCurrentLobby,
  leaveLobby,
  createLobby,
  isCurrentPlayerHost,
} = lobbyStore

const { availableLobbies, currentLobby, currentLobbyId } = storeToRefs(lobbyStore)

const { handleJoinRequest, deleteSession } = useMultiplayerSocket()

/**
 * Creates a new lobby with current user as host
 */
const handleCreateLobby = () => {
  if (!lobbyFormState.lobbyName.trim()) { return }
  createLobby(lobbyFormState.lobbyName.trim(), {
    id: userStore.userId,
    name: userStore.username,
  }, lobbyFormState.maxPlayers)
  lobbyFormState.lobbyName = ''
}

/**
 * Joins an existing lobby by ID
 */
const handleJoinLobby = (lobbyId: string) => {
  joinLobby(lobbyId, {
    id: userStore.userId,
    name: userStore.username,
  })

  lobbyIdToJoin.lobbyId = ''
}

const handleJoinLobbyRequest = () => {
  handleJoinRequest(lobbyIdToJoin.lobbyId, {
    id: userStore.userId,
    name: userStore.username,
  })

  lobbyIdToJoin.lobbyId = ''
}

const handleDeleteLobby = (lobbyId: string) => {
  deleteSession(lobbyId)
}

// Cleanup on unmount
onBeforeUnmount(() => {
  if (currentLobbyId) {
    leaveLobby(userStore.username)
  }
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
            <UAvatar
              :src="userStore.avatar"
              size="sm"
              class="ring-2 ring-gold-500/50"
            />
            <div class="flex flex-col">
              <span class="text-sm text-slate-300">Playing as</span>
              <span class="text-gold-500 font-medium">{{ userStore.username }}</span>
            </div>
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
                  :color="availableLobbies.length ? 'warning' : 'error'"
                  variant="subtle"
                  class="px-3 py-1"
                >
                  {{ availableLobbies.length }} Active
                </UBadge>
              </div>
            </template>

            <div class="space-y-3">
              <template v-if="availableLobbies.length">
                <UCard
                  v-for="lobby in availableLobbies"
                  :key="lobby.id"
                  class="bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer ring-slate-700 hover:ring-gold-500/50 transition-all duration-300"
                  @click="setCurrentLobby(lobby.id)"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-medium text-gold-500 mb-1">
                        {{ lobby.name }}
                      </h3>
                      <div class="flex items-center gap-2 text-sm text-slate-400">
                        <UAvatar :src="`https://api.dicebear.com/9.x/thumbs/svg?seed=${lobby.hostName}`" size="xs" />
                        <span>{{ lobby.hostName }}</span>
                      </div>
                    </div>
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
                  name="i-heroicons-globe-alt"
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
      <UCard class="bg-slate-800/95 backdrop-blur ring-slate-700">
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
                v-if="isCurrentPlayerHost"
                color="error"
                variant="soft"
                icon="i-heroicons-trash"
                @click="deleteSession(currentLobby?.id)"
              >
                Delete Lobby
              </UButton>
              <UButton
                color="error"
                variant="soft"
                icon="i-heroicons-arrow-left-on-rectangle"
                @click="leaveLobby(userStore.username)"
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
            <div class="grid grid-cols-4 gap-2">
              <UBadge
                v-for="player in currentLobby?.players"
                :key="player.id"
                :color="player.isHost ? 'primary' : 'secondary'"
                variant="subtle"
                class="px-3 py-1"
              >
                <div class="flex items-center gap-2">
                  <UAvatar :src="`https://api.dicebear.com/9.x/thumbs/svg?seed=${player.name}`" size="xs" />
                  {{ player.name }}
                  <UIcon
                    v-if="player.isHost"
                    name="i-heroicons-crown-20-solid"
                    class="text-primary"
                  />
                </div>
              </UBadge>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-medium text-slate-400 mb-2">
              Share Lobby
            </h4>
            <UButton
              :text="currentLobby?.id"
              class="w-full bg-slate-900/50"
              variant="outline"
              color="primary"
              @click="copy(currentLobby?.id ?? '')"
            >
              <div class="flex items-center justify-center gap-2">
                <UIcon name="i-heroicons-link" />
                {{ copied ? 'Copied!' : `Copy Lobby ID: ${currentLobby?.id}` }}
              </div>
            </UButton>
          </div>
        </div>
      </UCard>
    </UContainer>
  </main>
</template>
