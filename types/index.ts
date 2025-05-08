export interface Character {
  id: string
  name: string
  key: string
  /**
   * The user ID of the character
   */
  userId: string
  /**
   * Whether the character is custom or companion
   * @default false
   */
  custom?: boolean,
  position?: number[] // [x, y, z]
  level?: number
  weapon?: string,
  /**
   * Maximum hit points of the character
   */
  maxHP: number
  /**
   * Current hit points of the character
   */
  currentHP: number
  /**
   * Character's ability scores
   */
  stats?: {
    str: number
    dex: number
    con: number
    int: number
    wis: number
    cha: number
  }
  /**
   * Character's ability modifiers
   */
  modifiers?: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  },
  /**
   * List of action slugs that this character can perform
   * These are loaded from the character's class, race, and other sources
   */
  actions: string[],
  actionsState: Record<string, {
    uses: number,
  }>
}

export interface Player {
  // Base data
  id: string
  name: string
  status?: 'offline' | 'lobby' | 'in-game'

  // Lobby related
  lobbyId?: string
  isHost?: boolean
  ready?: boolean
}

export interface Lobby {
  id: string
  name: string
  hostId: string | undefined
  hostName: string | undefined
  playersIds: string[]
  maxPlayers: number
  status: 'waiting' | 'playing'
  createdAt: string
}

export interface CharacterTemplate {
  name: string
  key: string
  model: string
  title: string
  originName: string
  description: string
  portrait: string
  race: string
  class: string
  baseHitPoints: number
  hpPerLevel: number
  hitDie: string
  primaryAbility: string
  spellCastingAbility: string
  hasGod: boolean
  raceData?: Race
  classData?: Class
  stats: {
    str: number
    dex: number
    con: number
    int: number
    wis: number
    cha: number
  }
  spellsData?: Spell[]
  cantripsData?: Cantrip[]
}

export interface GameState {
  players: Player[]
  activePlayer: Player | null
  characterTemplates: CharacterTemplate[]
  characters: Character[]
  mode: 'single' | 'multiplayer'
}

export interface Race {
  name: string
  slug: string
  description: string
  features: string[]
}

export interface Class {
  name: string
  slug: string
  icon: string
  description: string
  hitDie: string
  primaryAbility: string
  savingThrows: string[]
  features: string[]
  proficiencies: {
    armor: string[]
    weapons: string[]
    skills: {
      choose: number
      from: string[]
    }
  }
  spells: string[]
  cantrips: string[]
  baseHitPoints: number
  hpPerLevel: number
}

export interface Spell {
  name: string
  slug: string
  icon: string
  description: string
  level: number
  school: string
}

export interface Cantrip {
  name: string
  slug: string
  icon: string
  description: string
  school: string
}

export interface Session {
  id: string
  players: Player[]
  hostId: string
}

export interface ContextMenuItem {
  label: string
  icon?: string
  action?: () => void
}

/**
 * Arguments for the dice roll modal
 */
export interface DiceRollModalArgs {
  title: string
  subtitle?: string
  difficultyClass?: number
  diceType: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'
  modifiers?: { name: string, value: number, icon?: string }[]
  skillCheck?: {
    ability: 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'
    skill: string
  }
  onSuccess?: () => void
  onFailure?: () => void
}

export interface UIState {
  contextMenu: {
    enabled: boolean
    isOpen: boolean
    items: ContextMenuItem[]
  }
  diceRollModal: {
    isOpen: boolean
    args?: DiceRollModalArgs
  }
}

/**
 * Base interface for game items like chests, doors, etc.
 */
export interface GameItem {
  id: string
  type: 'chest' | 'door' // Add more types as needed
  position: [number, number, number]
  rotation?: [number, number, number]
  state: Record<string, unknown>
}

/**
 * Interface specifically for chest items
 */
export interface ChestItem extends GameItem {
  type: 'chest'
  state: {
    isLocked: boolean
    isOpen: boolean
  }
}

/**
 * Interface for level ambient settings
 */
export interface LevelEnvironment {
  fogColor: string
  ambientLight: number
  background: 'sunset' | 'dawn' | 'night' | 'day'
  blur: number
}

/**
 * Interface for level grid settings
 */
export interface LevelGrid {
  size: [number, number]
  cellSize: number
}

/**
 * Interface for game levels
 */
export interface Level {
  id: string
  slug: string
  name: string
  environment: LevelEnvironment
  grid: LevelGrid
  items: GameItem[]
}

export interface Subclass {
  name: string
  slug: string
  class: string // parent class slug
  description: string
  icon: string
  features: string[]
}

export interface Progression {
  class: string
  subclass?: string
  level: number
  passivesAdded: string[]
  passivesRemoved: string[]
  boosts: string[]
  allowImprovement: boolean
  selectors: string[]
  isMulticlass: boolean
}

/**
 * Represents an action resource (like Action Point, Bonus Action, etc)
 */
export interface ActionResource {
  name: string
  slug: string
  description: string
  icon: string
  color: string
  replenishType: 'turn' | 'short-rest' | 'long-rest' | 'never'
}

/**
 * Represents a game action that can be performed
 */
export interface Action {
  name: string
  slug: string
  icon: string
  description: string
  kbds: string[]
  cost: string // Array of action resource slugs
  category: 'target' | 'shout' | 'zone' | 'projectile'
  source: 'common' | 'class' | 'racial' | 'weapon' | 'spell' | 'situational'
  tags?: string[] // For filtering/searching
  usedThisTurn?: boolean // Whether the action has been used this turn
  highlighted?: boolean // Whether the action is highlighted
}
