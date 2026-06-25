import { GAME, PLAYER } from './constants';
import { getAsset } from './assets';
import { keys, justPressed } from './input';
import { AABB, checkCollision, resolvePlayerPlatform } from './collision';
import { SceneData, SCENE_2, platformToAABB } from './scene';

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  ammo: number;
  facing: 'left' | 'right';
  grounded: boolean;
  invincible: boolean;
  invincibleTimer: number;
}

let player: Player;
let currentScene: SceneData = SCENE_2;

const ASTRONAUT_CROP = { sx: 642, sy: 148, sw: 633, sh: 775 };

function drawBaseAstronaut(ctx: CanvasRenderingContext2D): void {
  const bodyX = PLAYER.WIDTH * 0.23;
  const bodyY = PLAYER.HEIGHT * 0.34;
  const bodyW = PLAYER.WIDTH * 0.54;
  const bodyH = PLAYER.HEIGHT * 0.48;

  ctx.save();
  ctx.shadowColor = '#9ee7ff';
  ctx.shadowBlur = 10;

  ctx.fillStyle = '#e9fbff';
  ctx.strokeStyle = '#6fd6ff';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.ellipse(PLAYER.WIDTH / 2, PLAYER.HEIGHT * 0.22, PLAYER.WIDTH * 0.23, PLAYER.HEIGHT * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillRect(bodyX, bodyY, bodyW, bodyH);
  ctx.strokeRect(bodyX, bodyY, bodyW, bodyH);

  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.ellipse(PLAYER.WIDTH / 2, PLAYER.HEIGHT * 0.22, PLAYER.WIDTH * 0.14, PLAYER.HEIGHT * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#e9fbff';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(bodyX + 2, bodyY + 8);
  ctx.lineTo(4, PLAYER.HEIGHT * 0.62);
  ctx.moveTo(bodyX + bodyW - 2, bodyY + 8);
  ctx.lineTo(PLAYER.WIDTH - 4, PLAYER.HEIGHT * 0.62);
  ctx.moveTo(bodyX + bodyW * 0.35, bodyY + bodyH);
  ctx.lineTo(PLAYER.WIDTH * 0.35, PLAYER.HEIGHT - 3);
  ctx.moveTo(bodyX + bodyW * 0.65, bodyY + bodyH);
  ctx.lineTo(PLAYER.WIDTH * 0.65, PLAYER.HEIGHT - 3);
  ctx.stroke();

  ctx.restore();
}

function drawAssetHighlights(ctx: CanvasRenderingContext2D, img: HTMLImageElement): void {
  const isFullFrameAsset = img.naturalWidth > 512 && img.naturalHeight > 512;
  const sx = isFullFrameAsset ? 640 : 0;
  const sy = isFullFrameAsset ? 130 : 0;
  const sw = isFullFrameAsset ? 660 : img.naturalWidth;
  const sh = isFullFrameAsset ? 820 : img.naturalHeight;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = 'brightness(7) contrast(1.8)';
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, PLAYER.WIDTH, PLAYER.HEIGHT);
  ctx.restore();
}

export function setCurrentScene(scene: SceneData): void {
  currentScene = scene;
}

export function initPlayer(spawnX: number, spawnY: number): void {
  player = {
    x: spawnX,
    y: spawnY,
    vx: 0,
    vy: 0,
    hp: PLAYER.MAX_HP,
    ammo: PLAYER.MAX_AMMO,
    facing: 'right',
    grounded: false,
    invincible: false,
    invincibleTimer: 0,
  };
}

export function getPlayer(): Player {
  return player;
}

export function updatePlayer(dt: number): void {
  // Horizontal movement
  if (keys.left) {
    player.vx = -PLAYER.SPEED;
    player.facing = 'left';
  } else if (keys.right) {
    player.vx = PLAYER.SPEED;
    player.facing = 'right';
  } else {
    player.vx *= GAME.FRICTION;
    if (Math.abs(player.vx) < 0.1) player.vx = 0;
  }

  player.x += player.vx;

  // Jump (single press, only when grounded)
  if (justPressed.jump && player.grounded) {
    player.vy = PLAYER.JUMP_FORCE;
    player.grounded = false;
  }

  // Gravity
  player.vy += GAME.GRAVITY;
  if (player.vy > GAME.MAX_FALL_SPEED) {
    player.vy = GAME.MAX_FALL_SPEED;
  }

  player.y += player.vy;

  // Platform collision
  player.grounded = false;
  const playerAABB: AABB = {
    x: player.x,
    y: player.y,
    width: PLAYER.WIDTH,
    height: PLAYER.HEIGHT,
  };

  for (const plat of currentScene.platforms) {
    const platAABB = platformToAABB(plat);
    if (checkCollision(playerAABB, platAABB)) {
      if (player.vy >= 0 && player.y + PLAYER.HEIGHT > plat.y) {
        player.y = resolvePlayerPlatform(playerAABB, platAABB);
        player.vy = 0;
        player.grounded = true;
      }
    }
  }

  // Void damage
  if (player.y > currentScene.voidY) {
    takeDamage();
    player.x = currentScene.playerSpawn.x;
    player.y = currentScene.playerSpawn.y;
    player.vy = 0;
    player.vx = 0;
  }

  // World bounds
  if (player.x < 0) player.x = 0;
  if (player.x + PLAYER.WIDTH > currentScene.worldWidth) {
    player.x = currentScene.worldWidth - PLAYER.WIDTH;
  }

  // Invincibility timer
  if (player.invincible) {
    player.invincibleTimer -= dt;
    if (player.invincibleTimer <= 0) {
      player.invincible = false;
    }
  }
}

export function takeDamage(): void {
  if (player.invincible) return;
  player.hp--;
  player.invincible = true;
  player.invincibleTimer = PLAYER.INVINCIBILITY_DURATION;
  console.log(`[Player] Took damage! HP: ${player.hp}`);
}

export function drawPlayer(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
  const drawX = player.x - camX;
  const drawY = player.y - camY;

  ctx.save();
  if (player.invincible) {
    ctx.globalAlpha = Math.floor(Date.now() / 100) % 2 === 0 ? 1 : 0.5;
  }

  const astronautImg = getAsset('astronaut_idle');
  if (astronautImg && astronautImg.complete && astronautImg.naturalWidth > 0) {
    const visualW = 78;
    const visualH = 96;
    const visualX = drawX + PLAYER.WIDTH / 2 - visualW / 2;
    const visualY = drawY + PLAYER.HEIGHT - visualH;

    ctx.save();
    if (player.facing === 'left') {
      ctx.translate(visualX + visualW, visualY);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(visualX, visualY);
    }
    ctx.drawImage(
      astronautImg,
      ASTRONAUT_CROP.sx,
      ASTRONAUT_CROP.sy,
      ASTRONAUT_CROP.sw,
      ASTRONAUT_CROP.sh,
      0,
      0,
      visualW,
      visualH
    );
    ctx.restore();
  } else {
    ctx.save();
    ctx.translate(drawX, drawY);
    drawBaseAstronaut(ctx);
    ctx.restore();
  }

  ctx.restore();
}
