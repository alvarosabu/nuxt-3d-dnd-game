<script setup lang="ts">
import type { CharacterTemplate } from '~/types'

interface Props {
  character: CharacterTemplate
}

const props = defineProps<Props>()

// Format ability score with modifier
const getAbilityModifier = (score: number) => {
  const modifier = Math.floor((score - 10) / 2)
  return modifier >= 0 ? `+${modifier}` : modifier.toString()
}

// Get ability score display
const getAbilityDisplay = (score: number) => {
  return `${score} (${getAbilityModifier(score)})`
}

// Update proficiencies group with optional chaining
const proficiencyGroups = computed(() => ({
  weapons: props.character.classData?.proficiencies?.weapons?.join(', ') ?? '',
  armor: props.character.classData?.proficiencies?.armor?.join(', ') ?? '',
  skills: props.character.classData?.proficiencies?.skills?.from?.join(', ') ?? '',
}))

// Map short stat names to full names
const statNameMap: Record<string, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
}

// Check if stat is primary ability
const isPrimaryAbility = (stat: string) => {
  const fullStatName = statNameMap[stat.toLowerCase()]
  return props.character.classData?.primaryAbility === fullStatName
}
</script>

<template>
  <div class="character-info-panel w-80 fixed top-8 right-8 bg-black/75 backdrop-blur-sm border border-2 border-gold-500 rounded-lg p-4 text-sm">
    <!-- Race & Class -->
    <header class="text-center mb-4">
      <img :src="character.classData?.icon" alt="Class Icon" class="w-1/2 mx-auto mb-2" >
      <h2 class="text-gold-500/80  text-lg">{{ character.raceData?.name }}</h2>
      <h2 class="text-gold-200/80  text-xl">Level 1 {{ character.classData?.name }}</h2>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div v-for="(value, stat) in character.stats" :key="stat" class="text-center">
        <div class="text-gold-500/80 uppercase mb-1 flex items-center justify-center gap-1">
          {{ stat }}
          <UIcon
            v-if="isPrimaryAbility(stat)"
            name="i-heroicons-star-solid"
            class="text-gold-200 w-3 h-3"
          />
        </div>
        <div class="text-gold-100 font-bold">{{ getAbilityDisplay(value) }}</div>
      </div>
    </div>

    <!-- Spells & Cantrips -->
    <div class="mb-6 space-y-4">
      <div v-if="character.cantripsData?.length" class="space-y-2">
        <h3 class="text-gold-500/80 uppercase text-xs">Cantrips</h3>
        <div class="flex gap-2">
          <UTooltip
            v-for="cantrip in character.cantripsData"
            :key="cantrip.slug"
            :text="cantrip.name"
          >
            <div
              class="w-8 h-8 bg-black/40 rounded border border-gold-500/20 p-1 hover:border-gold-500/50 transition-colors cursor-help"
            >
              <UIcon
                :name="cantrip.icon"
                class="w-full h-full text-gold-500"
              />
            </div>
          </UTooltip>
        </div>
      </div>

      <div v-if="character.spellsData?.length" class="space-y-2">
        <h3 class="text-gold-500/80 uppercase text-xs">Spells</h3>
        <div class="flex gap-2">
          <UTooltip
            v-for="spell in character.spellsData"
            :key="spell.slug"
            :text="spell.name"
          >
            <div
              class="w-8 h-8 bg-black/40 rounded border border-gold-500/20 p-1 hover:border-gold-500/50 transition-colors cursor-help"
            >
              <UIcon
                :name="spell.icon"
                class="w-full h-full text-gold-500"
              />
            </div>
          </UTooltip>
        </div>
      </div>
    </div>

    <!-- Proficiencies -->
    <div class="space-y-4">
      <h3 class="text-gold-500/80 uppercase text-xs">Proficiencies</h3>
      <div class="space-y-2">
        <div v-if="proficiencyGroups.weapons" class="space-y-1">
          <div class="text-gold-500/60 text-xs">Weapons</div>
          <div class="text-gold-500">{{ proficiencyGroups.weapons }}</div>
        </div>
        <div v-if="proficiencyGroups.armor" class="space-y-1">
          <div class="text-gold-500/60 text-xs">Armor</div>
          <div class="text-gold-500">{{ proficiencyGroups.armor }}</div>
        </div>
        <div v-if="proficiencyGroups.skills" class="space-y-1">
          <div class="text-gold-500/60 text-xs">Skills</div>
          <div class="text-gold-500">{{ proficiencyGroups.skills }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
