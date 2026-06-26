// ============================================
// main.js — Entry point, game loop
// ============================================

import { COLORS, CAMERA, PLAYER } from './constants';
import { loadAllAssets, getAsset } from './assets';
import { initInput, clearJustPressed, keys, justPressed } from './input';
import { initGame, getState, setState, getCtx, getWidth, getHeight } from './game';
import { initPlayer, updatePlayer, drawPlayer, getPlayer } from './player';
import { SCENE_1, SCENE_2 } from './scene';
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
  bridge_platform: { sx: 386, sy: 440, sw: 1263, sh: 201 },
  bush_decoration: { sx: 412, sy: 320, sw: 1101, sh: 439 },
  butterfly_background: { sx: 768, sy: 354, sw: 373, sh: 373 },
  health_icon: { sx: 662, sy: 304, sw: 603, sh: 541 },
  laser_bullet: { sx: 628, sy: 332, sw: 565, sh: 285 },
  laser_weapon: { sx: 672, sy: 300, sw: 665, sh: 523 },
  portal_effect: { sx: 634, sy: 266, sw: 697, sh: 679 },
  rocket_part_02: { sx: 652, sy: 242, sw: 587, sh: 593 },
  vine_ladder: { sx: 898, sy: 96, sw: 179, sh: 889 },
  leaf_decoration: { sx: 750, sy: 210, sw: 120, sh: 580 },
};

const MENU_BUTTERFLIES: MenuButterfly[] = [
  { baseX: 0.25, baseY: 0.18, ampX: 0.10, ampY: 0.08, speed: 0.75, phase: 0.2, size: 720 },
  { baseX: 0.58, baseY: 0.24, ampX: 0.12, ampY: 0.09, speed: 0.62, phase: 1.8, size: 560 },
  { baseX: 0.82, baseY: 0.36, ampX: 0.08, ampY: 0.10, speed: 0.88, phase: 3.1, size: 640 },
  { baseX: 0.38, baseY: 0.66, ampX: 0.14, ampY: 0.07, speed: 0.55, phase: 4.4, size: 480 },
  { baseX: 0.70, baseY: 0.75, ampX: 0.10, ampY: 0.08, speed: 0.70, phase: 5.7, size: 520 },
];

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
      updateCamera(_dt);
      if (isCutsceneDone()) {
        transitionToScene2();
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
      drawCutscene(ctx, w, h);
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
}

// ---- Menu ----
function startGameFromMenu(): void {
  setCurrentScene(SCENE_1);
  initCamera(0, 0, SCENE_1.worldWidth, SCENE_1.worldHeight, getWidth(), getHeight());
  snapCamera(SCENE_1.playerSpawn.x, SCENE_1.playerSpawn.y);
  startCutscene(1, SCENE_1.playerSpawn.x, SCENE_1.playerSpawn.y);
  setState('CUTSCENE');
}

