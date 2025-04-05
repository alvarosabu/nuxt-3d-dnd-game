import type { Group, Mesh } from "three";

declare const path: unique symbol;

export const SceneScene: {
  [path]: [0];
  chest_large: {
    [path]: [0, 0];
    chest_large_lid: {
      [path]: [0, 0, 0];
    };
  };
};

export function getNode(spec: typeof SceneScene): Promise<Group>;
export function getNode(spec: typeof SceneScene.chest_large): Promise<Mesh>;
export function getNode(spec: typeof SceneScene.chest_large.chest_large_lid): Promise<Mesh>;

export {};
