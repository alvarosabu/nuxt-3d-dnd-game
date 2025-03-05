import { defineStore } from 'pinia'
import type { CharacterTemplate, GameItem, Level, Player } from '~/types'

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

  // Items State - Using a Record instead of Map for better persistence
  const items = ref<Record<string, GameItem>>({})

  // Levels State
  const levels = ref<Level[]>([])
  const currentLevelSlug = ref<string | null>(null)
  const currentLevel = computed(() => levels.value.find(level => level.slug === currentLevelSlug.value) ?? null)

  // Getters
  const getCharacterById = computed(() => {
    return (id: string) => characters.value.find(char => char.id === id)
  })

  const getItemById = computed(() => {
    return (id: string) => items.value[id]
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
    characterTemplates.value = templates.map((character) => {
      const classData = classMap.get(character.class)
      const characterTmpl = {
        ...character,
        raceData: raceMap.get(character.race),
        classData,
        // Map spell slugs to full spell data
        spellsData: classData?.spells?.map(spellSlug => spellMap.get(spellSlug)) ?? [],
        // Map cantrip slugs to full cantrip data
        cantripsData: classData?.cantrips?.map(cantripSlug => cantripMap.get(cantripSlug)) ?? [],
      }

      return characterTmpl
    })
  }

  /**
   * Load all available levels
   */
  async function loadLevels() {
    const levelsData = await queryCollection('levels').all()
    // Transform the level data to match our types
    levels.value = levelsData.map(level => ({
      ...level,
      items: level.items.map(item => ({
        ...item,
        position: item.position,
        rotation: item.rotation,
      })),
    }))
  }

  /**
   * Set the current level and initialize its items
   * @param levelSlug The slug of the level to set
   */
  function setCurrentLevel(levelSlug: string) {
    const level = levels.value.find(l => l.slug === levelSlug)
    if (!level) { return }

    // Clear existing items
    items.value = {}

    // Initialize level items
    level.items.forEach((item) => {
      setItem({
        ...item,
        position: item.position,
        rotation: item.rotation,
      })
    })

    currentLevelSlug.value = level.slug
  }

  /**
   * Initialize the game store
   */
  async function init() {
    await Promise.all([
      loadCharacterTemplates(),
      loadLevels(),
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

  /**
   * Add or update an item in the game world
   * @param item The item to add or update
   */
  function setItem(item: GameItem) {
    items.value = { ...items.value, [item.id]: item }
  }

  /**
   * Update the state of an item
   * @param itemId The ID of the item to update
   * @param state The new state to merge with the existing state
   */
  function updateItemState(itemId: string, state: Record<string, any>) {
    const item = items.value[itemId]
    if (item) {
      items.value = {
        ...items.value,
        [itemId]: {
          ...item,
          state: { ...item.state, ...state },
        },
      }
    }
  }

  /**
   * Update an item's position in the game world
   * @param itemId The ID of the item to update
   * @param position The new position as [x, y, z]
   */
  function updateItemPosition(itemId: string, position: [number, number, number]) {
    const item = items.value[itemId]
    if (item) {
      items.value = {
        ...items.value,
        [itemId]: {
          ...item,
          position,
        },
      }
    }
  }

  /**
   * Remove an item from the game world
   * @param itemId The ID of the item to remove
   */
  function removeItem(itemId: string) {
    const { [itemId]: _, ...rest } = items.value
    items.value = rest
  }

  /**
   * Handle remote item state update
   * @param itemId The ID of the item to update
   * @param state The new state to merge
   * @param position Optional new position as [x, y, z]
   */
  function handleRemoteItemUpdate(itemId: string, state: Record<string, any>, position?: [number, number, number]) {
    // Update item in items state
    updateItemState(itemId, state)
    if (position) {
      updateItemPosition(itemId, position)
    }

    // Update item in current level
    if (currentLevel.value) {
      const levelItem = currentLevel.value.items.find(item => item.id === itemId)
      if (levelItem) {
        levelItem.state = { ...levelItem.state, ...state }
        if (position) {
          levelItem.position = position
        }
      }
    }
  }

  return {
    // State
    players,
    activePlayer,
    mode,
    characterTemplates,
    characters,
    items,
    levels,
    currentLevelSlug,
    // Computed
    isMultiplayer,
    currentLevel,
    getCharacterById,
    getItemById,
    // Actions
    loadCharacterTemplates,
    loadLevels,
    init,
    setMode,
    setCharacter,
    addPlayer,
    setPlayerPosition,
    setItem,
    updateItemState,
    updateItemPosition,
    removeItem,
    setCurrentLevel,
    handleRemoteItemUpdate,
  }
}, {
  persist: {
    storage: piniaPluginPersistedstate.sessionStorage(),
  },
})
