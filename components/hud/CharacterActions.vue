<script setup lang="ts">
import type { Character } from '~/types'

const gameStore = useGameStore()

const { activeCharacter, characterTemplates, activeCharacterId } = storeToRefs(gameStore)


const getCharacterPortrait = (character: Character) => {
  const characterTemplate = characterTemplates.value.find(template => template.key === character.key)
  return characterTemplate?.portrait
}

const getCharacterIcon = (character: Character) => {
  const characterTemplate = characterTemplates.value.find(template => template.key === character.key)
  return characterTemplate?.classData.icon
}
</script>
<template>
 <div class="fixed w-2/3 bottom-1 mx-auto translate-x-1/3 flex items-center justify-start gap-0.5 z-10">
    <div class="relative">
      <img :src="getCharacterPortrait(activeCharacter)" :alt="activeCharacter.name" class="rounded-full w-48 h-48 border border-4 border-gold-500 shadow-xl overflow-hidden object-cover">
      <img :src="getCharacterIcon(activeCharacter)" class="bg-slate-600 rounded-full w-16 h-16 z-10 absolute -left-2  bottom-4 border border-2 border-gold-500 shadow-xl" />
    </div>
 </div>
</template>