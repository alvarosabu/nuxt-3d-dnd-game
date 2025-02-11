import { inject, provide, reactive, ref, shallowRef } from 'vue'
import type { Character, GameState } from '~/types'

const GameStateSymbol = Symbol('GameState')

export const createGameState = () => {
  const gameState = reactive<GameState>({
    players: [],
    activePlayer: null,
    characterTemplates: [],
    characters: [],
  })

  const saveGame = () => {
    localStorage.setItem('gameState', JSON.stringify(gameState))
  }

  const loadGame = () => {
    const saved = localStorage.getItem('gameState')
    if (saved) {
      Object.assign(gameState, JSON.parse(saved))
    }
  }

  const loadCharacterTemplates = async () => {
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

    // Join the data
    gameState.characterTemplates = characterTemplates.map(character => ({
      ...character,
      raceData: raceMap.get(character.race),
      classData: classMap.get(character.class),
      spellsData: character.spells.map(slug => spellMap.get(slug)).filter(Boolean),
      cantripsData: character.cantrips.map(slug => cantripMap.get(slug)).filter(Boolean),
    }))
  }

  async function init() {
    await Promise.all([loadCharacterTemplates()])
  }

  const ctx = {
    gameState,
    saveGame,
    loadGame,
    loadCharacterTemplates,
    init,
  }

  provide(GameStateSymbol, ctx)

  return ctx
}

export const useGameState = () => {
  const state = inject(GameStateSymbol)
  if (!state) { throw new Error('Game state not provided') }
  return state
}
