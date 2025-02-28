<script setup lang="ts">
import { watch } from 'vue'
import Dice20 from '~/assets/icons/d20.svg'

interface DiceRollProps {
  title?: string
  subtitle?: string
  difficultyClass?: number
  diceType?: 4 | 6 | 8 | 10 | 12 | 20 // Common D&D dice types
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
  diceType: 20,
  modifiers: () => [],
  remoteRoll: undefined,
  isInitiator: false, // Default to false
  isHost: false, // Default to false
})

const emit = defineEmits(['success', 'failure', 'close', 'result'])

const isRolling = ref(false)
const diceResult = ref<number | null>(null)
const showResult = ref(false)

// Calculate total bonus from modifiers
const totalBonus = computed(() => {
  return props.modifiers.reduce((acc, mod) => acc + mod.value, 0)
})

// Computed properties for roll results
const isCriticalSuccess = computed(() => diceResult.value === 20)
const isCriticalFailure = computed(() => diceResult.value === 1)
const isSuccess = computed(() => {
  if (!diceResult.value) { return false }
  if (isCriticalSuccess.value) { return true }
  if (isCriticalFailure.value) { return false }
  return (diceResult.value + totalBonus.value) >= props.difficultyClass
})

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

const handleContinue = () => {
  emit('close')
}

const rollDice = () => {
  showResult.value = false
  isRolling.value = true
  diceResult.value = null

  // Simulate dice roll animation
  setTimeout(() => {
    diceResult.value = Math.floor(Math.random() * props.diceType) + 1
    const success = diceResult.value >= props.difficultyClass

    // Emit the result for multiplayer sync
    emit('result', {
      result: diceResult.value,
      success,
      isCriticalSuccess: diceResult.value === 20,
      isCriticalFailure: diceResult.value === 1,
    })

    if (success) {
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
                :fontControlled="false"
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
                {{ diceResult }}
              </span>
              <span
                v-else
                class="absolute text-6xl font-bold text-gold-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                {{ diceType }}
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
            v-else-if="diceResult && !isSuccess && isInitiator && isHost"
            size="sm"
            variant="outline"
            color="error"
            class="text-sm"
            @click="rollDice"
          >
            Try Again
          </UButton>
          <UButton
            v-else-if="isInitiator"
            size="sm"
            variant="outline"
            color="neutral"
            class="text-sm text-slate-400"
            @click="rollDice"
          >
            Click dice to roll
          </UButton>
          <p v-else class="text-sm text-slate-400">
            Waiting for initiator to roll...
          </p>
        </div>
      </div>
    </template>

    <!-- Footer Section -->
    <template #footer>
      <!-- Modifiers Section -->
      <div class="modifiers-section mt-6 space-y-2">
        <div
          v-for="modifier in modifiers"
          :key="modifier.name"
          class="flex items-center justify-between p-2 bg-slate-900/30 hover:bg-slate-800/50 rounded ring-1 ring-slate-700 transition-colors duration-300"
        >
          <div class="flex items-center gap-2">
            <UIcon
              v-if="modifier.icon"
              :name="modifier.icon"
              class="text-gold-500"
            />
            <span class="text-slate-300">{{ modifier.name }}</span>
          </div>
          <span class="text-gold-500 font-semibold">
            {{ modifier.value >= 0 ? '+' : '' }}{{ modifier.value }}
          </span>
        </div>
      </div>

      <!-- Total Bonus -->
      <div class="mt-4 text-center border-t border-slate-700 pt-4">
        <p class="text-slate-400">Total Bonus</p>
        <p class="text-xl font-bold text-gold-500">
          {{ totalBonus >= 0 ? '+' : '' }}{{ totalBonus }}
        </p>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.dice-roll-modal {
  background-image: linear-gradient(to bottom, rgb(15 23 42 / 0.9), rgb(2 6 23 / 0.9));
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
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
