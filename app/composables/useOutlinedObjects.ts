import { type Object3D, SkinnedMesh } from 'three'
import { shallowRef } from 'vue'

/**
 * Composable for managing outlined objects in the scene with better performance
 * using shallowRef to avoid deep reactivity on Three.js objects
 */
const outlinedObjects = shallowRef<Object3D[]>([])
export function useOutlinedObjects() {
  /**
   * Add a single object to the outlined objects array
   */
  function outlineObject(object: Object3D | null) {
    if (!object) { return }

    if (object.children.length > 0) {
      object.children.forEach((child) => {
        outlineObject(child)
      })
      return
    }

    const existingObject = outlinedObjects.value.find(obj => obj.uuid === object.uuid)
    if (!existingObject) {
      outlinedObjects.value = [...outlinedObjects.value, object]
    }
  }

  /**
   * Remove a single object from the outlined objects array
   */
  function removeObjectOutline(object: Object3D | null) {
    if (!object) { return }

    if (object.children.length > 0) {
      object.children.forEach((child) => {
        removeObjectOutline(child)
      })
      return
    }

    outlinedObjects.value = outlinedObjects.value.filter(obj => obj.uuid !== object.uuid)
  }

  /**
   * Add character's children to outlined objects if they're not already there
   */
  function outlineCharacter(character: Object3D | null) {
    if (!character) { return }

    character.children.forEach((child) => {
      if (child instanceof SkinnedMesh) {
        outlineObject(child)
      }
    })
  }

  /**
   * Remove character's children from outlined objects
   */
  function removeCharacterOutline(character: Object3D | null) {
    if (!character) { return }

    character.children.forEach((child) => {
      if (child instanceof SkinnedMesh) {
        removeObjectOutline(child)
      }
    })
  }

  return {
    outlinedObjects,
    outlineObject,
    removeObjectOutline,
    outlineCharacter,
    removeCharacterOutline,
  }
}
