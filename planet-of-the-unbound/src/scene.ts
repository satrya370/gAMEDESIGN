import { AABB } from './collision';

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SceneData {
  platforms: Platform[];
  worldWidth: number;
  worldHeight: number;
  voidY: number;
  playerSpawn: { x: number; y: number };
  portal: { x: number; y: number; width: number; height: number };
  vinePositions?: { x: number; y: number; height: number }[];
}

export const SCENE_2: SceneData = {
  platforms: [
    { x: -10,  y: 645, width: 400, height: 24 },
    { x: 555,  y: 625, width: 605, height: 24 },
    { x: 1325, y: 610, width: 650, height: 24 },
    { x: 570,  y: 245, width: 430, height: 24 },
  ],
  worldWidth: 1920,
  worldHeight: 1080,
  voidY: 1120,
  playerSpawn: { x: 95, y: 580 },
  portal: { x: 900, y: 180, width: 70, height: 90 },
};

export const SCENE_1: SceneData = {
  platforms: [
    { x: 100, y: 60, width: 200, height: 20 },
  ],
  worldWidth: 400,
  worldHeight: 800,
  voidY: 850,
  playerSpawn: { x: 320, y: 700 },
  portal: { x: 0, y: 0, width: 0, height: 0 },
  vinePositions: [
    { x: 80, y: 100, height: 600 },
    { x: 320, y: 100, height: 600 },
  ],
};

export function platformToAABB(p: Platform): AABB {
  return { x: p.x, y: p.y, width: p.width, height: p.height };
}
