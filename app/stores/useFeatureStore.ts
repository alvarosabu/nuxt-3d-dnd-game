import { defineStore } from 'pinia'

// Define the Feature type to match the features collection schema
export interface Feature {
  name: string
  slug: string
  description: string
  source: string
  mechanics: {
    bonus: string
  }
}

/**
 * Pinia store for managing static feature data.
 * Loaded once per session, not persisted.
 */
export const useFeatureStore = defineStore('feature', () => {
  // All loaded features
  const features = ref<Feature[]>([])

  /**
   * Loads all features from the content collection.
   * Should be called once at app start or when needed.
   */
  async function loadFeatures(): Promise<void> {
    // Uses Nuxt Content's queryCollection to fetch all features
    features.value = await queryCollection('features').all()
  }

  /**
   * Finds a feature by its slug.
   * @param slug - The feature slug
   * @returns The feature object or undefined
   */
  function getFeatureBySlug(slug: string): Feature | undefined {
    return features.value.find(feature => feature.slug === slug)
  }

  // Expose state and methods
  return {
    features,
    loadFeatures,
    getFeatureBySlug,
  }
}) 