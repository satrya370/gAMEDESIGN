# 002 — Revision After Commit: Visual Overhaul & Scene Redesign

> **Commit:** `66b42c2` — "Update stage visuals to match scene reference"
> **Previous:** `635842a` — "Initial commit"
> **Date:** 2026-06-25
> **Files Changed:** 11 (+389 / -112 lines)

---

## Ringkasan Eksekutif

Commit ini adalah **revisi visual mayor** yang mengubah tampilan game dari prototype placeholder (kotak putih + teks) menjadi visual yang mendekati konsep artistik. Perubahan mencakup 4 area utama:

1. **Menu System** — Dari teks statis ke full-screen cover image + animated butterflies
2. **Rendering Pipeline** — Dari flat drawing ke layered parallax rendering (7 lapis)
3. **Player Visual** — Dari kotak putih ke cropped sprite sheet + procedural fallback
4. **Scene 2 Redesign** — Layout platform berubah total, dunia lebih besar

---

## 1. Perubahan Per File

### 1.1 `.gitignore`
| Item | Sebelum | Sesudah |
|------|---------|---------|
| `.npm-cache/` | ❌ tidak ada | ✅ ditambahkan |
| `*.log` | ❌ tidak ada | ✅ ditambahkan |

**Analisis:** Housekeeping — mencegah cache npm dan log file masuk ke repo.

---

### 1.2 `src/assets.ts`
| Item | Sebelum | Sesudah |
|------|---------|---------|
| `start_screen` | ❌ tidak ada | ✅ `'assets/images/start_screen.jpg'` |

**Analisis:** Asset baru ditambahkan untuk menu cover image. File `start_screen.jpg` (2.1MB) adalah full-screen background untuk main menu.

---

### 1.3 `src/camera.ts` — Refactor + Fix Bug

#### Perubahan Logic:

**a) `clampCamera()` helper function (BARU)**
```typescript
// Sebelum: inline clamp di updateCamera()
// Sesudah: extracted function, dipanggil di updateCamera() DAN snapCamera()
function clampCamera(): void {
  if (cam.x < boundsMinX) cam.x = boundsMinX;
  if (cam.x > boundsMaxX) cam.x = boundsMaxX;
  if (cam.y < boundsMinY) cam.y = boundsMinY;
  if (cam.y > boundsMaxY) cam.y = boundsMaxY;
}
```
**Analisis:** Refactor DRY (Don't Repeat Yourself). Clamp logic yang sebelumnya inline di `updateCamera()` sekarang di-extract ke reusable function. **Bug fix:** `snapCamera()` sekarang juga memanggil `clampCamera()` — sebelumnya camera bisa snap ke posisi di luar bounds.

**b) Bounds calculation berubah**
```typescript
// Sebelum:
boundsMaxX = maxX;
boundsMaxY = maxY;

// Sesudah:
boundsMaxX = Math.max(boundsMinX, maxX - viewW);
boundsMaxY = Math.max(boundsMinY, maxY - viewH);
```
**Analisis:** **BUG FIX KRITIS.** Sebelumnya, camera bounds dihitung dari world size tanpa memperhitungkan viewport. Ini menyebabkan camera bisa scroll melewati batas dunia (melihat area kosong di luar level). Sekarang bounds dikurangi dengan viewport size, sehingga camera berhenti tepat di tepi dunia.

**Dampak:** Camera tidak akan pernah menampilkan area di luar world boundary lagi.

---

### 1.4 `src/main.ts` — Redesign Total

Ini adalah file dengan perubahan terbesar (+345/-112). Berikut analisis per bagian:

#### a) Menu System — Dari Teks ke Visual

**Sebelum:**
```typescript
function drawMenu(ctx, w, h) {
  // Gambar moon, leaf, astronaut sebagai dekorasi
  // Teks: "Planet of the Unbound" + subtitle
  // Tombol: "Start Game" (rectangle + text)
}
```

