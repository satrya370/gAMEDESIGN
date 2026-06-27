import { AABB } from './collision';

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VineData {
  x: number;
  y: number;
  width: number;
  height: number;
  flipX?: boolean;
  climbable?: boolean;
}

export interface SceneData {
  platforms: Platform[];
  worldWidth: number;
  worldHeight: number;
  voidY: number;
  playerSpawn: { x: number; y: number };
  portal: { x: number; y: number; width: number; height: number };
  vinePositions?: VineData[];
}

export const DESIGN_WIDTH = 1920;
export const DESIGN_HEIGHT = 1080;

export const SCENE_1_LAYOUT = {
  viewport: {
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
  },
  bush: {
    x: -52,
    y: 254,
    width: 525,
    height: 860,
  },
  leftVine: {
    x: 282,
    y: 249,
    width: 232,
    height: 890,
  },
  rightVine: {
    x: 1073,
    y: 155,
    width: 237,
    height: 975,
  },
  bridge: {
    x: 1200,
    y: 155,
    width: 720,
    height: 124,
  },
  leafArea: {
    x: 1200,
    y: 257,
    width: 720,
    height: 864,
  },
  astronaut: {
    width: 175,
    height: 254,
    climbStartY: 819,
    climbEndY: 296,
  },
} as const;

export const SCENE_1_LEAF_STRANDS = [
  { x: 1188, width: 188, length: 865, seed: 1 },
  { x: 1318, width: 198, length: 710, seed: 2 },
  { x: 1448, width: 205, length: 850, seed: 3 },
  { x: 1585, width: 190, length: 680, seed: 4 },
  { x: 1710, width: 215, length: 860, seed: 5 },
  { x: 1830, width: 160, length: 760, seed: 6 },
] as const;

export const SCENE_2_LAYOUT = {
  platforms: [
    { x: -24, y: 652, width: 416, height: 24 },
    { x: 552, y: 620, width: 610, height: 24 },
    { x: 1322, y: 612, width: 646, height: 24 },
    { x: 572, y: 338, width: 430, height: 24 },
  ],
  vines: [
    { x: -8, y: 564, width: 92, height: 516, flipX: true, climbable: false },
    { x: 304, y: 610, width: 102, height: 470, climbable: false },
    { x: 542, y: 676, width: 96, height: 404, climbable: false },
    { x: 824, y: 756, width: 92, height: 324, flipX: true, climbable: false },
    { x: 1080, y: 688, width: 96, height: 392, climbable: false },
    { x: 1385, y: 594, width: 98, height: 486, climbable: false },
    { x: 1822, y: 610, width: 110, height: 470, climbable: false },
    { x: 578, y: -18, width: 110, height: 696, climbable: true },
    { x: 760, y: 300, width: 112, height: 368, flipX: true, climbable: true },
    { x: 938, y: -16, width: 110, height: 666, flipX: true, climbable: true },
  ],
  bushes: [
    { x: -90, y: 850, width: 550, height: 220 },
    { x: 345, y: 860, width: 420, height: 200 },
    { x: 690, y: 840, width: 520, height: 220 },
    { x: 1110, y: 830, width: 470, height: 215 },
    { x: 1450, y: 860, width: 540, height: 200 },
  ],
  rocketPart: { x: 812, y: 260, width: 64, height: 78 },
  alien: { x: 1660, y: 356, width: 134, height: 244 },
  portal: { x: 1772, y: 448, width: 126, height: 126 },
  backPortal: { x: 22, y: 514, width: 112, height: 112 },
  moon: { x: 1690, y: -34, width: 212, height: 212 },
  swirls: [
    { x: 710, y: -18, width: 146, height: 146, alpha: 0.72 },
    { x: 1866, y: 400, width: 164, height: 164, alpha: 0.50 },
  ],
  butterflies: [
    { x: 626, y: 188, size: 26, alpha: 0.84 },
    { x: 1334, y: 110, size: 22, alpha: 0.88 },
    { x: 860, y: 348, size: 34, alpha: 0.84 },
    { x: 1418, y: 432, size: 30, alpha: 0.84 },
    { x: 72, y: 484, size: 26, alpha: 0.80 },
  ],
} as const;

export const SCENE_2_5_LAYOUT = {
  platforms: [
    { x: -10, y: 700, width: 360, height: 24 },
    { x: 460, y: 610, width: 430, height: 24 },
    { x: 1030, y: 520, width: 440, height: 24 },
    { x: 1525, y: 430, width: 360, height: 24 },
  ],
  vines: [
    { x: 250, y: 620, width: 96, height: 460, flipX: true, climbable: false },
    { x: 720, y: 526, width: 98, height: 554, climbable: false },
    { x: 1280, y: 436, width: 104, height: 644, climbable: false },
    { x: 1710, y: 350, width: 108, height: 730, flipX: true, climbable: false },
  ],
  bushes: [
    { x: -90, y: 850, width: 550, height: 220 },
    { x: 410, y: 870, width: 430, height: 200 },
    { x: 860, y: 842, width: 500, height: 220 },
    { x: 1320, y: 850, width: 590, height: 210 },
  ],
  rocketPart: { x: 1172, y: 434, width: 82, height: 70 },
  portal: { x: 1736, y: 296, width: 126, height: 126 },
  backPortal: { x: 18, y: 562, width: 112, height: 112 },
  moon: { x: 1560, y: -20, width: 220, height: 220 },
  butterflies: [
    { x: 418, y: 250, size: 26, alpha: 0.84 },
    { x: 890, y: 300, size: 30, alpha: 0.84 },
    { x: 1332, y: 196, size: 26, alpha: 0.82 },
  ],
} as const;

