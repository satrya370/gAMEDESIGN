// ============================================
// game.js — Game state machine & scene manager
// ============================================

import { CANVAS, COLORS } from './constants';

export type GameState = 'MENU' | 'CONTROLS' | 'PLAYING' | 'CUTSCENE' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

let currentState: GameState = 'MENU';
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

// Canvas sizing
let canvasWidth = 800;
let canvasHeight = 600;

export function initGame(canvasEl: HTMLCanvasElement): void {
  canvas = canvasEl;
  ctx = canvas.getContext('2d')!;
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  console.log('[Game] Initialized.');
}

function resizeCanvas(): void {
  const maxW = CANVAS.MAX_WIDTH;
  const maxH = CANVAS.MAX_HEIGHT;
  const windowW = window.innerWidth;
  const windowH = window.innerHeight;

  // Scale to fit window while maintaining max resolution
  const scale = Math.min(windowW / maxW, windowH / maxH, 1);

  canvasWidth = Math.floor(maxW * scale);
  canvasHeight = Math.floor(maxH * scale);

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Center canvas
  canvas.style.position = 'absolute';
  canvas.style.left = `${(windowW - canvasWidth) / 2}px`;
  canvas.style.top = `${(windowH - canvasHeight) / 2}px`;
}

export function getState(): GameState { return currentState; }
export function setState(state: GameState): void { currentState = state; }
export function getCanvas(): HTMLCanvasElement { return canvas; }
export function getCtx(): CanvasRenderingContext2D { return ctx; }
export function getWidth(): number { return canvasWidth; }
export function getHeight(): number { return canvasHeight; }
