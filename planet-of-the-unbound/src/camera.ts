import { CAMERA } from './constants';

export interface Camera {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

let cam: Camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
let boundsMinX = 0;
let boundsMinY = 0;
let boundsMaxX = 0;
let boundsMaxY = 0;
let viewW = 800;
let viewH = 600;

function clampCamera(): void {
  if (cam.x < boundsMinX) cam.x = boundsMinX;
  if (cam.x > boundsMaxX) cam.x = boundsMaxX;
  if (cam.y < boundsMinY) cam.y = boundsMinY;
  if (cam.y > boundsMaxY) cam.y = boundsMaxY;
}

export function initCamera(minX: number, minY: number, maxX: number, maxY: number, vw?: number, vh?: number): void {
  boundsMinX = minX;
  boundsMinY = minY;
  if (vw) viewW = vw;
  if (vh) viewH = vh;
  boundsMaxX = Math.max(boundsMinX, maxX - viewW);
  boundsMaxY = Math.max(boundsMinY, maxY - viewH);
  cam.x = 0;
  cam.y = 0;
  cam.targetX = 0;
  cam.targetY = 0;
}

export function setCameraTarget(x: number, y: number): void {
  cam.targetX = x;
  cam.targetY = y;
}

export function updateCamera(_dt: number): void {
  // Target = player position, camera = target minus half canvas (so player is centered)
  const goalX = cam.targetX - viewW / 2;
  const goalY = cam.targetY - viewH / 2;

  cam.x += (goalX - cam.x) * CAMERA.SMOOTHING;
  cam.y += (goalY - cam.y) * CAMERA.SMOOTHING;

  clampCamera();
}

export function getCamera(): Camera {
  return cam;
}

export function snapCamera(x: number, y: number): void {
  const goalX = x - viewW / 2;
  const goalY = y - viewH / 2;
  cam.x = goalX;
  cam.y = goalY;
  cam.targetX = x;
  cam.targetY = y;
  clampCamera();
}
