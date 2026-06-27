import { GAME, PLAYER } from './constants';
import { getAsset } from './assets';
import { keys, justPressed } from './input';
import { AABB, checkCollision, resolvePlayerPlatform } from './collision';
import { SceneData, SCENE_2, VineData, platformToAABB } from './scene';

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  ammo: number;
  facing: 'left' | 'right';
  grounded: boolean;
  climbing: boolean;
  crouching: boolean;
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
    climbing: false,
    crouching: false,
    invincible: false,
    invincibleTimer: 0,
  };
}

export function getPlayer(): Player {
  return player;
}

export function refillAmmo(): void {
  player.ammo = PLAYER.MAX_AMMO;
}

export function consumeAmmo(): boolean {
  if (player.ammo <= 0) return false;
  player.ammo -= 1;
  return true;
}

export function setPlayerPosition(x: number, y: number): void {
  player.x = x;
  player.y = y;
  player.vx = 0;
  player.vy = 0;
  player.climbing = false;
  player.crouching = false;
}

export function getPlayerAABB(): AABB {
  if (player.crouching) {
    const xInset = (PLAYER.WIDTH - PLAYER.CROUCH_HITBOX_WIDTH) / 2;
    return {
      x: player.x + xInset,
      y: player.y + PLAYER.HEIGHT - PLAYER.CROUCH_HEIGHT,
      width: PLAYER.CROUCH_HITBOX_WIDTH,
      height: PLAYER.CROUCH_HEIGHT,
    };
  }

  return {
    x: player.x + PLAYER.HITBOX_INSET_X,
    y: player.y + PLAYER.HITBOX_INSET_Y,
    width: PLAYER.HITBOX_WIDTH,
    height: PLAYER.HITBOX_HEIGHT,
  };
}

