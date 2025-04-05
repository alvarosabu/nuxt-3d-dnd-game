import gltfLoader from "@todde.tv/gltf-type-toolkit/gltf-loader";
import gltfPath from "./chests.gltf";

const path = Symbol();

export const chestsScene = {
  [path]: [0],
  chest005: {
    [path]: [0, 0],
    chest_lid005: {
      [path]: [0, 0, 0],
    },
  },
  chest006: {
    [path]: [0, 1],
    chest_lid006: {
      [path]: [0, 1, 0],
    },
  },
  chest007: {
    [path]: [0, 2],
    chest_lid007: {
      [path]: [0, 2, 0],
    },
  },
  chest_gold003: {
    [path]: [0, 3],
    chest_gold_lid003: {
      [path]: [0, 3, 0],
    },
  },
};

export async function getNode(spec) {
  let node = { children: (await loadModel()).scenes };
  for (const idx of spec[path]) {
    node = node.children[idx];
  }

  return node;
}

let modelPromise;

function loadModel() {
  if (!modelPromise) {
    modelPromise = gltfLoader.loadAsync(gltfPath);
  }

  return modelPromise;
}
