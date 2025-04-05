import gltfLoader from "@todde.tv/gltf-type-toolkit/gltf-loader";
import gltfPath from "./lights.gltf";

const path = Symbol();

export const lightsScene = {
  [path]: [0],
  torch_mounted076: {
    [path]: [0, 0],
  },
  torch_mounted077: {
    [path]: [0, 1],
  },
  torch_mounted078: {
    [path]: [0, 2],
  },
  torch_mounted079: {
    [path]: [0, 3],
  },
  torch_mounted080: {
    [path]: [0, 4],
  },
  torch_mounted081: {
    [path]: [0, 5],
  },
  torch_mounted082: {
    [path]: [0, 6],
  },
  torch_mounted083: {
    [path]: [0, 7],
  },
  torch_mounted084: {
    [path]: [0, 8],
  },
  torch_mounted085: {
    [path]: [0, 9],
  },
  torch_mounted086: {
    [path]: [0, 10],
  },
  torch_mounted087: {
    [path]: [0, 11],
  },
  torch_mounted088: {
    [path]: [0, 12],
  },
  torch_mounted089: {
    [path]: [0, 13],
  },
  torch_mounted090: {
    [path]: [0, 14],
  },
  torch_mounted091: {
    [path]: [0, 15],
  },
  torch_mounted092: {
    [path]: [0, 16],
  },
  torch_mounted093: {
    [path]: [0, 17],
  },
  torch_mounted094: {
    [path]: [0, 18],
  },
  torch_mounted095: {
    [path]: [0, 19],
  },
  torch_mounted096: {
    [path]: [0, 20],
  },
  torch_mounted097: {
    [path]: [0, 21],
  },
  torch_mounted098: {
    [path]: [0, 22],
  },
  torch_mounted099: {
    [path]: [0, 23],
  },
  torch_mounted100: {
    [path]: [0, 24],
  },
  torch_mounted101: {
    [path]: [0, 25],
  },
  torch_mounted102: {
    [path]: [0, 26],
  },
  torch_mounted103: {
    [path]: [0, 27],
  },
  torch_mounted104: {
    [path]: [0, 28],
  },
  torch_mounted105: {
    [path]: [0, 29],
  },
  torch_mounted106: {
    [path]: [0, 30],
  },
  torch_mounted107: {
    [path]: [0, 31],
  },
  torch_mounted108: {
    [path]: [0, 32],
  },
  torch_mounted109: {
    [path]: [0, 33],
  },
  torch_mounted110: {
    [path]: [0, 34],
  },
  torch_mounted111: {
    [path]: [0, 35],
  },
  torch_mounted112: {
    [path]: [0, 36],
  },
  torch_mounted113: {
    [path]: [0, 37],
  },
  torch_mounted114: {
    [path]: [0, 38],
  },
  torch_mounted115: {
    [path]: [0, 39],
  },
  torch_mounted116: {
    [path]: [0, 40],
  },
  torch_mounted117: {
    [path]: [0, 41],
  },
  torch_mounted118: {
    [path]: [0, 42],
  },
  torch_mounted119: {
    [path]: [0, 43],
  },
  torch_mounted120: {
    [path]: [0, 44],
  },
  torch_mounted121: {
    [path]: [0, 45],
  },
  torch_mounted122: {
    [path]: [0, 46],
  },
  torch_mounted123: {
    [path]: [0, 47],
  },
  torch_mounted124: {
    [path]: [0, 48],
  },
  torch_mounted125: {
    [path]: [0, 49],
  },
  torch_mounted126: {
    [path]: [0, 50],
  },
  torch_mounted127: {
    [path]: [0, 51],
  },
  torch_mounted128: {
    [path]: [0, 52],
  },
  torch_mounted129: {
    [path]: [0, 53],
  },
  torch_mounted130: {
    [path]: [0, 54],
  },
  torch_mounted131: {
    [path]: [0, 55],
  },
  torch_mounted132: {
    [path]: [0, 56],
  },
  torch_mounted133: {
    [path]: [0, 57],
  },
  torch_mounted134: {
    [path]: [0, 58],
  },
  torch_mounted135: {
    [path]: [0, 59],
  },
  torch_mounted136: {
    [path]: [0, 60],
  },
  torch_mounted137: {
    [path]: [0, 61],
  },
  torch_mounted138: {
    [path]: [0, 62],
  },
  torch_mounted139: {
    [path]: [0, 63],
  },
  torch_mounted140: {
    [path]: [0, 64],
  },
  torch_mounted141: {
    [path]: [0, 65],
  },
  torch_mounted142: {
    [path]: [0, 66],
  },
  torch_mounted143: {
    [path]: [0, 67],
  },
  torch_mounted144: {
    [path]: [0, 68],
  },
  torch_mounted145: {
    [path]: [0, 69],
  },
  torch_mounted146: {
    [path]: [0, 70],
  },
  torch_mounted147: {
    [path]: [0, 71],
  },
  torch_mounted148: {
    [path]: [0, 72],
  },
  torch_mounted149: {
    [path]: [0, 73],
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
