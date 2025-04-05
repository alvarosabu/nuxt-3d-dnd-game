import type { Group, Mesh } from "three";

declare const path: unique symbol;

export const SceneScene: {
  [path]: [0];
  druid_staff: {
    [path]: [0, 0];
  };
};

export function getNode(spec: typeof SceneScene): Promise<Group>;
export function getNode(spec: typeof SceneScene.druid_staff): Promise<Mesh>;

export {};
