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
  rotation: number[] // [x, y, z, w]
  // Character state
  isMoving: boolean
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  isRunning: boolean
  isJumping: boolean
  isGrounded: boolean
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
