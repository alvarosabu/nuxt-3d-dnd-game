import type { Group, Mesh } from "three";

declare const path: unique symbol;

export const doorsScene: {
  [path]: [0];
  wall_doorway009: {
    [path]: [0, 0];
    wall_doorway_door009: {
      [path]: [0, 0, 0];
    };
  };
  wall_doorway010: {
    [path]: [0, 1];
    wall_doorway_door010: {
      [path]: [0, 1, 0];
    };
  };
  wall_doorway011: {
    [path]: [0, 2];
    wall_doorway_door011: {
      [path]: [0, 2, 0];
    };
  };
  wall_doorway012: {
    [path]: [0, 3];
    wall_doorway_door012: {
      [path]: [0, 3, 0];
    };
  };
  wall_doorway013: {
    [path]: [0, 4];
    wall_doorway_door013: {
      [path]: [0, 4, 0];
    };
  };
  wall_doorway014: {
    [path]: [0, 5];
    wall_doorway_door014: {
      [path]: [0, 5, 0];
    };
  };
  wall_doorway015: {
    [path]: [0, 6];
    wall_doorway_door015: {
      [path]: [0, 6, 0];
    };
  };
};

export function getNode(spec: typeof doorsScene): Promise<Group>;
export function getNode(spec: typeof doorsScene.wall_doorway009): Promise<Mesh>;
export function getNode(spec: typeof doorsScene.wall_doorway009.wall_doorway_door009): Promise<Mesh>;
export function getNode(spec: typeof doorsScene.wall_doorway010): Promise<Mesh>;
export function getNode(spec: typeof doorsScene.wall_doorway010.wall_doorway_door010): Promise<Mesh>;
export function getNode(spec: typeof doorsScene.wall_doorway011): Promise<Mesh>;
export function getNode(spec: typeof doorsScene.wall_doorway011.wall_doorway_door011): Promise<Mesh>;
export function getNode(spec: typeof doorsScene.wall_doorway012): Promise<Mesh>;
export function getNode(spec: typeof doorsScene.wall_doorway012.wall_doorway_door012): Promise<Mesh>;
export function getNode(spec: typeof doorsScene.wall_doorway013): Promise<Mesh>;
export function getNode(spec: typeof doorsScene.wall_doorway013.wall_doorway_door013): Promise<Mesh>;
export function getNode(spec: typeof doorsScene.wall_doorway014): Promise<Mesh>;
export function getNode(spec: typeof doorsScene.wall_doorway014.wall_doorway_door014): Promise<Mesh>;
export function getNode(spec: typeof doorsScene.wall_doorway015): Promise<Mesh>;
export function getNode(spec: typeof doorsScene.wall_doorway015.wall_doorway_door015): Promise<Mesh>;

export {};
