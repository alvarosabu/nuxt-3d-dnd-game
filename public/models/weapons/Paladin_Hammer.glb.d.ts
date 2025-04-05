import type { Group, Mesh } from "three";

declare const path: unique symbol;

export const SceneScene: {
  [path]: [0];
  paladin_hammer: {
    [path]: [0, 0];
    paladin_hammer_1: {
      [path]: [0, 0, 0];
    };
    paladin_hammer_2: {
      [path]: [0, 0, 1];
    };
  };
};

export function getNode(spec: typeof SceneScene): Promise<Group>;
export function getNode(spec: typeof SceneScene.paladin_hammer): Promise<Group>;
export function getNode(spec: typeof SceneScene.paladin_hammer.paladin_hammer_1): Promise<Mesh>;
export function getNode(spec: typeof SceneScene.paladin_hammer.paladin_hammer_2): Promise<Mesh>;

export {};
