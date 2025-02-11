import { defineStore } from 'pinia'
import type { Character, GameState } from '~/types'

/**
 * Store for managing game state including characters, players, and templates
 * @returns {object} Game store methods and state
 */
export const useGameStore = defineStore('game', () => {
  // State
  const state = reactive<GameState>({
    players: [],
    activePlayer: null,
    characterTemplates: [],
    characters: [],
  })

  // Getters
  const getCharacterById = computed(() => {
    return (id: string) => state.characters.find(char => char.id === id)
  })

  // Actions
  /**
   * Save current game state to localStorage
   */
  function saveGame() {
    localStorage.setItem('gameState', JSON.stringify(state))
  }

  /**
   * Load game state from localStorage
   */
  function loadGame() {
    const saved = localStorage.getItem('gameState')
    if (saved) {
      Object.assign(state, JSON.parse(saved))
    }
  }

  /**
   * Load and join character templates with their related data
   */
  async function loadCharacterTemplates() {
    // Load all collections
    const [characterTemplates, races, classes, spells, cantrips] = await Promise.all([
      queryCollection('origins').all(),
      queryCollection('races').all(),
      queryCollection('classes').all(),
      queryCollection('spells').all(),
      queryCollection('cantrips').all(),
    ])

    // Create maps for faster lookups
    const raceMap = new Map(races.map(race => [race.slug, race]))
    const classMap = new Map(classes.map(classItem => [classItem.slug, classItem]))
    const spellMap = new Map(spells.map(spell => [spell.slug, spell]))
    const cantripMap = new Map(cantrips.map(cantrip => [cantrip.slug, cantrip]))

    // Join the data with proper type assertions
    state.characterTemplates = characterTemplates.map(character => ({
      ...character,
      raceData: raceMap.get(character.race) ?? undefined,
      classData: classMap.get(character.class) ?? undefined,
      spellsData: character.spells
        .map(slug => spellMap.get(slug))
        .filter((spell): spell is NonNullable<typeof spell> => spell !== undefined),
      cantripsData: character.cantrips
        .map(slug => cantripMap.get(slug))
        .filter((cantrip): cantrip is NonNullable<typeof cantrip> => cantrip !== undefined),
    }))
  }

  /**
   * Initialize the game store
   */
  async function init() {
    await loadCharacterTemplates()
  }

  return {
    // State
    state,
    // Getters
    getCharacterById,
    // Actions
    saveGame,
    loadGame,
    loadCharacterTemplates,
    init,
  }
})
