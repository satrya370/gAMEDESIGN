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
  WORLD_WIDTH: 800,
  WORLD_HEIGHT: 4000,      // Lebih besar dari view height
  SCENE_TOP_Y: 3000,       // Scene mulai di sini (atas)
  SCENE_BOTTOM_Y: 3600,    // Scene berakhir di sini (bawah)
  WALL_LEFT_X: 0,          // Tembok kiri mulai
  WALL_LEFT_END_X: 240,    // Tembok kiri selesai (30%)
  GAP_START_X: 240,        // Gap mulai
  GAP_END_X: 400,          // Gap selesai (20%)
  WALL_RIGHT_X: 400,       // Tembok kanan mulai (50%)
  VINE_LEFT_X: 240,        // Vine kiri di sisi kanan bush
  VINE_RIGHT_X: 400,       // Vine kanan di sisi kiri leaf
  BRIDGE_X: 400,           // Bridge di atas kanan
  BRIDGE_Y: 3000,          // Bridge di atas scene
  BRIDGE_HEIGHT: 80,       // Tinggi bridge
  CLIMB_START_Y: 3550,     // Astronaut mulai di bawah
  CLIMB_END_Y: 3080,       // Astronaut sampai di bridge
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
