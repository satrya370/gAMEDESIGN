// ============================================
// game.js — Game state machine & scene manager
// ============================================

import { COLORS } from './constants';

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
  canvasWidth = Math.max(1, window.innerWidth);
  canvasHeight = Math.max(1, window.innerHeight);

  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const pixelWidth = Math.round(canvasWidth * dpr);
  const pixelHeight = Math.round(canvasHeight * dpr);

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  canvas.style.position = 'absolute';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function getState(): GameState { return currentState; }
export function setState(state: GameState): void { currentState = state; }
export function getCanvas(): HTMLCanvasElement { return canvas; }
export function getCtx(): CanvasRenderingContext2D { return ctx; }
export function getWidth(): number { return canvasWidth; }
export function getHeight(): number { return canvasHeight; }