**Sesudah:**
```typescript
function drawMenu(ctx, w, h) {
  // Full-screen cover image (start_screen.jpg)
  // Animated butterflies (5 butterflies dengan sine-wave motion)
}
```

**Perubahan Flow:**
| Item | Sebelum | Sesudah |
|------|---------|---------|
| MENU → | CONTROLS screen | Langsung ke CUTSCENE (Scene 1) |
| Background | Teks + dekorasi | Full-screen cover image |
| Animasi | Tidak ada | 5 animated butterflies |

**Analisis:** CONTROLS screen di-skip dari flow menu. Player langsung masuk game setelah tekan Start. Ini menyederhanakan onboarding tapi menghilangkan screen edukasi kontrol.

#### b) Asset Cropping System (BARU)

```typescript
const ASSET_CROPS: Record<string, AssetCrop> = {
  astronaut_idle: { sx: 642, sy: 148, sw: 633, sh: 775 },
  alien_shooter: { sx: 662, sy: 104, sw: 457, sh: 823 },
  background_moon: { sx: 598, sy: 220, sw: 639, sh: 635 },
  // ... 12 assets total
};
```

**Analisis:** Asset PNG yang ada ternyata adalah **sprite sheet / composite image**, bukan individual sprites. Setiap asset perlu di-crop dari region tertentu. Sistem ini mendefinisikan crop coordinates untuk setiap asset.

#### c) Rendering Pipeline — 7 Lapis

**Sebelum:** Flat rendering — background, platforms, player, HUD (4 langkah)
**Sesudah:** Layered parallax — 7 lapis rendering:

```
1. drawStageBackground()    — Background color + fog + parallax portals/moon/butterflies
2. drawStageMidground()     — Vine decorations (parallax 0.72x)
3. drawStagePlatforms()     — Bridge platforms (with asset or fallback)
4. drawStageProps()         — Rocket parts, alien shooter placement
5. drawPlayer()             — Player character
6. drawStageForeground()    — Bush decorations (parallax 0.92x)
7. drawStageHud()           — Portrait box, hearts, weapon, ammo
```

**Analisis:** Setiap lapis memiliki depth/parallax yang berbeda, menciptakan efek 3D pada game 2D. Background bergerak lebih lambat (0.12x-0.25x) sedangkan foreground hampir secepat camera (0.92x).

#### d) HUD Redesign

**Sebelum:**
```
♥ ♥ ♥    Ammo: 8
```
(Teks sederhana di pojok kiri atas)

**Sesudah:**
```
┌──────────────────────┐
│ ┌────────┐           │
│ │Portrait│  ♥ ♥ ♥    │
│ │  Astr  │  🔫 x 8   │
│ └────────┘           │
└──────────────────────┘
```
(Box portrait + cropped sprites + hearts + weapon icon + ammo counter)

**Analisis:** HUD sekarang sesuai dengan desain di spec.md section 12.1. Menggunakan `drawCroppedAsset()` untuk menampilkan sprite asli, dengan fallback procedural drawing jika asset belum loaded.

#### e) `gameLoop` deltaTime fix
```typescript
// Sebelum:
const deltaTime = timestamp - lastTime;

// Sesudah:
const deltaTime = lastTime === 0 ? 0 : timestamp - lastTime;
```
**Analisis:** Bug fix — frame pertama deltaTime akan bernilai besar (timestamp - 0 = ~16ms dari requestAnimationFrame). Sekarang frame pertama di-skip (deltaTime = 0), mencegah player bergerak terlalu jauh di frame pertama.

---

### 1.5 `src/player.ts` — Visual Overhaul

#### a) Cropped Sprite Rendering
**Sebelum:** Draw full `astronaut_idle.png` image langsung ke canvas
**Sesudah:** Crop region `sx:642, sy:148, sw:633, sh:775` dari sprite sheet, render ke area visual 78x96

**Analisis:** Asset `astronaut_idle.png` ternyata composite image yang besar. Hanya region tertentu yang berisi sprite astronaut. Rendering sekarang lebih akurat.

