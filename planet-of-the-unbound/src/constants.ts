// ============================================
// constants.js — Semua angka tunable game
// ============================================

export const GAME = {
  GRAVITY: 0.5,
  MAX_FALL_SPEED: 12,
  FRICTION: 0.8,
};

export const PLAYER = {
  SPEED: 4,
  JUMP_FORCE: -10,
  CLIMB_SPEED: 3,
  MAX_HP: 3,
  MAX_AMMO: 8,
  INVINCIBILITY_DURATION: 1000, // ms
  WIDTH: 48,
  HEIGHT: 64,
};

export const ENEMIES = {
  SMALL_ALIEN: {
    HP: 2,
    SPEED: 2,
    DAMAGE: 1,
    DETECTION_RANGE: 300,
  },
  BOSS_ALIEN: {
    HP: 5,
    SPEED: 1.5,
    DAMAGE: 1,
    ROCK_ATTACK_INTERVAL: 2000, // ms between rock throws
    METEOR_TRIGGER_HP: 3,       // triggers at 3 HP remaining
    METEOR_COUNT: 5,
    METEOR_INTERVAL: 500,       // ms between each meteor
  },
  UFO: {
    HP: 2,
    SPEED: 1,
    DAMAGE: 1,
    SHOOT_INTERVAL: 3000,       // ms between shots
  },
};

export const PROJECTILES = {
  LASER: {
    SPEED: 10,
    DAMAGE: 1,
  },
  ROCK_BULLET: {
    SPEED: 5,
    DAMAGE: 1,
  },
  METEOR: {
    SPEED: 8,
    DAMAGE: 1,
  },
  UFO_BULLET: {
    SPEED: 6,
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

export const SCENE_1 = {
  WORLD_WIDTH: 400,
  WORLD_HEIGHT: 800,
  VINE_LEFT_X: 80,
  VINE_RIGHT_X: 320,
  BRIDGE_Y: 60,
  CLIMB_START_Y: 700,
  CLIMB_END_Y: 80,
};

export const CUTSCENE = {
  CAMERA_Y_OFFSET: 100,
};

export const CANVAS = {
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
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