export const SCENE_3_LAYOUT = {
  platforms: [
    { x: -20, y: 648, width: 1960, height: 24 },
  ],
  vines: [
    { x: 210, y: 140, width: 100, height: 480, flipX: true, climbable: false },
    { x: 760, y: 80, width: 104, height: 540, climbable: false },
    { x: 1340, y: 110, width: 104, height: 510, flipX: true, climbable: false },
  ],
  bushes: [
    { x: -90, y: 846, width: 620, height: 228 },
    { x: 500, y: 860, width: 510, height: 208 },
    { x: 980, y: 848, width: 520, height: 220 },
    { x: 1440, y: 856, width: 560, height: 204 },
  ],
  moon: { x: 1642, y: -44, width: 240, height: 240 },
  portal: { x: 1742, y: 470, width: 136, height: 136 },
  backPortal: { x: 20, y: 506, width: 112, height: 112 },
  rocketPart: { x: 1488, y: 564, width: 72, height: 84 },
} as const;

export const LAST_SCENE_LAYOUT = {
  viewport: { width: DESIGN_WIDTH, height: DESIGN_HEIGHT },
  moon: { x: -36, y: -28, width: 250, height: 250 },
  rearPlants: [
    { x: -26, y: 272, width: 318, height: 560, alpha: 0.32, flipX: true },
    { x: 296, y: 238, width: 334, height: 604, alpha: 0.26, flipX: false },
    { x: 670, y: 252, width: 346, height: 586, alpha: 0.24, flipX: true },
  ],
  mainPlants: [
    { x: 92, y: 136, width: 312, height: 728, alpha: 0.88, flipX: false },
    { x: 508, y: 128, width: 316, height: 742, alpha: 0.88, flipX: true },
    { x: 946, y: 146, width: 308, height: 724, alpha: 0.88, flipX: false },
  ],
  bushBand: { x: -78, y: 782, width: 1368, height: 332 },
  mound: { x: 1414, y: 624, width: 532, height: 416 },
  repairPlatform: { x: 1398, y: 676, width: 486, height: 44 },
  rocketPad: { x: 1600, y: 292, width: 236, height: 368 },
  rocketDoor: { x: 1644, y: 436, width: 58, height: 112 },
  astronautRepair: { x: 1488, y: 514, width: 116, height: 170 },
  repairWalk: {
    startX: 1328,
    startY: 512,
    workX: 1500,
    workY: 512,
  },
  repairIcons: { x: 1546, y: 428, width: 96, height: 96 },
  launchPath: {
    startX: 1600,
    startY: 292,
    endX: 1588,
    endY: -264,
  },
} as const;

export const SCENE_2: SceneData = {
  platforms: [...SCENE_2_LAYOUT.platforms],
  worldWidth: DESIGN_WIDTH,
  worldHeight: DESIGN_HEIGHT,
  voidY: 1120,
  playerSpawn: { x: 92, y: 560 },
  portal: { ...SCENE_2_LAYOUT.portal },
  vinePositions: SCENE_2_LAYOUT.vines
    .filter((vine) => vine.climbable)
    .map((vine) => ({ ...vine })),
};

export const SCENE_2_5: SceneData = {
  platforms: [...SCENE_2_5_LAYOUT.platforms],
  worldWidth: DESIGN_WIDTH,
  worldHeight: DESIGN_HEIGHT,
  voidY: 1120,
  playerSpawn: { x: 40, y: 610 },
  portal: { ...SCENE_2_5_LAYOUT.portal },
  vinePositions: [],
};

export const SCENE_3: SceneData = {
  platforms: [...SCENE_3_LAYOUT.platforms],
  worldWidth: DESIGN_WIDTH,
  worldHeight: DESIGN_HEIGHT,
  voidY: 1120,
  playerSpawn: { x: 70, y: 560 },
  portal: { ...SCENE_3_LAYOUT.portal },
  vinePositions: [],
};

export const SCENE_1: SceneData = {
  platforms: [
    {
      x: SCENE_1_LAYOUT.bridge.x,
      y: SCENE_1_LAYOUT.bridge.y,
      width: SCENE_1_LAYOUT.bridge.width,
      height: SCENE_1_LAYOUT.bridge.height,
    },
  ],
  worldWidth: DESIGN_WIDTH,
  worldHeight: DESIGN_HEIGHT,
  voidY: DESIGN_HEIGHT + 120,
  playerSpawn: {
    x: SCENE_1_LAYOUT.rightVine.x,
    y: SCENE_1_LAYOUT.astronaut.climbStartY,
  },
  portal: { x: 0, y: 0, width: 0, height: 0 },
  vinePositions: [
    {
      x: SCENE_1_LAYOUT.leftVine.x,
      y: SCENE_1_LAYOUT.leftVine.y,
      width: SCENE_1_LAYOUT.leftVine.width,
      height: SCENE_1_LAYOUT.leftVine.height,
    },
    {
      x: SCENE_1_LAYOUT.rightVine.x,
      y: SCENE_1_LAYOUT.rightVine.y,
      width: SCENE_1_LAYOUT.rightVine.width,
      height: SCENE_1_LAYOUT.rightVine.height,
    },
  ],
};

export function platformToAABB(p: Platform): AABB {
  return { x: p.x, y: p.y, width: p.width, height: p.height };
}
