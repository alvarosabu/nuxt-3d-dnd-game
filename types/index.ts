import type { OriginsCollectionItem } from '@nuxt/content'
import type { Vector3 } from 'three'

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
  proficiencies: {
    weapons: string[]
    armor: string[]
    skills: string[]
  }
  spells: string[]
  cantrips: string[]
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

export interface DiceRollModalArgs {
  title?: string
  subtitle?: string
  difficultyClass?: number
  diceType?: 4 | 6 | 8 | 10 | 12 | 20
  modifiers?: {
    name: string
    value: number
    icon?: string
  }[]
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
  state: Record<string, any>
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
export interface LevelAmbient {
  light: number
  environment: 'sunset' | 'dawn' | 'night' | 'day'
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
  ambient: LevelAmbient
  grid: LevelGrid
  items: GameItem[]
}
