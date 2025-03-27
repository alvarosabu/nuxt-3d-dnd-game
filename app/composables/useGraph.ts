// useGraph creates two flat objects collections for nodes and materials

import { Material, Object3D } from 'three'

export const useGraph = (object: Object3D) => {
  const nodes: Object3D[] = []
  const materials: Material[] = []

  const traverse = (object: Object3D) => {
    if (object instanceof Object3D) {
      nodes.push(object)
    }
    if (object instanceof Material) {
      materials.push(object)
    }
    object.children.forEach(traverse)
  }
  traverse(object)
  return { nodes, materials }
}
