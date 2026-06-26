# 002 — Implementation Plan: Scene 1 Cutscene Visual Overhaul

> **Based on:** `002_revision_scene_01_plan.md`  
> **Date:** 2026-06-26  
> **Status:** Ready for implementation  
> **Files changed:** 4 (`constants.ts`, `scene.ts`, `cutscene.ts`, `main.ts`)  
> **Estimated time:** ~10 menit (single worker agent)

---

## 0. Pre-Flight Check

Sebelum mulai, pastikan semua informasi ini sudah diverifikasi:

- [ ] Reference visual: `C:\GameDesign\example_scene\scene_01.png` — sudah dianalisis
- [ ] Asset source: `C:\GameDesign\GameAset\` — 22 file tersedia
- [ ] Semua asset yang dibutuhkan ada: `bush_decoration.png`, `leaf_decoration.png`, `vine_ladder.png`, `bridge_platform.png`, `astronaut_idle.png`, `butterfly_background.png`

---

## 1. Step-by-Step Implementation

### Step 1 — `src/constants.ts`: Update SCENE_1 data

**File:** `C:\GameDesign\planet-of-the-unbound\src\constants.ts`

**Change:** Ganti block `SCENE_1` — WORLD_WIDTH 400→800, hapus VINE_LEFT_X & VINE_RIGHT_X, tambah VINE_CENTER_X.

**OLD (lines 77-85):**
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

**NEW:**
```typescript
export const SCENE_1 = {
  WORLD_WIDTH: 800,
  WORLD_HEIGHT: 800,
  VINE_LEFT_X: 180,       // Vine kiri — menempel dengan bush
  VINE_RIGHT_X: 620,      // Vine kanan — menempel dengan leaf
  BRIDGE_Y: 60,
  CLIMB_START_Y: 700,
  CLIMB_END_Y: 80,
};
```

---

### Step 2 — `src/scene.ts`: Update SCENE_1 layout

**File:** `C:\GameDesign\planet-of-the-unbound\src\scene.ts`

**Change:** WorldWidth 400→800, platform lebih lebar, 1 vine di tengah, playerSpawn di tengah.

**OLD (lines 34-47):**
```typescript
export const SCENE_1: SceneData = {
  platforms: [
    { x: 100, y: 60, width: 200, height: 20 },
  ],
  worldWidth: 400,
  worldHeight: 800,
  voidY: 850,
  playerSpawn: { x: 320, y: 700 },
  portal: { x: 0, y: 0, width: 0, height: 0 },
  vinePositions: [
    { x: 80, y: 100, height: 600 },
    { x: 320, y: 100, height: 600 },
  ],
};
```

**NEW:**
```typescript
export const SCENE_1: SceneData = {
  platforms: [
    { x: 100, y: 60, width: 600, height: 24 }, // Bridge atas — horizontal lebar
  ],
  worldWidth: 800,
  worldHeight: 800,
  voidY: 850,
  playerSpawn: { x: 400, y: 700 }, // Tengah bawah
  portal: { x: 0, y: 0, width: 0, height: 0 },
  vinePositions: [
    { x: 180, y: 80, height: 640 }, // Vine kiri — menempel bush
    { x: 620, y: 80, height: 640 }, // Vine kanan — menempel leaf
  ],
};
```

---

### Step 3 — `src/cutscene.ts`: Fix astronautX reference

**File:** `C:\GameDesign\planet-of-the-unbound\src\cutscene.ts`

**Change:** Line 54 — `SCENE_1.VINE_RIGHT_X` → `SCENE_1.VINE_CENTER_X`

**OLD (line 54):**
```typescript
    cutscene.astronautX = SCENE_1.VINE_RIGHT_X;
```

**NEW:**
```typescript
    cutscene.astronautX = SCENE_1.VINE_RIGHT_X; // Naik di vine kanan
