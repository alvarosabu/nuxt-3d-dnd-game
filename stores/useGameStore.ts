import { defineStore } from 'pinia'
import type { Vector3 } from 'three'
import { useControls } from '@tresjs/leches'
import type { Character, CharacterTemplate, GameItem, Level, Player } from '~/types'
import { MathUtils } from 'three'
import { calculateHitPoints, calculateConstitutionModifier } from '~/utils/characterStats'
import { calculateAbilityModifiers } from '~/utils/abilityModifiers'

/**
 * Store for managing game state including characters, players, and templates
 * @returns {object} Game store methods and state
 */
export const useGameStore = defineStore('game', () => {
  const userStore = useUserStore()
  const actionStore = useActionStore()
  const { userId } = storeToRefs(userStore)
  // Global 
  const { debug } = useControls({
    debug: true,
  })
  const isDebug = computed(() => debug.value)
  // Players State
  const players = ref<Player[]>([])
  const activePlayer = ref<Player | null>(null)

  // Game Mode
  const mode = ref<'single' | 'multiplayer'>('single')
  const isMultiplayer = computed(() => mode.value === 'multiplayer')

  // Characters
  const characterTemplates = ref<CharacterTemplate[]>([])
  const characters = ref<Character[]>([]) // TODO: Define proper type
  const customCharacters = computed(() => characters.value.filter(character => character.custom))
  const party = computed(() => characters.value.filter(character => character.userId === userId.value))
  const activeCharacterId = ref<string | null>(null)
  const activeCharacter = computed(() => characters.value.filter(character => character.id === activeCharacterId.value)[0])

  watch(party, (partyCharacter) => {
    if(partyCharacter.length > 0) {
      activeCharacterId.value = partyCharacter[0].id
    }
  })

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

  const formattedPlayers = computed(() => {
    return players.value.map((player) => {
      return {
        ...player,
        ...characterTemplates.value.find(character => character.key === player.character),
      }
    })
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
  function addCharacter(character: Partial<Character>) {
    if (!character.key) {
      console.error('Character key is required')
      return
    }

    const template = characterTemplates.value.find(t => t.key === character.key)
    if (!template) {
      console.error('Character template not found')
      return
    }

    // Merge classData properties into the template for HP calculation
    const classData = template.classData
    if (!classData || typeof classData.baseHitPoints !== 'number' || typeof classData.hpPerLevel !== 'number') {
      console.error('Class data missing baseHitPoints or hpPerLevel')
      return
    }

    // Ensure all stats are present and valid
    const baseStats = template.stats
    const inputStats = character.stats as Partial<typeof baseStats> ?? {}
    const stats: typeof baseStats = {
      str: inputStats.str ?? baseStats.str,
      dex: inputStats.dex ?? baseStats.dex,
      con: inputStats.con ?? baseStats.con,
      int: inputStats.int ?? baseStats.int,
      wis: inputStats.wis ?? baseStats.wis,
      cha: inputStats.cha ?? baseStats.cha,
    }

    const modifiers = calculateAbilityModifiers(stats)
    const constitutionModifier = modifiers.constitution 
    const maxHP = calculateHitPoints(classData.baseHitPoints, classData.hpPerLevel, character.level ?? 1, constitutionModifier)

    const actions = actionStore.getActionsByFilters({
      source: 'common',
    })
    const actionsState = actions.reduce((acc, action) => {
      acc[action.slug] = {
        uses: 0,
      }
      return acc
    }, {} as Record<string, { uses: number }>)
    const newCharacter: Character = {
      id: MathUtils.generateUUID(),
      name: character.name ?? 'New Character',
      key: character.key, // Ensure key is always defined
      userId: userId.value,
      custom: true,
      maxHP,
      currentHP: maxHP,
      level: character.level ?? 1,
      stats,
      modifiers,
      position: character.position,
      weapon: character.weapon,
      actions: actions.map(action => action.slug),
      actionsState: actionsState,
    }

    characters.value = [...characters.value, newCharacter]
  }

  /**
   * Update a character's stats and recalculate modifiers and HP
   * @param characterId The ID of the character to update
   * @param newStats The new stats object
   */
  function updateCharacterStats(characterId: string, newStats: Partial<Character['stats']> = {}) {
    const characterIndex = characters.value.findIndex(c => c.id === characterId)
    if (characterIndex === -1) return

    const character = characters.value[characterIndex]
    const template = characterTemplates.value.find(t => t.key === character.key)
    if (!template) return

    // Ensure all stats are present and valid
    const baseStats = character.stats ?? template.stats
    const mergedStats = {
      str: newStats.str ?? baseStats.str,
      dex: newStats.dex ?? baseStats.dex,
      con: newStats.con ?? baseStats.con,
      int: newStats.int ?? baseStats.int,
      wis: newStats.wis ?? baseStats.wis,
      cha: newStats.cha ?? baseStats.cha,
    }

    // Calculate new modifiers
    const newModifiers = calculateAbilityModifiers(mergedStats)
    
    // Check if constitution modifier changed
    const oldConModifier = character.modifiers?.constitution ?? 0
    const newConModifier = newModifiers.constitution
    
    // Only recalculate HP if constitution modifier changed
    if (oldConModifier !== newConModifier) {
      const newMaxHP = calculateHitPoints(template, character.level ?? 1, newConModifier)
      const hpDifference = newMaxHP - character.maxHP
      
      // Update character with new stats, modifiers and HP
      characters.value[characterIndex] = {
        ...character,
        stats: mergedStats,
        modifiers: newModifiers,
        maxHP: newMaxHP,
        currentHP: Math.min(character.currentHP + hpDifference, newMaxHP), // Adjust current HP by the difference
      }
    } else {
      // Just update stats and modifiers if constitution didn't change
      characters.value[characterIndex] = {
        ...character,
        stats: mergedStats,
        modifiers: newModifiers,
      }
    }
  }

  /**
   * Level up a character
   * @param characterId The ID of the character to level up
   */
  function levelUpCharacter(characterId: string) {
    const characterIndex = characters.value.findIndex(c => c.id === characterId)
    if (characterIndex === -1) return

    const character = characters.value[characterIndex]
    const template = characterTemplates.value.find(t => t.key === character.key)
    if (!template) return

    // Calculate new HP
    const constitutionModifier = character.modifiers?.constitution ?? 0
    const newLevel = (character.level ?? 1) + 1
    const newMaxHP = calculateHitPoints(template, newLevel, constitutionModifier)
    
    // Update character with new level and HP
    characters.value[characterIndex] = {
      ...character,
      level: newLevel,
      maxHP: newMaxHP,
      currentHP: newMaxHP, // Restore HP to max on level up
    }
  }

  function removeCharacter(character: Character) {
    characters.value = characters.value.filter(c => c.id !== character.id)
  }

  function removeAllCharacters() {
    characters.value = []
  }

  function setCurrentCharacterPosition(position: Vector3) {
    if (!activeCharacterId.value) { return }
    const character = characters.value.find(c => c.id === activeCharacterId.value)
    if (!character) { return }
    character.position = [position.x, position.y, position.z]
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

  function removePlayer(player: Player) {
    players.value = players.value.filter(p => p.id !== player.id)
  }

  function removeAllPlayers() {
    players.value = []
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
  function updateItemState(itemId: string, state: Record<string, unknown>) {
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
  function handleRemoteItemUpdate(itemId: string, state: Record<string, unknown>, position?: [number, number, number]) {
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

  function clearGame() {
    removeAllPlayers()
    removeAllCharacters()
    // removeAllItems()
    setCurrentLevel('test-level-a')
  }

  return {
    // Players
    players,
    formattedPlayers,
    activePlayer,
    addPlayer,
    setPlayerPosition,
    // Characters
    characterTemplates,
    loadCharacterTemplates,
    characters,
    getCharacterById,
    customCharacters,
    party,
    activeCharacterId,
    activeCharacter,
    addCharacter,
    removeCharacter,
    setCurrentCharacterPosition,
    // Items
    items,
    setItem,
    updateItemState,
    updateItemPosition,
    removeItem,
    handleRemoteItemUpdate,
    // Levels
    levels,
    setCurrentLevel,
    currentLevelSlug,
    loadLevels,
    // Mode
    mode,
    isMultiplayer,
    // Actions
    removePlayer,
    removeAllPlayers,
    setMode,
    currentLevel,
    getItemById,
    isDebug,
    // Actions
    init,
    clearGame,
    levelUpCharacter,
    updateCharacterStats,
  }
}, {
  persist: {
    storage: piniaPluginPersistedstate.sessionStorage(),
  },
})
