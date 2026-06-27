// ============================================
// main.js — Entry point, game loop
// ============================================

import { COLORS, CAMERA, ENEMIES, PLAYER, PROJECTILES } from './constants';
import { loadAllAssets, getAsset } from './assets';
import { initInput, clearJustPressed, getMouseX, getMouseY, keys, justPressed } from './input';
import { initGame, getState, setState, getCtx, getWidth, getHeight } from './game';
import {
  initPlayer,
  updatePlayer,
  drawPlayer,
  getPlayer,
  getPlayerAABB,
  consumeAmmo,
  refillAmmo,
  setPlayerPosition,
  takeDamage,
} from './player';
import {
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  LAST_SCENE_LAYOUT,
  SCENE_1,
  SCENE_1_LAYOUT,
  SCENE_1_LEAF_STRANDS,
  SCENE_2_5,
  SCENE_2_5_LAYOUT,
  SCENE_2_LAYOUT,
  SCENE_2,
  SCENE_3,
  SCENE_3_LAYOUT,
} from './scene';
import { initCamera, setCameraTarget, updateCamera, getCamera, snapCamera } from './camera';
import { startCutscene, updateCutscene, getCutscene, isCutsceneDone } from './cutscene';
import { setCurrentScene } from './player';

// ---- Game Loop ----
let lastTime = 0;
let menuTime = 0;

interface MenuButterfly {
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  speed: number;
  phase: number;
  size: number;
}

interface AssetCrop {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

const ASSET_CROPS: Record<string, AssetCrop> = {
  astronaut_idle: { sx: 642, sy: 148, sw: 633, sh: 775 },
  alien_shooter: { sx: 662, sy: 104, sw: 457, sh: 823 },
  background_moon: { sx: 598, sy: 220, sw: 639, sh: 635 },
  bridge_platform: { sx: 385, sy: 439, sw: 1264, sh: 202 },
  bullet_boss: { sx: 507, sy: 278, sw: 895, sh: 526 },
  bush_decoration: { sx: 412, sy: 319, sw: 1102, sh: 440 },
  butterfly_background: { sx: 768, sy: 354, sw: 373, sh: 373 },
  health_icon: { sx: 662, sy: 303, sw: 603, sh: 543 },
  laser_bullet: { sx: 628, sy: 331, sw: 565, sh: 287 },
  laser_weapon: { sx: 672, sy: 300, sw: 665, sh: 524 },
  meteor_projectile: { sx: 611, sy: 271, sw: 688, sh: 513 },
  portal_effect: { sx: 630, sy: 265, sw: 704, sh: 683 },
  environment_plants: { sx: 613, sy: 108, sw: 572, sh: 803 },
  rocket_part_01: { sx: 664, sy: 232, sw: 419, sh: 601 },
  rocket_part_02: { sx: 650, sy: 240, sw: 592, sh: 596 },
  rocket_part_03: { sx: 626, sy: 268, sw: 668, sh: 544 },
  rocket_part_04: { sx: 558, sy: 232, sw: 799, sh: 690 },
  vine_ladder: { sx: 898, sy: 95, sw: 179, sh: 890 },
  leaf_decoration: { sx: 762, sy: 230, sw: 396, sh: 620 },
};

const DEBUG_SCENE_LAYOUT = false;

const MENU_BUTTERFLIES: MenuButterfly[] = [
  { baseX: 0.25, baseY: 0.18, ampX: 0.10, ampY: 0.08, speed: 0.75, phase: 0.2, size: 720 },
  { baseX: 0.58, baseY: 0.24, ampX: 0.12, ampY: 0.09, speed: 0.62, phase: 1.8, size: 560 },
  { baseX: 0.82, baseY: 0.36, ampX: 0.08, ampY: 0.10, speed: 0.88, phase: 3.1, size: 640 },
  { baseX: 0.38, baseY: 0.66, ampX: 0.14, ampY: 0.07, speed: 0.55, phase: 4.4, size: 480 },
  { baseX: 0.70, baseY: 0.75, ampX: 0.10, ampY: 0.08, speed: 0.70, phase: 5.7, size: 520 },
];

type PlayableSceneId = 'scene2' | 'scene2_5' | 'scene3';
type SceneTransitionId = PlayableSceneId | 'scene4_cutscene' | 'scene5_cutscene' | 'victory';
type EnemyKind = 'alien' | 'boss' | 'ufo';
type ProjectileKind = 'player_laser' | 'alien_laser' | 'boss_rock' | 'ufo_bullet' | 'meteor';

interface EnemyRuntime {
  id: string;
  kind: EnemyKind;
  x: number;
  y: number;
  originX: number;
  platformLeft: number;
  platformRight: number;
  width: number;
  height: number;
  hp: number;
  speed: number;
  dir: 1 | -1;
  cooldownMs: number;
  phase: number;
  baseY: number;
  shotPatternIndex: number;
  meteorUsed?: boolean;
  visible?: boolean;
}

interface ProjectileRuntime {
  id: string;
  kind: ProjectileKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  ttlMs: number;
  variant?: 'body' | 'high';
}

interface RocketPartRuntime {
  id: PlayableSceneId;
  assetName: 'rocket_part_01' | 'rocket_part_03' | 'rocket_part_04';
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  gatedByBoss?: boolean;
}

interface SceneRuntimeState {
  sceneId: PlayableSceneId;
  enemies: EnemyRuntime[];
  projectiles: ProjectileRuntime[];
  rocketPart: RocketPartRuntime | null;
  collectedParts: number;
  collectedPartIds: Set<PlayableSceneId>;
  clearedSceneIds: Set<PlayableSceneId>;
  objectiveText: string;
  pendingTransition: SceneTransitionId | null;
  flashTimerMs: number;
  playerShotCooldownMs: number;
}

let actorIdCounter = 0;
let debugAimWorldOverride: { x: number; y: number } | null = null;
const PLAYER_SHOT_COOLDOWN_MS = 165;
const MENU_BUTTON_START = { x: -130, y: 80, width: 260, height: 56 };
const MENU_BUTTON_CONTROLS = { x: -130, y: 152, width: 260, height: 56 };
const MENU_BUTTON_EXIT = { x: -130, y: 224, width: 260, height: 56 };
const CONTROLS_BUTTON_PLAY = { x: -130, y: 180, width: 260, height: 52 };
const CONTROLS_BUTTON_BACK = { x: -130, y: 248, width: 260, height: 52 };
const MENU_BUTTON_RESTART = { x: -100, y: 20, width: 200, height: 50 };
const MENU_BUTTON_QUIT = { x: -100, y: 90, width: 200, height: 50 };

const sceneRuntime: SceneRuntimeState = {
  sceneId: 'scene2',
  enemies: [],
  projectiles: [],
  rocketPart: null,
  collectedParts: 0,
  collectedPartIds: new Set<PlayableSceneId>(),
  clearedSceneIds: new Set<PlayableSceneId>(),
  objectiveText: 'Find the missing rocket parts',
  pendingTransition: null,
  flashTimerMs: 0,
  playerShotCooldownMs: 0,
};

function drawCroppedAsset(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: { alpha?: number; flipX?: boolean } = {}
): boolean {
  const img = getAsset(name);
  const crop = ASSET_CROPS[name];
  if (!img || !crop || !img.complete || img.naturalWidth === 0) return false;

  ctx.save();
  ctx.globalAlpha = options.alpha ?? 1;
  if (options.flipX) {
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height);
  } else {
    ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, x, y, width, height);
  }
  ctx.restore();
  return true;
}

function drawWorldAsset(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  camX: number,
  camY: number,
  options: { alpha?: number; flipX?: boolean } = {}
): boolean {
  return drawCroppedAsset(ctx, name, x - camX, y - camY, width, height, options);
}

function drawVerticalVine(
  ctx: CanvasRenderingContext2D,
  vine: { x: number; y: number; width: number; height: number; flipX?: boolean },
  camX: number,
  camY: number,
  options: { alpha?: number; sway?: number; segmentHeight?: number } = {}
): void {
  const drawX = vine.x - camX;
  const drawY = vine.y - camY;
  const sway = options.sway ?? 6;
  const segmentHeight = options.segmentHeight ?? 220;
  const stemWidth = Math.max(10, vine.width * 0.14);
  const visibleWidth = vine.width * 0.72;
  const alpha = options.alpha ?? 0.98;
  const phase = vine.flipX ? Math.PI * 0.5 : 0;

  ctx.save();
  ctx.beginPath();
  ctx.rect(drawX, drawY, vine.width, vine.height);
  ctx.clip();

  ctx.strokeStyle = 'rgba(21, 18, 10, 0.92)';
  ctx.lineWidth = stemWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(drawX + vine.width / 2, drawY - 12);
  ctx.lineTo(drawX + vine.width / 2, drawY + vine.height + 12);
  ctx.stroke();

  for (let offsetY = -36; offsetY < vine.height; offsetY += segmentHeight - 42) {
    const offsetX = Math.sin(offsetY * 0.018 + phase) * sway;
    drawCroppedAsset(
      ctx,
      'vine_ladder',
      drawX + vine.width / 2 - visibleWidth / 2 + offsetX,
      drawY + offsetY,
      visibleWidth,
      Math.min(segmentHeight, vine.height - offsetY + 42),
      { alpha, flipX: vine.flipX }
    );
  }

  ctx.restore();
}

interface DesignViewport {
  scale: number;
  offsetX: number;
  offsetY: number;
  renderedWidth: number;
  renderedHeight: number;
}

function beginDesignSpace(ctx: CanvasRenderingContext2D, viewportWidth: number, viewportHeight: number): DesignViewport {
  const scale = Math.min(viewportWidth / DESIGN_WIDTH, viewportHeight / DESIGN_HEIGHT);
  const renderedWidth = DESIGN_WIDTH * scale;
  const renderedHeight = DESIGN_HEIGHT * scale;
  const offsetX = (viewportWidth - renderedWidth) / 2;
  const offsetY = (viewportHeight - renderedHeight) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
  ctx.clip();

  return { scale, offsetX, offsetY, renderedWidth, renderedHeight };
}

