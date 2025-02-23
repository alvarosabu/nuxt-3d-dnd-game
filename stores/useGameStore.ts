import { defineStore } from 'pinia'
import type { CharacterTemplate, GameState, Player } from '~/types'
import type { Object3D, Vector3 } from 'three'

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
    mode: 'single',
  })

  // Getters
  const getCharacterById = computed(() => {
    return (id: string) => state.characters.find(char => char.id === id)
  })

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
    await Promise.all([
      loadCharacterTemplates(),
    ])
  }

  const isMultiplayer = computed(() => state.mode === 'multiplayer')

  /**
   * Set the game mode
   * @param mode The game mode to set
   */
  function setMode(mode: GameState['mode']) {
    state.mode = mode
  }

  /**
   * Set the selected character for the player
   * @param character The character template to set
   */
  function setCharacter(character: CharacterTemplate) {
    state.players[0].character = character.key
    state.players[0].characterName = character.name
  }

  /**
   * Set the player's position in the game world
   * @param player The player to update
   * @param position The new position as a Three.js Vector3
   */
  function setPlayerPosition(player: Player, position: Vector3) {
    state.players[0].position = [position.x, position.y, position.z]
  }

  function addPlayer(player: Player) {
    state.players = [...state.players, player]
  }

  return {
    // State
    state,
    isMultiplayer,
    // Getters
    getCharacterById,
    // Actions
    loadCharacterTemplates,
    init,
    setMode,
    setCharacter,
    addPlayer,
    setPlayerPosition,
  }
}, {
  persist: {
    storage: piniaPluginPersistedstate.sessionStorage(),
  },
})
