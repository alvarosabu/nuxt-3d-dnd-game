import { defineStore } from 'pinia'
import type { Class, Subclass, Progression } from '~/types'

/**
 * Pinia store for managing static class, subclass, and progression data.
 * Loaded once per session, not persisted.
 */
export const useClassStore = defineStore('class', () => {
  // All loaded classes
  const classes = ref<Class[]>([])
  // All loaded subclasses
  const subclasses = ref<Subclass[]>([])
  // All loaded progressions
  const progressions = ref<Progression[]>([])

  /**
   * Loads all classes from the content collection.
   * Should be called once at app start or when needed.
   */
  async function loadClasses(): Promise<void> {
    classes.value = await queryCollection('classes').all()
  }

  /**
   * Loads all subclasses from the content collection.
   */
  async function loadSubclasses(): Promise<void> {
    subclasses.value = await queryCollection('subclasses').all()
  }

  /**
   * Loads all progressions from the content collection.
   */
  async function loadProgressions(): Promise<void> {
    progressions.value = await queryCollection('progressions').all()
  }

  /**
   * Finds a class by its slug.
   * @param slug - The class slug
   * @returns The class object or undefined
   */
  function getClassBySlug(slug: string): Class | undefined {
    return classes.value.find(cls => cls.slug === slug)
  }

  /**
   * Finds all subclasses for a given class slug.
   * @param classSlug - The parent class slug
   * @returns Array of Subclass objects
   */
  function getSubclassesByClassSlug(classSlug: string): Subclass[] {
    return subclasses.value.filter(sub => sub.class === classSlug)
  }

  /**
   * Finds all progressions for a given class slug (excluding subclass-specific progressions).
   * @param classSlug - The class slug
   * @returns Array of Progression objects
   */
  function getProgressionForClass(classSlug: string): Progression[] {
    return progressions.value.filter(p => p.class === classSlug && !p.subclass)
  }

  /**
   * Finds all progressions for a given class and subclass slug.
   * @param classSlug - The class slug
   * @param subclassSlug - The subclass slug
   * @returns Array of Progression objects
   */
  function getProgressionForSubclass(classSlug: string, subclassSlug: string): Progression[] {
    return progressions.value.filter(p => p.class === classSlug && p.subclass === subclassSlug)
  }

  // Expose state and methods
  return {
    classes,
    subclasses,
    progressions,
    loadClasses,
    loadSubclasses,
    loadProgressions,
    getClassBySlug,
    getSubclassesByClassSlug,
    getProgressionForClass,
    getProgressionForSubclass,
  }
}) 