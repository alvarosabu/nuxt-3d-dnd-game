import { defineStore } from 'pinia'
import type { Action, ActionResource } from '~/types'

/**
 * Pinia store for managing static action and action resource data.
 * Loaded once per session, not persisted.
 */
export const useActionStore = defineStore('actions', () => {
  // All loaded actions
  const actions = ref<Action[]>([])
  // All loaded action resources
  const actionResources = ref<ActionResource[]>([])

  /**
   * Loads all actions from the content collection.
   * Should be called once at app start or when needed.
   */
  async function loadActions(): Promise<void> {
    actions.value = (await queryCollection('actions').all()).flatMap(action => action.meta.body)
  }

  /**
   * Loads all action resources from the content collection.
   */
  async function loadActionResources(): Promise<void> {
    actionResources.value = (await queryCollection('actionResources').all()).flatMap(actionResource => actionResource.meta.body)
  }

  /**
   * Finds an action by its slug.
   * @param slug - The action slug
   * @returns The action object or undefined
   */
  function getActionBySlug(slug: string): Action | undefined {
    return actions.value.find(action => action.slug === slug)
  }

  /**
   * Filters actions by category.
   * @param category - The category to filter by
   * @returns Array of Action objects matching the category
   */
  function getActionsByCategory(category: string): Action[] {
    return actions.value.filter(action => action.category === category)
  }

  /**
   * Filters actions by source (class, race, etc).
   * @param source - The source to filter by
   * @returns Array of Action objects matching the source
   */
  function getActionsBySource(source: string): Action[] {
    return actions.value.filter(action => action.source === source)
  }

  /**
   * Filters actions by cost (action resource).
   * @param resourceSlug - The resource slug to filter by
   * @returns Array of Action objects that cost the specified resource
   */
  function getActionsByResource(resourceSlug: string): Action[] {
    return actions.value.filter(action => action.cost.includes(resourceSlug))
  }

  /**
   * Filters actions by multiple criteria.
   * @param filters - Object containing filter criteria
   * @returns Array of Action objects matching all criteria
   */
  function getActionsByFilters(filters: {
    category?: string
    source?: string
    resource?: string
    tags?: string[]
  }): Action[] {
    return actions.value.filter(action => {
      if (filters.category && action.category !== filters.category) return false
      if (filters.source && action.source !== filters.source) return false
      if (filters.resource && !action.cost.includes(filters.resource)) return false
      if (filters.tags && !filters.tags.every(tag => action.tags?.includes(tag))) return false
      return true
    })
  }

  /**
   * Gets all available action categories.
   * @returns Array of unique category strings
   */
  function getAvailableCategories(): string[] {
    return [...new Set(actions.value.map(action => action.category))]
  }

  /**
   * Gets all available action sources.
   * @returns Array of unique source strings
   */
  function getAvailableSources(): string[] {
    return [...new Set(actions.value.map(action => action.source).filter(Boolean))]
  }

  function getActionResourceBySlug(slug: string): ActionResource | undefined {
    return actionResources.value.find(resource => resource.slug === slug)
  }

  function getActionResourceIcon(slug: string): string | undefined {
    return actionResources.value.find(resource => resource.slug === slug)?.icon
  }

  // Expose state and methods
  return {
    actions,
    actionResources,
    loadActions,
    loadActionResources,
    getActionBySlug,
    getActionsByCategory,
    getActionsBySource,
    getActionsByResource,
    getActionsByFilters,
    getAvailableCategories,
    getAvailableSources,
    getActionResourceBySlug,
    getActionResourceIcon,
  }
}) 