#### b) Procedural Fallback (BARU)
```typescript
function drawBaseAstronaut(ctx) {
  // Gambar astronaut secara procedural:
  // - Head (ellipse, white + blue border)
  // - Body (rectangle, white + blue border)
  // - Visor (dark ellipse)
  // - Arms + Legs (lines)
  // Efek glow: shadowColor '#9ee7ff'
}
```
**Analisis:** Jika asset gambar belum loaded, game sekarang menampilkan astronaut procedural (bukan kotak putih). Ini memastikan game playable meskipun asset lambat loaded.

#### c) `drawPlayer()` refactored
- Visual size dikurangi dari `PLAYER.WIDTH x PLAYER.HEIGHT` (48x64) ke `78x96` (dari crop)
- Player sprite di-center di dalam collision box
- Proper `ctx.save()/restore()` untuk invincibility alpha

---

### 1.6 `src/scene.ts` — Level Redesign

#### SCENE_2 Berubah Total:

| Property | Sebelum | Sesudah | Analisis |
|----------|---------|---------|----------|
| platforms | 3 @ y=350, w=300 | 4 @ y=645/625/610/245, w=400-650 | Layout vertikal + horizontal |
| worldWidth | 1200 | 1920 | Dunia 60% lebih lebar |
| worldHeight | 600 | 1080 | Dunia 80% lebih tinggi |
| voidY | 500 | 1120 | Void lebih dalam |
| playerSpawn | (100, 286) | (95, 580) | Spawn lebih rendah |
| portal | (1100, 250, 40x60) | (900, 180, 70x90) | Portal lebih besar, posisi berubah |

**Analisis:** Level didesain ulang untuk menyesuaikan dengan referensi visual (scene_02.png). Layout sekarang memiliki:
- 3 platform bervariasi tinggi (bukan sejajar)
- 1 platform atas (y=245) sebagai area tujuan
- Dunia jauh lebih besar untuk parallax scrolling

---

## 2. Revisi Logic yang Berubah

### 2.1 Flow Menu — CONTROLS Screen Dihapus

| Item | Spec (asli) | Implementasi (baru) |
|------|-------------|---------------------|
| MENU → | CONTROLS screen | Langsung ke CUTSCENE |
| Controls screen | Interactive, ada tombol Start | **Tidak ada lagi** |
| Player learning | Di controls screen | Learning by doing |

**Status:** ⚠️ DEVIATION dari spec — perlu keputusan apakah controls screen masih diperlukan.

### 2.2 Camera Bounds — Viewport-Aware

| Item | Spec (asli) | Implementasi (baru) |
|------|-------------|---------------------|
| Camera max X | `worldWidth` | `worldWidth - viewportWidth` |
| Camera max Y | `worldHeight` | `worldHeight - viewportHeight` |

**Status:** ✅ IMPROVEMENT — sesuai intent spec (camera tidak boleh melihat di luar level).

### 2.3 Rendering Approach — Parallax Layers

| Item | Spec (asli) | Implementasi (baru) |
|------|-------------|---------------------|
| Background | Flat color | Layered fog + parallax |
| Foreground | Tidak ada | Bush layer dengan parallax 0.92x |
| Midground | Tidak ada | Vine decorations dengan parallax 0.72x |
| HUD | Teks sederhana | Full portrait box + sprites |

**Status:** ✅ IMPROVEMENT — visual jauh lebih kaya dari spec.

---

## 3. Asset Baru yang Ditambahkan

| File | Size | Usage |
|------|------|-------|
| `start_screen.jpg` | 2.1 MB | Menu cover image (full-screen) |
| `scene_02.png` | 840 KB | Referensi visual Scene 2 (di example_scene/) |
| `butterfly_background.png` | 62 KB | Updated (dari 138 KB ke 62 KB — optimized) |

---

## 4. Checklist Milestone (berdasarkan analisis kode)

### ✅ Milestone 1 — Project Setup
- [x] Create project structure (folders, files)
- [x] Setup HTML with Canvas element
- [x] Implement responsive canvas sizing
- [x] Create game loop (requestAnimationFrame)
- [x] Implement input handler (keyboard + mouse)
- [x] Load and display placeholder sprites

