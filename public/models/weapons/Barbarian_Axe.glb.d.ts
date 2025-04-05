import type { Group, Mesh } from "three";

declare const path: unique symbol;

export const SceneScene: {
  [path]: [0];
  axe_2handed: {
    [path]: [0, 0];
  };
};

export function getNode(spec: typeof SceneScene): Promise<Group>;
export function getNode(spec: typeof SceneScene.axe_2handed): Promise<Mesh>;

export {};