```

---

### Step 4 — `src/main.ts`: Rewrite `drawCutscene()`

**File:** `C:\GameDesign\planet-of-the-unbound\src\main.ts`

**Change:** Replace seluruh function `drawCutscene` (lines 569-632).

**OLD (lines 569-632):**
```typescript
function drawCutscene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const cs = getCutscene();
  const cam = getCamera();

  ctx.fillStyle = COLORS.VOID;
  ctx.fillRect(0, 0, w, h);

  const moonImg = getAsset('background_moon');
  if (moonImg) {
    ctx.globalAlpha = 0.1;
    ctx.drawImage(moonImg, w * 0.7, 20, 150, 150);
    ctx.globalAlpha = 1;
  }

  const bflyImg = getAsset('butterfly_background');
  if (bflyImg) {
    ctx.globalAlpha = 0.6;
    ctx.drawImage(bflyImg, 50, 200, 40, 40);
    ctx.drawImage(bflyImg, w - 90, 150, 40, 40);
    ctx.globalAlpha = 1;
  }

  const plantsImg = getAsset('environment_plants');
  if (plantsImg) {
    ctx.drawImage(plantsImg, 0, h - 120, 200, 120);
    ctx.drawImage(plantsImg, w - 200, h - 120, 200, 120);
  }

  const bushImg = getAsset('bush_decoration');
  if (bushImg) {
    ctx.drawImage(bushImg, 0, h - 60, 180, 60);
    ctx.drawImage(bushImg, w - 180, h - 60, 180, 60);
  }

  const leafImg = getAsset('leaf_decoration');
  if (leafImg) {
    ctx.drawImage(leafImg, 20, 10, 100, 70);
    ctx.drawImage(leafImg, w - 120, 10, 100, 70);
  }

  const vineImg = getAsset('vine_ladder');
  if (vineImg) {
    for (const vine of SCENE_1.vinePositions || []) {
      ctx.drawImage(vineImg, vine.x - cam.x, vine.y - cam.y, 32, vine.height);
    }
  }

  const bridgeImg = getAsset('bridge_platform');
  if (bridgeImg) {
    for (const plat of SCENE_1.platforms) {
      ctx.drawImage(bridgeImg, plat.x - cam.x, plat.y - cam.y, plat.width, plat.height);
    }
  }

  const drawX = cs.astronautX - cam.x;
  const drawY = cs.astronautY - cam.y;
  const astronautImg = getAsset('astronaut_idle');
  if (astronautImg) {
    ctx.drawImage(astronautImg, drawX, drawY, PLAYER.WIDTH, PLAYER.HEIGHT);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(drawX, drawY, PLAYER.WIDTH, PLAYER.HEIGHT);
  }
}
```

**NEW:**
```typescript
function drawCutscene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const cs = getCutscene();
  const cam = getCamera();

  // 1. Background terang (bukan hitam!)
  ctx.fillStyle = '#f7f7f4';
  ctx.fillRect(0, 0, w, h);

  // 2. Soft fog blobs di area tengah
  drawSoftFog(ctx, w * 0.35 - cam.x * 0.12, h * 0.40 - cam.y * 0.08, 200, 0.25);
  drawSoftFog(ctx, w * 0.55 - cam.x * 0.12, h * 0.50 - cam.y * 0.08, 220, 0.20);
  drawSoftFog(ctx, w * 0.50 - cam.x * 0.10, h * 0.35 - cam.y * 0.08, 180, 0.15);

  // 3. Tembok Kiri — bush_decoration vertical wall
  drawCroppedAsset(ctx, 'bush_decoration',
    -30 - cam.x * 0.05, -50 - cam.y * 0.05,
    230, h + 100,
    { alpha: 0.95 }
  );

  // 4. Vine Kiri — menempel dengan bush
  drawCroppedAsset(ctx, 'vine_ladder',
    SCENE_1.VINE_LEFT_X - cam.x, SCENE_1.vinePositions![0].y - cam.y,
    50, SCENE_1.vinePositions![0].height,
    { alpha: 0.90 }
  );

  // 5. Tembok Kanan — leaf_decoration vertical wall
  drawCroppedAsset(ctx, 'leaf_decoration',
    w - 220 - cam.x * 0.05, -50 - cam.y * 0.05,
    250, h + 100,
    { alpha: 0.95, flipX: true }
  );

  // 6. Vine Kanan — menempel dengan leaf
  drawCroppedAsset(ctx, 'vine_ladder',
    SCENE_1.VINE_RIGHT_X - cam.x, SCENE_1.vinePositions![1].y - cam.y,
    50, SCENE_1.vinePositions![1].height,
    { alpha: 0.90 }
  );

  // 6. Bridge atas
  const bridge = SCENE_1.platforms[0];
  drawBridge(ctx, bridge.x, bridge.y, bridge.width, cam.x, cam.y);

  // 7. Butterflies — 3 instance melayang di area tengah
  const time = cs.elapsed / 1000;
  const butterflies = [
    { bx: 0.40, by: 0.35, ax: 40, ay: 30, sp: 1.2, ph: 0,    sz: 30 },
    { bx: 0.55, by: 0.50, ax: 35, ay: 25, sp: 0.8, ph: 1.5,  sz: 26 },
    { bx: 0.48, by: 0.60, ax: 45, ay: 35, sp: 1.0, ph: 3.0,  sz: 34 },
  ];
  for (const b of butterflies) {
    const bx = w * b.bx + Math.sin(time * b.sp + b.ph) * b.ax;
    const by = h * b.by + Math.cos(time * b.sp * 1.23 + b.ph) * b.ay;
    const alpha = 0.55 + Math.sin(time * 2 + b.ph) * 0.20;
    drawCroppedAsset(ctx, 'butterfly_background',
      bx - cam.x * 0.15, by - cam.y * 0.15,
      b.sz, b.sz,
      { alpha }
    );
  }

  // 8. Astronaut memanjat di sebelah vine tengah
  const drawX = cs.astronautX - cam.x;
  const drawY = cs.astronautY - cam.y;
  if (!drawCroppedAsset(ctx, 'astronaut_idle', drawX - 15, drawY, 78, 96, { alpha: 1 })) {
    // Fallback: kotak putih jika asset belum loaded
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(drawX, drawY, PLAYER.WIDTH, PLAYER.HEIGHT);
  }
}
```

---

## 2. Summary of All Changes

| # | File | Lines | Action |
|---|------|-------|--------|
| 1 | `src/constants.ts` | 77-85 | Update SCENE_1: WORLD_WIDTH 400→800, VINE_LEFT_X=180, VINE_RIGHT_X=620 |
| 2 | `src/scene.ts` | 34-47 | Update SCENE_1: worldWidth 800, bridge 600px, 2 vine (kiri+kanan) |
| 3 | `src/cutscene.ts` | 54 | Tetap VINE_RIGHT_X (astronaut naik vine kanan) |
| 4 | `src/main.ts` | 569-632 | Rewrite `drawCutscene()`: bush+vine kiri, leaf+vine kanan, bridge atas, butterfly+fog tengah |

---

## 3. Build & Verify

### Build
```bash
cd C:\GameDesign\planet-of-the-unbound
npx esbuild src/main.ts --bundle --outfile=dist/bundle.js
```
**Expected:** Build clean, no TypeScript errors.

### Verify Checklist

Buka `index.html` di browser, lalu cek:

- [ ] **F12 Console** — tidak ada error asset loading, semua 21 asset loaded
- [ ] **Menu** — Start Game, masuk ke Scene 1
- [ ] **Background** — TERANG (putih/abu muda), BUKAN hitam
- [ ] **Tembok kiri** — bush_decoration full height, padat, dari atas ke bawah
- [ ] **Tembok kanan** — leaf_decoration full height, menjuntai ke bawah
- [ ] **Vine tengah** — 1 vine di tengah, vertikal
- [ ] **Astronaut** — terlihat jelas (putih), memanjat vine tengah, crop benar
- [ ] **Bridge** — platform di atas, pakai bridge_platform crop
- [ ] **Butterflies** — 3 kupu-kupu melayang di area tengah
- [ ] **Fog** — kabut abu-abu transparan di background tengah
- [ ] **Moon** — TIDAK ADA (dihapus)
- [ ] **environment_plants** — TIDAK ADA (dihapus)
- [ ] **Duration** — 3 detik, transisi ke Scene 2
- [ ] **Kontras** — semua elemen terlihat jelas, tidak menyatu dengan background

---

## 4. Fallback & Troubleshooting

### Jika build gagal
```
Error: SCENE_1.VINE_CENTER_X is not defined
```
→ Pastikan Step 1 (`constants.ts`) sudah dijalankan sebelum Step 3 (`cutscene.ts`).

### Jika asset tidak muncul (F12 Console error)
```
Gagal load: leaf_decoration
```
→ Pastikan `C:\GameDesign\planet-of-the-unbound\assets\images\` berisi semua 22 PNG.
→ Pastikan `loadAllAssets()` di `assets.ts` menangani loading dengan benar (cek bug fix sebelumnya: simpan di onload).

### Jika tembok terlalu kecil / tidak full height
→ Sesuaikan width parameter di drawCroppedAsset (280 untuk bush, 260 untuk leaf).
→ Jika perlu, eksperimen dengan nilai width yang berbeda.

### Jika leaf_decoration flipX terlihat aneh
→ Hapus `flipX: true` dari Step 4, ganti jadi:
```typescript
  drawCroppedAsset(ctx, 'leaf_decoration',
    w - 230 - cam.x * 0.05, -50 - cam.y * 0.05,
    260, h + 100,
    { alpha: 0.95 }
  );
```

### Jika astronaut terlalu besar/kecil
→ Sesuaikan size di drawCroppedAsset. Saat ini 78x96 (crop coords proporsional):
  - Terlalu besar → coba 60x74 atau 48x64
  - Terlalu kecil → coba 90x110

### Jika astronaut tidak center di vine
→ Sesuaikan offset `drawX - 15`. Naikkan angka jika terlalu ke kiri, turunkan jika terlalu ke kanan.

---

## 5. Z-Index Rendering Order

Urutan menggambar (layer depth):

```
Layer 1 (paling belakang): Background solid #f7f7f4
Layer 2:                   Soft fog blobs (parallax ~0.10x)
Layer 3:                   Butterfly (parallax ~0.15x)
Layer 4:                   Tembok Kiri — bush_decoration (parallax ~0.05x)
Layer 5:                   Tembok Kanan — leaf_decoration (parallax ~0.05x)
Layer 6:                   Vine tengah (parallax ~1.00x — normal)
Layer 7:                   Bridge atas (parallax ~1.00x — normal)
Layer 8 (paling depan):    Astronaut (parallax ~1.00x — normal)
```

---

*Implementation plan generated by Hermes Agent — 2026-06-26*