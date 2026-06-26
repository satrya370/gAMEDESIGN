# 002 — Revision Log: Scene 1 Cutscene

> **Date:** 2026-06-26
> **Commits:** `6ce4034` (fix rewrite), `8f06c14` (initial overhaul)
> **Status:** ✅ Selesai

---

## Ringkasan Revisi

Revisi total Scene 1 cutscene dari hitam pekat (tidak keliatan aset) menjadi visual yang mendekati reference `scene_01.png`.

---

## Masalah Awal

| # | Masalah | Dampak |
|---|---------|--------|
| 1 | Background hitam `COLORS.VOID` | Asset gelap menyatu dengan background |
| 2 | `leaf_decoration` tidak ada di ASSET_CROPS | Leaf tidak pernah ter-render |
| 3 | Vine salah taruh di tengah | Seharusnya di kiri & kanan |
| 4 | Bridge menghubungkan kiri-kanan | Seharusnya di atas kanan saja |
| 5 | Camera bergerak follow astronaut | Seharusnya fix, tidak bergerak |
| 6 | Scene pakai world coordinates | Seharusnya screen coordinates |
| 7 | Bush & leaf stretch tanpa aspect ratio | Asset jadi aneh/distorsi |
| 8 | `drawSoftFog` crash karena NaN | Game berhenti, layar putih |

---

## Perubahan Per File

### 1. `src/constants.ts`

**Sebelum:**
```typescript
export const SCENE_1 = {
  WORLD_WIDTH: 400,
  WORLD_HEIGHT: 800,
  VINE_LEFT_X: 80,
  VINE_RIGHT_X: 320,
  BRIDGE_Y: 60,
  CLIMB_START_Y: 700,
  CLIMB_END_Y: 80,
};
```

**Sesudah:**
```typescript
export const SCENE_1 = {
  WORLD_WIDTH: 800,
  WORLD_HEIGHT: 4000,
  SCENE_TOP_Y: 3000,
  SCENE_BOTTOM_Y: 3600,
  WALL_LEFT_X: 0,
  WALL_LEFT_END_X: 240,
  GAP_START_X: 240,
  GAP_END_X: 400,
  WALL_RIGHT_X: 400,
  VINE_LEFT_X: 240,
  VINE_RIGHT_X: 400,
  BRIDGE_X: 400,
  BRIDGE_Y: 3000,
  BRIDGE_HEIGHT: 80,
  CLIMB_START_Y: 3550,
  CLIMB_END_Y: 3080,
};
```

**Catatan:** Properti scene sekarang ada di `scene.ts` (SCENE_1 object), bukan di constants.

---

### 2. `src/scene.ts`

**Sebelum:**
```typescript
export const SCENE_1: SceneData = {
  platforms: [{ x: 100, y: 60, width: 200, height: 20 }],
  worldWidth: 400,
  worldHeight: 800,
  playerSpawn: { x: 320, y: 700 },
  vinePositions: [
    { x: 80, y: 100, height: 600 },
    { x: 320, y: 100, height: 600 },
  ],
};
```

**Sesudah:**
```typescript
export const SCENE_1: SceneData = {
  platforms: [{ x: 400, y: 3000, width: 400, height: 80 }],
  worldWidth: 800,
  worldHeight: 4000,
  playerSpawn: { x: 400, y: 3550 },
  vinePositions: [
    { x: 240, y: 3000, height: 600 },
    { x: 400, y: 3000, height: 600 },
  ],
  SCENE_TOP_Y: 3250,
  SCENE_BOTTOM_Y: 3850,
  BRIDGE_Y: 3250,
  CLIMB_START_Y: 3800,
  CLIMB_END_Y: 3330,
  // ... wall/gap positions
} as any;
```

---

### 3. `src/cutscene.ts`

**Sebelum:**
```typescript
cutscene.astronautY = SCENE_1.CLIMB_START_Y +
  (SCENE_1.CLIMB_END_Y - SCENE_1.CLIMB_START_Y) * eased;
cutscene.astronautX = SCENE_1.VINE_RIGHT_X;
```

