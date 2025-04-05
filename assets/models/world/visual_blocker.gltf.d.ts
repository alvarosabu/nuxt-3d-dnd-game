import type { Group, Mesh } from "three";

declare const path: unique symbol;

export const visual_blockerScene: {
  [path]: [0];
  room7001: {
    [path]: [0, 0];
  };
  room6001: {
    [path]: [0, 1];
  };
  room5001: {
    [path]: [0, 2];
  };
  room4001: {
    [path]: [0, 3];
  };
  room3001: {
    [path]: [0, 4];
  };
  room2001: {
    [path]: [0, 5];
  };
  room1001: {
    [path]: [0, 6];
  };
  outer001: {
    [path]: [0, 7];
  };
};

export function getNode(spec: typeof visual_blockerScene): Promise<Group>;
export function getNode(spec: typeof visual_blockerScene.room7001): Promise<Mesh>;
export function getNode(spec: typeof visual_blockerScene.room6001): Promise<Mesh>;
export function getNode(spec: typeof visual_blockerScene.room5001): Promise<Mesh>;
export function getNode(spec: typeof visual_blockerScene.room4001): Promise<Mesh>;
export function getNode(spec: typeof visual_blockerScene.room3001): Promise<Mesh>;
export function getNode(spec: typeof visual_blockerScene.room2001): Promise<Mesh>;
export function getNode(spec: typeof visual_blockerScene.room1001): Promise<Mesh>;
export function getNode(spec: typeof visual_blockerScene.outer001): Promise<Mesh>;

export {};
