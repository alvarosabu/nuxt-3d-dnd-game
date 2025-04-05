import type { Group, Mesh } from "three";

declare const path: unique symbol;

export const chestsScene: {
  [path]: [0];
  chest005: {
    [path]: [0, 0];
    chest_lid005: {
      [path]: [0, 0, 0];
    };
  };
  chest006: {
    [path]: [0, 1];
    chest_lid006: {
      [path]: [0, 1, 0];
    };
  };
  chest007: {
    [path]: [0, 2];
    chest_lid007: {
      [path]: [0, 2, 0];
    };
  };
  chest_gold003: {
    [path]: [0, 3];
    chest_gold_lid003: {
      [path]: [0, 3, 0];
    };
  };
};

export function getNode(spec: typeof chestsScene): Promise<Group>;
export function getNode(spec: typeof chestsScene.chest005): Promise<Mesh>;
export function getNode(spec: typeof chestsScene.chest005.chest_lid005): Promise<Mesh>;
export function getNode(spec: typeof chestsScene.chest006): Promise<Mesh>;
export function getNode(spec: typeof chestsScene.chest006.chest_lid006): Promise<Mesh>;
export function getNode(spec: typeof chestsScene.chest007): Promise<Mesh>;
export function getNode(spec: typeof chestsScene.chest007.chest_lid007): Promise<Mesh>;
export function getNode(spec: typeof chestsScene.chest_gold003): Promise<Mesh>;
export function getNode(spec: typeof chestsScene.chest_gold003.chest_gold_lid003): Promise<Mesh>;

export {};
