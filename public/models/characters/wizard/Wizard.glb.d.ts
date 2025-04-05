import type { Bone, Group, Mesh, Object3D, SkinnedMesh } from "three";

declare const path: unique symbol;

export const SceneScene: {
  [path]: [0];
  Rig: {
    [path]: [0, 0];
    Mage_ArmLeft: {
      [path]: [0, 0, 0];
    };
    Mage_ArmRight: {
      [path]: [0, 0, 1];
    };
    Mage_Body: {
      [path]: [0, 0, 2];
    };
    Mage_LegLeft: {
      [path]: [0, 0, 3];
    };
    Mage_LegRight: {
      [path]: [0, 0, 4];
    };
    Witch_Glasses: {
      [path]: [0, 0, 5];
      Witch_Glasses_1: {
        [path]: [0, 0, 5, 0];
      };
      Witch_Glasses_2: {
        [path]: [0, 0, 5, 1];
      };
    };
    Witch_Head: {
      [path]: [0, 0, 6];
    };
    root: {
      [path]: [0, 0, 7];
      hips: {
        [path]: [0, 0, 7, 0];
        spine: {
          [path]: [0, 0, 7, 0, 0];
          chest: {
            [path]: [0, 0, 7, 0, 0, 0];
            upperarml: {
              [path]: [0, 0, 7, 0, 0, 0, 0];
              lowerarml: {
                [path]: [0, 0, 7, 0, 0, 0, 0, 0];
                wristl: {
                  [path]: [0, 0, 7, 0, 0, 0, 0, 0, 0];
                  handl: {
                    [path]: [0, 0, 7, 0, 0, 0, 0, 0, 0, 0];
                    handslotl: {
                      [path]: [0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0];
                    };
                  };
                };
              };
            };
            upperarmr: {
              [path]: [0, 0, 7, 0, 0, 0, 1];
              lowerarmr: {
                [path]: [0, 0, 7, 0, 0, 0, 1, 0];
                wristr: {
                  [path]: [0, 0, 7, 0, 0, 0, 1, 0, 0];
                  handr: {
                    [path]: [0, 0, 7, 0, 0, 0, 1, 0, 0, 0];
                    handslotr: {
                      [path]: [0, 0, 7, 0, 0, 0, 1, 0, 0, 0, 0];
                    };
                  };
                };
              };
            };
            head: {
              [path]: [0, 0, 7, 0, 0, 0, 2];
              Mage_Hat: {
                [path]: [0, 0, 7, 0, 0, 0, 2, 0];
              };
            };
            Mage_Cape: {
              [path]: [0, 0, 7, 0, 0, 0, 3];
            };
          };
        };
        upperlegl: {
          [path]: [0, 0, 7, 0, 1];
          lowerlegl: {
            [path]: [0, 0, 7, 0, 1, 0];
            footl: {
              [path]: [0, 0, 7, 0, 1, 0, 0];
              toesl: {
                [path]: [0, 0, 7, 0, 1, 0, 0, 0];
              };
            };
          };
        };
        upperlegr: {
          [path]: [0, 0, 7, 0, 2];
          lowerlegr: {
            [path]: [0, 0, 7, 0, 2, 0];
            footr: {
              [path]: [0, 0, 7, 0, 2, 0, 0];
              toesr: {
                [path]: [0, 0, 7, 0, 2, 0, 0, 0];
              };
            };
          };
        };
      };
      kneeIKl: {
        [path]: [0, 0, 7, 1];
      };
      control-toe-rolll: {
        [path]: [0, 0, 7, 2];
        control-heel-rolll: {
          [path]: [0, 0, 7, 2, 0];
          control-foot-rolll: {
            [path]: [0, 0, 7, 2, 0, 0];
            heelIKl: {
              [path]: [0, 0, 7, 2, 0, 0, 0];
            };
            IK-footl: {
              [path]: [0, 0, 7, 2, 0, 0, 1];
            };
          };
          IK-toel: {
            [path]: [0, 0, 7, 2, 0, 1];
          };
        };
      };
      kneeIKr: {
        [path]: [0, 0, 7, 3];
      };
      control-toe-rollr: {
        [path]: [0, 0, 7, 4];
        control-heel-rollr: {
          [path]: [0, 0, 7, 4, 0];
          control-foot-rollr: {
            [path]: [0, 0, 7, 4, 0, 0];
            heelIKr: {
              [path]: [0, 0, 7, 4, 0, 0, 0];
            };
            IK-footr: {
              [path]: [0, 0, 7, 4, 0, 0, 1];
            };
          };
          IK-toer: {
            [path]: [0, 0, 7, 4, 0, 1];
          };
        };
      };
      elbowIKl: {
        [path]: [0, 0, 7, 5];
      };
      handIKl: {
        [path]: [0, 0, 7, 6];
      };
      elbowIKr: {
        [path]: [0, 0, 7, 7];
      };
      handIKr: {
        [path]: [0, 0, 7, 8];
      };
    };
  };
};

export function getNode(spec: typeof SceneScene): Promise<Group>;
export function getNode(spec: typeof SceneScene.Rig): Promise<Object3D>;
export function getNode(spec: typeof SceneScene.Rig.Mage_ArmLeft): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Mage_ArmRight): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Mage_Body): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Mage_LegLeft): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Mage_LegRight): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Witch_Glasses): Promise<Group>;
export function getNode(spec: typeof SceneScene.Rig.Witch_Glasses.Witch_Glasses_1): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Witch_Glasses.Witch_Glasses_2): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Witch_Head): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.root): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine.chest): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine.chest.upperarml): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine.chest.upperarml.lowerarml): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine.chest.upperarml.lowerarml.wristl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine.chest.upperarml.lowerarml.wristl.handl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine.chest.upperarml.lowerarml.wristl.handl.handslotl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine.chest.upperarmr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine.chest.upperarmr.lowerarmr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine.chest.upperarmr.lowerarmr.wristr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine.chest.upperarmr.lowerarmr.wristr.handr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine.chest.upperarmr.lowerarmr.wristr.handr.handslotr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine.chest.head): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine.chest.head.Mage_Hat): Promise<Mesh>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine.chest.Mage_Cape): Promise<Mesh>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegl.lowerlegl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegl.lowerlegl.footl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegl.lowerlegl.footl.toesl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegr.lowerlegr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegr.lowerlegr.footr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegr.lowerlegr.footr.toesr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.kneeIKl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.control-toe-rolll): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.control-toe-rolll.control-heel-rolll): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.control-toe-rolll.control-heel-rolll.control-foot-rolll): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.control-toe-rolll.control-heel-rolll.control-foot-rolll.heelIKl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.control-toe-rolll.control-heel-rolll.control-foot-rolll.IK-footl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.control-toe-rolll.control-heel-rolll.IK-toel): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.kneeIKr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.control-toe-rollr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.control-toe-rollr.control-heel-rollr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.control-toe-rollr.control-heel-rollr.control-foot-rollr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.control-toe-rollr.control-heel-rollr.control-foot-rollr.heelIKr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.control-toe-rollr.control-heel-rollr.control-foot-rollr.IK-footr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.control-toe-rollr.control-heel-rollr.IK-toer): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.elbowIKl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.handIKl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.elbowIKr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.handIKr): Promise<Bone>;

export {};
