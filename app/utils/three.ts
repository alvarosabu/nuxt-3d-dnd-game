import type { Object3D } from 'three'

/**
 * Find the parent rig from a character part by traversing up the object hierarchy
 * @param object The object to find the rig from
 * @returns The parent rig object
 */
export function findCharacterRig(object: Object3D): Object3D {
  let characterRig = object
  while (characterRig.parent && !characterRig.name?.includes('Rig')) {
    characterRig = characterRig.parent
  }
  return characterRig
}