export function updatePlayer(dt: number): void {
  let vine = findTouchingVine();

  if (!player.climbing && vine && (keys.up || keys.down)) {
    player.climbing = true;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;
  }

  if (player.climbing) {
    player.crouching = false;
    vine = vine ?? findClosestClimbVine();

    if (!vine) {
      player.climbing = false;
    } else {
      const vineCenterX = vine.x + vine.width / 2;
      const targetX = vineCenterX - PLAYER.WIDTH * 0.48;

      player.vx = 0;
      player.vy = 0;
      player.x += (targetX - player.x) * 0.45;

      if (keys.up) {
        player.y -= PLAYER.CLIMB_SPEED;
      }
      if (keys.down) {
        player.y += PLAYER.CLIMB_SPEED;
      }
      if (keys.left) {
        player.facing = 'left';
      } else if (keys.right) {
        player.facing = 'right';
      }
      if (justPressed.jump) {
        player.climbing = false;
        player.vy = PLAYER.JUMP_FORCE * 0.85;
      }

      const topLimit = vine.y - PLAYER.HEIGHT * 0.35;
      const bottomLimit = vine.y + vine.height - PLAYER.HEIGHT * 0.2;
      if (player.y < topLimit) player.y = topLimit;
      if (player.y > bottomLimit) {
        player.y = bottomLimit;
        if (keys.down) player.climbing = false;
      }
    }
  }

  if (!player.climbing) {
    const wasGrounded = player.grounded;
    const moveDirection = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
    player.crouching = wasGrounded && keys.down && !keys.up;

    const targetSpeed = player.crouching
      ? PLAYER.SPEED * PLAYER.CROUCH_SPEED_MULTIPLIER
      : PLAYER.SPEED;
    const acceleration = wasGrounded ? PLAYER.GROUND_ACCELERATION : PLAYER.AIR_ACCELERATION;
    const drag = wasGrounded ? GAME.FRICTION : PLAYER.AIR_DRAG;

    if (moveDirection !== 0) {
      player.vx += (moveDirection * targetSpeed - player.vx) * acceleration;
      player.facing = moveDirection < 0 ? 'left' : 'right';
    } else {
      player.vx *= drag;
      if (Math.abs(player.vx) < 0.05) player.vx = 0;
    }

    if (player.crouching && wasGrounded) {
      player.vx *= 0.82;
    }

    player.x += player.vx;

    if (justPressed.jump && wasGrounded && !player.crouching) {
      player.vy = PLAYER.JUMP_FORCE;
      player.grounded = false;
    }

    player.vy += player.vy > 0 ? GAME.GRAVITY * PLAYER.FALL_GRAVITY_MULTIPLIER : GAME.GRAVITY;
    if (player.vy > GAME.MAX_FALL_SPEED) {
      player.vy = GAME.MAX_FALL_SPEED;
    }

    player.y += player.vy;
  }

  // Platform collision
  player.grounded = false;
  const playerAABB = getPlayerAABB();

  for (const plat of currentScene.platforms) {
    const platAABB = platformToAABB(plat);
    if (checkCollision(playerAABB, platAABB)) {
      if (player.vy >= 0 && playerAABB.y + playerAABB.height > plat.y) {
        player.y = resolvePlayerPlatform({ ...playerAABB, height: PLAYER.HEIGHT }, platAABB);
        player.vy = 0;
        player.grounded = true;
        player.climbing = false;
      }
    }
  }

  if (!player.grounded) {
    player.crouching = false;
  }

  // Void damage
  if (player.y > currentScene.voidY) {
    takeDamage();
    player.x = currentScene.playerSpawn.x;
    player.y = currentScene.playerSpawn.y;
    player.vy = 0;
    player.vx = 0;
    player.climbing = false;
    player.crouching = false;
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

function getClimbVines(): VineData[] {
  return (currentScene.vinePositions ?? []).filter((vine) => vine.climbable !== false);
}

function findTouchingVine(): VineData | undefined {
  const body = getPlayerAABB();
  const centerX = body.x + body.width * 0.5;
  const bodyTop = body.y + 6;
  const bodyBottom = body.y + body.height - 4;

  return getClimbVines().find((vine) => {
    const left = vine.x + vine.width * 0.2;
    const right = vine.x + vine.width * 0.8;
    const top = vine.y;
    const bottom = vine.y + vine.height;
    return centerX >= left - 16 && centerX <= right + 16 && bodyBottom >= top + 10 && bodyTop <= bottom - 10;
  });
}

function findClosestClimbVine(): VineData | undefined {
  const body = getPlayerAABB();
  const centerX = body.x + body.width * 0.5;
  const centerY = body.y + body.height * 0.5;

  return getClimbVines()
    .map((vine) => {
      const vineCenterX = vine.x + vine.width * 0.5;
      const vineCenterY = vine.y + vine.height * 0.5;
      const dx = Math.abs(vineCenterX - centerX);
      const dy = Math.abs(vineCenterY - centerY);
      return { vine, distance: dx + dy * 0.2 };
    })
    .sort((a, b) => a.distance - b.distance)[0]?.vine;
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
  const crouchScale = player.crouching ? 0.70 : 1;

  ctx.save();
  if (player.invincible) {
    ctx.globalAlpha = Math.floor(Date.now() / 100) % 2 === 0 ? 1 : 0.5;
  }

  const astronautImg = getAsset('astronaut_idle');
  if (astronautImg && astronautImg.complete && astronautImg.naturalWidth > 0) {
    const visualW = player.crouching ? 74 : 78;
    const visualH = 96 * crouchScale;
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
    if (player.grounded) {
      ctx.strokeStyle = 'rgba(5, 5, 5, 0.55)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(visualW * 0.22, visualH - 3);
      ctx.lineTo(visualW * 0.45, visualH - 3);
      ctx.moveTo(visualW * 0.58, visualH - 3);
      ctx.lineTo(visualW * 0.82, visualH - 3);
      ctx.stroke();
    }
    ctx.restore();
  } else {
    ctx.save();
    ctx.translate(drawX, drawY + (player.crouching ? 10 : 0));
    if (player.crouching) {
      ctx.scale(1, 0.82);
    }
    drawBaseAstronaut(ctx);
    ctx.restore();
  }

  ctx.restore();
}
