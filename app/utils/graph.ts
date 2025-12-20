import { type TresMaterial, isMesh } from "@tresjs/core"
import type { Mesh, Scene, Object3D } from "three"

export interface TresObjectMap {
  nodes: { [name: string]: TresObject }
  materials: { [name: string]: TresMaterial }
  meshes: { [name: string]: Mesh }
  scene?: Scene
}

export function buildGraph(object: Object3D | TresObject): TresObjectMap {
  const data: TresObjectMap = { nodes: {}, materials: {}, meshes: {} }
  if (object) {
    object.traverse((obj: Object3D) => {
      if (obj.name) { data.nodes[obj.name] = obj }

      if (isMesh(obj)) {
        if (!data.meshes[obj.name]) { data.meshes[obj.name] = obj }

        (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((material) => {
          if (material.name && !data.materials[material.name]) { data.materials[material.name] = material }
        })
      }
    })
  }
  return data
}