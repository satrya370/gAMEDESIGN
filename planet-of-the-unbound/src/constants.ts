// ============================================
// constants.js — Semua angka tunable game
// ============================================

export const GAME = {
  GRAVITY: 0.62,
  MAX_FALL_SPEED: 13,
  FRICTION: 0.72,
};

export const PLAYER = {
  SPEED: 4.6,
  JUMP_FORCE: -10.6,
  CLIMB_SPEED: 3,
  MAX_HP: 3,
  MAX_AMMO: 15,
  INVINCIBILITY_DURATION: 1000, // ms
  WIDTH: 48,
  HEIGHT: 64,
  GROUND_ACCELERATION: 0.42,
  AIR_ACCELERATION: 0.18,
  AIR_DRAG: 0.96,
  FALL_GRAVITY_MULTIPLIER: 1.16,
  CROUCH_SPEED_MULTIPLIER: 0.42,
  HITBOX_WIDTH: 38,
  HITBOX_HEIGHT: 60,
  HITBOX_INSET_X: 5,
  HITBOX_INSET_Y: 4,
  CROUCH_HITBOX_WIDTH: 36,
  CROUCH_HEIGHT: 38,
};

export const ENEMIES = {
  SMALL_ALIEN: {
    HP: 2,
    SPEED: 1.35,
    DAMAGE: 1,
    DETECTION_RANGE: 300,
    SHOOT_INTERVAL: 3200,
  },
  BOSS_ALIEN: {
    HP: 8,
    SPEED: 1.2,
    DAMAGE: 1,
    ROCK_ATTACK_INTERVAL: 2600, // ms between rock throws
    METEOR_TRIGGER_HP: 4,       // triggers at 4 HP remaining
    METEOR_COUNT: 5,
    METEOR_INTERVAL: 500,       // ms between each meteor
  },
  UFO: {
    HP: 2,
    SPEED: 1,
    DAMAGE: 1,
    SHOOT_INTERVAL: 4200,       // ms between shots
  },
};

export const PROJECTILES = {
  LASER: {
    SPEED: 10,
    DAMAGE: 1,
  },
  ALIEN_BULLET: {
    BODY_SPEED: 2.3,
    HIGH_SPEED: 2.55,
    DAMAGE: 1,
  },
  ROCK_BULLET: {
    SPEED: 4.6,
    DAMAGE: 1,
  },
  METEOR: {
    SPEED: 8,
    DAMAGE: 1,
  },
  UFO_BULLET: {
    SPEED: 3.6,
    DAMAGE: 1,
  },
};

export const CAMERA = {
  SMOOTHING: 0.1,
  OFFSET_X: -150,  // player slightly left of center
  OFFSET_Y: 100,   // player slightly below center
};

export const SCENES = {
  SCENE_1_DURATION: 3000, // ms
  SCENE_4_DURATION: 5000, // ms
  SCENE_5_DURATION: 8000, // ms
};

export const CUTSCENE = {
  CAMERA_Y_OFFSET: 100,
};

export const COLORS = {
  BACKGROUND: '#000000',
  PLAYER: '#ffffff',
  PLATFORM: '#ffffff',
  ENEMY: '#ffffff',
  VOID: '#000000',
  UI_TEXT: '#ffffff',
  UI_ACCENT: '#888888',
  UI_DIM: '#555555',
};
