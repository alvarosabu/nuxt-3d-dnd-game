import type { Group, Mesh } from "three";

declare const path: unique symbol;

export const SceneScene: {
  [path]: [0];
  sword_2handed: {
    [path]: [0, 0];
  };
};

export function getNode(spec: typeof SceneScene): Promise<Group>;
export function getNode(spec: typeof SceneScene.sword_2handed): Promise<Mesh>;

export {};
