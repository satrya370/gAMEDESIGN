export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function checkCollision(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function resolvePlayerPlatform(player: AABB, platform: AABB): number {
  return platform.y - player.height;
}
