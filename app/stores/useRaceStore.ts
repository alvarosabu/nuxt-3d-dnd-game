import { defineStore } from 'pinia'
import type { Race } from '~/types'

/**
 * Pinia store for managing static race data.
 * Loaded once per session, not persisted.
 */
export const useRaceStore = defineStore('race', () => {
  // All loaded races
  const races = ref<Race[]>([])

  /**
   * Loads all races from the content collection.
   * Should be called once at app start or when needed.
   */
  async function loadRaces(): Promise<void> {
    // Uses Nuxt Content's queryCollection to fetch all races
    races.value = await queryCollection('races').all()
  }

  /**
   * Finds a race by its slug.
   * @param slug - The race slug
   * @returns The race object or undefined
   */
  function getRaceBySlug(slug: string): Race | undefined {
    return races.value.find(race => race.slug === slug)
  }

  // Expose state and methods
  return {
    races,
    loadRaces,
    getRaceBySlug,
  }
})
