import { defineStore } from 'pinia'
import type { CharacterTemplate, Player } from '~/types'
import type { Vector3 } from 'three'

/**
 * Store for managing game state including characters, players, and templates
 * @returns {object} Game store methods and state
 */
export const useGameStore = defineStore('game', () => {
  // Players State
  const players = ref<Player[]>([])
  const activePlayer = ref<Player | null>(null)

  // Game Mode
  const mode = ref<'single' | 'multiplayer'>('single')
  const isMultiplayer = computed(() => mode.value === 'multiplayer')

  // Characters
  const characterTemplates = ref<CharacterTemplate[]>([])
  const characters = ref<any[]>([]) // TODO: Define proper type

  // Getters
  const getCharacterById = computed(() => {
    return (id: string) => characters.value.find(char => char.id === id)
  })

  /**
   * Load and join character templates with their related data
   */
  async function loadCharacterTemplates() {
    // Load all collections
    const [templates, races, classes, spells, cantrips] = await Promise.all([
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
    characterTemplates.value = templates.map(character => ({
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

  /**
   * Set the game mode
   * @param newMode The game mode to set
   */
  function setMode(newMode: 'single' | 'multiplayer') {
    mode.value = newMode
  }

  /**
   * Set the selected character for the player
   * @param character The character template to set
   */
  function setCharacter(character: Pick<CharacterTemplate, 'key' | 'name'>) {
    if (!players.value[0]) { return }
    players.value[0].character = character.key
    players.value[0].characterName = character.name
  }

  /**
   * Set the player's position in the game world
   * @param player The player to update
   * @param position The new position as a Three.js Vector3
   */
  function setPlayerPosition(player: Player, position: Vector3) {
    if (!players.value[0]) { return }
    players.value[0].position = [position.x, position.y, position.z]
  }

  /**
   * Add a new player to the game
   * @param player The player to add
   */
  function addPlayer(player: Player) {
    players.value = [...players.value, player]
  }

  return {
    // State
    players,
    activePlayer,
    mode,
    characterTemplates,
    characters,
    // Computed
    isMultiplayer,
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
