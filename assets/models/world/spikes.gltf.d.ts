import type { Group, Mesh } from "three";

declare const path: unique symbol;

export const spikesScene: {
  [path]: [0];
  floor_tile_big_spikes003: {
    [path]: [0, 0];
    spikes003: {
      [path]: [0, 0, 0];
    };
  };
};

export function getNode(spec: typeof spikesScene): Promise<Group>;
export function getNode(spec: typeof spikesScene.floor_tile_big_spikes003): Promise<Mesh>;
export function getNode(spec: typeof spikesScene.floor_tile_big_spikes003.spikes003): Promise<Mesh>;

export {};
