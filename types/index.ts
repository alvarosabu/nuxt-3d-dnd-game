
export interface Character {
  id: string
  name: string
  description: string
  image: string
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

  // Game related
  character?: string
  characterName?: string
  position: number[] // [x, y, z]
  weapon?: string
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
  description: string
  race: string
  class: string
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
