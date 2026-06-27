// ============================================
// input.js — Keyboard & mouse handler
// ============================================

export interface Keys {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  shoot: boolean;
  restart: boolean;
  pause: boolean;
}

export const keys: Keys = {
  left: false,
  right: false,
  up: false,
  down: false,
  jump: false,
  shoot: false,
  restart: false,
  pause: false,
};

// Track single-press keys (for actions like shoot, jump)
export const justPressed: Keys = {
  left: false,
  right: false,
  up: false,
  down: false,
  jump: false,
  shoot: false,
  restart: false,
  pause: false,
};

let mouseX = 0;
let mouseY = 0;
let mouseDown = false;

export function getMouseX(): number { return mouseX; }
export function getMouseY(): number { return mouseY; }
export function isMouseDown(): boolean { return mouseDown; }

function handleKeyDown(e: KeyboardEvent): void {
  switch (e.code) {
    case 'KeyA':
    case 'ArrowLeft':
      keys.left = true;
      break;
    case 'KeyD':
    case 'ArrowRight':
      keys.right = true;
      break;
    case 'KeyW':
    case 'ArrowUp':
      keys.up = true;
      break;
    case 'KeyS':
    case 'ArrowDown':
      keys.down = true;
      break;
    case 'Space':
      keys.jump = true;
      justPressed.jump = true;
      e.preventDefault();
      break;
    case 'KeyJ':
    case 'Enter':
      keys.shoot = true;
      justPressed.shoot = true;
      e.preventDefault();
      break;
    case 'KeyR':
      keys.restart = true;
      justPressed.restart = true;
      break;
    case 'Escape':
      keys.pause = true;
      justPressed.pause = true;
      break;
  }
}

function handleKeyUp(e: KeyboardEvent): void {
  switch (e.code) {
    case 'KeyA':
    case 'ArrowLeft':
      keys.left = false;
      break;
    case 'KeyD':
    case 'ArrowRight':
      keys.right = false;
      break;
    case 'KeyW':
    case 'ArrowUp':
      keys.up = false;
      break;
    case 'KeyS':
    case 'ArrowDown':
      keys.down = false;
      break;
    case 'Space':
      keys.jump = false;
      e.preventDefault();
      break;
    case 'KeyJ':
    case 'Enter':
      keys.shoot = false;
      e.preventDefault();
      break;
    case 'KeyR':
      keys.restart = false;
      break;
    case 'Escape':
      keys.pause = false;
      break;
  }
}

function handleMouseMove(e: MouseEvent): void {
  mouseX = e.clientX;
  mouseY = e.clientY;
}

function handleMouseDown(e: MouseEvent): void {
  if (e.button === 0) {
    mouseDown = true;
    keys.shoot = true;
    justPressed.shoot = true;
  }
}

function handleMouseUp(e: MouseEvent): void {
  if (e.button === 0) {
    mouseDown = false;
    keys.shoot = false;
  }
}

export function initInput(): void {
  mouseX = window.innerWidth / 2;
  mouseY = window.innerHeight / 2;
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mouseup', handleMouseUp);
  console.log('[Input] Initialized.');
}

// Call at end of each frame to clear justPressed
export function clearJustPressed(): void {
  justPressed.left = false;
  justPressed.right = false;
  justPressed.up = false;
  justPressed.down = false;
  justPressed.jump = false;
  justPressed.shoot = false;
  justPressed.restart = false;
  justPressed.pause = false;
}
