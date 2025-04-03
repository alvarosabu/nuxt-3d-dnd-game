<script setup lang="ts">
import { watch } from 'vue'
import Dice20 from '~/assets/icons/d20.svg'
import { checkCritical } from '~/utils/dice'

interface DiceRollProps {
  title?: string
  subtitle?: string
  difficultyClass?: number
  diceType?: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' // Common D&D dice types
  modifiers?: {
    name: string
    value: number
    icon?: string
  }[]
  remoteRoll?: {
    result: number
    success: boolean
    isCriticalSuccess: boolean
    isCriticalFailure: boolean
  }
  isInitiator?: boolean // Add this prop to control who can roll
  isHost?: boolean // Add this prop to control who can retry
}

const props = withDefaults(defineProps<DiceRollProps>(), {
  title: 'Ability Check',
  subtitle: '',
  difficultyClass: 10,
  diceType: 'd20',
  modifiers: () => [],
  remoteRoll: undefined,
  isInitiator: false, // Default to false
  isHost: false, // Default to false
})

const emit = defineEmits<{
  success: []
  failure: []
  close: []
  result: [{
    result: number
    success: boolean
    isCriticalSuccess: boolean
    isCriticalFailure: boolean
    totalValue: number // Add total value with modifiers
  }]
}>()

const diceTypeValue = computed(() => {
  // Remove 'd' prefix and convert to number
  return Number(props.diceType.slice(1))
})

const isRolling = ref(false)
const diceResult = ref<number | null>(null)
const showResult = ref(false)

// Calculate total bonus from modifiers
const totalBonus = computed(() => {
  return props.modifiers?.reduce((acc, mod) => acc + mod.value, 0) ?? 0
})

// Computed properties for roll results using our utility functions
const rollState = computed(() => {
  if (!diceResult.value) {
    return {
      isCriticalSuccess: false,
      isCriticalFailure: false,
      isSuccess: false,
    }
  }

  const { isCriticalSuccess, isCriticalFailure } = checkCritical(diceResult.value)
  const totalValue = diceResult.value + totalBonus.value

  return {
    isCriticalSuccess,
    isCriticalFailure,
    isSuccess: isCriticalSuccess || (!isCriticalFailure && totalValue >= (props.difficultyClass ?? 10)),
    totalValue,
  }
})

// Use the computed roll state
const isCriticalSuccess = computed(() => rollState.value.isCriticalSuccess)
const isCriticalFailure = computed(() => rollState.value.isCriticalFailure)
const isSuccess = computed(() => rollState.value.isSuccess)

const resultText = computed(() => {
  if (isCriticalSuccess.value) { return 'Critical Success!' }
  if (isCriticalFailure.value) { return 'Critical Failure!' }
  return isSuccess.value ? 'Success!' : 'Failure'
})

const resultClass = computed(() => {
  if (isCriticalSuccess.value) { return 'text-emerald-500' }
  if (isCriticalFailure.value) { return 'text-red-500' }
  return isSuccess.value ? 'text-gold-500' : 'text-red-500'
})

// Add karmic dice state
const KARMA_MEMORY = 3 // How many recent rolls to consider
const KARMA_WEIGHT = 0.4 // How much to adjust probabilities (0 to 1)
const recentRolls = ref<number[]>([]) // Store recent rolls for this check type

/**
 * Calculate the karmic adjustment based on recent rolls
 * Returns a number between -0.5 and 0.5 to adjust roll probability
 */
const getKarmicAdjustment = () => {
  if (recentRolls.value.length === 0) { return 0 }

  // Calculate average of recent rolls
  const avg = recentRolls.value.reduce((a, b) => a + b, 0) / recentRolls.value.length

  // Calculate how far from the ideal average (diceTypeValue/2) we are
  const idealAvg = diceTypeValue.value / 2
  const deviation = (idealAvg - avg) / diceTypeValue.value

  // Return an adjustment factor, weighted by KARMA_WEIGHT
  return deviation * KARMA_WEIGHT
}

/**
 * Generate a roll with karmic adjustment
 */
const generateKarmicRoll = () => {
  const karmicAdjustment = getKarmicAdjustment()

  // Generate base random number
  let roll = Math.random()

  // Apply karmic adjustment
  roll = Math.max(0, Math.min(1, roll + karmicAdjustment))

  // Convert to dice range (1 to diceTypeValue)
  const result = Math.floor(roll * diceTypeValue.value) + 1

  // Update recent rolls history
  recentRolls.value.push(result)
  if (recentRolls.value.length > KARMA_MEMORY) {
    recentRolls.value.shift()
  }

  return result
}

const handleContinue = () => {
  emit('close')
}

