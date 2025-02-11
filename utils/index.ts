import { type Bone, type Object3D, type SkinnedMesh } from 'three'

/**
 * Finds a bone by name in a 3D model's skeleton
 * @param object - The 3D model to search in
 * @param name - The name of the bone to find
 * @returns The found bone or null if not found
 */
export const findBoneByName = (object: Object3D, name: string): Bone | null => {
  let bone: Bone | null = null
  
  object.traverse((child) => {
    if (child.type === 'SkinnedMesh') {
      const skinnedMesh = child as SkinnedMesh
      bone = skinnedMesh.skeleton.bones.find(b => b.name === name) || null
    }
  })
  
  return bone
}