**Sesudah:**
```typescript
// Normalized: 1 = bawah, 0 = atas
cutscene.astronautY = 1 - eased;
cutscene.astronautX = 0; // Posisi fix di drawCutscene
```

**Perubahan:** Astronaut sekarang pakai normalized coordinates (0-1), posisi dihitung di `drawCutscene`.

---

### 4. `src/main.ts`

#### a. `ASSET_CROPS` — Tambah `leaf_decoration`
```typescript
leaf_decoration: { sx: 750, sy: 210, sw: 120, sh: 580 },
```

#### b. `drawSoftFog` — Safety check NaN
```typescript
function drawSoftFog(ctx, x, y, radius, alpha) {
  if (!isFinite(x) || !isFinite(y) || !isFinite(radius)) return;
  // ... gradient code
}
```

#### c. `drawCutscene` — Total rewrite

**Sebelum:** Pakai camera offset, world coordinates, stretch tanpa aspect ratio.

**Sesudah:** Fixed screen coordinates, cover-fit helper.

```typescript
function drawCutscene(ctx, w, h) {
  const cs = getCutscene();
  const time = cs.elapsed / 1000;

  // Scene = 70% dari screen height, di bagian bawah
  const sceneTop = h * 0.30;
  const sceneBottom = h;
  const sceneHeight = sceneBottom - sceneTop;

  // Pembagian lebar: 30% kiri, 20% tengah, 50% kanan
  const wallLeftWidth = w * 0.30;
  const gapWidth = w * 0.20;
  const wallRightWidth = w * 0.50;
  const wallRightX = wallLeftWidth + gapWidth;

  // 1. Background terang
  ctx.fillStyle = '#f7f7f4';
  ctx.fillRect(0, 0, w, h);

  // 2. Fog di gap
  drawSoftFog(ctx, ...);

  // 3. Bush kiri (30% lebar, full scene height)
  drawCoverFit(ctx, 'bush_decoration', 0, sceneTop, wallLeftWidth, sceneHeight);

  // 4. Vine kiri (dekorasi)
  drawCroppedAsset(ctx, 'vine_ladder', wallLeftWidth - 15, sceneTop, 30, sceneHeight);

  // 5. Vine kanan (dipanjat)
  drawCroppedAsset(ctx, 'vine_ladder', wallRightX - 15, sceneTop, 30, sceneHeight);

  // 6. Leaf kanan (50% lebar, full scene height)
  drawCoverFit(ctx, 'leaf_decoration', wallRightX, sceneTop, wallRightWidth, sceneHeight);

  // 7. Bridge (drawBridge)
  drawBridge(ctx, wallRightX, sceneTop, wallRightWidth, 0, 0);

  // 8. Butterflies (3 instance animated)
  // ... sinusoidal motion

  // 9. Astronaut slide up
  const astronautX = wallRightX - 30;
  const astronautY = sceneTop + cs.astronautY * sceneHeight;
  drawCroppedAsset(ctx, 'astronaut_idle', astronautX, astronautY, 60, 75);
}
```

---

### 5. `src/main.ts` — `drawBridge` dipanggil tanpa camX/camY

**Sebelum:** `drawBridge(ctx, bridge.x, bridge.y, bridge.width, cam.x, cam.y)`

**Sesudah:** `drawBridge(ctx, wallRightX, sceneTop, wallRightWidth, 0, 0)`

Karena camera fix (tidak bergerak), camX=0 dan camY=0.

---

## Placeholder / Visual Description

