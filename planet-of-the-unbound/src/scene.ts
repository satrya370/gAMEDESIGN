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
    { x: 400, y: 3000, width: 400, height: 80 }, // Bridge di atas kanan
  ],
  worldWidth: 800,
  worldHeight: 4000,      // Lebih besar dari view height
  voidY: 3900,
  playerSpawn: { x: 400, y: 3550 }, // Di bawah vine kanan
  portal: { x: 0, y: 0, width: 0, height: 0 },
  vinePositions: [
    { x: 240, y: 3000, height: 600 }, // Vine kiri — sisi kanan bush
    { x: 400, y: 3000, height: 600 }, // Vine kanan — sisi kiri leaf
  ],
  // Layout properties untuk drawCutscene
  SCENE_TOP_Y: 3250,
  SCENE_BOTTOM_Y: 3850,
  WALL_LEFT_X: 0,
  WALL_LEFT_END_X: 240,
  GAP_START_X: 240,
  GAP_END_X: 400,
  WALL_RIGHT_X: 400,
  VINE_LEFT_X: 240,
  VINE_RIGHT_X: 400,
  BRIDGE_X: 400,
  BRIDGE_Y: 3250,
  BRIDGE_HEIGHT: 80,
  CLIMB_START_Y: 3800,
  CLIMB_END_Y: 3330,
} as any; // Cast to any untuk tambah properties

export function platformToAABB(p: Platform): AABB {
  return { x: p.x, y: p.y, width: p.width, height: p.height };
}
