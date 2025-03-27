<script setup lang="ts">
import { useUserStore } from '~/stores/useUserStore'

const userStore = useUserStore()
const gameStore = useGameStore()
// Local state for the input
const usernameInput = ref(userStore.username)

/**
 * Handles navigation to different sections of the game
 * @param route - The route to navigate to
 */
const handleNavigation = (route: string) => {
  if (route === '/game') {
    gameStore.setMode('single')
    gameStore.addPlayer({
      id: userStore.userId,
      name: userStore.username,
      character: null,
      characterName: null,
      weapon: null,
      position: [0, 0, 0],
      status: 'in-game',
    })
    if (gameStore.characters.length > 0) {
      navigateTo('/game')
    }
    else {
      navigateTo('/character/select')
    }
  }
  else {
    navigateTo(route)
  }
}

/**
 * Saves the new username and exits edit mode
 */
const saveUsername = () => {
  if (usernameInput.value.trim()) {
    userStore.setUsername(usernameInput.value.trim())
    userStore.toggleEditUsername()
  }
}

/**
 * Handles the enter key press in the input
 * @param event - Keyboard event
 */
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    saveUsername()
  }
}

const buttons = ['New Game', 'Load Game', 'Multiplayer', 'Options']
const buttonLinks = ['/game', '/load-game', '/multiplayer', '/options']
</script>

<template>
  <main class="min-h-screen bg-slate-900 text-white relative">
    <!-- Title Section -->
    <div class="container mx-auto px-4 py-12">
      <h1 class="text-6xl font-bold text-gold-500 mb-12 font-serif">
        Fardur's Gate
      </h1>

      <!-- Main Content Layout -->
      <div class="flex justify-between items-start">
        <!-- Navigation Buttons -->
        <div class="space-y-4 w-64">
          <UButton
            v-for="(button, index) in buttons"
            :key="index"
            color="primary"
            :variant="index === 0 ? 'solid' : 'outline'"
            class="w-full text-xl font-medium cursor-pointer"
            @click="handleNavigation(buttonLinks[index])"
          >
            {{ button }}
          </UButton>
        </div>

        <!-- User Info Card -->
        <div class="fixed bottom-8 right-8">
          <div class="bg-slate-800/80 backdrop-blur p-6 rounded-lg border border-gold-500/30 shadow-xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-gold-500 font-medium">Character Info</h3>
              <UButton
                v-if="!userStore.isEditingUsername"
                color="gray"
                variant="ghost"
                icon="i-heroicons-pencil-square"
                size="xs"
                @click="userStore.toggleEditUsername"
              />
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between gap-4">
                <UAvatar :src="userStore.avatar" />
                <!-- Username display/edit -->
                <template v-if="!userStore.isEditingUsername">
                  <span class="font-medium">{{ userStore.username }}</span>
                </template>
                <template v-else>
                  <div class="flex items-center gap-2">
                    <UInput
                      v-model="usernameInput"
                      size="sm"
                      autofocus
                      @keydown="handleKeyDown"
                    />
                    <UButton
                      color="primary"
                      variant="solid"
                      icon="i-heroicons-check"
                      size="sm"
                      @click="saveUsername"
                    />
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
