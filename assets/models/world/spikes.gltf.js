import gltfLoader from "@todde.tv/gltf-type-toolkit/gltf-loader";
import gltfPath from "./spikes.gltf";

const path = Symbol();

export const spikesScene = {
  [path]: [0],
  floor_tile_big_spikes003: {
    [path]: [0, 0],
    spikes003: {
      [path]: [0, 0, 0],
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
