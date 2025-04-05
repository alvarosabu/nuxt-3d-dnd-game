import gltfLoader from "@todde.tv/gltf-type-toolkit/gltf-loader";
import gltfPath from "./dungeon.gltf";

const path = Symbol();

export const dungeonScene = {
  [path]: [0],
  dungeon_1: {
    [path]: [0, 0],
    Plane003: {
      [path]: [0, 0, 0],
    },
    Plane003_1: {
      [path]: [0, 0, 1],
    },
    Plane003_2: {
      [path]: [0, 0, 2],
    },
    Plane003_3: {
      [path]: [0, 0, 3],
    },
    Plane003_4: {
      [path]: [0, 0, 4],
    },
    Plane003_5: {
      [path]: [0, 0, 5],
    },
    Plane003_6: {
      [path]: [0, 0, 6],
    },
    Plane003_7: {
      [path]: [0, 0, 7],
    },
    Plane003_8: {
      [path]: [0, 0, 8],
    },
    Plane003_9: {
      [path]: [0, 0, 9],
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