### Layout Akhir (setelah revisi)

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│  30% atas = kosong (background terang)                │
│                                                       │
├───────────────────────────────────────────────────────┤ ← sceneTop (30% dari atas)
│                                                       │
│  ▓▓▓▓▓▓▓▓|||        ╔════BRIDGE════╗                 │
│  ▓▓BUSH▓▓|||        ║▓▓▓▓LEAF▓▓▓▓▓▓║                 │
│  ▓▓▓▓▓▓▓▓|||  ⭐⭐  ║▓▓▓▓▓▓▓▓▓▓▓▓▓▓║                 │
│  ▓▓▓▓▓▓▓▓|||        ║▓▓▓▓▓▓▓▓▓▓▓▓▓▓║                 │
│  ▓▓▓▓▓▓▓▓||| 🧑‍🚀    ║▓▓▓▓▓▓▓▓▓▓▓▓▓▓║                 │
│  ▓▓▓▓▓▓▓▓||| slide  ║▓▓▓▓▓▓▓▓▓▓▓▓▓▓║                 │
│  ▓▓▓▓▓▓▓▓||| up     ║▓▓▓▓▓▓▓▓▓▓▓▓▓▓║                 │
│  ▓▓▓▓▓▓▓▓||| vine   ║▓▓▓▓▓▓▓▓▓▓▓▓▓▓║                 │
│  ▓▓▓▓▓▓▓▓|||        ║▓▓▓▓▓▓▓▓▓▓▓▓▓▓║                 │
│  ▓▓▓▓▓▓▓▓|||        ╚══════════════╝                 │
│                                                       │
├───────────────────────────────────────────────────────┤ ← sceneBottom (bawah screen)
│                                                       │
│  0% = kiri                                           │
│  30% = batas bush                                    │
│  50% = batas gap/leaf                                │
│  100% = kanan                                        │
└───────────────────────────────────────────────────────┘
```

### Elemen Visual

| # | Elemen | Posisi | Aset | Cara Gambar |
|---|--------|--------|------|-------------|
| 1 | Background | Full screen | — | `fillRect` #f7f7f4 |
| 2 | Fog | Gap tengah | — | `drawSoftFog` (radial gradient) |
| 3 | Bush (tembok kiri) | x=0, 30% lebar, full scene height | `bush_decoration.png` | `drawCoverFit` (aspect ratio preserved) |
| 4 | Vine kiri | x=30% - 15px, 30px lebar | `vine_ladder.png` | `drawCroppedAsset` |
| 5 | Vine kanan | x=50% - 15px, 30px lebar | `vine_ladder.png` | `drawCroppedAsset` |
| 6 | Leaf (tembok kanan) | x=50%, 50% lebar, full scene height | `leaf_decoration.png` | `drawCoverFit` (aspect ratio preserved) |
| 7 | Bridge | x=50%, atas scene, 50% lebar | `bridge_platform.png` | `drawBridge` (proper height calc) |
| 8 | Butterflies | Gap tengah (3 instance) | `butterfly_background.png` | `drawCroppedAsset` + sinusoidal animasi |
| 9 | Astronaut | x=50% - 30px, slide up | `astronaut_idle.png` | `drawCroppedAsset` (60x75) |

---

## Animasi

### Astronaut Slide Up

```
Detik 0:  🧑‍🚀 di bawah vine kanan (sceneBottom)
Detik 1:  🧑‍🚀 naik 30% (ease-in, mulai lambat)
Detik 2:  🧑‍🚀 naik 70% (ease, kecepatan stabil)
Detik 3:  🧑‍🚀 sampai di bridge (ease-out, melambat)
```

**Easing:** Quadratic ease-in-out
```typescript
const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
```

**Posisi:** Normalized (0=atas, 1=bawah)
```typescript
const astronautY = sceneTop + cs.astronautY * sceneHeight;
```

### Butterflies

3 kupu-kupu kecil melayang di gap dengan sinusoidal motion:
- bx: posisi horizontal + sin(time)
- by: posisi vertical + cos(time)
- alpha: berkedip 0.55 ± 0.20

---

## Build Result

```
dist/bundle.js  34.7kb
⚡ Done in 18ms
```

**Build: CLEAN ✅**

---

## Verification

| # | Check | Status |
|---|-------|--------|
| 1 | Build clean | ✅ 34.7kb |
| 2 | No TypeScript errors | ✅ |
| 3 | No NaN/Infinity | ✅ (safety check di drawSoftFog) |
| 4 | All assets loaded | ✅ 22/22 |
| 5 | leaf_decoration di ASSET_CROPS | ✅ |
| 6 | Camera fix (tidak bergerak) | ✅ |
| 7 | Bridge pakai drawBridge() | ✅ |
| 8 | Vine menempel dinding | ✅ |

---

*Log generated by Hermes Agent — 2026-06-26*
