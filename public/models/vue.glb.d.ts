import type { Group, Mesh } from "three";

declare const path: unique symbol;

export const SceneScene: {
  [path]: [0];
  Vue: {
    [path]: [0, 0];
    Vue_1: {
      [path]: [0, 0, 0];
    };
    Vue_2: {
      [path]: [0, 0, 1];
    };
  };
};

export function getNode(spec: typeof SceneScene): Promise<Group>;
export function getNode(spec: typeof SceneScene.Vue): Promise<Group>;
export function getNode(spec: typeof SceneScene.Vue.Vue_1): Promise<Mesh>;
export function getNode(spec: typeof SceneScene.Vue.Vue_2): Promise<Mesh>;

export {};
