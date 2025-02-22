import { defineStore } from 'pinia'
import type { Character, GameState, Player } from '~/types'
import type { type Object3D, SkinnedMesh, Vector3 } from 'three'

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

  // Outlined objects state
  const outlinedObjects = shallowRef<Object3D[]>([])

  // Getters
  const getCharacterById = computed(() => {
    return (id: string) => state.characters.find(char => char.id === id)
  })

  function outlineObject(object: Object3D | null) {
    if (!object) { return }

    const existingObject = outlinedObjects.value.find(obj => obj.uuid === object.uuid)
    if (!existingObject) {
      outlinedObjects.value = [...outlinedObjects.value, object]
    }
  }

  function removeObjectOutline(object: Object3D | null) {
    if (!object) { return }

    outlinedObjects.value = outlinedObjects.value.filter(obj => obj.uuid !== object.uuid)
  }

  /**
   * Add character's children to outlined objects if they're not already there
   * @param character The character object to outline
   */
  function outlineCharacter(character: Object3D | null) {
    if (!character) { return }

    character.children.forEach((child) => {
      if (!(child instanceof SkinnedMesh)) { return }
      const existingObject = outlinedObjects.value.find(obj => obj.uuid === child.uuid)
      if (!existingObject) {
        outlinedObjects.value = [...outlinedObjects.value, child]
      }
    })
  }

  /**
   * Remove character's children from outlined objects
   * @param character The character object to remove outline from
   */
  function removeCharacterOutline(character: Object3D | null) {
    if (!character) { return }

    outlinedObjects.value = outlinedObjects.value.filter(obj =>
      !character.children.some(child => child.uuid === obj.uuid),
    )
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

  function setCharacter(character: Character) {
    state.players[0].character = character.key
    state.players[0].characterName = character.name
  }

  function setPlayerPosition(player: Player, position: Vector3) {
    state.players[0].position = position
  }

  function addPlayer(player: Player) {
    state.players = [...state.players, player]
  }

  return {
    // State
    state,
    outlinedObjects,
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
    // Outline methods
    outlineCharacter,
    removeCharacterOutline,
    outlineObject,
    removeObjectOutline,
  }
}, {
  persist: {
    storage: piniaPluginPersistedstate.sessionStorage(),
  },
})
