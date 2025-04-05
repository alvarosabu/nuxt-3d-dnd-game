import gltfLoader from "@todde.tv/gltf-type-toolkit/gltf-loader";
import gltfPath from "./visual_blocker.gltf";

const path = Symbol();

export const visual_blockerScene = {
  [path]: [0],
  room7001: {
    [path]: [0, 0],
  },
  room6001: {
    [path]: [0, 1],
  },
  room5001: {
    [path]: [0, 2],
  },
  room4001: {
    [path]: [0, 3],
  },
  room3001: {
    [path]: [0, 4],
  },
  room2001: {
    [path]: [0, 5],
  },
  room1001: {
    [path]: [0, 6],
  },
  outer001: {
    [path]: [0, 7],
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