function deterministicNoise(index: number, seed: number): number {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function nextActorId(prefix: string): string {
  actorIdCounter += 1;
  return `${prefix}_${actorIdCounter}`;
}

function getPlayableSceneData(sceneId: PlayableSceneId) {
  switch (sceneId) {
    case 'scene2':
      return SCENE_2;
    case 'scene2_5':
      return SCENE_2_5;
    case 'scene3':
      return SCENE_3;
  }
}

function getPlayableSceneLayout(sceneId: PlayableSceneId) {
  switch (sceneId) {
    case 'scene2':
      return SCENE_2_LAYOUT;
    case 'scene2_5':
      return SCENE_2_5_LAYOUT;
    case 'scene3':
      return SCENE_3_LAYOUT;
  }
}

function makeAlien(id: string, x: number, platformX: number, platformY: number, patrolWidth: number): EnemyRuntime {
  const width = 78;
  const height = 110;
  const platformLeft = platformX + 10;
  const platformRight = Math.max(platformLeft, platformX + patrolWidth - width - 10);

  return {
    id,
    kind: 'alien',
    x: Math.max(platformLeft, Math.min(platformRight, x)),
    y: platformY - height + 6,
    originX: x,
    platformLeft,
    platformRight,
    width,
    height,
    hp: 2,
    speed: ENEMIES.SMALL_ALIEN.SPEED,
    dir: -1,
    cooldownMs: 1500,
    phase: patrolWidth,
    baseY: platformY - height + 6,
    shotPatternIndex: 0,
  };
}

function makeBoss(id: string, x: number, platformX: number, platformY: number, platformWidth: number): EnemyRuntime {
  const width = 152;
  const height = 164;
  const patrolWidth = platformWidth * 0.30;
  const patrolCenter = platformX + platformWidth * 0.76;
  const platformLeft = Math.max(platformX + platformWidth * 0.64, patrolCenter - patrolWidth * 0.5);
  const platformRight = Math.min(platformX + platformWidth - width - 46, patrolCenter + patrolWidth * 0.5);

  return {
    id,
    kind: 'boss',
    x: Math.max(platformLeft, Math.min(platformRight, x)),
    y: platformY - height,
    originX: x,
    platformLeft,
    platformRight,
    width,
    height,
    hp: ENEMIES.BOSS_ALIEN.HP,
    speed: ENEMIES.BOSS_ALIEN.SPEED,
    dir: -1,
    cooldownMs: 2000,
    phase: 0,
    baseY: platformY - height + 10,
    shotPatternIndex: 0,
    meteorUsed: false,
  };
}

function makeUfo(id: string, x: number, y: number): EnemyRuntime {
  const width = 146;
  const height = 146;
  return {
    id,
    kind: 'ufo',
    x,
    y,
    originX: x,
    platformLeft: 120,
    platformRight: DESIGN_WIDTH - 120 - width,
    width,
    height,
    hp: 2,
    speed: 0.72,
    dir: -1,
    cooldownMs: 1800,
    phase: x * 0.01,
    baseY: y,
    shotPatternIndex: 0,
  };
}

function refreshObjectiveText(): void {
  sceneRuntime.collectedParts = sceneRuntime.collectedPartIds.size;

  if (sceneRuntime.collectedPartIds.size >= 3) {
    sceneRuntime.objectiveText = 'All parts found! Return to rocket';
    return;
  }

  if (sceneRuntime.collectedPartIds.size === 0) {
    sceneRuntime.objectiveText = 'Find the missing rocket parts';
    return;
  }

  sceneRuntime.objectiveText = `Rocket Parts: ${sceneRuntime.collectedPartIds.size}/3`;
}

function setupSceneRuntime(sceneId: PlayableSceneId): void {
  const disableEnemies = sceneRuntime.clearedSceneIds.has(sceneId);

  sceneRuntime.sceneId = sceneId;
  sceneRuntime.enemies = [];
  sceneRuntime.projectiles = [];
  sceneRuntime.pendingTransition = null;
  sceneRuntime.flashTimerMs = 0;
  sceneRuntime.playerShotCooldownMs = 0;

  switch (sceneId) {
    case 'scene2':
      sceneRuntime.enemies = disableEnemies ? [] : [
        makeAlien(nextActorId('alien'), 638, SCENE_2_LAYOUT.platforms[1].x, SCENE_2_LAYOUT.platforms[1].y, SCENE_2_LAYOUT.platforms[1].width),
        makeAlien(nextActorId('alien'), 1460, SCENE_2_LAYOUT.platforms[2].x, SCENE_2_LAYOUT.platforms[2].y, SCENE_2_LAYOUT.platforms[2].width),
        makeAlien(nextActorId('alien'), 1718, SCENE_2_LAYOUT.platforms[2].x, SCENE_2_LAYOUT.platforms[2].y, SCENE_2_LAYOUT.platforms[2].width),
      ];
      sceneRuntime.rocketPart = {
        id: 'scene2',
        assetName: 'rocket_part_01',
        x: SCENE_2_LAYOUT.rocketPart.x,
        y: SCENE_2_LAYOUT.rocketPart.y,
        width: SCENE_2_LAYOUT.rocketPart.width,
        height: SCENE_2_LAYOUT.rocketPart.height,
        collected: sceneRuntime.collectedPartIds.has('scene2'),
      };
      break;
    case 'scene2_5':
      sceneRuntime.enemies = disableEnemies ? [] : [
        makeAlien(nextActorId('alien'), 544, SCENE_2_5_LAYOUT.platforms[1].x, SCENE_2_5_LAYOUT.platforms[1].y, SCENE_2_5_LAYOUT.platforms[1].width),
        makeAlien(nextActorId('alien'), 1090, SCENE_2_5_LAYOUT.platforms[2].x, SCENE_2_5_LAYOUT.platforms[2].y, SCENE_2_5_LAYOUT.platforms[2].width),
        makeAlien(nextActorId('alien'), 1588, SCENE_2_5_LAYOUT.platforms[3].x, SCENE_2_5_LAYOUT.platforms[3].y, SCENE_2_5_LAYOUT.platforms[3].width),
      ];
      sceneRuntime.rocketPart = {
        id: 'scene2_5',
        assetName: 'rocket_part_04',
        x: SCENE_2_5_LAYOUT.rocketPart.x,
        y: SCENE_2_5_LAYOUT.rocketPart.y,
        width: SCENE_2_5_LAYOUT.rocketPart.width,
        height: SCENE_2_5_LAYOUT.rocketPart.height,
        collected: sceneRuntime.collectedPartIds.has('scene2_5'),
      };
      break;
    case 'scene3':
      sceneRuntime.enemies = disableEnemies ? [] : [
        makeBoss(nextActorId('boss'), 1450, SCENE_3_LAYOUT.platforms[0].x, SCENE_3_LAYOUT.platforms[0].y, SCENE_3_LAYOUT.platforms[0].width),
        makeUfo(nextActorId('ufo'), 1340, 340),
      ];
      sceneRuntime.rocketPart = {
        id: 'scene3',
        assetName: 'rocket_part_03',
        x: SCENE_3_LAYOUT.rocketPart.x,
        y: SCENE_3_LAYOUT.rocketPart.y,
        width: SCENE_3_LAYOUT.rocketPart.width,
        height: SCENE_3_LAYOUT.rocketPart.height,
        collected: sceneRuntime.collectedPartIds.has('scene3'),
        gatedByBoss: true,
      };
      break;
  }

  refreshObjectiveText();
}

function gameLoop(timestamp: number): void {
  const deltaTime = lastTime === 0 ? 0 : timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  draw();

  clearJustPressed();
  requestAnimationFrame(gameLoop);
}

// ---- Update ----
function update(_dt: number): void {
  const state = getState();

  switch (state) {
    case 'MENU':
      updateMenu(_dt);
      break;
    case 'CONTROLS':
      updateControls();
      break;
    case 'CUTSCENE':
      updateCutscene(_dt);
      if (isCutsceneDone()) {
        handleCutsceneComplete();
      }
      break;
    case 'PLAYING':
      updatePlaying(_dt);
      break;
    case 'PAUSED':
      updatePaused();
      break;
    case 'GAME_OVER':
      updateGameOver();
      break;
    case 'VICTORY':
      updateVictory();
      break;
  }
}

// ---- Draw ----
function draw(): void {
  const ctx = getCtx();
  const w = getWidth();
  const h = getHeight();

  // Clear
  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.fillRect(0, 0, w, h);

  const state = getState();

  switch (state) {
    case 'MENU':
      drawMenu(ctx, w, h);
      break;
    case 'CONTROLS':
      drawControls(ctx, w, h);
      break;
    case 'CUTSCENE':
      drawActiveCutscene(ctx, w, h);
      break;
    case 'PLAYING':
      drawPlaying(ctx, w, h);
      break;
    case 'PAUSED':
      drawPaused(ctx, w, h);
      break;
    case 'GAME_OVER':
      drawGameOver(ctx, w, h);
      break;
    case 'VICTORY':
      drawVictory(ctx, w, h);
      break;
  }

  if (state !== 'CUTSCENE') {
    drawPointer(ctx);
  }
}

// ---- Menu ----
function enterPlayableScene(sceneId: PlayableSceneId, resetPlayerState: boolean, entrance: 'left' | 'right' = 'left'): void {
  const scene = getPlayableSceneData(sceneId);
  const spawnX = entrance === 'right'
    ? Math.max(0, scene.worldWidth - PLAYER.WIDTH - 118)
    : scene.playerSpawn.x;
  const spawnY = entrance === 'right'
    ? scene.playerSpawn.y
    : scene.playerSpawn.y;

  setCurrentScene(scene);
  if (resetPlayerState) {
    initPlayer(spawnX, spawnY);
  } else {
    setPlayerPosition(spawnX, spawnY);
    refillAmmo();
  }

  setupSceneRuntime(sceneId);
  initCamera(0, 0, scene.worldWidth, scene.worldHeight, getWidth(), getHeight());
  snapCamera(spawnX + CAMERA.OFFSET_X, spawnY + CAMERA.OFFSET_Y);
  setState('PLAYING');
}

function parseDebugScene(value: string | null): PlayableSceneId | null {
  if (value === 'scene2' || value === 'scene2_5' || value === 'scene3') {
    return value;
  }
  return null;
}

function parseDebugCutscene(value: string | null): 1 | 4 | 5 | null {
  if (value === '1' || value === '4' || value === '5') {
    return Number(value) as 1 | 4 | 5;
  }
  return null;
}

function startDebugSceneFromUrl(): boolean {
  const params = new URLSearchParams(window.location.search);
  const debugState = params.get('debugState');
  if (debugState === 'menu') {
    setState('MENU');
    return true;
  }
  if (debugState === 'controls') {
    setState('CONTROLS');
    return true;
  }

  const debugCutscene = parseDebugCutscene(params.get('debugCutscene'));
  if (debugCutscene) {
    const progress = clamp(Number(params.get('cutsceneProgress')) || 0, 0, 0.999);
    initCamera(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, getWidth(), getHeight());
    snapCamera(DESIGN_WIDTH * 0.5, DESIGN_HEIGHT * 0.5);
    startCutscene(debugCutscene, 0, 0);
    if (progress > 0) {
      updateCutscene(progress * getCutscene().duration);
    }
    setState('CUTSCENE');
    return true;
  }

  const debugScene = parseDebugScene(params.get('debugScene'));
  if (!debugScene) return false;

  enterPlayableScene(debugScene, true);

  const playerX = Number(params.get('playerX'));
  const playerY = Number(params.get('playerY'));
  if (Number.isFinite(playerX) && Number.isFinite(playerY)) {
    setPlayerPosition(playerX, playerY);
    snapCamera(playerX + CAMERA.OFFSET_X, playerY + CAMERA.OFFSET_Y);
  }

  const aimX = Number(params.get('aimX'));
  const aimY = Number(params.get('aimY'));
  debugAimWorldOverride = Number.isFinite(aimX) && Number.isFinite(aimY) ? { x: aimX, y: aimY } : null;
  updatePlayerAimFacing();
  if (params.get('debugAutoShoot') === '1') {
    tryShootPlayerLaser();
  }

  return true;
}

function startGameFromMenu(): void {
  resetRunState();
  setCurrentScene(SCENE_1);
  initCamera(0, 0, SCENE_1.worldWidth, SCENE_1.worldHeight, getWidth(), getHeight());
  snapCamera(SCENE_1.playerSpawn.x, SCENE_1.playerSpawn.y);
  startCutscene(1, SCENE_1.playerSpawn.x, SCENE_1.playerSpawn.y);
  setState('CUTSCENE');
}

function tryExitFromMenu(): void {
  window.close();
  window.setTimeout(() => {
    if (!window.closed) {
      window.location.href = 'about:blank';
    }
  }, 120);
}

function updateMenu(dt: number): void {
  menuTime += dt / 1000;

  if (justPressed.jump) {
    startGameFromMenu();
    return;
  }

  if (!justPressed.shoot) {
    return;
  }

  const { x: mouseX, y: mouseY } = getCanvasPointer();
  const centerX = getWidth() / 2;
  const centerY = getHeight() / 2;

  if (pointInButton(mouseX, mouseY, centerX, centerY, MENU_BUTTON_START)) {
    startGameFromMenu();
    return;
  }

  if (pointInButton(mouseX, mouseY, centerX, centerY, MENU_BUTTON_CONTROLS)) {
    setState('CONTROLS');
    return;
  }

  if (pointInButton(mouseX, mouseY, centerX, centerY, MENU_BUTTON_EXIT)) {
    tryExitFromMenu();
    return;
  }

  if (justPressed.shoot) {
    startGameFromMenu();
  }
}

function drawCoverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number): void {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

function drawMenuButterflies(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const bflyImg = getAsset('butterfly_background');
  if (!bflyImg || !bflyImg.complete || bflyImg.naturalWidth === 0) return;

  for (const butterfly of MENU_BUTTERFLIES) {
    const t = menuTime * butterfly.speed + butterfly.phase;
    const x = w * (butterfly.baseX + Math.sin(t) * butterfly.ampX + Math.sin(t * 0.47) * 0.035);
    const y = h * (butterfly.baseY + Math.cos(t * 1.23) * butterfly.ampY + Math.sin(t * 0.71) * 0.030);
    const scale = 1 + Math.sin(t * 1.7) * 0.12;
    const width = butterfly.size * scale;
    const height = width * (bflyImg.naturalHeight / bflyImg.naturalWidth);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 1.4) * 0.18);
    ctx.globalAlpha = 0.75 + Math.sin(t * 2) * 0.15;
    ctx.drawImage(bflyImg, -width / 2, -height / 2, width, height);
    ctx.restore();
  }
}

