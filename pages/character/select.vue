<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import CharacterInfoPanel from '~/components/character/CharacterInfoPanel.vue'
import gsap from 'gsap'
import { useMultiplayer } from '~/composables/game/useMultiplayer'
import { useGameStore } from '~/stores/useGameStore'

definePageMeta({
  colorMode: 'dark',
})

const gameStore = useGameStore()
const lobbyStore = useLobbyStore()
const { init } = gameStore
await init()

const { sendMsg } = useMultiplayer()

// Get character templates from game state and ensure consistent order
const characters = computed(() => {
  const templates = gameStore.characterTemplates
  // Sort characters by their key or any other property to maintain consistent order
  return [...templates].sort((a, b) => a.key.localeCompare(b.key))
})

// Track the currently selected character
const selectedIndex = ref(0)
const selectedCharacter = computed(() => {
  return characters.value[selectedIndex.value]
})

// Camera controls for the carousel
const cameraPosition = ref({ x: 0, y: 2, z: 10 })
const cameraTarget = ref({ x: 0, y: 1, z: 0 })

// Carousel rotation and positioning
const radius = 4 // Distance from center
const carouselRotation = ref(0)
// Track the actual angle for each character position
const characterAngle = computed(() => 2 * Math.PI / characters.value.length)
// Track the current rotation direction (1 for clockwise, -1 for counter-clockwise)
const rotationDirection = ref(1)

// GSAP spring configuration
const springConfig = {
  duration: 1,
  ease: 'elastic.out(1, 0.75)', // Springy effect, adjust values for different bounce
}

// Initialize carousel rotation to show first character in front
onMounted(() => {
  carouselRotation.value = 0
})

// Calculate positions for each character
const getCharacterPosition = (index: number) => {
  const angle = (2 * Math.PI * index) / characters.value.length
  const x = Math.sin(angle) * radius
  const z = Math.cos(angle) * radius
  return { x, z }
}

// Calculate rotation for each character to face camera
const getCharacterRotation = (index: number) => {
  const angle = (2 * Math.PI * index) + carouselRotation.value
  return -angle
}

// Handle character selection with animation
const selectNext = () => {
  // Update the selected index
  selectedIndex.value = (selectedIndex.value + 1) % characters.value.length

  // Set rotation direction
  rotationDirection.value = -1

  // Calculate the new rotation - always rotate one step forward
  const newRotation = carouselRotation.value - characterAngle.value

  // Animate to the new rotation
  gsap.to(carouselRotation, {
    value: newRotation,
    ...springConfig,
  })
}

const selectPrevious = () => {
  // Update the selected index
  selectedIndex.value = selectedIndex.value === 0
    ? characters.value.length - 1
    : selectedIndex.value - 1

  // Set rotation direction
  rotationDirection.value = 1

  // Calculate the new rotation - always rotate one step backward
  const newRotation = carouselRotation.value + characterAngle.value

  // Animate to the new rotation
  gsap.to(carouselRotation, {
    value: newRotation,
    ...springConfig,
  })
}

// Handle keyboard navigation
onKeyStroke('ArrowRight', selectNext)
onKeyStroke('ArrowLeft', selectPrevious)

// Add character name with default value
const characterName = ref('Tav')

const handleSelectCharacter = () => {
  if (gameStore.isMultiplayer) {
    sendMsg({
      type: 'SELECT_CHARACTER',
      characterName: characterName.value,
      lobbyId: lobbyStore.currentLobby?.id,
      character: selectedCharacter.value?.key,
      weapon: selectedCharacter.value?.weapon,
    })

    /* sendMsg({
      type: 'UPDATE_PLAYER_STATE',
      lobbyId: lobbyStore.currentLobbyId,
      state: {
        weapon: selectedCharacter.value?.weapon,
      },
    }) */
  }
  else {
    gameStore.addCharacter({
      name: characterName.value,
      key: selectedCharacter.value?.key,
    })
  }
  navigateTo('/game')
}

onMounted(() => {
  if (gameStore.isMultiplayer) {
    sendMsg({
      type: 'UPDATE_PLAYER_STATUS',
      status: 'in-game',
    })
  }
})
</script>

<template>
  <div class="relative w-full h-screen">
    <!-- 3D Scene -->
    <TresCanvas clear-color="#000000" window-size>
      <!-- Camera -->
      <TresPerspectiveCamera
        :position="[cameraPosition.x, cameraPosition.y, cameraPosition.z]"
        :look-at="[cameraTarget.x, cameraTarget.y, cameraTarget.z]"
      />

      <!-- Lighting -->
      <TresAmbientLight :intensity="0.8" />
      <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" cast-shadow />

      <!-- Environment -->
      <Suspense>
        <Environment files="/textures/environment/meadow_2_2k.hdr" :blur="0.2" background />
      </Suspense>

      <!-- Character Carousel -->
      <TresGroup :rotation-y="carouselRotation">
        <template v-for="(character, index) in characters" :key="character.key">
          <TresGroup
            :position="[getCharacterPosition(index).x, 0, getCharacterPosition(index).z]"
            :rotation-y="getCharacterRotation(index)"
          >
            <CharacterPreview
              :character="character"
              :is-selected="index === selectedIndex"
            />
          </TresGroup>
        </template>
      </TresGroup>
    </TresCanvas>

    <!-- UI Overlay -->
    <div class="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
      <div class="container mx-auto flex justify-center gap-8">
        <!-- Character Name Input and Navigation Controls -->
        <div class="flex flex-col items-center gap-4">
          <div class="flex flex-col items-center gap-2">
            <label class="text-gold-200/80 text-sm">Enter your character name</label>
            <UInput
              v-model="characterName"
              color="neutral"
              size="lg"
              placeholder="Character Name"
              class="w-64 text-center bg-black/75 border-2 border-gold-500/50 text-white rounded-lg placeholder:text-gold-500/30"
            />
          </div>

          <!-- Navigation Controls -->
          <div class="flex justify-start gap-4">
            <UButton
              icon="i-heroicons-arrow-left"
              variant="ghost"
              color="primary"
              @click="selectPrevious"
            />
            <UButton
              variant="solid"
              color="primary"
              @click="handleSelectCharacter"
            >
              Select Character
            </UButton>
            <UButton
              icon="i-heroicons-arrow-right"
              variant="ghost"
              color="primary"
              @click="selectNext"
            />
          </div>
        </div>
      </div>
    </div>

    <CharacterInfoPanel
      v-if="selectedCharacter"
      :character="selectedCharacter"
    />
  </div>
</template>
