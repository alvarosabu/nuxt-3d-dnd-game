<script setup lang="ts">
import bgMedievalCity from '~/public/bgs/bg-medieval-city.webp'
import bgDungeon from '~/public/bgs/bg-dungeon.webp'
import bgCamp from '~/public/bgs/bg-camp.webp'

interface Props {
  /**
   * Loading progress from 0 to 100
   */
  progress?: number
  /**
   * Loading message to display
   */
  message?: string
  /**
   * Minimum display time in milliseconds
   * @default 5000
   */
  minDisplayTime?: number
}

// Define props with default values
const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  message: 'Loading...',
  minDisplayTime: 5000,
})

// Background images array
const backgrounds = [
  bgMedievalCity,
  bgDungeon,
  bgCamp,
]

// Current background index and transition state
const currentBg = ref(0)
const isTransitioning = ref(false)

// Get next and previous background indices
const nextBg = computed(() => (currentBg.value + 1) % backgrounds.length)

// Use buffered progress instead of direct progress
const progressPercentage = computed(() => Math.round(props.progress))

// Function to handle background transition
const transitionBackground = () => {
  if (isTransitioning.value) { return } // Prevent multiple transitions

  isTransitioning.value = true

  // Wait for transition to complete before updating current
  setTimeout(() => {
    currentBg.value = nextBg.value
    isTransitioning.value = false
  }, 1000)
}

// Start background rotation on mount
onMounted(() => {
  const interval = setInterval(transitionBackground, 5000)

  // Cleanup on unmount
  onUnmounted(() => clearInterval(interval))
})
</script>

<template>
  <div class="loading-screen">
    <!-- Background layers -->
    <div class="fixed top-0 right-0 bottom-0 left-0 overflow-hidden bg-black">
      <!-- Current background -->
      <img
        :src="backgrounds[currentBg]"
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        :class="{ 'opacity-0': isTransitioning }"
      />
      <!-- Next background -->
      <img
        :src="backgrounds[nextBg]"
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        :class="{ 'opacity-100': isTransitioning }"
        :style="{ opacity: 0 }"
      />
    </div>

    <!-- Dark overlay with slight transparency -->
    <div class="fixed top-0 right-0 bottom-0 left-0 bg-black/60 backdrop-blur-[2px] z-10"></div>

    <!-- Loading spinner container - Bottom Right -->
    <div class="fixed bottom-8 right-8 z-30 flex flex-col items-center gap-2">
      <div class="relative flex items-center justify-center gap-4">
        <span class="text-gold-500 font-bold">
          {{ progressPercentage }}%
        </span>
        <UiLoadingSpinner :size="32" :stroke-width="4" />
      </div>
    </div>
  </div>
</template>