const rollDice = () => {
  showResult.value = false
  isRolling.value = true
  diceResult.value = null

  // Simulate dice roll animation
  setTimeout(() => {
    // Use karmic roll instead of pure random
    diceResult.value = generateKarmicRoll()

    // Get roll state and calculate total with modifiers
    const { isCriticalSuccess, isCriticalFailure, isSuccess } = rollState.value
    const totalValue = diceResult.value + totalBonus.value

    // Emit the result for multiplayer sync
    emit('result', {
      result: diceResult.value,
      success: isSuccess,
      isCriticalSuccess,
      isCriticalFailure,
      totalValue,
    })

    if (isSuccess) {
      emit('success')
    }
    else {
      emit('failure')
    }
    isRolling.value = false

    // Show result after roll animation
    setTimeout(() => {
      showResult.value = true
    }, 500)
  }, 1000)
}

// Watch for remote roll updates
watch(() => props.remoteRoll, (roll) => {
  if (!roll) { return }

  showResult.value = false
  isRolling.value = true
  diceResult.value = null

  // Simulate dice roll animation for remote roll
  setTimeout(() => {
    diceResult.value = roll.result
    isRolling.value = false

    // Show result after roll animation
    setTimeout(() => {
      showResult.value = true
      if (roll.success) {
        emit('success')
      }
      else {
        emit('failure')
      }
    }, 500)
  }, 1000)
}, { immediate: true })

function resetModal() {
  isRolling.value = false
  showResult.value = false
  diceResult.value = null
  emit('close')
}

const ABILITY_NAMES = {
  DEX: 'Dexterity',
  STR: 'Strength',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
} as const

const getModifierLabel = (modifier: { name: string }) => {
  if (modifier.name === 'Proficiency') { return `${props.subtitle} Proficiency` }
  return ABILITY_NAMES[modifier.name as keyof typeof ABILITY_NAMES] ?? modifier.name
}
</script>

