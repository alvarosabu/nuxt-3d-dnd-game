import gltfLoader from "@todde.tv/gltf-type-toolkit/gltf-loader";
import gltfPath from "./Paladin.glb";

const path = Symbol();

export const SceneScene = {
  [path]: [0],
  Rig: {
    [path]: [0, 0],
    Paladin_ArmLeft: {
      [path]: [0, 0, 0],
      Paladin_ArmLeft_1: {
        [path]: [0, 0, 0, 0],
      },
      Paladin_ArmLeft_2: {
        [path]: [0, 0, 0, 1],
      },
    },
    Paladin_ArmRight: {
      [path]: [0, 0, 1],
      Paladin_ArmRight_1: {
        [path]: [0, 0, 1, 0],
      },
      Paladin_ArmRight_2: {
        [path]: [0, 0, 1, 1],
      },
    },
    Paladin_Body: {
      [path]: [0, 0, 2],
      Paladin_Body_1: {
        [path]: [0, 0, 2, 0],
      },
      Paladin_Body_2: {
        [path]: [0, 0, 2, 1],
      },
    },
    Paladin_Head: {
      [path]: [0, 0, 3],
    },
    Paladin_LegLeft: {
      [path]: [0, 0, 4],
      Paladin_LegLeft_1: {
        [path]: [0, 0, 4, 0],
      },
      Paladin_LegLeft_2: {
        [path]: [0, 0, 4, 1],
      },
    },
    Paladin_LegRight: {
      [path]: [0, 0, 5],
      Paladin_LegRight_1: {
        [path]: [0, 0, 5, 0],
      },
      Paladin_LegRight_2: {
        [path]: [0, 0, 5, 1],
      },
    },
    root: {
      [path]: [0, 0, 6],
      hips: {
        [path]: [0, 0, 6, 0],
        spine: {
          [path]: [0, 0, 6, 0, 0],
          chest: {
            [path]: [0, 0, 6, 0, 0, 0],
            upperarml: {
              [path]: [0, 0, 6, 0, 0, 0, 0],
              lowerarml: {
                [path]: [0, 0, 6, 0, 0, 0, 0, 0],
                wristl: {
                  [path]: [0, 0, 6, 0, 0, 0, 0, 0, 0],
                  handl: {
                    [path]: [0, 0, 6, 0, 0, 0, 0, 0, 0, 0],
                    handslotl: {
                      [path]: [0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0],
                    },
                  },
                },
              },
            },
            upperarmr: {
              [path]: [0, 0, 6, 0, 0, 0, 1],
              lowerarmr: {
                [path]: [0, 0, 6, 0, 0, 0, 1, 0],
                wristr: {
                  [path]: [0, 0, 6, 0, 0, 0, 1, 0, 0],
                  handr: {
                    [path]: [0, 0, 6, 0, 0, 0, 1, 0, 0, 0],
                    handslotr: {
                      [path]: [0, 0, 6, 0, 0, 0, 1, 0, 0, 0, 0],
                    },
                  },
                },
              },
            },
            head: {
              [path]: [0, 0, 6, 0, 0, 0, 2],
            },
            Paladin_Cape: {
              [path]: [0, 0, 6, 0, 0, 0, 3],
            },
          },
        },
        upperlegl: {
          [path]: [0, 0, 6, 0, 1],
          lowerlegl: {
            [path]: [0, 0, 6, 0, 1, 0],
            footl: {
              [path]: [0, 0, 6, 0, 1, 0, 0],
              toesl: {
                [path]: [0, 0, 6, 0, 1, 0, 0, 0],
              },
            },
          },
        },
        upperlegr: {
          [path]: [0, 0, 6, 0, 2],
          lowerlegr: {
            [path]: [0, 0, 6, 0, 2, 0],
            footr: {
              [path]: [0, 0, 6, 0, 2, 0, 0],
              toesr: {
                [path]: [0, 0, 6, 0, 2, 0, 0, 0],
              },
            },
          },
        },
      },
      elbowIKl: {
        [path]: [0, 0, 6, 1],
      },
      handIKl: {
        [path]: [0, 0, 6, 2],
      },
      kneeIKl: {
        [path]: [0, 0, 6, 3],
      },
      control-toe-rolll: {
        [path]: [0, 0, 6, 4],
        control-heel-rolll: {
          [path]: [0, 0, 6, 4, 0],
          control-foot-rolll: {
            [path]: [0, 0, 6, 4, 0, 0],
            heelIKl: {
              [path]: [0, 0, 6, 4, 0, 0, 0],
            },
            IK-footl: {
              [path]: [0, 0, 6, 4, 0, 0, 1],
            },
          },
          IK-toel: {
            [path]: [0, 0, 6, 4, 0, 1],
          },
        },
      },
      kneeIKr: {
        [path]: [0, 0, 6, 5],
      },
      control-toe-rollr: {
        [path]: [0, 0, 6, 6],
        control-heel-rollr: {
          [path]: [0, 0, 6, 6, 0],
          control-foot-rollr: {
            [path]: [0, 0, 6, 6, 0, 0],
            heelIKr: {
              [path]: [0, 0, 6, 6, 0, 0, 0],
            },
            IK-footr: {
              [path]: [0, 0, 6, 6, 0, 0, 1],
            },
          },
          IK-toer: {
            [path]: [0, 0, 6, 6, 0, 1],
          },
        },
      },
      elbowIKr: {
        [path]: [0, 0, 6, 7],
      },
      handIKr: {
        [path]: [0, 0, 6, 8],
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