function drawMenuButton(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  button: { x: number; y: number; width: number; height: number },
  label: string,
  colors: { fill: string; stroke: string; text: string }
): void {
  const left = centerX + button.x;
  const top = centerY + button.y;
  ctx.save();
  ctx.fillStyle = colors.fill;
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(left, top, button.width, button.height, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, left + button.width * 0.5, top + button.height * 0.5);
  ctx.restore();
}

function drawMenu(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const startScreenImg = getAsset('start_screen');
  if (startScreenImg && startScreenImg.complete && startScreenImg.naturalWidth > 0) {
    drawCoverImage(ctx, startScreenImg, w, h);
  } else {
    ctx.fillStyle = '#f7f7f4';
    ctx.fillRect(0, 0, w, h);
  }

  drawMenuButterflies(ctx, w, h);

  const centerX = w * 0.5;
  const centerY = h * 0.5;

  ctx.save();
  ctx.fillStyle = 'rgba(247, 247, 244, 0.90)';
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(centerX - 176, centerY + 44, 352, 268, 12);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawMenuButton(ctx, centerX, centerY, MENU_BUTTON_START, 'Start', {
    fill: '#111111',
    stroke: '#111111',
    text: '#f7f7f4',
  });
  drawMenuButton(ctx, centerX, centerY, MENU_BUTTON_CONTROLS, 'Controls', {
    fill: '#f7f7f4',
    stroke: '#111111',
    text: '#111111',
  });
  drawMenuButton(ctx, centerX, centerY, MENU_BUTTON_EXIT, 'Exit', {
    fill: '#d9d7d0',
    stroke: '#111111',
    text: '#111111',
  });
}

// ---- Controls ----
function updateControls(): void {
  if (justPressed.pause) {
    setState('MENU');
    return;
  }

  if (justPressed.jump) {
    startGameFromMenu();
    return;
  }

  if (!justPressed.shoot) {
    return;
  }

  const { x: mouseX, y: mouseY } = getCanvasPointer();
  const centerX = getWidth() / 2;
  const centerY = getHeight() / 2;

  if (pointInButton(mouseX, mouseY, centerX, centerY, CONTROLS_BUTTON_PLAY)) {
    startGameFromMenu();
    return;
  }

  if (pointInButton(mouseX, mouseY, centerX, centerY, CONTROLS_BUTTON_BACK)) {
    setState('MENU');
    return;
  }
}

