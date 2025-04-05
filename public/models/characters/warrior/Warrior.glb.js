import gltfLoader from "@todde.tv/gltf-type-toolkit/gltf-loader";
import gltfPath from "./Warrior.glb";

const path = Symbol();

export const SceneScene = {
  [path]: [0],
  Rig: {
    [path]: [0, 0],
    Arms_Base: {
      [path]: [0, 0, 0],
    },
    Ear_Pointy_Straight: {
      [path]: [0, 0, 1],
    },
    Earing_TwoRings_Left: {
      [path]: [0, 0, 2],
    },
    Eyebrows_Thick: {
      [path]: [0, 0, 3],
    },
    Eyes_Base: {
      [path]: [0, 0, 4],
    },
    Hair_EyriePeak: {
      [path]: [0, 0, 5],
    },
    Head_Male: {
      [path]: [0, 0, 6],
    },
    Horns_Ruin_Curves: {
      [path]: [0, 0, 7],
    },
    Nose_Base: {
      [path]: [0, 0, 8],
    },
    ScaleMail_Boots: {
      [path]: [0, 0, 9],
    },
    ScaleMail_Gloves: {
      [path]: [0, 0, 10],
    },
    ScaleMail_Male: {
      [path]: [0, 0, 11],
    },
    root: {
      [path]: [0, 0, 12],
      hips: {
        [path]: [0, 0, 12, 0],
        spine: {
          [path]: [0, 0, 12, 0, 0],
          chest: {
            [path]: [0, 0, 12, 0, 0, 0],
            upperarml: {
              [path]: [0, 0, 12, 0, 0, 0, 0],
              lowerarml: {
                [path]: [0, 0, 12, 0, 0, 0, 0, 0],
                wristl: {
                  [path]: [0, 0, 12, 0, 0, 0, 0, 0, 0],
                  handl: {
                    [path]: [0, 0, 12, 0, 0, 0, 0, 0, 0, 0],
                    handslotl: {
                      [path]: [0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0],
                    },
                  },
                },
              },
            },
            upperarmr: {
              [path]: [0, 0, 12, 0, 0, 0, 1],
              lowerarmr: {
                [path]: [0, 0, 12, 0, 0, 0, 1, 0],
                wristr: {
                  [path]: [0, 0, 12, 0, 0, 0, 1, 0, 0],
                  handr: {
                    [path]: [0, 0, 12, 0, 0, 0, 1, 0, 0, 0],
                    handslotr: {
                      [path]: [0, 0, 12, 0, 0, 0, 1, 0, 0, 0, 0],
                    },
                  },
                },
              },
            },
            head: {
              [path]: [0, 0, 12, 0, 0, 0, 2],
            },
          },
        },
        upperlegl: {
          [path]: [0, 0, 12, 0, 1],
          lowerlegl: {
            [path]: [0, 0, 12, 0, 1, 0],
            footl: {
              [path]: [0, 0, 12, 0, 1, 0, 0],
              toesl: {
                [path]: [0, 0, 12, 0, 1, 0, 0, 0],
              },
            },
          },
        },
        upperlegr: {
          [path]: [0, 0, 12, 0, 2],
          lowerlegr: {
            [path]: [0, 0, 12, 0, 2, 0],
            footr: {
              [path]: [0, 0, 12, 0, 2, 0, 0],
              toesr: {
                [path]: [0, 0, 12, 0, 2, 0, 0, 0],
              },
            },
          },
        },
      },
      kneeIKl: {
        [path]: [0, 0, 12, 1],
      },
      control-toe-rolll: {
        [path]: [0, 0, 12, 2],
        control-heel-rolll: {
          [path]: [0, 0, 12, 2, 0],
          control-foot-rolll: {
            [path]: [0, 0, 12, 2, 0, 0],
            heelIKl: {
              [path]: [0, 0, 12, 2, 0, 0, 0],
            },
            IK-footl: {
              [path]: [0, 0, 12, 2, 0, 0, 1],
            },
          },
          IK-toel: {
            [path]: [0, 0, 12, 2, 0, 1],
          },
        },
      },
      kneeIKr: {
        [path]: [0, 0, 12, 3],
      },
      control-toe-rollr: {
        [path]: [0, 0, 12, 4],
        control-heel-rollr: {
          [path]: [0, 0, 12, 4, 0],
          control-foot-rollr: {
            [path]: [0, 0, 12, 4, 0, 0],
            heelIKr: {
              [path]: [0, 0, 12, 4, 0, 0, 0],
            },
            IK-footr: {
              [path]: [0, 0, 12, 4, 0, 0, 1],
            },
          },
          IK-toer: {
            [path]: [0, 0, 12, 4, 0, 1],
          },
        },
      },
      elbowIKl: {
        [path]: [0, 0, 12, 5],
      },
      handIKl: {
        [path]: [0, 0, 12, 6],
      },
      elbowIKr: {
        [path]: [0, 0, 12, 7],
      },
      handIKr: {
        [path]: [0, 0, 12, 8],
      },
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
