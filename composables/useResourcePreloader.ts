import type { Texture } from 'three'
import { AudioLoader, Group, TextureLoader } from 'three'
import type { GLTF } from 'three-stdlib'

type ResourceType = 'model' | 'texture' | 'audio' | 'environment'

interface Resource {
  type: ResourceType
  path: string
  key: string
}

interface ResourceCache {
  models: Map<string, GLTF>
  textures: Map<string, Texture>
  audio: Map<string, AudioBuffer>
  environment: Map<string, any> // For environment maps, HDRIs, etc.
}

// Create a singleton cache outside the composable
const globalCache = ({
  models: new Map(),
  textures: new Map(),
  audio: new Map(),
  environment: new Map(),
})

// Create singleton loading state
const globalLoading = ref(true)
const globalProgress = ref(0)
const globalStartTime = ref(0)
const globalMinDisplayTime = 500 // 5 seconds minimum display time

export const useResourcePreloader = () => {
  // Use the global cache instead of creating a new one
  const cache = globalCache

  const resources: Resource[] = [
    // Models
    { type: 'model', path: '/models/characters/paladin/Paladin_with_Helmet.glb', key: 'paladin' },
    { type: 'model', path: '/models/characters/paladin/Paladin_Helmet_Storyblok.glb', key: 'paladin-storyblok' },
    { type: 'model', path: '/models/characters/vampire/Vampire.glb', key: 'vampire' },
    { type: 'model', path: '/models/characters/druid/Druid.glb', key: 'druid' },
    { type: 'model', path: '/models/characters/paladin/paladin_hammer.gltf', key: 'hammer' },
    { type: 'model', path: '/models/characters/artificer/Artificer.glb', key: 'artificer' },
    { type: 'model', path: '/models/characters/rogue/Rogue.glb', key: 'rogue' },
    { type: 'model', path: '/models/characters/wizard/Wizard.glb', key: 'wizard' },
    { type: 'model', path: '/models/characters/warrior/Warrior.glb', key: 'warrior' },
    // Items
    { type: 'model', path: '/models/items/Chest.glb', key: 'chest' },
    // Textures
    { type: 'texture', path: '/models/characters/paladin/paladin_texture_A.png', key: 'paladin-texture-a' },
    { type: 'texture', path: '/models/characters/paladin/paladin_texture_storyblok.png', key: 'paladin-texture-storyblok' },
    // Misc
    { type: 'model', path: '/models/Vue.glb', key: 'vue' },
  ]

  // Loaders
  const textureLoader = new TextureLoader()
  const audioLoader = new AudioLoader()

  const loadResource = async (resource: Resource) => {
    try {
      switch (resource.type) {
        case 'model':
          const result = await useGLTF(resource.path, { draco: true })

          const { scene, animations, nodes, materials } = result
          // Ensure scene is a Group
          if (!(scene instanceof Group)) {
            throw new TypeError('Loaded scene is not a Group')
          }
          cache.models.set(resource.key, { scene, animations, nodes, materials })
          break

        case 'texture':
          const texture = await textureLoader.loadAsync(resource.path)
          cache.textures.set(resource.key, texture)
          break

        case 'audio':
          const audio = await audioLoader.loadAsync(resource.path)
          cache.audio.set(resource.key, audio)
          break

        case 'environment':
          // Handle environment maps, HDRIs, etc.
          break
      }
    }
    catch (error) {
      console.error(`Error loading resource ${resource.key}:`, error)
      throw error
    }
  }

  const preloadResources = async () => {
    const total = resources.length
    let loaded = 0
    globalStartTime.value = Date.now()

    try {
      for (const resource of resources) {
        await loadResource(resource)
        loaded++

        // Calculate real progress
        const realProgress = (loaded / total) * 100

        // Calculate minimum progress based on elapsed time
        const elapsedTime = Date.now() - globalStartTime.value
        const minProgress = Math.min(100, (elapsedTime / globalMinDisplayTime) * 100)

        // Use the higher value between real progress and minimum progress
        globalProgress.value = Math.max(realProgress, minProgress)
      }

      // Ensure minimum display time has passed
      const elapsedTime = Date.now() - globalStartTime.value
      if (elapsedTime < globalMinDisplayTime) {
        await new Promise(resolve => setTimeout(resolve, globalMinDisplayTime - elapsedTime))
      }

      globalLoading.value = false
    }
    catch (error) {
      console.error('Error preloading resources:', error)
      throw error
    }
  }

  const getResource = <T extends keyof ResourceCache>(
    type: T,
    key: string,
  ): NonNullable<ResourceCache[T]['get']> => {
    const resource = cache[type].get(key)
    if (!resource) { throw new Error(`Resource ${key} not found in ${type} cache`) }

    // For models, return a clone to allow multiple instances
    if (type === 'models') {
      return resource
    }

    return resource as any
  }

  return {
    isLoading: readonly(globalLoading),
    progress: readonly(globalProgress),
    preloadResources,
    getResource,
  }
}
