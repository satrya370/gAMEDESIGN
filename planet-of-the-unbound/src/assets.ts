// ============================================
// assets.js — Load semua image sprites
// ============================================

export interface AssetList {
  [key: string]: HTMLImageElement;
}

const ASSET_PATHS: Record<string, string> = {
  start_screen: 'assets/images/start_screen.jpg',
  astronaut_idle: 'assets/images/astronaut_idle.png',
  alien_shooter: 'assets/images/alien_shooter.png',
  background_moon: 'assets/images/background_moon.png',
  environment_plants: 'assets/images/environment_plants.png',
  leaf_decoration: 'assets/images/leaf_decoration.png',
  bush_decoration: 'assets/images/bush_decoration.png',
  vine_ladder: 'assets/images/vine_ladder.png',
  butterfly_background: 'assets/images/butterfly_background.png',
  bridge_platform: 'assets/images/bridge_platform.png',
  rock_platform_large: 'assets/images/rock_platform_large.png',
  laser_bullet: 'assets/images/laser_bullet.png',
  bullet_boss: 'assets/images/bullet_boss.png',
  meteor_projectile: 'assets/images/meteor_projectile.png',
  rocket_part_01: 'assets/images/rocket_part_01.png',
  rocket_part_02: 'assets/images/rocket_part_02.png',
  rocket_part_03: 'assets/images/rocket_part_03.png',
  rocket_part_04: 'assets/images/rocket_part_04.png',
  rocket_broken: 'assets/images/rocket_broken.png',
  portal_effect: 'assets/images/portal_effect.png',
  laser_weapon: 'assets/images/laser_weapon.png',
  health_icon: 'assets/images/health_icon.png',
};

let loadedAssets: AssetList = {};

function loadAsset(name: string, path: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      loadedAssets[name] = img; // ← Simpan image yang sudah ke-load!
      console.log(`[Assets] Loaded: ${name}`);
      resolve();
    };
    img.onerror = () => {
      console.error(`[Assets] Failed to load: ${name} (${path})`);
      resolve(); // resolve anyway so game doesn't hang
    };
    img.src = path;
  });
}

export async function loadAllAssets(): Promise<AssetList> {
  const keys = Object.keys(ASSET_PATHS);

  console.log(`[Assets] Loading ${keys.length} assets...`);

  const promises = keys.map((key) =>
    loadAsset(key, ASSET_PATHS[key])
  );

  await Promise.all(promises);

  console.log(`[Assets] All assets loaded. Count: ${Object.keys(loadedAssets).length}`);
  return loadedAssets;
}

export function getAsset(name: string): HTMLImageElement | undefined {
  return loadedAssets[name];
}