function updateMenu(dt: number): void {
  menuTime += dt / 1000;
  if (justPressed.shoot || justPressed.jump) {
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

function drawMenu(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const startScreenImg = getAsset('start_screen');
  if (startScreenImg && startScreenImg.complete && startScreenImg.naturalWidth > 0) {
    drawCoverImage(ctx, startScreenImg, w, h);
  } else {
    ctx.fillStyle = '#f7f7f4';
    ctx.fillRect(0, 0, w, h);
  }

  drawMenuButterflies(ctx, w, h);
}

// ---- Controls ----
function updateControls(): void {
  if (justPressed.jump || justPressed.shoot) {
    setCurrentScene(SCENE_1);
    initCamera(0, 0, SCENE_1.worldWidth, SCENE_1.worldHeight, getWidth(), getHeight());
    snapCamera(SCENE_1.playerSpawn.x, SCENE_1.playerSpawn.y);
    startCutscene(1, SCENE_1.playerSpawn.x, SCENE_1.playerSpawn.y);
    setState('CUTSCENE');
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
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Controls', w / 2, 80);

  const controls = [
    ['A / Arrow Left', 'Move Left'],
    ['D / Arrow Right', 'Move Right'],
    ['W / Arrow Up', 'Climb Up / Jump'],
    ['S / Arrow Down', 'Climb Down'],
    ['Space', 'Jump'],
    ['Left Click / J', 'Shoot Laser'],
    ['R', 'Restart'],
    ['Esc', 'Pause'],
  ];

  ctx.font = '18px Arial';
  let y = 150;
  controls.forEach(([key, action]) => {
    ctx.fillStyle = '#888888';
    ctx.textAlign = 'right';
    ctx.fillText(key, w / 2 - 20, y);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(action, w / 2 + 20, y);
    y += 35;
  });

  ctx.fillStyle = '#888888';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Press SPACE or CLICK to start', w / 2, h - 40);
}

// ---- Playing ----
function updatePlaying(_dt: number): void {
  if (justPressed.pause) {
    setState('PAUSED');
    return;
  }
  updatePlayer(_dt);
  const p = getPlayer();
  setCameraTarget(p.x + CAMERA.OFFSET_X, p.y + CAMERA.OFFSET_Y);
  updateCamera(_dt);
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
  ctx.fillStyle = '#f7f7f4';
  ctx.fillRect(0, 0, w, h);

  drawSoftFog(ctx, 190 - camX * 0.12, 235 - camY * 0.08, 235, 0.34);
  drawSoftFog(ctx, 880 - camX * 0.12, 430 - camY * 0.08, 260, 0.32);
  drawSoftFog(ctx, 1320 - camX * 0.12, 420 - camY * 0.08, 260, 0.30);
  drawSoftFog(ctx, 1285 - camX * 0.10, 150 - camY * 0.08, 220, 0.18);

  drawWorldAsset(ctx, 'portal_effect', 635, 10, 170, 166, camX * 0.25, camY * 0.20, { alpha: 0.55 });
  drawWorldAsset(ctx, 'portal_effect', 1800, 390, 210, 205, camX * 0.25, camY * 0.20, { alpha: 0.35 });
  drawWorldAsset(ctx, 'background_moon', 1692, -44, 260, 258, camX * 0.12, camY * 0.08, { alpha: 0.72 });

  drawWorldAsset(ctx, 'butterfly_background', 54, 456, 44, 44, camX * 0.20, camY * 0.15, { alpha: 0.75 });
  drawWorldAsset(ctx, 'butterfly_background', 620, 200, 34, 34, camX * 0.18, camY * 0.15, { alpha: 0.65 });
  drawWorldAsset(ctx, 'butterfly_background', 884, 360, 56, 56, camX * 0.18, camY * 0.15, { alpha: 0.72 });
  drawWorldAsset(ctx, 'butterfly_background', 1398, 438, 50, 50, camX * 0.18, camY * 0.15, { alpha: 0.68 });
  drawWorldAsset(ctx, 'butterfly_background', 1250, 135, 34, 34, camX * 0.18, camY * 0.15, { alpha: 0.70 });
}

function drawBridge(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, camX: number, camY: number): void {
  const bridgeHeight = Math.max(74, width * 0.18);
  const bridgeY = y - 10;
  if (!drawWorldAsset(ctx, 'bridge_platform', x, bridgeY, width, bridgeHeight, camX, camY)) {
    ctx.fillStyle = '#111111';
    ctx.fillRect(x - camX, y - camY, width, 10);
  }
}

function drawStagePlatforms(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
  for (const plat of SCENE_2.platforms) {
    drawBridge(ctx, plat.x, plat.y, plat.width, camX, camY);
  }
}

function drawStageMidground(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
  drawWorldAsset(ctx, 'vine_ladder', -70, 565, 150, 520, camX, camY, { alpha: 0.95, flipX: true });
  drawWorldAsset(ctx, 'vine_ladder', 345, 620, 118, 470, camX, camY, { alpha: 0.95 });
  drawWorldAsset(ctx, 'vine_ladder', 545, 670, 112, 430, camX, camY, { alpha: 0.95 });
  drawWorldAsset(ctx, 'vine_ladder', 835, 760, 108, 340, camX, camY, { alpha: 0.92, flipX: true });
  drawWorldAsset(ctx, 'vine_ladder', 1065, 680, 115, 420, camX, camY, { alpha: 0.92 });
  drawWorldAsset(ctx, 'vine_ladder', 1372, 585, 112, 510, camX, camY, { alpha: 0.95 });
  drawWorldAsset(ctx, 'vine_ladder', 1840, 610, 125, 475, camX, camY, { alpha: 0.95 });

  drawWorldAsset(ctx, 'vine_ladder', 525, -84, 118, 460, camX * 0.72, camY, { alpha: 0.98 });
  drawWorldAsset(ctx, 'vine_ladder', 935, -48, 125, 420, camX * 0.72, camY, { alpha: 0.98, flipX: true });
}

function drawStageProps(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
  drawWorldAsset(ctx, 'rocket_part_02', 658, 526, 82, 82, camX, camY, { alpha: 0.95 });
  drawWorldAsset(ctx, 'alien_shooter', 1630, 350, 168, 300, camX, camY, { alpha: 1 });
}

function drawStageForeground(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
  const bushes = [
    { x: -90, y: 842, w: 520, h: 210 },
    { x: 395, y: 900, w: 420, h: 160 },
    { x: 720, y: 832, w: 520, h: 220 },
    { x: 1110, y: 800, w: 470, h: 235 },
    { x: 1450, y: 875, w: 540, h: 190 },
  ];

  for (const bush of bushes) {
    drawWorldAsset(ctx, 'bush_decoration', bush.x, bush.y, bush.w, bush.h, camX * 0.92, camY, { alpha: 1 });
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
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 22, 192, 192);
  ctx.fillRect(22, 24, 188, 188);
  drawCroppedAsset(ctx, 'astronaut_idle', 70, 42, 96, 132, { alpha: 1 });

  for (let i = 0; i < PLAYER.MAX_HP; i++) {
    const alpha = i < p.hp ? 1 : 0.18;
    if (!drawCroppedAsset(ctx, 'health_icon', 235 + i * 92, 42, 84, 78, { alpha })) {
      drawSolidHeart(ctx, 235 + i * 92, 42, 78, alpha);
    }
  }

  if (!drawCroppedAsset(ctx, 'laser_weapon', 220, 132, 92, 72)) {
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(230, 172);
    ctx.lineTo(300, 150);
    ctx.lineTo(306, 170);
    ctx.lineTo(246, 188);
    ctx.stroke();
  }
  drawCroppedAsset(ctx, 'laser_bullet', 340, 150, 84, 42);

  ctx.fillStyle = '#050505';
  ctx.font = 'bold 54px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`x ${p.ammo}`, 442, 166);
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
  drawPlayer(ctx, camX, camY);
  drawStageForeground(ctx, camX, camY);
  drawStageHud(ctx);
}

// ---- Paused ----
function updatePaused(): void {
  if (justPressed.pause) {
    setState('PLAYING');
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
  if (justPressed.restart) {
    // TODO: Reset game state and go to Scene 1
    setState('PLAYING');
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
  if (justPressed.restart) {
    // TODO: Reset game state and go to Scene 1
    setState('PLAYING');
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
function transitionToScene2(): void {
  console.log('[Main] Scene 1 cutscene done → Scene 2');
  setCurrentScene(SCENE_2);
  initPlayer(SCENE_2.playerSpawn.x, SCENE_2.playerSpawn.y);
  initCamera(0, 0, SCENE_2.worldWidth, SCENE_2.worldHeight, getWidth(), getHeight());
  snapCamera(
    SCENE_2.playerSpawn.x + CAMERA.OFFSET_X,
    SCENE_2.playerSpawn.y + CAMERA.OFFSET_Y
  );
  setState('PLAYING');
}

function drawCutscene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const cs = getCutscene();
  const time = cs.elapsed / 1000;

  // Scene = 70% dari screen height, di bagian bawah
  const sceneTop = h * 0.30;    // Scene mulai di 30% dari atas
  const sceneBottom = h;         // Scene berakhir di bawah screen
  const sceneHeight = sceneBottom - sceneTop;

  // Pembagian lebar: 30% kiri, 20% tengah, 50% kanan
  const wallLeftWidth = w * 0.30;
  const gapWidth = w * 0.20;
  const wallRightWidth = w * 0.50;
  const wallRightX = wallLeftWidth + gapWidth;

  // 1. Background terang
  ctx.fillStyle = '#f7f7f4';
  ctx.fillRect(0, 0, w, h);

  // 2. Soft fog di gap (tengah)
  drawSoftFog(ctx, wallLeftWidth + gapWidth / 2, sceneTop + sceneHeight * 0.4, 180, 0.25);
  drawSoftFog(ctx, wallLeftWidth + gapWidth / 2 + 50, sceneTop + sceneHeight * 0.6, 160, 0.20);

  // 3. Tembok KIRI — bush (30% lebar, full scene height)
  drawCroppedAsset(ctx, 'bush_decoration',
    0, sceneTop,
    wallLeftWidth, sceneHeight,
    { alpha: 0.95 }
  );

  // 4. Vine Kiri — di sisi kanan bush (dekorasi)
  drawCroppedAsset(ctx, 'vine_ladder',
    wallLeftWidth - 15, sceneTop,
    30, sceneHeight,
    { alpha: 0.90 }
  );

  // 5. Vine Kanan — di sisi kiri leaf (dipanjat karakter)
  drawCroppedAsset(ctx, 'vine_ladder',
    wallRightX - 15, sceneTop,
    30, sceneHeight,
    { alpha: 0.90 }
  );

  // 6. Tembok KANAN — leaf (50% lebar, full scene height)
  drawCroppedAsset(ctx, 'leaf_decoration',
    wallRightX, sceneTop,
    wallRightWidth, sceneHeight,
    { alpha: 0.95 }
  );

  // 7. Bridge di atas kanan (menempel leaf)
  drawCroppedAsset(ctx, 'bridge_platform',
    wallRightX, sceneTop,
    wallRightWidth, 80,
    { alpha: 0.95 }
  );

  // 8. Butterflies di gap (tengah)
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

  // 9. Astronaut slide up vine kanan
  // cs.astronautY = 0 (atas) sampai 1 (bawah), di-map ke scene
  const astronautX = wallRightX - 30;
  const astronautY = sceneTop + cs.astronautY * sceneHeight;
  if (!drawCroppedAsset(ctx, 'astronaut_idle', astronautX, astronautY, 60, 75, { alpha: 1 })) {
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

  console.log('[Main] Starting game loop...');
  requestAnimationFrame(gameLoop);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
