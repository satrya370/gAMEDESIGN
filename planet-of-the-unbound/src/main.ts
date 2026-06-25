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

function gameLoop(timestamp: number): void {
  const deltaTime = timestamp - lastTime;
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
      updateMenu();
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
function updateMenu(): void {
  // Check if user clicks "Start Game" button area
  if (justPressed.shoot || justPressed.jump) {
    setState('CONTROLS');
  }
}

function drawMenu(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const moonImg = getAsset('background_moon');
  if (moonImg) {
    ctx.globalAlpha = 0.15;
    ctx.drawImage(moonImg, w * 0.6, h * 0.05, 200, 200);
    ctx.globalAlpha = 1;
  }

  const leafImg = getAsset('leaf_decoration');
  if (leafImg) {
    ctx.drawImage(leafImg, w * 0.05, -10, 120, 80);
    ctx.drawImage(leafImg, w * 0.85, -10, 120, 80);
  }

  const astronautImg = getAsset('astronaut_idle');
  if (astronautImg) {
    ctx.drawImage(astronautImg, w * 0.12, h * 0.25, 96, 128);
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Planet of the Unbound', w / 2, h / 3);

  ctx.font = '20px Arial';
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('A lost astronaut. A living planet. One way home.', w / 2, h / 3 + 50);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(w / 2 - 100, h / 2 + 20, 200, 50);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Start Game', w / 2, h / 2 + 52);

  ctx.fillStyle = '#888888';
  ctx.font = '14px Arial';
  ctx.fillText('Press SPACE or CLICK to start', w / 2, h - 40);
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

function drawPlaying(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const cam = getCamera();
  const camX = cam.x;
  const camY = cam.y;

  ctx.fillStyle = COLORS.VOID;
  ctx.fillRect(0, 0, w, h);

  // Draw platforms — try image first, fallback to white rect
  const bridgeImg = getAsset('bridge_platform');
  for (const plat of SCENE_2.platforms) {
    const dx = plat.x - camX;
    const dy = plat.y - camY;
    if (bridgeImg && bridgeImg.complete && bridgeImg.naturalWidth > 0) {
      ctx.drawImage(bridgeImg, dx, dy, plat.width, plat.height);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dx, dy, plat.width, plat.height);
    }
  }

  // Void line — white dashed
  ctx.strokeStyle = '#ffffff44';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(0, SCENE_2.voidY - camY);
  ctx.lineTo(w, SCENE_2.voidY - camY);
  ctx.stroke();
  ctx.setLineDash([]);

  drawPlayer(ctx, camX, camY);

  // HUD
  const heartImg = getAsset('health_icon');
  for (let i = 0; i < getPlayer().hp; i++) {
    if (heartImg && heartImg.complete && heartImg.naturalWidth > 0) {
      ctx.drawImage(heartImg, 10 + i * 28, 8, 24, 24);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('♥', 10 + i * 24, 26);
    }
  }

  ctx.fillStyle = COLORS.UI_TEXT;
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`Ammo: ${getPlayer().ammo}`, 100, 24);
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
  const cam = getCamera();

  ctx.fillStyle = COLORS.VOID;
  ctx.fillRect(0, 0, w, h);

  const moonImg = getAsset('background_moon');
  if (moonImg) {
    ctx.globalAlpha = 0.1;
    ctx.drawImage(moonImg, w * 0.7, 20, 150, 150);
    ctx.globalAlpha = 1;
  }

  const bflyImg = getAsset('butterfly_background');
  if (bflyImg) {
    ctx.globalAlpha = 0.6;
    ctx.drawImage(bflyImg, 50, 200, 40, 40);
    ctx.drawImage(bflyImg, w - 90, 150, 40, 40);
    ctx.globalAlpha = 1;
  }

  const plantsImg = getAsset('environment_plants');
  if (plantsImg) {
    ctx.drawImage(plantsImg, 0, h - 120, 200, 120);
    ctx.drawImage(plantsImg, w - 200, h - 120, 200, 120);
  }

  const bushImg = getAsset('bush_decoration');
  if (bushImg) {
    ctx.drawImage(bushImg, 0, h - 60, 180, 60);
    ctx.drawImage(bushImg, w - 180, h - 60, 180, 60);
  }

  const leafImg = getAsset('leaf_decoration');
  if (leafImg) {
    ctx.drawImage(leafImg, 20, 10, 100, 70);
    ctx.drawImage(leafImg, w - 120, 10, 100, 70);
  }

  const vineImg = getAsset('vine_ladder');
  if (vineImg) {
    for (const vine of SCENE_1.vinePositions || []) {
      ctx.drawImage(vineImg, vine.x - cam.x, vine.y - cam.y, 32, vine.height);
    }
  }

  const bridgeImg = getAsset('bridge_platform');
  if (bridgeImg) {
    for (const plat of SCENE_1.platforms) {
      ctx.drawImage(bridgeImg, plat.x - cam.x, plat.y - cam.y, plat.width, plat.height);
    }
  }

  const drawX = cs.astronautX - cam.x;
  const drawY = cs.astronautY - cam.y;
  const astronautImg = getAsset('astronaut_idle');
  if (astronautImg) {
    ctx.drawImage(astronautImg, drawX, drawY, PLAYER.WIDTH, PLAYER.HEIGHT);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(drawX, drawY, PLAYER.WIDTH, PLAYER.HEIGHT);
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
