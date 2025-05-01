<script setup lang="ts">
import type { Character } from '~/types'

const gameStore = useGameStore()
const { party, characterTemplates, activeCharacterId } = storeToRefs(gameStore)

const getCharacterPortrait = (character: Character) => {
  const characterTemplate = characterTemplates.value.find(template => template.key === character.key)
  return characterTemplate?.portrait
}

</script>
<template>
  <div class="fixed left-1 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-0.5 z-10">
    <div v-for="character in party" :key="character.id" class="flex gap-2">
      <div
        :class="[
          'relative w-20 aspect-[3/4] overflow-hidden border-2    shadow-xl hover:border-white hover:bg-white transition-colors duration-300',
          activeCharacterId === character.id ? 'bg-white border-white' : 'bg-gold-500 border-gold-500',
        ]"
        @click="activeCharacterId = character.id"
      >
        <img :src="getCharacterPortrait(character)" :alt="character.name" class="rounded-lg w-full h-full object-cover">
        <div class="absolute bottom-0 left-0 mx-0 w-full text-white text-sm text-center text-shadow-lg">
          12/12
        </div>
      </div>
      <div>
       
      </div>
    </div>
  </div>
</template>