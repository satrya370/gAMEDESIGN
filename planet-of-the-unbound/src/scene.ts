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
    { x: 50,   y: 350, width: 300, height: 20 },  // Bridge 1 (left)
    { x: 450,  y: 350, width: 300, height: 20 },  // Bridge 2 (middle)
    { x: 850,  y: 350, width: 300, height: 20 },  // Bridge 3 (right)
  ],
  worldWidth: 1200,
  worldHeight: 600,
  voidY: 500,
  playerSpawn: { x: 100, y: 286 },
  portal: { x: 1100, y: 250, width: 40, height: 60 },
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
