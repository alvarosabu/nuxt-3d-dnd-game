import type { Bone, Group, Mesh, Object3D, SkinnedMesh } from "three";

declare const path: unique symbol;

export const SceneScene: {
  [path]: [0];
  Rig: {
    [path]: [0, 0];
    Paladin_ArmLeft: {
      [path]: [0, 0, 0];
      Paladin_ArmLeft_1: {
        [path]: [0, 0, 0, 0];
      };
      Paladin_ArmLeft_2: {
        [path]: [0, 0, 0, 1];
      };
    };
    Paladin_ArmRight: {
      [path]: [0, 0, 1];
      Paladin_ArmRight_1: {
        [path]: [0, 0, 1, 0];
      };
      Paladin_ArmRight_2: {
        [path]: [0, 0, 1, 1];
      };
    };
    Paladin_Body: {
      [path]: [0, 0, 2];
      Paladin_Body_1: {
        [path]: [0, 0, 2, 0];
      };
      Paladin_Body_2: {
        [path]: [0, 0, 2, 1];
      };
    };
    Paladin_Helmet: {
      [path]: [0, 0, 3];
      Paladin_Helmet_1: {
        [path]: [0, 0, 3, 0];
      };
      Paladin_Helmet_2: {
        [path]: [0, 0, 3, 1];
      };
    };
    Paladin_LegLeft: {
      [path]: [0, 0, 4];
      Paladin_LegLeft_1: {
        [path]: [0, 0, 4, 0];
      };
      Paladin_LegLeft_2: {
        [path]: [0, 0, 4, 1];
      };
    };
    Paladin_LegRight: {
      [path]: [0, 0, 5];
      Paladin_LegRight_1: {
        [path]: [0, 0, 5, 0];
      };
      Paladin_LegRight_2: {
        [path]: [0, 0, 5, 1];
      };
    };
    root: {
      [path]: [0, 0, 6];
      hips: {
        [path]: [0, 0, 6, 0];
        spine: {
          [path]: [0, 0, 6, 0, 0];
          chest: {
            [path]: [0, 0, 6, 0, 0, 0];
            upperarml: {
              [path]: [0, 0, 6, 0, 0, 0, 0];
              lowerarml: {
                [path]: [0, 0, 6, 0, 0, 0, 0, 0];
                wristl: {
                  [path]: [0, 0, 6, 0, 0, 0, 0, 0, 0];
                  handl: {
                    [path]: [0, 0, 6, 0, 0, 0, 0, 0, 0, 0];
                    handslotl: {
                      [path]: [0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0];
                    };
                  };
                };
              };
            };
            upperarmr: {
              [path]: [0, 0, 6, 0, 0, 0, 1];
              lowerarmr: {
                [path]: [0, 0, 6, 0, 0, 0, 1, 0];
                wristr: {
                  [path]: [0, 0, 6, 0, 0, 0, 1, 0, 0];
                  handr: {
                    [path]: [0, 0, 6, 0, 0, 0, 1, 0, 0, 0];
                    handslotr: {
                      [path]: [0, 0, 6, 0, 0, 0, 1, 0, 0, 0, 0];
                    };
                  };
                };
              };
            };
            head: {
              [path]: [0, 0, 6, 0, 0, 0, 2];
            };
            Paladin_Cape: {
              [path]: [0, 0, 6, 0, 0, 0, 3];
            };
          };
        };
        upperlegl: {
          [path]: [0, 0, 6, 0, 1];
          lowerlegl: {
            [path]: [0, 0, 6, 0, 1, 0];
            footl: {
              [path]: [0, 0, 6, 0, 1, 0, 0];
              toesl: {
                [path]: [0, 0, 6, 0, 1, 0, 0, 0];
              };
            };
          };
        };
        upperlegr: {
          [path]: [0, 0, 6, 0, 2];
          lowerlegr: {
            [path]: [0, 0, 6, 0, 2, 0];
            footr: {
              [path]: [0, 0, 6, 0, 2, 0, 0];
              toesr: {
                [path]: [0, 0, 6, 0, 2, 0, 0, 0];
              };
            };
          };
        };
      };
      elbowIKl: {
        [path]: [0, 0, 6, 1];
      };
      handIKl: {
        [path]: [0, 0, 6, 2];
      };
      kneeIKl: {
        [path]: [0, 0, 6, 3];
      };
      control-toe-rolll: {
        [path]: [0, 0, 6, 4];
        control-heel-rolll: {
          [path]: [0, 0, 6, 4, 0];
          control-foot-rolll: {
            [path]: [0, 0, 6, 4, 0, 0];
            heelIKl: {
              [path]: [0, 0, 6, 4, 0, 0, 0];
            };
            IK-footl: {
              [path]: [0, 0, 6, 4, 0, 0, 1];
            };
          };
          IK-toel: {
            [path]: [0, 0, 6, 4, 0, 1];
          };
        };
      };
      kneeIKr: {
        [path]: [0, 0, 6, 5];
      };
      control-toe-rollr: {
        [path]: [0, 0, 6, 6];
        control-heel-rollr: {
          [path]: [0, 0, 6, 6, 0];
          control-foot-rollr: {
            [path]: [0, 0, 6, 6, 0, 0];
            heelIKr: {
              [path]: [0, 0, 6, 6, 0, 0, 0];
            };
            IK-footr: {
              [path]: [0, 0, 6, 6, 0, 0, 1];
            };
          };
          IK-toer: {
            [path]: [0, 0, 6, 6, 0, 1];
          };
        };
      };
      elbowIKr: {
        [path]: [0, 0, 6, 7];
      };
      handIKr: {
        [path]: [0, 0, 6, 8];
      };
    };
  };
};

export function getNode(spec: typeof SceneScene): Promise<Group>;
export function getNode(spec: typeof SceneScene.Rig): Promise<Object3D>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_ArmLeft): Promise<Group>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_ArmLeft.Paladin_ArmLeft_1): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_ArmLeft.Paladin_ArmLeft_2): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_ArmRight): Promise<Group>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_ArmRight.Paladin_ArmRight_1): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_ArmRight.Paladin_ArmRight_2): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_Body): Promise<Group>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_Body.Paladin_Body_1): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_Body.Paladin_Body_2): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_Helmet): Promise<Group>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_Helmet.Paladin_Helmet_1): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_Helmet.Paladin_Helmet_2): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_LegLeft): Promise<Group>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_LegLeft.Paladin_LegLeft_1): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_LegLeft.Paladin_LegLeft_2): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_LegRight): Promise<Group>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_LegRight.Paladin_LegRight_1): Promise<SkinnedMesh>;
export function getNode(spec: typeof SceneScene.Rig.Paladin_LegRight.Paladin_LegRight_2): Promise<SkinnedMesh>;
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
export function getNode(spec: typeof SceneScene.Rig.root.hips.spine.chest.Paladin_Cape): Promise<Mesh>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegl.lowerlegl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegl.lowerlegl.footl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegl.lowerlegl.footl.toesl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegr.lowerlegr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegr.lowerlegr.footr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.hips.upperlegr.lowerlegr.footr.toesr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.elbowIKl): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.handIKl): Promise<Bone>;
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
export function getNode(spec: typeof SceneScene.Rig.root.elbowIKr): Promise<Bone>;
export function getNode(spec: typeof SceneScene.Rig.root.handIKr): Promise<Bone>;

export {};