<template>
  <UModal
    class="dice-roll-modal w-448px mx-auto bg-slate-800/50 backdrop-blur ring-slate-700"
    @update:open="resetModal"
  >
    <!-- Header Section -->
    <template #header>
      <div class="text-center mb-4">
        <h2 class="text-2xl font-bold text-gold-500 font-serif">{{ title }}</h2>
        <p class="text-slate-400">{{ subtitle }}</p>
      </div>
    </template>

    <!-- Body Section -->
    <template #body>
      <!-- Difficulty Class Section -->
      <div class="text-center mb-6">
        <p class="text-sm text-slate-400">DIFFICULTY CLASS</p>
        <p class="text-4xl font-bold text-gold-500">{{ difficultyClass }}</p>
      </div>

      <!-- Dice Section -->
      <div
        class="flex flex-col items-center justify-center dice-container relative transition-transform duration-300"
        :class="{ 'hover:scale-105': !showResult || !isSuccess }"
      >
        <div
          class="flex flex-col items-center justify-center dice-face min-h-[364px] w-full rounded-lg p-8 text-center ring-1 ring-slate-700 shadow-lg bg-slate-900/50 relative"
          :class="{ 'cursor-pointer': !showResult || !isSuccess }"
          @click="(!showResult || !isSuccess) && rollDice()"
        >
          <Transition name="fade">
            <div v-if="!showResult" class="relative">
              <Dice20
                class="mx-auto w-[300px] h-[300px]"
                :font-controlled="false"
                :class="{ 'animate-spin': isRolling }"
              />
              <span
                v-if="diceResult !== null"
                class="absolute text-6xl font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                :class="[
                  isCriticalSuccess ? 'text-emerald-500'
                  : isCriticalFailure ? 'text-red-500'
                    : isSuccess ? 'text-gold-500' : 'text-red-500',
                ]"
              >
                {{ diceResult + totalBonus }}
              </span>
              <span
                v-else
                class="absolute text-6xl font-bold text-gold-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                {{ diceTypeValue }}
              </span>
            </div>
            <div
              v-else
              class="flex items-center justify-center min-h-300px"
            >
              <h3
                class="text-5xl font-bold font-serif"
                :class="resultClass"
              >
                {{ resultText }}
              </h3>
            </div>
          </Transition>
        </div>

        <!-- Action Button -->
        <div class="mt-4">
          <UButton
            v-if="showResult && isSuccess && isInitiator"
            size="lg"
            color="primary"
            variant="solid"
            class="font-bold"
            @click="handleContinue"
          >
            Continue
          </UButton>
          <UButton
            v-if="diceResult && !isSuccess && isInitiator && isHost"
            size="sm"
            variant="outline"
            color="error"
            class="text-sm"
            @click="rollDice"
          >
            Try Again
          </UButton>
          <UButton
            v-if="isInitiator && !diceResult"
            size="sm"
            variant="outline"
            color="neutral"
            class="text-sm text-slate-400"
            @click="rollDice"
          >
            Click dice to roll
          </UButton>
          <p v-if="!isInitiator" class="text-sm text-slate-400">
            Waiting for initiator to roll...
          </p>
        </div>
      </div>
    </template>

    <!-- Footer Section -->
    <template #footer>
      <!-- Modifiers Section -->
      <div v-if="modifiers.length > 0" class="modifiers-section mt-6 w-full">
        <!-- Grid Layout for Modifiers -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div
            v-for="modifier in modifiers"
            :key="modifier.name"
            class="relative group min-h-120px"
          >
            <!-- Decorative Border -->
            <div class="absolute inset-0 bg-gradient-to-b from-gold-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>

            <!-- Card Content -->
            <div class="relative h-full text-center flex flex-col items-center p-4 bg-slate-900/80 rounded-lg ring-1 ring-gold-500/30 hover:ring-gold-500/50 transition-all duration-300">
              <!-- Icon -->
              <div class="mb-2">
                <UIcon
                  v-if="modifier.icon"
                  :name="modifier.icon"
                  class="w-8 h-8 text-gold-500"
                />
              </div>

              <!-- Value -->
              <span
                class="text-xl font-bold font-serif"
                :class="modifier.value >= 0 ? 'text-emerald-500' : 'text-red-500'"
              >
                {{ modifier.value >= 0 ? '+' : '' }}{{ modifier.value }}
              </span>

              <!-- Name -->
              <span class="text-sm text-slate-300 mb-1">{{ getModifierLabel(modifier) }}</span>

              <!-- Decorative Corner Lines -->
              <div class="absolute top-0 left-0 w-12px h-12px">
                <div class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-gold-500/50 to-transparent"/>
                <div class="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-gold-500/50 to-transparent"/>
              </div>
              <div class="absolute top-0 right-0 w-12px h-12px">
                <div class="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l from-gold-500/50 to-transparent"/>
                <div class="absolute top-0 right-0 h-full w-0.5 bg-gradient-to-b from-gold-500/50 to-transparent"/>
              </div>
              <div class="absolute bottom-0 left-0 w-12px h-12px">
                <div class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gold-500/50 to-transparent"/>
                <div class="absolute bottom-0 left-0 h-full w-0.5 bg-gradient-to-t from-gold-500/50 to-transparent"/>
              </div>
              <div class="absolute bottom-0 right-0 w-12px h-12px">
                <div class="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-gold-500/50 to-transparent"/>
                <div class="absolute bottom-0 right-0 h-full w-0.5 bg-gradient-to-t from-gold-500/50 to-transparent"/>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Bonus -->
        <div v-if="totalBonus !== 0" class="relative">
          <!-- Decorative Border -->
          <div class="absolute inset-0 bg-gradient-to-b from-gold-500/10 to-transparent rounded-lg"/>

          <div class="relative p-4 text-center border-t border-gold-500/30">
            <span class="text-sm text-slate-400 block mb-2">Total Bonus</span>
            <span class="text-2xl font-bold font-serif text-gold-500 tabular-nums">
              {{ totalBonus >= 0 ? '+' : '' }}{{ totalBonus }}
            </span>

            <!-- Decorative Corner Lines -->
            <div class="absolute top-0 left-0 w-12px h-12px">
              <div class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-gold-500/50 to-transparent"/>
              <div class="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-gold-500/50 to-transparent"/>
            </div>
            <div class="absolute top-0 right-0 w-12px h-12px">
              <div class="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l from-gold-500/50 to-transparent"/>
              <div class="absolute top-0 right-0 h-full w-0.5 bg-gradient-to-b from-gold-500/50 to-transparent"/>
            </div>
            <div class="absolute bottom-0 left-0 w-12px h-12px">
              <div class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gold-500/50 to-transparent"/>
              <div class="absolute bottom-0 left-0 h-full w-0.5 bg-gradient-to-t from-gold-500/50 to-transparent"/>
            </div>
            <div class="absolute bottom-0 right-0 w-12px h-12px">
              <div class="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-gold-500/50 to-transparent"/>
              <div class="absolute bottom-0 right-0 h-full w-0.5 bg-gradient-to-t from-gold-500/50 to-transparent"/>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.dice-roll-modal {
  background-image: linear-gradient(to bottom, rgb(15 23 42 / 0.9), rgb(2 6 23 / 0.95));
}

.dice-face {
  background: linear-gradient(45deg, rgb(15 23 42 / 0.8), rgb(30 41 59 / 0.8));
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
