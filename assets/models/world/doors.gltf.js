import gltfLoader from "@todde.tv/gltf-type-toolkit/gltf-loader";
import gltfPath from "./doors.gltf";

const path = Symbol();

export const doorsScene = {
  [path]: [0],
  wall_doorway009: {
    [path]: [0, 0],
    wall_doorway_door009: {
      [path]: [0, 0, 0],
    },
  },
  wall_doorway010: {
    [path]: [0, 1],
    wall_doorway_door010: {
      [path]: [0, 1, 0],
    },
  },
  wall_doorway011: {
    [path]: [0, 2],
    wall_doorway_door011: {
      [path]: [0, 2, 0],
    },
  },
  wall_doorway012: {
    [path]: [0, 3],
    wall_doorway_door012: {
      [path]: [0, 3, 0],
    },
  },
  wall_doorway013: {
    [path]: [0, 4],
    wall_doorway_door013: {
      [path]: [0, 4, 0],
    },
  },
  wall_doorway014: {
    [path]: [0, 5],
    wall_doorway_door014: {
      [path]: [0, 5, 0],
    },
  },
  wall_doorway015: {
    [path]: [0, 6],
    wall_doorway_door015: {
      [path]: [0, 6, 0],
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