### ✅ Milestone 2 — Player Movement
- [x] Left/right movement with friction
- [x] Gravity system
- [x] Jump mechanic
- [x] Ground collision (platform landing)
- [x] Basic animation states (idle, walk, jump, climb)

### ✅ Milestone 3 — Scene 1 Cutscene
- [x] Vertical scrolling camera
- [x] Vine climbing animation (auto)
- [x] 3-second cutscene timer
- [x] Transition to Scene 2

### ✅ Milestone 4 — Scene 2 Level
- [x] Create bridge platforms (4 platforms, bukan 3)
- [x] Horizontal scroll camera
- [x] Platform collision
- [x] Void detection (fall damage)
- [x] Portal transition to Scene 3
- [x] Barrier system (no backtracking)

### 🔲 Milestone 5 — Shooting System
- [ ] Laser projectile creation
- [ ] Laser horizontal movement
- [ ] Ammo system (8 shots)
- [ ] Laser collision (enemy, wall, screen edge)
- [ ] Muzzle flash effect

### 🔲 Milestone 6 — Enemies
- [ ] Small alien: movement, chase behavior, HP
- [ ] Enemy-player collision (damage)
- [ ] Enemy death (HP reaches 0)
- [ ] Boss alien: movement, rock bullet attack
- [ ] Boss meteor ulti (one-time, random)
- [ ] UFO: movement, aimed shots
- [ ] All enemy projectile systems

### 🔲 Milestone 7 — Scene 3 Boss Arena
- [ ] Create flat arena platform
- [ ] Enemy spawn system (appear from edges)
- [ ] Boss fight flow (small alien → boss + UFO)
- [ ] Rocket part spawn after boss defeat
- [ ] Transition to Scene 4

### 🔲 Milestone 8 — Cutscenes (Scene 4 & 5)
- [ ] Scene 4: Rocket repair cutscene (5 sec)
- [ ] Scene 5: Rocket launch cutscene (8 sec)
- [ ] Victory screen trigger

### ✅ Milestone 9 — UI & Menus
- [x] Main menu screen (cover image + animated butterflies)
- [x] Interactive controls screen — **DIHAPUS dari flow**
- [x] HUD (health, ammo, portrait, objective text)
- [x] Pause menu (Resume + Quit)
- [ ] Game over screen (PPT style)
- [ ] Victory screen (PPT style)

### 🔲 Milestone 10 — Collectibles & Objective
- [ ] Rocket part collectible logic
- [ ] Counter display (0/3 → 1/3 → 2/3 → 3/3)
- [ ] Objective text updates
- [ ] "Return to rocket" trigger after 3/3

### 🔲 Milestone 11 — Polish
- [ ] Invincibility frames (blinking effect) — **partial: alpha toggle ada**
- [ ] Minimal visual effects (muzzle flash, hit flash, pickup sparkle)
- [x] Background particles (butterflies, fog)
- [x] Camera smoothing (lerp)
- [ ] Balance tuning (speed, HP, ammo, timing)

### 🔲 Milestone 12 — Testing & Bug Fixes
- [ ] Full playthrough test (start to victory)
- [ ] Death and restart test
- [ ] All collision edge cases
- [ ] Browser compatibility test
- [ ] Performance optimization

---

## 5. Risks & Catatan

| # | Issue | Severity | Notes |
|---|-------|----------|-------|
| 1 | Controls screen dihapus | ⚠️ Medium | Player tidak tahu kontrol sebelum mulai |
| 2 | start_screen.jpg 2.1MB | ⚠️ Medium | Load time di slow connection |
| 3 | Asset cropping hardcoded | ℹ️ Low | Jika asset diganti, crop coords harus di-update |
| 4 | Scene 2 belum ada enemy | ℹ️ Low | Enemy system belum diimplementasi (Milestone 6) |

---

*Document generated by Hermes Agent — 2026-06-25*