function drawHealthPip(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.save();
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ff6b6b';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 22);
  ctx.bezierCurveTo(x - 4, y + 10, x + 2, y - 2, x + 12, y + 5);
  ctx.bezierCurveTo(x + 22, y - 2, x + 28, y + 10, x + 12, y + 22);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawControls(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#f3f2ed';
  ctx.fillRect(0, 0, w, h);

  const centerX = w * 0.5;
  const centerY = h * 0.5;

  ctx.fillStyle = '#f7f7f4';
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(centerX - 280, 64, 560, 496, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#111111';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Controls', centerX, 112);

  const controls = [
    ['A / Arrow Left', 'Move Left'],
    ['D / Arrow Right', 'Move Right'],
    ['W / Arrow Up', 'Climb Up / Jump'],
    ['S / Arrow Down', 'Climb Down / Crouch'],
    ['Space', 'Jump'],
    ['Left Click / J / Enter', 'Shoot Laser'],
    ['R', 'Restart'],
    ['Esc', 'Pause'],
  ];

  ctx.font = '18px Arial';
  let y = 178;
  controls.forEach(([key, action]) => {
    ctx.fillStyle = '#4b4b4b';
    ctx.textAlign = 'right';
    ctx.fillText(key, centerX - 24, y);
    ctx.fillStyle = '#111111';
    ctx.textAlign = 'left';
    ctx.fillText(action, centerX + 24, y);
    y += 38;
  });

  drawMenuButton(ctx, centerX, centerY, CONTROLS_BUTTON_PLAY, 'Play', {
    fill: '#111111',
    stroke: '#111111',
    text: '#f7f7f4',
  });
  drawMenuButton(ctx, centerX, centerY, CONTROLS_BUTTON_BACK, 'Back', {
    fill: '#f7f7f4',
    stroke: '#111111',
    text: '#111111',
  });
}

// ---- Playing ----
function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function pointInButton(mouseX: number, mouseY: number, centerX: number, centerY: number, button: { x: number; y: number; width: number; height: number }): boolean {
  const left = centerX + button.x;
  const top = centerY + button.y;
  return mouseX >= left && mouseX <= left + button.width && mouseY >= top && mouseY <= top + button.height;
}

function resetRunState(): void {
  sceneRuntime.collectedPartIds.clear();
  sceneRuntime.clearedSceneIds.clear();
  sceneRuntime.collectedParts = 0;
  sceneRuntime.enemies = [];
  sceneRuntime.projectiles = [];
  sceneRuntime.rocketPart = null;
  sceneRuntime.pendingTransition = null;
  sceneRuntime.flashTimerMs = 0;
  sceneRuntime.playerShotCooldownMs = 0;
  refreshObjectiveText();
}

function goToMenu(): void {
  resetRunState();
  setState('MENU');
}

function getPlayerBounds() {
  return getPlayerAABB();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function expandRect<T extends { x: number; y: number; width: number; height: number }>(rect: T, paddingX: number, paddingY = paddingX) {
  return {
    x: rect.x - paddingX,
    y: rect.y - paddingY,
    width: rect.width + paddingX * 2,
    height: rect.height + paddingY * 2,
  };
}

function getCanvasPointer() {
  const canvas = getCtx().canvas;
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return { x: getMouseX(), y: getMouseY() };
  }

  return {
    x: (getMouseX() - rect.left) * (getWidth() / rect.width),
    y: (getMouseY() - rect.top) * (getHeight() / rect.height),
  };
}

function getAimWorldPoint(): { x: number; y: number } {
  if (debugAimWorldOverride) {
    return debugAimWorldOverride;
  }

  const pointer = getCanvasPointer();
  const camera = getCamera();
  return {
    x: pointer.x + camera.x,
    y: pointer.y + camera.y,
  };
}

function getPlayerAimData(): {
  handX: number;
  handY: number;
  muzzleX: number;
  muzzleY: number;
  nx: number;
  ny: number;
  angle: number;
} {
  const player = getPlayer();
  const aimPoint = getAimWorldPoint();
  const visualW = player.crouching ? 74 : 78;
  const visualH = 96 * (player.crouching ? 0.70 : 1);
  const visualX = player.x + PLAYER.WIDTH * 0.5 - visualW * 0.5;
  const visualY = player.y + PLAYER.HEIGHT - visualH;
  const visualCenterX = visualX + visualW * 0.5;
  const facingRight = aimPoint.x >= visualCenterX;
  const shoulderX = visualX + visualW * (facingRight ? 0.68 : 0.32);
  const shoulderY = visualY + visualH * (player.crouching ? 0.52 : 0.47);
  let dx = aimPoint.x - shoulderX;
  let dy = aimPoint.y - shoulderY;
  let length = Math.hypot(dx, dy);

  if (length < 8) {
    dx = player.facing === 'left' ? -1 : 1;
    dy = 0;
    length = 1;
  }

  const nx = dx / length;
  const ny = dy / length;
  const handX = shoulderX + nx * 6;
  const handY = shoulderY + ny * 4;

  return {
    handX,
    handY,
    muzzleX: handX + nx * 32,
    muzzleY: handY + ny * 32,
    nx,
    ny,
    angle: Math.atan2(ny, nx),
  };
}

function updatePlayerAimFacing(): void {
  const player = getPlayer();
  const body = getPlayerAABB();
  const aimPoint = getAimWorldPoint();
  const centerX = body.x + body.width * 0.5;
  if (Math.abs(aimPoint.x - centerX) > 4) {
    player.facing = aimPoint.x < centerX ? 'left' : 'right';
  }
}

function spawnProjectile(
  kind: ProjectileKind,
  x: number,
  y: number,
  vx: number,
  vy: number,
  width: number,
  height: number,
  damage: number,
  ttlMs: number
): void {
  sceneRuntime.projectiles.push({
    id: nextActorId(kind),
    kind,
    x,
    y,
    vx,
    vy,
    width,
    height,
    damage,
    ttlMs,
  });
}

function tryShootPlayerLaser(): boolean {
  if (!consumeAmmo()) return false;

  const aim = getPlayerAimData();
  const bulletWidth = 44;
  const bulletHeight = 16;
  spawnProjectile(
    'player_laser',
    aim.muzzleX - bulletWidth * 0.5,
    aim.muzzleY - bulletHeight * 0.5,
    aim.nx * PROJECTILES.LASER.SPEED,
    aim.ny * PROJECTILES.LASER.SPEED,
    bulletWidth,
    bulletHeight,
    PROJECTILES.LASER.DAMAGE,
    2400
  );
  return true;
}

function getAlienMuzzle(enemy: EnemyRuntime, highShot: boolean): { x: number; y: number } {
  const muzzleX = enemy.dir > 0 ? enemy.x + enemy.width * 0.82 : enemy.x + enemy.width * 0.14;
  const muzzleY = enemy.y + enemy.height * (highShot ? 0.40 : 0.66);
  return { x: muzzleX, y: muzzleY };
}

function updateEnemyRuntime(dt: number): void {
  const player = getPlayer();

  for (const enemy of sceneRuntime.enemies) {
    enemy.cooldownMs -= dt;

    if (enemy.kind === 'ufo') {
      enemy.x += Math.sin((performance.now() + enemy.phase * 1000) * 0.0012) * enemy.speed;
      if (enemy.x < enemy.platformLeft) enemy.x = enemy.platformLeft;
      if (enemy.x > enemy.platformRight) enemy.x = enemy.platformRight;
      enemy.y = enemy.baseY + Math.sin((performance.now() + enemy.phase * 1200) * 0.0018) * 26;

      if (enemy.cooldownMs <= 0) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const len = Math.max(1, Math.hypot(dx, dy));
        const bulletSize = 24;
        spawnProjectile(
          'ufo_bullet',
          enemy.x + enemy.width * 0.5 - bulletSize * 0.5,
          enemy.y + enemy.height * 0.68 - bulletSize * 0.5,
          (dx / len) * PROJECTILES.UFO_BULLET.SPEED,
          (dy / len) * PROJECTILES.UFO_BULLET.SPEED,
          bulletSize,
          bulletSize,
          PROJECTILES.UFO_BULLET.DAMAGE,
          3600
        );
        enemy.cooldownMs = ENEMIES.UFO.SHOOT_INTERVAL;
      }
      continue;
    }

    if (!Number.isFinite(enemy.x) || !Number.isFinite(enemy.y)) {
      enemy.x = clamp(enemy.originX, enemy.platformLeft, enemy.platformRight);
      enemy.y = enemy.baseY;
    }
    enemy.x = clamp(enemy.x, enemy.platformLeft, enemy.platformRight);
    enemy.y = enemy.baseY;

    const dxToPlayer = player.x - enemy.x;
    const wantsChase = enemy.kind !== 'boss' && Math.abs(dxToPlayer) < ENEMIES.SMALL_ALIEN.DETECTION_RANGE + 90;
    const patrolMin = enemy.platformLeft;
    const patrolMax = enemy.platformRight;

    if (wantsChase) {
      enemy.dir = dxToPlayer < 0 ? -1 : 1;
      enemy.x += enemy.dir * enemy.speed;
    } else {
      enemy.x += enemy.dir * enemy.speed * 0.5;
      if (enemy.x <= patrolMin || enemy.x >= patrolMax) {
        enemy.dir *= -1;
      }
    }

    if (enemy.x < patrolMin) {
      enemy.x = patrolMin;
      enemy.dir = 1;
    }
    if (enemy.x > patrolMax) {
      enemy.x = patrolMax;
      enemy.dir = -1;
    }

    if (enemy.cooldownMs <= 0) {
      if (enemy.kind === 'alien') {
        const bulletDir = dxToPlayer < 0 ? -1 : 1;
        enemy.dir = bulletDir;
        const highShot = enemy.shotPatternIndex % 3 === 1;
        const muzzle = getAlienMuzzle(enemy, highShot);
        const bulletWidth = highShot ? 34 : 30;
        const bulletHeight = highShot ? 14 : 12;
        spawnProjectile(
          'alien_laser',
          muzzle.x - bulletWidth * 0.5,
          muzzle.y - bulletHeight * 0.5,
          bulletDir * (highShot ? PROJECTILES.ALIEN_BULLET.HIGH_SPEED : PROJECTILES.ALIEN_BULLET.BODY_SPEED),
          highShot ? -0.05 : 0,
          bulletWidth,
          bulletHeight,
          PROJECTILES.ALIEN_BULLET.DAMAGE,
          3600
        );
        sceneRuntime.projectiles[sceneRuntime.projectiles.length - 1].variant = highShot ? 'high' : 'body';
        enemy.shotPatternIndex += 1;
        enemy.cooldownMs = ENEMIES.SMALL_ALIEN.SHOOT_INTERVAL;
      } else if (enemy.kind === 'boss') {
        const playerCenterX = player.x + PLAYER.WIDTH * 0.5;
        const bossCenterX = enemy.x + enemy.width * 0.5;
        const bulletDir = playerCenterX < bossCenterX ? -1 : 1;
        enemy.dir = bulletDir;
        const rockWidth = 42;
        const rockHeight = 30;
        const muzzleX = bulletDir > 0 ? enemy.x + enemy.width * 0.78 : enemy.x + enemy.width * 0.16;
        const muzzleY = enemy.y + enemy.height * 0.56;
        spawnProjectile(
          'boss_rock',
          muzzleX - rockWidth * 0.5,
          muzzleY - rockHeight * 0.5,
          bulletDir * PROJECTILES.ROCK_BULLET.SPEED,
          -0.08,
          rockWidth,
          rockHeight,
          PROJECTILES.ROCK_BULLET.DAMAGE,
          4800
        );
        enemy.cooldownMs = ENEMIES.BOSS_ALIEN.ROCK_ATTACK_INTERVAL;
      }
    }

    if (enemy.kind === 'boss' && enemy.hp <= ENEMIES.BOSS_ALIEN.METEOR_TRIGGER_HP && !enemy.meteorUsed) {
      enemy.meteorUsed = true;
      for (let i = 0; i < ENEMIES.BOSS_ALIEN.METEOR_COUNT; i++) {
        const meteorX = 280 + i * 300;
        spawnProjectile('meteor', meteorX, -80 - i * 60, 0, PROJECTILES.METEOR.SPEED, 52, 52, PROJECTILES.METEOR.DAMAGE, 5000);
      }
    }
  }

  sceneRuntime.enemies = sceneRuntime.enemies.filter((enemy) => enemy.hp > 0);
}

function updateProjectileRuntime(dt: number): void {
  const playerBounds = getPlayerBounds();

  for (const projectile of sceneRuntime.projectiles) {
    projectile.x += projectile.vx;
    projectile.y += projectile.vy;
    projectile.ttlMs -= dt;

    if (projectile.kind !== 'player_laser' && rectsOverlap(projectile, playerBounds)) {
      takeDamage();
      sceneRuntime.flashTimerMs = 120;
      projectile.ttlMs = 0;
      continue;
    }

    if (projectile.kind === 'player_laser') {
      for (const enemy of sceneRuntime.enemies) {
        if (rectsOverlap(projectile, enemy)) {
          enemy.hp -= projectile.damage;
          projectile.ttlMs = 0;
          break;
        }
      }
    }
  }

  sceneRuntime.projectiles = sceneRuntime.projectiles.filter((projectile) => {
    return projectile.ttlMs > 0 && projectile.x > -120 && projectile.x < DESIGN_WIDTH + 120 && projectile.y > -160 && projectile.y < DESIGN_HEIGHT + 160;
  });
}

function updateRocketPartCollection(): void {
  if (!sceneRuntime.rocketPart || sceneRuntime.rocketPart.collected) return;
  if (sceneRuntime.rocketPart.gatedByBoss && sceneRuntime.enemies.some((enemy) => enemy.kind === 'boss')) return;

  if (rectsOverlap(getPlayerBounds(), expandRect(sceneRuntime.rocketPart, 10, 8))) {
    sceneRuntime.rocketPart.collected = true;
    sceneRuntime.collectedPartIds.add(sceneRuntime.rocketPart.id);
    refreshObjectiveText();
  }
}

function updateEnemyContactDamage(): void {
  const playerBounds = getPlayerBounds();
  for (const enemy of sceneRuntime.enemies) {
    if (rectsOverlap(enemy, playerBounds)) {
      takeDamage();
      sceneRuntime.flashTimerMs = 120;
      break;
    }
  }
}

function handleSceneExit(): void {
  const player = getPlayer();
  const scene = getPlayableSceneData(sceneRuntime.sceneId);
  const reachedRightEdge = player.x + PLAYER.WIDTH >= scene.worldWidth - 24;
  const reachedLeftEdge = player.x <= 4;
  const currentPartCollected = !sceneRuntime.rocketPart || sceneRuntime.rocketPart.collected;

  if (reachedLeftEdge) {
    if (sceneRuntime.sceneId === 'scene2_5') {
      sceneRuntime.pendingTransition = 'scene2';
    } else if (sceneRuntime.sceneId === 'scene3') {
      sceneRuntime.pendingTransition = 'scene2_5';
    }
    return;
  }

  if (!reachedRightEdge) return;

  if (sceneRuntime.sceneId === 'scene2') {
    sceneRuntime.clearedSceneIds.add('scene2');
    sceneRuntime.pendingTransition = 'scene2_5';
  } else if (sceneRuntime.sceneId === 'scene2_5') {
    sceneRuntime.clearedSceneIds.add('scene2_5');
    sceneRuntime.pendingTransition = 'scene3';
  } else if (
    sceneRuntime.sceneId === 'scene3' &&
    sceneRuntime.enemies.length === 0 &&
    currentPartCollected &&
    sceneRuntime.collectedPartIds.size >= 3
  ) {
    sceneRuntime.clearedSceneIds.add('scene3');
    sceneRuntime.pendingTransition = 'scene4_cutscene';
  }
}

function updateSceneRuntime(dt: number): void {
  sceneRuntime.playerShotCooldownMs = Math.max(0, sceneRuntime.playerShotCooldownMs - dt);
  if ((justPressed.shoot || keys.shoot) && sceneRuntime.playerShotCooldownMs <= 0) {
    if (tryShootPlayerLaser()) {
      sceneRuntime.playerShotCooldownMs = PLAYER_SHOT_COOLDOWN_MS;
    }
  }

  updateEnemyRuntime(dt);
  updateProjectileRuntime(dt);
  updateEnemyContactDamage();
  updateRocketPartCollection();
  handleSceneExit();

  if (sceneRuntime.flashTimerMs > 0) {
    sceneRuntime.flashTimerMs = Math.max(0, sceneRuntime.flashTimerMs - dt);
  }
}

function processSceneTransition(): void {
  if (!sceneRuntime.pendingTransition) return;

  const next = sceneRuntime.pendingTransition;
  sceneRuntime.pendingTransition = null;

  if (next === 'victory') {
    setState('VICTORY');
    return;
  }

  if (next === 'scene4_cutscene') {
    startFinalCutscene(4);
    return;
  }

  if (next === 'scene5_cutscene') {
    startFinalCutscene(5);
    return;
  }

  const from = sceneRuntime.sceneId;
  const backtracking =
    (from === 'scene2_5' && next === 'scene2') ||
    (from === 'scene3' && next === 'scene2_5');
  enterPlayableScene(next, false, backtracking ? 'right' : 'left');
}

function updatePlaying(_dt: number): void {
  if (justPressed.pause) {
    setState('PAUSED');
    return;
  }
  if (justPressed.restart) {
    startGameFromMenu();
    return;
  }
  updatePlayer(_dt);
  updatePlayerAimFacing();
  updateSceneRuntime(_dt);
  const p = getPlayer();
  setCameraTarget(p.x + CAMERA.OFFSET_X, p.y + CAMERA.OFFSET_Y);
  updateCamera(_dt);
  processSceneTransition();
  if (p.hp <= 0) {
    setState('GAME_OVER');
  }
}

function drawSoftFog(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, alpha: number): void {
  // Safety check: skip jika nilai tidak finite
  if (!isFinite(x) || !isFinite(y) || !isFinite(radius)) return;
  try {
    const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    gradient.addColorStop(0, `rgba(120, 120, 120, ${alpha})`);
    gradient.addColorStop(0.45, `rgba(160, 160, 160, ${alpha * 0.42})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  } catch (e) {
    // Skip fog jika error
  }
}

function drawStageBackground(ctx: CanvasRenderingContext2D, w: number, h: number, camX: number, camY: number): void {
  const layout = getPlayableSceneLayout(sceneRuntime.sceneId);
  ctx.fillStyle = '#f7f7f4';
  ctx.fillRect(0, 0, w, h);

  drawSoftFog(ctx, 70 - camX * 0.14, 420 - camY * 0.08, 200, 0.24);
  drawSoftFog(ctx, 820 - camX * 0.12, 390 - camY * 0.08, 255, 0.26);
  drawSoftFog(ctx, 1295 - camX * 0.12, 385 - camY * 0.08, 280, 0.24);
  drawSoftFog(ctx, 1540 - camX * 0.10, 470 - camY * 0.08, 220, 0.18);

  if ('swirls' in layout) {
    for (const swirl of layout.swirls) {
      drawWorldAsset(ctx, 'portal_effect', swirl.x, swirl.y, swirl.width, swirl.height, camX * 0.18, camY * 0.12, {
        alpha: swirl.alpha,
      });
    }
  }

  drawWorldAsset(
    ctx,
    'background_moon',
    layout.moon.x,
    layout.moon.y,
    layout.moon.width,
    layout.moon.height,
    camX * 0.10,
    camY * 0.06,
    { alpha: sceneRuntime.sceneId === 'scene3' ? 0.36 : 0.44 }
  );

  if ('butterflies' in layout) {
    for (const butterfly of layout.butterflies) {
      drawWorldAsset(ctx, 'butterfly_background', butterfly.x, butterfly.y, butterfly.size, butterfly.size, camX * 0.14, camY * 0.08, {
        alpha: butterfly.alpha,
      });
      drawButterflySilhouette(
        ctx,
        butterfly.x - camX * 0.14 + butterfly.size * 0.5,
        butterfly.y - camY * 0.08 + butterfly.size * 0.5,
        butterfly.size * 0.55,
        butterfly.alpha
      );
    }
  }
}

function drawBridge(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, camX: number, camY: number): void {
  const bridgeHeight = 86;
  const drawX = x - camX;
  const drawY = y - camY;
  const moduleWidth = 160;
  const railHeight = 10;

  ctx.save();
  ctx.strokeStyle = '#101010';
  ctx.lineWidth = railHeight;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(drawX, drawY);
  ctx.lineTo(drawX + width, drawY);
  ctx.moveTo(drawX, drawY + bridgeHeight - railHeight);
  ctx.lineTo(drawX + width, drawY + bridgeHeight - railHeight);
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(drawX, drawY, width, bridgeHeight);
  ctx.clip();

  for (let moduleX = drawX + 12; moduleX < drawX + width; moduleX += moduleWidth) {
    const right = moduleX + moduleWidth - 20;
    ctx.beginPath();
    ctx.moveTo(moduleX, drawY + railHeight);
    ctx.lineTo(right, drawY + bridgeHeight - railHeight);
    ctx.moveTo(right, drawY + railHeight);
    ctx.lineTo(moduleX, drawY + bridgeHeight - railHeight);
    ctx.lineWidth = 8;
    ctx.stroke();
  }
  ctx.restore();
}

function drawStagePlatforms(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
  for (const plat of getPlayableSceneData(sceneRuntime.sceneId).platforms) {
    drawBridge(ctx, plat.x, plat.y, plat.width, camX, camY);
  }
}

function drawStageMidground(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
  for (const vine of getPlayableSceneLayout(sceneRuntime.sceneId).vines) {
    drawVerticalVine(ctx, vine, camX, camY, {
      alpha: vine.climbable ? 0.96 : 0.92,
      sway: vine.climbable ? 4 : 6,
      segmentHeight: vine.climbable ? 240 : 210,
    });
  }
}

function drawStageProps(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
  const scene = getPlayableSceneData(sceneRuntime.sceneId);
  const layout = getPlayableSceneLayout(sceneRuntime.sceneId);
  const drawPortal = (portal: { x: number; y: number; width: number; height: number }, alphaBase: number): void => {
    const pulse = 1 + Math.sin(performance.now() * 0.004) * 0.06;
    const width = portal.width * pulse;
    const height = portal.height * pulse;
    const x = portal.x + portal.width * 0.5 - width * 0.5;
    const y = portal.y + portal.height * 0.5 - height * 0.5;
    drawWorldAsset(
      ctx,
      'portal_effect',
      x,
      y,
      width,
      height,
      camX,
      camY,
      { alpha: alphaBase + Math.sin(performance.now() * 0.006) * 0.06 }
    );
  };

  if (scene.portal.width > 0 && scene.portal.height > 0) {
    drawPortal(scene.portal, 0.9);
  }

  if (sceneRuntime.sceneId !== 'scene2' && 'backPortal' in layout) {
    drawPortal(layout.backPortal, 0.68);
  }
}

function drawStageForeground(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
  for (const bush of getPlayableSceneLayout(sceneRuntime.sceneId).bushes) {
    drawWorldAsset(ctx, 'bush_decoration', bush.x, bush.y, bush.width, bush.height, camX * 0.92, camY, { alpha: 1 });
  }
}

function drawUfo(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
  ctx.save();
  ctx.fillStyle = 'rgba(5, 5, 5, 0.16)';
  ctx.beginPath();
  ctx.ellipse(x + width * 0.5, y + height * 0.86, width * 0.34, height * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (!drawCroppedAsset(ctx, 'rocket_part_02', x, y, width, height, { alpha: 1 })) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 5;
    ctx.fillStyle = '#f7f7f4';
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.54, width * 0.46, height * 0.28, -0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.ellipse(width * 0.56, height * 0.46, width * 0.16, height * 0.18, 0.56, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawPlayerAimWeapon(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
  const aim = getPlayerAimData();

  ctx.save();
  ctx.translate(aim.handX - camX, aim.handY - camY);
  ctx.rotate(aim.angle);
  if (aim.nx < 0) {
    ctx.scale(1, -1);
  }

  ctx.fillStyle = '#050505';
  ctx.beginPath();
  ctx.roundRect(-4, -4, 22, 8, 3);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(3, 2, 7, 12, 3);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(16, -2, 10, 5, 2);
  ctx.fill();
  ctx.fillStyle = '#d4d0ca';
  ctx.beginPath();
  ctx.roundRect(-1, -2, 12, 4, 2);
  ctx.fill();
  ctx.strokeStyle = '#050505';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-7, 0);
  ctx.lineTo(-18, 2);
  ctx.stroke();

  ctx.restore();
}

function drawPointer(ctx: CanvasRenderingContext2D): void {
  const { x, y } = getCanvasPointer();
  ctx.save();
  ctx.strokeStyle = '#111111';
  ctx.fillStyle = '#111111';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 16, y);
  ctx.lineTo(x - 7, y);
  ctx.moveTo(x + 7, y);
  ctx.lineTo(x + 16, y);
  ctx.moveTo(x, y - 16);
  ctx.lineTo(x, y - 7);
  ctx.moveTo(x, y + 7);
  ctx.lineTo(x, y + 16);
  ctx.stroke();
  ctx.restore();
}

function drawLaserProjectile(ctx: CanvasRenderingContext2D, projectile: ProjectileRuntime, camX: number, camY: number): void {
  const color = projectile.kind === 'player_laser'
    ? '#111111'
    : projectile.variant === 'high'
      ? '#474747'
      : '#2d2d2d';
  const centerX = projectile.x - camX + projectile.width * 0.5;
  const centerY = projectile.y - camY + projectile.height * 0.5;
  const angle = Math.atan2(projectile.vy, projectile.vx);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);
  drawCroppedAsset(ctx, 'laser_bullet', -projectile.width * 0.5, -projectile.height * 0.5, projectile.width, projectile.height, { alpha: 1 });
  if (projectile.kind === 'player_laser') {
    ctx.strokeStyle = '#f7f7f4';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-projectile.width * 0.45, 0);
    ctx.lineTo(projectile.width * 0.45, 0);
    ctx.stroke();

    ctx.strokeStyle = '#050505';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-projectile.width * 0.42, 0);
    ctx.lineTo(projectile.width * 0.42, 0);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.globalAlpha = projectile.kind === 'player_laser' ? 0.32 : 0.22;
  ctx.fillRect(-projectile.width * 0.5, -projectile.height * 0.5, projectile.width, projectile.height);
  ctx.restore();
}

function drawSceneRuntimeActors(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
  if (sceneRuntime.rocketPart && !sceneRuntime.rocketPart.collected) {
    const blocked = sceneRuntime.rocketPart.gatedByBoss && sceneRuntime.enemies.some((enemy) => enemy.kind === 'boss');
    if (!blocked) {
      drawWorldAsset(
        ctx,
        sceneRuntime.rocketPart.assetName,
        sceneRuntime.rocketPart.x,
        sceneRuntime.rocketPart.y,
        sceneRuntime.rocketPart.width,
        sceneRuntime.rocketPart.height,
        camX,
        camY,
        { alpha: 0.98 }
      );
    }
  }

  for (const enemy of sceneRuntime.enemies) {
    if (enemy.kind === 'ufo') {
      drawUfo(ctx, enemy.x - camX, enemy.y - camY, enemy.width, enemy.height);
      continue;
    }

    const stepLift = Math.abs(Math.sin(performance.now() * 0.008 + enemy.phase)) * 3;

    ctx.save();
    ctx.fillStyle = 'rgba(5, 5, 5, 0.18)';
    ctx.beginPath();
    ctx.ellipse(
      enemy.x - camX + enemy.width * 0.5,
      enemy.y - camY + enemy.height - 2,
      enemy.width * 0.38,
      6,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    drawWorldAsset(
      ctx,
      'alien_shooter',
      enemy.x,
      enemy.y - stepLift,
      enemy.width,
      enemy.height,
      camX,
      camY,
      { alpha: 1, flipX: enemy.kind === 'boss' ? enemy.dir > 0 : enemy.dir < 0 }
    );

    if (enemy.kind === 'alien' || enemy.kind === 'boss') {
      const muzzle = enemy.kind === 'boss'
        ? {
            x: enemy.dir > 0 ? enemy.x + enemy.width * 0.78 : enemy.x + enemy.width * 0.16,
            y: enemy.y + enemy.height * 0.56,
          }
        : getAlienMuzzle(enemy, false);
      ctx.save();
      ctx.fillStyle = '#050505';
      ctx.beginPath();
      ctx.ellipse(muzzle.x - camX, muzzle.y - camY + 4, enemy.kind === 'boss' ? 8 : 5, enemy.kind === 'boss' ? 6 : 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (const projectile of sceneRuntime.projectiles) {
    if (projectile.kind === 'meteor') {
      drawWorldAsset(ctx, 'meteor_projectile', projectile.x, projectile.y, projectile.width, projectile.height, camX, camY, { alpha: 1 });
      continue;
    }
    if (projectile.kind === 'boss_rock') {
      drawWorldAsset(ctx, 'bullet_boss', projectile.x, projectile.y, projectile.width, projectile.height, camX, camY, {
        alpha: 1,
        flipX: projectile.vx < 0,
      });
      continue;
    }

    drawLaserProjectile(ctx, projectile, camX, camY);
  }
}

function drawSolidHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha = 1): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#050505';
  ctx.beginPath();
  ctx.moveTo(x + size * 0.50, y + size * 0.88);
  ctx.bezierCurveTo(x - size * 0.18, y + size * 0.42, x + size * 0.06, y - size * 0.12, x + size * 0.50, y + size * 0.22);
  ctx.bezierCurveTo(x + size * 0.94, y - size * 0.12, x + size * 1.18, y + size * 0.42, x + size * 0.50, y + size * 0.88);
  ctx.fill();
  ctx.restore();
}

function drawStageHud(ctx: CanvasRenderingContext2D): void {
  const p = getPlayer();

  ctx.save();
  ctx.fillStyle = '#f7f7f4';
  ctx.strokeStyle = '#050505';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 20, 74, 74);
  ctx.fillRect(20, 22, 70, 70);
  drawCroppedAsset(ctx, 'astronaut_idle', 38, 28, 34, 48, { alpha: 1 });

  for (let i = 0; i < PLAYER.MAX_HP; i++) {
    const alpha = i < p.hp ? 1 : 0.18;
    if (!drawCroppedAsset(ctx, 'health_icon', 108 + i * 34, 22, 30, 28, { alpha })) {
      drawSolidHeart(ctx, 108 + i * 34, 22, 28, alpha);
    }
  }

  if (!drawCroppedAsset(ctx, 'laser_weapon', 108, 58, 42, 30)) {
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(112, 75);
    ctx.lineTo(145, 66);
    ctx.lineTo(148, 76);
    ctx.lineTo(118, 84);
    ctx.stroke();
  }
  drawCroppedAsset(ctx, 'laser_bullet', 158, 64, 38, 20);

  ctx.fillStyle = '#050505';
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.ammo > 0 ? `x ${p.ammo}` : 'EMPTY', 204, 76);

  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(sceneRuntime.objectiveText, 108, 112);
  ctx.restore();
}

function drawPlaying(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const cam = getCamera();
  const camX = cam.x;
  const camY = cam.y;

  drawStageBackground(ctx, w, h, camX, camY);
  drawStageMidground(ctx, camX, camY);
  drawStagePlatforms(ctx, camX, camY);
  drawStageProps(ctx, camX, camY);
  drawSceneRuntimeActors(ctx, camX, camY);
  drawPlayer(ctx, camX, camY);
  drawPlayerAimWeapon(ctx, camX, camY);
  drawStageForeground(ctx, camX, camY);
  drawStageHud(ctx);

  if (sceneRuntime.flashTimerMs > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 80, 80, 0.12)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

// ---- Paused ----
function updatePaused(): void {
  if (justPressed.pause) {
    setState('PLAYING');
    return;
  }

  if (!justPressed.shoot) {
    return;
  }

  const { x: mouseX, y: mouseY } = getCanvasPointer();
  const centerX = getWidth() / 2;
  const centerY = getHeight() / 2;

  if (pointInButton(mouseX, mouseY, centerX, centerY, { ...MENU_BUTTON_RESTART, y: 0 })) {
    setState('PLAYING');
    return;
  }

  if (pointInButton(mouseX, mouseY, centerX, centerY, { ...MENU_BUTTON_QUIT, y: 70 })) {
    goToMenu();
  }
}

function drawPaused(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', w / 2, h / 3);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(w / 2 - 100, h / 2, 200, 50);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Resume', w / 2, h / 2 + 32);

  ctx.strokeStyle = '#888888';
  ctx.strokeRect(w / 2 - 100, h / 2 + 70, 200, 50);
  ctx.fillStyle = '#888888';
  ctx.fillText('Quit', w / 2, h / 2 + 102);
}

// ---- Game Over ----
function updateGameOver(): void {
  if (justPressed.restart || justPressed.jump) {
    startGameFromMenu();
    return;
  }

  if (justPressed.pause) {
    goToMenu();
    return;
  }

  if (!justPressed.shoot) {
    return;
  }

  const { x: mouseX, y: mouseY } = getCanvasPointer();
  const centerX = getWidth() / 2;
  const centerY = getHeight() / 2;

  if (pointInButton(mouseX, mouseY, centerX, centerY, MENU_BUTTON_RESTART)) {
    startGameFromMenu();
    return;
  }

  if (pointInButton(mouseX, mouseY, centerX, centerY, MENU_BUTTON_QUIT)) {
    goToMenu();
  }
}

function drawGameOver(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', w / 2, h / 3);

  ctx.fillStyle = '#888888';
  ctx.font = '20px Arial';
  ctx.fillText('The astronaut did not survive...', w / 2, h / 3 + 50);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(w / 2 - 100, h / 2 + 20, 200, 50);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Restart', w / 2, h / 2 + 52);

  ctx.strokeStyle = '#888888';
  ctx.strokeRect(w / 2 - 100, h / 2 + 90, 200, 50);
  ctx.fillStyle = '#888888';
  ctx.fillText('Back to Menu', w / 2, h / 2 + 122);
}

// ---- Victory ----
function updateVictory(): void {
  if (justPressed.restart || justPressed.jump) {
    startGameFromMenu();
    return;
  }

  if (justPressed.pause) {
    goToMenu();
    return;
  }

  if (!justPressed.shoot) {
    return;
  }

  const { x: mouseX, y: mouseY } = getCanvasPointer();
  const centerX = getWidth() / 2;
  const centerY = getHeight() / 2;

  if (pointInButton(mouseX, mouseY, centerX, centerY, { x: -100, y: 60, width: 200, height: 50 })) {
    startGameFromMenu();
    return;
  }

  if (pointInButton(mouseX, mouseY, centerX, centerY, { x: -100, y: 130, width: 200, height: 50 })) {
    goToMenu();
  }
}

function drawVictory(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('MISSION COMPLETE', w / 2, h / 3 - 20);

  ctx.fillStyle = '#aaaaaa';
  ctx.font = '18px Arial';
  ctx.fillText('All rocket parts recovered.', w / 2, h / 3 + 30);
  ctx.fillText('Rocket repaired successfully.', w / 2, h / 3 + 60);
  ctx.fillText('Astronaut escaped the planet.', w / 2, h / 3 + 90);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(w / 2 - 100, h / 2 + 60, 200, 50);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Restart', w / 2, h / 2 + 92);

  ctx.strokeStyle = '#888888';
  ctx.strokeRect(w / 2 - 100, h / 2 + 130, 200, 50);
  ctx.fillStyle = '#888888';
  ctx.fillText('Back to Menu', w / 2, h / 2 + 162);
}

// ---- Cutscene ----
function startFinalCutscene(sceneIndex: 4 | 5): void {
  initCamera(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, getWidth(), getHeight());
  snapCamera(DESIGN_WIDTH * 0.5, DESIGN_HEIGHT * 0.5);
  startCutscene(sceneIndex, 0, 0);
  setState('CUTSCENE');
}

function handleCutsceneComplete(): void {
  const cutscene = getCutscene();
  if (cutscene.sceneIndex === 1) {
    enterPlayableScene('scene2', true);
    return;
  }
  if (cutscene.sceneIndex === 4) {
    startFinalCutscene(5);
    return;
  }
  if (cutscene.sceneIndex === 5) {
    setState('VICTORY');
  }
}

function drawActiveCutscene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const cutscene = getCutscene();
  if (cutscene.sceneIndex === 4) {
    drawScene4RepairCutscene(ctx, w, h);
    return;
  }
  if (cutscene.sceneIndex === 5) {
    drawScene5LaunchCutscene(ctx, w, h);
    return;
  }
  drawScene1Cutscene(ctx, w, h);
}

function drawDenseTiles(
  ctx: CanvasRenderingContext2D,
  assetName: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    tileWidth: number;
    tileHeight: number;
    stepX: number;
    stepY: number;
    scaleMin: number;
    scaleMax: number;
    seed: number;
    alpha?: number;
  }
): void {
  let index = 0;
  for (let tileY = y; tileY < y + height; tileY += options.stepY) {
    for (let tileX = x; tileX < x + width; tileX += options.stepX) {
      const n = deterministicNoise(index, options.seed);
      const m = deterministicNoise(index, options.seed + 17);
      const scale = lerp(options.scaleMin, options.scaleMax, n);
      const offsetX = (m - 0.5) * options.stepX * 0.55;
      const offsetY = (n - 0.5) * options.stepY * 0.28;
      drawCroppedAsset(ctx, assetName, tileX + offsetX, tileY + offsetY, options.tileWidth * scale, options.tileHeight * scale, {
        alpha: options.alpha ?? 1,
        flipX: n > 0.5,
      });
      index++;
    }
  }
}

function drawLeftBush(ctx: CanvasRenderingContext2D): void {
  const { bush, leftVine } = SCENE_1_LAYOUT;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, bush.y, leftVine.x + leftVine.width * 0.78, DESIGN_HEIGHT - bush.y);
  ctx.clip();

  ctx.fillStyle = '#222525';
  ctx.fillRect(0, bush.y + 118, leftVine.x + leftVine.width * 0.42, DESIGN_HEIGHT - bush.y);

  drawDenseTiles(ctx, 'bush_decoration', bush.x, bush.y + 30, bush.width, bush.height, {
    tileWidth: 300,
    tileHeight: 282,
    stepX: 132,
    stepY: 126,
    scaleMin: 0.92,
    scaleMax: 1.22,
    seed: 11,
    alpha: 0.98,
  });

  drawDenseTiles(ctx, 'bush_decoration', bush.x + 62, bush.y + 138, bush.width - 20, bush.height, {
    tileWidth: 220,
    tileHeight: 208,
    stepX: 100,
    stepY: 98,
    scaleMin: 0.82,
    scaleMax: 1.05,
    seed: 37,
    alpha: 0.96,
  });

  ctx.restore();
}

function drawLeafStrand(ctx: CanvasRenderingContext2D, strand: { x: number; width: number; length: number; seed: number }): void {
  const startY = SCENE_1_LAYOUT.leafArea.y - 20;
  const tileHeight = 165;
  const stepY = 88;

  for (let y = startY, index = 0; y < startY + strand.length; y += stepY, index++) {
    const n = deterministicNoise(index, strand.seed);
    const m = deterministicNoise(index, strand.seed + 29);
    const scale = 0.88 + n * 0.24;
    const offsetX = (m - 0.5) * 54;
    drawCroppedAsset(ctx, 'leaf_decoration', strand.x + offsetX, y, strand.width * scale, tileHeight * scale, {
      alpha: 0.96,
      flipX: n > 0.52,
    });
  }
}

function drawRightLeaves(ctx: CanvasRenderingContext2D): void {
  const { leafArea } = SCENE_1_LAYOUT;

  ctx.save();
  ctx.beginPath();
  ctx.rect(leafArea.x - 42, leafArea.y - 32, leafArea.width + 80, DESIGN_HEIGHT - leafArea.y + 52);
  ctx.clip();

  ctx.fillStyle = 'rgba(31, 32, 31, 0.36)';
  ctx.fillRect(leafArea.x + 10, leafArea.y - 10, leafArea.width, 82);

  for (const strand of SCENE_1_LEAF_STRANDS) {
    drawLeafStrand(ctx, strand);
  }

  ctx.restore();
}

function drawSceneBridge(ctx: CanvasRenderingContext2D): void {
  const { bridge } = SCENE_1_LAYOUT;
  const moduleWidth = 160;
  const railHeight = 14;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#101010';
  ctx.lineWidth = railHeight;
  ctx.beginPath();
  ctx.moveTo(bridge.x, bridge.y);
  ctx.lineTo(bridge.x + bridge.width, bridge.y);
  ctx.moveTo(bridge.x, bridge.y + bridge.height - railHeight);
  ctx.lineTo(bridge.x + bridge.width, bridge.y + bridge.height - railHeight);
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(bridge.x, bridge.y, bridge.width, bridge.height);
  ctx.clip();

  for (let moduleX = bridge.x + 16; moduleX < bridge.x + bridge.width; moduleX += moduleWidth) {
    const right = moduleX + moduleWidth - 24;
    ctx.beginPath();
    ctx.moveTo(moduleX, bridge.y + railHeight);
    ctx.lineTo(right, bridge.y + bridge.height - railHeight);
    ctx.moveTo(right, bridge.y + railHeight);
    ctx.lineTo(moduleX, bridge.y + bridge.height - railHeight);
    ctx.lineWidth = 10;
    ctx.stroke();
  }
  ctx.restore();
}

function drawSceneFog(ctx: CanvasRenderingContext2D): void {
  drawSoftFog(ctx, 780, 420, 330, 0.14);
  drawSoftFog(ctx, 865, 690, 285, 0.10);
}

function drawSceneLeftVine(ctx: CanvasRenderingContext2D): void {
  drawVerticalVine(ctx, { ...SCENE_1_LAYOUT.leftVine, flipX: true }, 0, 0, {
    alpha: 0.98,
    sway: 4,
    segmentHeight: 230,
  });
}

function drawSceneRightVine(ctx: CanvasRenderingContext2D): void {
  drawVerticalVine(ctx, SCENE_1_LAYOUT.rightVine, 0, 0, {
    alpha: 0.98,
    sway: 4,
    segmentHeight: 230,
  });
}

function drawSceneButterflies(ctx: CanvasRenderingContext2D, time: number): void {
  const butterflies = [
    { bx: 635, by: 350, ax: 36, ay: 20, sp: 1.15, ph: 0.2, sz: 34 },
    { bx: 815, by: 470, ax: 28, ay: 24, sp: 0.86, ph: 1.8, sz: 38 },
    { bx: 690, by: 632, ax: 42, ay: 25, sp: 1.02, ph: 3.0, sz: 32 },
    { bx: 915, by: 740, ax: 34, ay: 18, sp: 0.74, ph: 4.2, sz: 36 },
    { bx: 930, by: 285, ax: 24, ay: 18, sp: 1.25, ph: 5.4, sz: 28 },
  ];

  for (const b of butterflies) {
    const x = b.bx + Math.sin(time * b.sp + b.ph) * b.ax;
    const y = b.by + Math.cos(time * b.sp * 1.23 + b.ph) * b.ay;
    const alpha = 0.72 + Math.sin(time * 2 + b.ph) * 0.14;
    drawCroppedAsset(ctx, 'butterfly_background', x, y, b.sz, b.sz, { alpha });
    drawButterflySilhouette(ctx, x + b.sz * 0.5, y + b.sz * 0.5, b.sz * 0.42, alpha);
  }
}

function getAstronautX(): number {
  const { rightVine, astronaut } = SCENE_1_LAYOUT;
  return rightVine.x + rightVine.width * 0.22 - astronaut.width * 0.55;
}

function drawButterflySilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.28);
  ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.95, alpha + 0.12)})`;
  ctx.beginPath();
  ctx.ellipse(-size * 0.34, -size * 0.12, size * 0.30, size * 0.18, -0.55, 0, Math.PI * 2);
  ctx.ellipse(size * 0.34, -size * 0.12, size * 0.30, size * 0.18, 0.55, 0, Math.PI * 2);
  ctx.ellipse(-size * 0.18, size * 0.14, size * 0.18, size * 0.12, 0.35, 0, Math.PI * 2);
  ctx.ellipse(size * 0.18, size * 0.14, size * 0.18, size * 0.12, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawClimbingAstronaut(ctx: CanvasRenderingContext2D, progress: number): void {
  const { astronaut } = SCENE_1_LAYOUT;
  const t = clamp01(progress);
  const eased = easeInOutQuad(t);
  const x = getAstronautX() + Math.sin(t * Math.PI * 6) * 1.4;
  const y = lerp(astronaut.climbStartY, astronaut.climbEndY, eased);
  const angle = Math.sin(t * Math.PI * 6) * 0.02;

  ctx.save();
  ctx.translate(x + astronaut.width * 0.48, y + astronaut.height * 0.44);
  ctx.rotate(angle);
  drawCroppedAsset(ctx, 'astronaut_idle', -astronaut.width * 0.48, -astronaut.height * 0.44, astronaut.width, astronaut.height, { alpha: 1 });
  ctx.restore();
}

function drawSceneHud(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = '#f7f7f4';
  ctx.strokeStyle = '#050505';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 22, 72, 72);
  ctx.fillRect(22, 24, 68, 68);
  drawCroppedAsset(ctx, 'astronaut_idle', 39, 32, 34, 48, { alpha: 1 });

  for (let i = 0; i < PLAYER.MAX_HP; i++) {
    if (!drawCroppedAsset(ctx, 'health_icon', 112 + i * 42, 24, 36, 34)) {
      drawSolidHeart(ctx, 112 + i * 42, 24, 34);
    }
  }

  drawCroppedAsset(ctx, 'laser_weapon', 112, 70, 48, 35);
  drawCroppedAsset(ctx, 'laser_bullet', 168, 77, 42, 21);

  ctx.fillStyle = '#050505';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`x ${PLAYER.MAX_AMMO}`, 220, 86);

  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(1510, 64, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(1510, 64, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawSceneDebugOverlay(ctx: CanvasRenderingContext2D): void {
  const boxes = [
    { name: 'bush', box: SCENE_1_LAYOUT.bush, color: '#ff4040' },
    { name: 'leftVine', box: SCENE_1_LAYOUT.leftVine, color: '#40c463' },
    { name: 'rightVine', box: SCENE_1_LAYOUT.rightVine, color: '#40c463' },
    { name: 'bridge', box: SCENE_1_LAYOUT.bridge, color: '#409cff' },
    { name: 'leafArea', box: SCENE_1_LAYOUT.leafArea, color: '#f2cc60' },
  ];

  ctx.save();
  ctx.font = '20px Arial';
  ctx.lineWidth = 3;
  for (const item of boxes) {
    ctx.strokeStyle = item.color;
    ctx.strokeRect(item.box.x, item.box.y, item.box.width, item.box.height);
    ctx.fillStyle = item.color;
    ctx.fillText(item.name, item.box.x + 8, item.box.y + 24);
  }

  const ax = getAstronautX() + SCENE_1_LAYOUT.astronaut.width * 0.5;
  ctx.strokeStyle = '#ff00ff';
  ctx.beginPath();
  ctx.moveTo(ax, SCENE_1_LAYOUT.astronaut.climbStartY);
  ctx.lineTo(ax, SCENE_1_LAYOUT.astronaut.climbEndY);
  ctx.stroke();

  ctx.strokeStyle = '#111111';
  ctx.strokeRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
  ctx.restore();
}

function drawScene1Cutscene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const cs = getCutscene();
  const time = cs.elapsed / 1000;

  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.fillRect(0, 0, w, h);

  beginDesignSpace(ctx, w, h);
  ctx.fillStyle = '#f7f7f4';
  ctx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

  drawSceneFog(ctx);
  drawLeftBush(ctx);
  drawRightLeaves(ctx);
  drawSceneBridge(ctx);
  drawSceneLeftVine(ctx);
  drawSceneButterflies(ctx, time);
  drawClimbingAstronaut(ctx, cs.progress);
  drawSceneRightVine(ctx);
  drawSceneHud(ctx);

  if (DEBUG_SCENE_LAYOUT) {
    drawSceneDebugOverlay(ctx);
  }

  ctx.restore();
}

function drawLastScenePlantGroup(
  ctx: CanvasRenderingContext2D,
  plants: ReadonlyArray<{ x: number; y: number; width: number; height: number; alpha: number; flipX: boolean }>
): void {
  for (const plant of plants) {
    drawCroppedAsset(ctx, 'environment_plants', plant.x, plant.y, plant.width, plant.height, {
      alpha: plant.alpha,
      flipX: plant.flipX,
    });
  }
}

function drawLastSceneBushBand(ctx: CanvasRenderingContext2D): void {
  const bush = LAST_SCENE_LAYOUT.bushBand;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, bush.y - 20, DESIGN_WIDTH, DESIGN_HEIGHT - bush.y + 40);
  ctx.clip();
  ctx.fillStyle = '#1a1a19';
  ctx.fillRect(0, bush.y + 118, 1320, 260);
  drawDenseTiles(ctx, 'bush_decoration', bush.x, bush.y + 12, bush.width, bush.height, {
    tileWidth: 282,
    tileHeight: 198,
    stepX: 128,
    stepY: 90,
    scaleMin: 0.86,
    scaleMax: 1.16,
    seed: 73,
    alpha: 0.98,
  });
  drawDenseTiles(ctx, 'bush_decoration', bush.x + 36, bush.y + 118, bush.width - 60, bush.height, {
    tileWidth: 212,
    tileHeight: 156,
    stepX: 88,
    stepY: 76,
    scaleMin: 0.76,
    scaleMax: 0.98,
    seed: 97,
    alpha: 0.96,
  });
  ctx.restore();
}

function drawLastSceneMound(ctx: CanvasRenderingContext2D): void {
  const mound = LAST_SCENE_LAYOUT.mound;
  const left = mound.x - 42;
  const top = mound.y + 34;
  const right = mound.x + mound.width - 8;
  ctx.save();
  ctx.fillStyle = '#9b9a96';
  ctx.strokeStyle = '#6f6d68';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(left, DESIGN_HEIGHT - 28);
  ctx.quadraticCurveTo(left + 68, top + 44, left + 192, top + 26);
  ctx.quadraticCurveTo(left + 316, top + 8, left + 430, top + 40);
  ctx.quadraticCurveTo(right - 44, top + 54, right, DESIGN_HEIGHT - 36);
  ctx.lineTo(right, DESIGN_HEIGHT + 12);
  ctx.lineTo(left, DESIGN_HEIGHT + 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#c9c8c3';
  ctx.beginPath();
  ctx.ellipse(left + 180, top + 126, 108, 62, -0.28, 0, Math.PI * 2);
  ctx.ellipse(left + 312, top + 98, 132, 74, 0.12, 0, Math.PI * 2);
  ctx.ellipse(left + 430, top + 132, 104, 56, -0.16, 0, Math.PI * 2);
  ctx.fill();

  drawCroppedAsset(ctx, 'rock_platform_large', left + 124, top - 122, mound.width - 144, mound.height, { alpha: 0.78 });
  ctx.restore();
}

function drawLastSceneRepairPlatform(ctx: CanvasRenderingContext2D): void {
  const platform = LAST_SCENE_LAYOUT.repairPlatform;

  ctx.save();
  ctx.fillStyle = '#f7f7f4';
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.roundRect(platform.x, platform.y, platform.width, platform.height, 8);
  ctx.fill();
  ctx.stroke();

  ctx.lineWidth = 4;
  for (let x = platform.x + 34; x < platform.x + platform.width - 30; x += 78) {
    ctx.beginPath();
    ctx.moveTo(x, platform.y + 8);
    ctx.lineTo(x + 48, platform.y + platform.height - 8);
    ctx.moveTo(x + 48, platform.y + 8);
    ctx.lineTo(x, platform.y + platform.height - 8);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(17, 17, 17, 0.12)';
  ctx.beginPath();
  ctx.ellipse(platform.x + 92, platform.y + platform.height + 12, 118, 16, 0, 0, Math.PI * 2);
  ctx.ellipse(platform.x + 304, platform.y + platform.height + 14, 142, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLastSceneEnvironment(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#f7f7f4';
  ctx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
  drawCroppedAsset(ctx, 'background_moon', LAST_SCENE_LAYOUT.moon.x, LAST_SCENE_LAYOUT.moon.y, LAST_SCENE_LAYOUT.moon.width, LAST_SCENE_LAYOUT.moon.height, {
    alpha: 0.8,
  });
  drawLastScenePlantGroup(ctx, LAST_SCENE_LAYOUT.rearPlants);
  drawLastScenePlantGroup(ctx, LAST_SCENE_LAYOUT.mainPlants);
  drawLastSceneBushBand(ctx);
  drawLastSceneMound(ctx);
  drawLastSceneRepairPlatform(ctx);
}

function drawCutsceneAstronaut(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options: { alpha?: number; flipX?: boolean; angle?: number } = {}
): void {
  ctx.save();
  ctx.globalAlpha = options.alpha ?? 1;
  ctx.translate(x + width * 0.5, y + height * 0.5);
  ctx.rotate(options.angle ?? 0);
  if (options.flipX) {
    ctx.scale(-1, 1);
  }
  drawCroppedAsset(ctx, 'astronaut_idle', -width * 0.5, -height * 0.5, width, height, { alpha: 1 });
  ctx.restore();
}

function drawRepairIconCluster(ctx: CanvasRenderingContext2D, progress: number): void {
  const icon = LAST_SCENE_LAYOUT.repairIcons;
  const pulse = 1 + Math.sin(progress * Math.PI * 8) * 0.06;
  const cx = icon.x + icon.width * 0.5;
  const cy = icon.y + icon.height * 0.5;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(pulse, pulse);
  ctx.strokeStyle = '#121212';
  ctx.fillStyle = 'rgba(247, 247, 244, 0.92)';
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.arc(-16, -10, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    const inner = 22;
    const outer = 32;
    ctx.beginPath();
    ctx.moveTo(-16 + Math.cos(a) * inner, -10 + Math.sin(a) * inner);
    ctx.lineTo(-16 + Math.cos(a) * outer, -10 + Math.sin(a) * outer);
    ctx.stroke();
  }

  ctx.rotate(-0.38 + Math.sin(progress * Math.PI * 6) * 0.08);
  ctx.beginPath();
  ctx.roundRect(4, -10, 44, 12, 6);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(44, -10);
  ctx.lineTo(58, -20);
  ctx.lineTo(64, -14);
  ctx.lineTo(50, -2);
  ctx.stroke();
  ctx.restore();
}

function drawUprightRocket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options: { alpha?: number; ignition?: number; brokenOverlay?: number } = {}
): void {
  const alpha = options.alpha ?? 1;
  const ignition = clamp01(options.ignition ?? 0);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);

  ctx.fillStyle = '#f5f5f2';
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(width * 0.5, 0);
  ctx.bezierCurveTo(width * 0.68, height * 0.1, width * 0.74, height * 0.26, width * 0.74, height * 0.52);
  ctx.lineTo(width * 0.74, height * 0.76);
  ctx.lineTo(width * 0.86, height * 0.98);
  ctx.lineTo(width * 0.64, height * 0.88);
  ctx.lineTo(width * 0.57, height);
  ctx.lineTo(width * 0.43, height);
  ctx.lineTo(width * 0.36, height * 0.88);
  ctx.lineTo(width * 0.14, height * 0.98);
  ctx.lineTo(width * 0.26, height * 0.76);
  ctx.lineTo(width * 0.26, height * 0.52);
  ctx.bezierCurveTo(width * 0.26, height * 0.26, width * 0.32, height * 0.1, width * 0.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.28, width * 0.12, height * 0.08, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#d9d9d4';
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#1d1d1d';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.08);
  ctx.lineTo(width * 0.5, height * 0.84);
  ctx.moveTo(width * 0.34, height * 0.58);
  ctx.lineTo(width * 0.66, height * 0.58);
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(width * 0.4, height * 0.44, width * 0.2, height * 0.2, 12);
  ctx.stroke();

  if ((options.brokenOverlay ?? 0) > 0.01) {
    drawCroppedAsset(ctx, 'rocket_broken', width * 0.02, height * 0.12, width * 0.98, height * 0.8, {
      alpha: clamp01(options.brokenOverlay ?? 0) * 0.52,
    });
  }

  if (ignition > 0) {
    const flameHeight = height * lerp(0.18, 0.38, ignition);
    const flameWidth = width * lerp(0.16, 0.28, ignition);
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.moveTo(width * 0.5 - flameWidth * 0.24, height);
    ctx.quadraticCurveTo(width * 0.5, height + flameHeight * 0.18, width * 0.5 + flameWidth * 0.24, height);
    ctx.quadraticCurveTo(width * 0.5 + flameWidth * 0.08, height + flameHeight * 0.94, width * 0.5, height + flameHeight);
    ctx.quadraticCurveTo(width * 0.5 - flameWidth * 0.08, height + flameHeight * 0.94, width * 0.5 - flameWidth * 0.24, height);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f7f7f4';
    ctx.beginPath();
    ctx.moveTo(width * 0.5 - flameWidth * 0.14, height);
    ctx.quadraticCurveTo(width * 0.5, height + flameHeight * 0.12, width * 0.5 + flameWidth * 0.14, height);
    ctx.quadraticCurveTo(width * 0.5 + flameWidth * 0.04, height + flameHeight * 0.56, width * 0.5, height + flameHeight * 0.64);
    ctx.quadraticCurveTo(width * 0.5 - flameWidth * 0.04, height + flameHeight * 0.56, width * 0.5 - flameWidth * 0.14, height);
    ctx.fill();

    ctx.fillStyle = 'rgba(17, 17, 17, 0.12)';
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height + flameHeight * 1.1, flameWidth * 0.55, flameHeight * 0.16, 0, 0, Math.PI * 2);
    ctx.ellipse(width * 0.5 - flameWidth * 0.22, height + flameHeight * 1.28, flameWidth * 0.42, flameHeight * 0.13, -0.16, 0, Math.PI * 2);
    ctx.ellipse(width * 0.5 + flameWidth * 0.2, height + flameHeight * 1.42, flameWidth * 0.36, flameHeight * 0.11, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawRepairFragments(ctx: CanvasRenderingContext2D, progress: number): void {
  const rocket = LAST_SCENE_LAYOUT.rocketPad;
  const join = clamp01((progress - 0.28) / 0.42);
  const alpha = 1 - clamp01((progress - 0.72) / 0.16);
  if (join <= 0 || alpha <= 0) return;

  const fragments = [
    { name: 'rocket_part_01', sx: rocket.x - 174, sy: rocket.y + 128, tx: rocket.x - 12, ty: rocket.y + 142, w: 102, h: 142, rot: -0.24 },
    { name: 'rocket_part_03', sx: rocket.x - 126, sy: rocket.y - 120, tx: rocket.x + 18, ty: rocket.y + 26, w: 128, h: 102, rot: 0.2 },
    { name: 'rocket_part_04', sx: rocket.x + 208, sy: rocket.y + 72, tx: rocket.x + 104, ty: rocket.y + 196, w: 136, h: 118, rot: 0.16 },
  ] as const;

  for (const fragment of fragments) {
    const x = lerp(fragment.sx, fragment.tx, easeInOutQuad(join));
    const y = lerp(fragment.sy, fragment.ty, easeInOutQuad(join));
    const angle = fragment.rot * (1 - join);
    ctx.save();
    ctx.translate(x + fragment.w * 0.5, y + fragment.h * 0.5);
    ctx.rotate(angle);
    drawCroppedAsset(ctx, fragment.name, -fragment.w * 0.5, -fragment.h * 0.5, fragment.w, fragment.h, {
      alpha: alpha * 0.9,
      flipX: fragment.name === 'rocket_part_04',
    });
    ctx.restore();
  }
}

function drawScene4RepairCutscene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const cutscene = getCutscene();
  const t = clamp01(cutscene.progress);
  const rocket = LAST_SCENE_LAYOUT.rocketPad;
  const astronaut = LAST_SCENE_LAYOUT.astronautRepair;
  const walk = LAST_SCENE_LAYOUT.repairWalk;
  const walkProgress = clamp01(t / 0.34);
  const repairProgress = clamp01((t - 0.30) / 0.62);
  const repairResolve = clamp01((repairProgress - 0.56) / 0.24);
  const brokenOverlay = 1 - clamp01((repairProgress - 0.10) / 0.42);
  const stepBob = walkProgress < 1 ? Math.abs(Math.sin(walkProgress * Math.PI * 6)) * 7 : Math.sin(repairProgress * Math.PI * 6) * 2;
  const astronautX = lerp(walk.startX, walk.workX, easeInOutQuad(walkProgress));
  const astronautY = lerp(walk.startY, walk.workY, walkProgress) - stepBob;
  const workingAngle = walkProgress >= 1 ? Math.sin(repairProgress * Math.PI * 8) * 0.04 : Math.sin(walkProgress * Math.PI * 6) * 0.03;

  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.fillRect(0, 0, w, h);

  beginDesignSpace(ctx, w, h);
  drawLastSceneEnvironment(ctx);
  drawUprightRocket(ctx, rocket.x, rocket.y, rocket.width, rocket.height, {
    brokenOverlay,
    alpha: 0.88 + repairResolve * 0.12,
  });
  if (repairProgress > 0) {
    drawRepairFragments(ctx, repairProgress);
    drawRepairIconCluster(ctx, repairProgress);
  }
  drawCutsceneAstronaut(ctx, astronautX, astronautY, astronaut.width, astronaut.height, {
    flipX: false,
    angle: workingAngle,
  });
  ctx.restore();
}

function drawScene5LaunchCutscene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const cutscene = getCutscene();
  const t = clamp01(cutscene.progress);
  const rocket = LAST_SCENE_LAYOUT.rocketPad;
  const door = LAST_SCENE_LAYOUT.rocketDoor;
  const boarding = clamp01(t / 0.18);
  const ignition = clamp01((t - 0.18) / 0.17);
  const lift = clamp01((t - 0.35) / 0.37);
  const accel = clamp01((t - 0.72) / 0.28);
  const rocketX = lerp(LAST_SCENE_LAYOUT.launchPath.startX, LAST_SCENE_LAYOUT.launchPath.endX, accel * 0.35 + lift * 0.65);
  const rocketY = lift < 1
    ? lerp(LAST_SCENE_LAYOUT.launchPath.startY, 86, easeInOutQuad(lift))
    : lerp(86, LAST_SCENE_LAYOUT.launchPath.endY, easeInOutQuad(accel));
  const shake = ignition > 0 && lift < 0.08 ? Math.sin(t * Math.PI * 42) * 4 : 0;
  const astronaut = LAST_SCENE_LAYOUT.astronautRepair;
  const astronautX = lerp(astronaut.x, door.x + 4, boarding);
  const astronautY = lerp(astronaut.y, door.y + 12, boarding);
  const astronautAlpha = 1 - clamp01((boarding - 0.72) / 0.28);

  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.fillRect(0, 0, w, h);

  beginDesignSpace(ctx, w, h);
  drawLastSceneEnvironment(ctx);

  if (astronautAlpha > 0.01) {
    drawCutsceneAstronaut(ctx, astronautX, astronautY, astronaut.width, astronaut.height, {
      alpha: astronautAlpha,
      angle: Math.sin(boarding * Math.PI) * 0.03,
    });
  }

  drawUprightRocket(ctx, rocketX, rocketY + shake, rocket.width, rocket.height, {
    ignition: Math.max(ignition * 0.72, lift * 0.88 + accel),
    alpha: 1,
  });
  ctx.restore();
}

function drawCutscene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const cs = getCutscene();
  const time = cs.elapsed / 1000;

  // Scene = 70% of screen height, positioned at bottom
  const sceneTop = h * 0.30;
  const sceneHeight = h - sceneTop;

  // Width divisions: 30% left wall, 20% gap, 50% right wall
  const wallLeftWidth = w * 0.30;
  const gapWidth = w * 0.20;
  const wallRightWidth = w * 0.50;
  const wallRightX = wallLeftWidth + gapWidth;

  // Helper: calculate cover-fit source rect so asset fills target area without distortion
  function coverFit(
    cropW: number, cropH: number,
    targetW: number, targetH: number
  ): { sw: number; sh: number; sx: number; sy: number; dw: number; dh: number } {
    const scale = Math.max(targetW / cropW, targetH / cropH);
    const sw = targetW / scale;
    const sh = targetH / scale;
    return {
      sw, sh,
      sx: (cropW - sw) / 2,
      sy: (cropH - sh) / 2,
      dw: targetW,
      dh: targetH,
    };
  }

  // Draw a decoration asset filling a target rectangle using cover-fit
  function drawCoverFit(
    name: string,
    tx: number, ty: number,
    tw: number, th: number,
    options: { alpha?: number; clip?: boolean } = {}
  ): void {
    const crop = ASSET_CROPS[name];
    if (!crop) return;
    const fit = coverFit(crop.sw, crop.sh, tw, th);

    // Calculate draw position so the drawn region covers the full target area
    const drawX = tx - (fit.dw - tw) / 2;
    const drawY = ty - (fit.dh - th) / 2;

    if (options.clip !== false) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(tx, ty, tw, th);
      ctx.clip();
    }

    drawCroppedAsset(
      ctx, name,
      drawX, drawY, fit.dw, fit.dh,
      { alpha: options.alpha }
    );

    if (options.clip !== false) {
      ctx.restore();
    }
  }

  // 1. Bright background
  ctx.fillStyle = '#f7f7f4';
  ctx.fillRect(0, 0, w, h);

  // 2. Soft fog in gap (center)
  drawSoftFog(ctx, wallLeftWidth + gapWidth / 2, sceneTop + sceneHeight * 0.4, 180, 0.25);
  drawSoftFog(ctx, wallLeftWidth + gapWidth / 2 + 50, sceneTop + sceneHeight * 0.6, 160, 0.20);

  // 3. Left wall — bush_decoration (30% width, full scene height, cover-fit)
  drawCoverFit('bush_decoration',
    0, sceneTop,
    wallLeftWidth, sceneHeight,
    { alpha: 0.95 }
  );

  // 4. Left vine — on the right edge of the bush wall (decoration)
  const vineWidth = 30;
  drawCroppedAsset(ctx, 'vine_ladder',
    wallLeftWidth - vineWidth / 2, sceneTop,
    vineWidth, sceneHeight,
    { alpha: 0.90 }
  );

  // 5. Right wall — leaf_decoration (50% width, full scene height, cover-fit)
  drawCoverFit('leaf_decoration',
    wallRightX, sceneTop,
    wallRightWidth, sceneHeight,
    { alpha: 0.95 }
  );

  // 6. Right vine — on the left edge of the leaf wall (astronaut climbs this)
  const rightVineX = wallRightX - vineWidth / 2;
  drawCroppedAsset(ctx, 'vine_ladder',
    rightVineX, sceneTop,
    vineWidth, sceneHeight,
    { alpha: 0.90 }
  );

  // 7. Bridge at top of right wall (use drawBridge with camX/camY = 0)
  drawBridge(ctx, wallRightX, sceneTop, wallRightWidth, 0, 0);

  // 8. Butterflies in gap (center)
  const butterflies = [
    { bx: wallLeftWidth + gapWidth * 0.3, by: sceneTop + sceneHeight * 0.3, ax: 30, ay: 20, sp: 1.2, ph: 0, sz: 25 },
    { bx: wallLeftWidth + gapWidth * 0.6, by: sceneTop + sceneHeight * 0.5, ax: 25, ay: 15, sp: 0.8, ph: 1.5, sz: 20 },
    { bx: wallLeftWidth + gapWidth * 0.5, by: sceneTop + sceneHeight * 0.7, ax: 35, ay: 25, sp: 1.0, ph: 3.0, sz: 28 },
  ];
  for (const b of butterflies) {
    const bx = b.bx + Math.sin(time * b.sp + b.ph) * b.ax;
    const by = b.by + Math.cos(time * b.sp * 1.23 + b.ph) * b.ay;
    const alpha = 0.55 + Math.sin(time * 2 + b.ph) * 0.20;
    drawCroppedAsset(ctx, 'butterfly_background',
      bx, by,
      b.sz, b.sz,
      { alpha }
    );
  }

  // 9. Astronaut slides up right vine
  // cs.astronautY: 0 = top, 1 = bottom; ease-in-out in cutscene.ts
  const astronautX = rightVineX - PLAYER.WIDTH / 2;
  const astronautY = sceneTop + (1 - easeInOutQuad(cs.progress)) * sceneHeight;
  if (!drawCroppedAsset(ctx, 'astronaut_idle', astronautX, astronautY, PLAYER.WIDTH, PLAYER.HEIGHT, { alpha: 1 })) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(astronautX, astronautY, PLAYER.WIDTH, PLAYER.HEIGHT);
  }
}

// ---- Init ----
async function main(): Promise<void> {
  console.log('[Main] Starting Planet of the Unbound...');

  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('[Main] Canvas not found!');
    return;
  }

  initInput();
  initGame(canvas);

  await loadAllAssets();

  startDebugSceneFromUrl();

  console.log('[Main] Starting game loop...');
  requestAnimationFrame(gameLoop);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
