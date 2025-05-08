<script setup lang="ts">
import type { Character, Action, ActionResource } from '~/types'

const gameStore = useGameStore()
const actionStore = useActionStore()
const { activeCharacter, characterTemplates } = storeToRefs(gameStore)

const getCharacterPortrait = (character: Character) => {
  if (!character) return undefined
  const characterTemplate = characterTemplates.value.find(template => template.key === character.key)
  return characterTemplate?.portrait
}

const getCharacterIcon = (character: Character) => {
  if (!character) return undefined
  const characterTemplate = characterTemplates.value.find(template => template.key === character.key)
  return characterTemplate?.classData?.icon
}

const getActionResourceData = (resource: string | null): ActionResource | undefined => {
  if (!resource) return undefined
  const actionResource = actionStore.getActionResourceBySlug(resource.split(':')[0])
  console.log('actionResource', actionResource)
  return actionResource
}

// Number of columns in the grid (BG3 uses 8)
const columns = 8
const rows = 4

// Fill empty slots to keep grid shape
const filledActions = computed(() => {
  const actions = activeCharacter.value?.actions || []
  const totalSlots = columns * rows
  const filled = actions.map(action => ({ action }))
  const remainder = totalSlots - filled.length
  if (remainder <= 0) return filled
  return [...filled, ...Array(remainder).fill({ action: null })]
})

const getActionData = (action: string | null): Action | undefined => {
  if (!action) return undefined
  return actionStore.getActionBySlug(action)
}

// Handle action click
const handleActionClick = (action: Action) => {
  // TODO: Implement action click handler
  console.log('Action clicked:', action)
}
</script>
<template>
 <div
  v-if="activeCharacter"
  class="fixed w-full bottom-1 mx-auto translate-x-1/3 flex items-center justify-start gap-0.5 z-10"
>
    <div class="character relative">
      <img :src="getCharacterPortrait(activeCharacter)" :alt="activeCharacter.name" class="rounded-full w-36 h-36 border border-4 border-gold-500 shadow-xl overflow-hidden object-cover">
      <img :src="getCharacterIcon(activeCharacter)" class="bg-slate-600 rounded-full w-12 h-12 z-10 absolute -left-8  bottom-4 border border-2 border-gold-500 shadow-xl" />
      <HudCharacterHPDisplay :character="activeCharacter" size="md" class="bottom-2" />
    </div>
    <div class="actions ring ring-2 ring-primary-500 px-4 grid grid-cols-8 gap-0.5 p-2 bg-neutral-900/80 rounded-lg shadow-lg min-h-[48px]">
      <template v-for="(item, idx) in filledActions" :key="item.action ? item.action : 'empty-' + idx">
        <UPopover
          v-if="item.action"
          class="bg-slate-800/50"
          :popper="{ placement: 'top' }"
          mode="hover"
        >
          <UButton
            :icon="getActionData(item.action)?.icon"
            :disabled="getActionData(item.action)?.usedThisTurn"
            variant="soft"
            class="flex flex-col items-center justify-center h-10 w-10 rounded-lg border border-neutral-700 bg-neutral-800/80 transition hover:border-primary-500 hover:bg-primary-900/30 cursor-pointer group overflow-hidden"
            :class="{ 'opacity-50 grayscale': getActionData(item.action)?.usedThisTurn, 'bg-gradient-to-br from-yellow-900/30 to-transparent': getActionData(item.action)?.highlighted }"
            @click="handleActionClick(getActionData(item.action)!)"
          />
          <template #content>
            <div class="p-4 max-w-sm">
              <h3 class="text-lg font-semibold mb-2">{{ getActionData(item.action)?.name }}</h3>
              <p class="text-sm text-gray-300 mb-4 text-primary-500">{{ getActionData(item.action)?.description }}</p>
             
              
            </div>
            <footer class="py-2 px-4 flex items-center bg-purple-800 gap-2">
              <UIcon :name="getActionResourceData(getActionData(item.action).cost)?.icon" :class="getActionResourceData(getActionData(item.action).cost)?.color" />
              <p class="text-xs text-bold text-white">{{ getActionResourceData(getActionData(item.action).cost)?.name }}</p>
              <div class="flex gap-1">
                <UKbd v-for="kbd in getActionData(item.action)?.kbds" :key="kbd" size="sm">
                  {{ kbd }}
                </UKbd>
              </div>
            </footer>
          </template>
        </UPopover>
        <div v-else class="flex flex-col items-center justify-center h-10 w-10 rounded-lg border border-neutral-700 bg-neutral-800/80 opacity-50" />
      </template>
    </div>
 </div>
</template>

<style scoped>
.actions {
  min-height: 96px;
}
</style>