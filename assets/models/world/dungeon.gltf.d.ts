import type { Group, Mesh } from "three";

declare const path: unique symbol;

export const dungeonScene: {
  [path]: [0];
  dungeon_1: {
    [path]: [0, 0];
    Plane003: {
      [path]: [0, 0, 0];
    };
    Plane003_1: {
      [path]: [0, 0, 1];
    };
    Plane003_2: {
      [path]: [0, 0, 2];
    };
    Plane003_3: {
      [path]: [0, 0, 3];
    };
    Plane003_4: {
      [path]: [0, 0, 4];
    };
    Plane003_5: {
      [path]: [0, 0, 5];
    };
    Plane003_6: {
      [path]: [0, 0, 6];
    };
    Plane003_7: {
      [path]: [0, 0, 7];
    };
    Plane003_8: {
      [path]: [0, 0, 8];
    };
    Plane003_9: {
      [path]: [0, 0, 9];
    };
  };
};

export function getNode(spec: typeof dungeonScene): Promise<Group>;
export function getNode(spec: typeof dungeonScene.dungeon_1): Promise<Group>;
export function getNode(spec: typeof dungeonScene.dungeon_1.Plane003): Promise<Mesh>;
export function getNode(spec: typeof dungeonScene.dungeon_1.Plane003_1): Promise<Mesh>;
export function getNode(spec: typeof dungeonScene.dungeon_1.Plane003_2): Promise<Mesh>;
export function getNode(spec: typeof dungeonScene.dungeon_1.Plane003_3): Promise<Mesh>;
export function getNode(spec: typeof dungeonScene.dungeon_1.Plane003_4): Promise<Mesh>;
export function getNode(spec: typeof dungeonScene.dungeon_1.Plane003_5): Promise<Mesh>;
export function getNode(spec: typeof dungeonScene.dungeon_1.Plane003_6): Promise<Mesh>;
export function getNode(spec: typeof dungeonScene.dungeon_1.Plane003_7): Promise<Mesh>;
export function getNode(spec: typeof dungeonScene.dungeon_1.Plane003_8): Promise<Mesh>;
export function getNode(spec: typeof dungeonScene.dungeon_1.Plane003_9): Promise<Mesh>;

export {};
