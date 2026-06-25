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

  if (player.invincible) {
    ctx.globalAlpha = Math.floor(Date.now() / 100) % 2 === 0 ? 1 : 0.5;
  }

  const astronautImg = getAsset('astronaut_idle');
  if (astronautImg && astronautImg.complete && astronautImg.naturalWidth > 0) {
    ctx.save();
    if (player.facing === 'left') {
      ctx.translate(drawX + PLAYER.WIDTH, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(astronautImg, 0, 0, PLAYER.WIDTH, PLAYER.HEIGHT);
    } else {
      ctx.drawImage(astronautImg, drawX, drawY, PLAYER.WIDTH, PLAYER.HEIGHT);
    }
    ctx.restore();
  } else {
    // Fallback: white rectangle
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(drawX, drawY, PLAYER.WIDTH, PLAYER.HEIGHT);
  }

  ctx.globalAlpha = 1;
}
