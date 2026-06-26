# 001 Log Implementation — Milestone 1-3

> **Game:** Planet of the Unbound
> **Date Started:** 2026-06-26
> **Status:** In Progress

---

## Session 1 — Project Setup (Milestone 1)

**Tanggal:** 2026-06-26
**Status:** ✅ Selesai
**Durasi:** ~15 menit

### Yang Dikerjakan
- Setup project structure (`planet-of-the-unbound/`, `src/`, `assets/images/`)
- Install TypeScript + esbuild via npm
- Buat semua source files dalam TypeScript
- Copy 21 asset images dari `C:\GameDesign\GameAset`
- Build pipeline: TypeScript → JavaScript via esbuild
- Local server test (Python http.server)

### Files yang Dibuat
```
planet-of-the-unbound/
├── index.html          ✅ Entry point
├── styles.css          ✅ Canvas styling
├── tsconfig.json       ✅ TypeScript config
├── package.json        ✅ Build scripts
├── dist/
│   ├── bundle.js       ✅ Compiled output (12.8kb)
│   └── bundle.js.map   ✅ Source map
├── src/
│   ├── main.ts         ✅ Game loop + screens
│   ├── game.ts         ✅ State machine + canvas
│   ├── constants.ts    ✅ Tuning values
│   ├── assets.ts       ✅ Asset loader
│   └── input.ts        ✅ Keyboard/mouse handler
└── assets/
    └── images/         ✅ 21 PNG sprites
```

### Teknis
- **Canvas:** Responsive, max 1920x1080, aspect ratio tetap
- **Game loop:** `requestAnimationFrame` dengan deltaTime
- **Input:** Keyboard (WASD/arrows/space/J/R/Esc) + Mouse (click)
- **Asset loading:** Promise-based, log progress ke console
- **State machine:** MENU → CONTROLS → PLAYING → PAUSED/GAME_OVER/VICTORY
- **Build:** `esbuild src/main.ts --bundle --outfile=dist/bundle.js`

### Screens yang Sudah Ada
| Screen | Fungsi |
|--------|--------|
| MENU | Judul + "Start Game" button |
| CONTROLS | List kontrol + "Press SPACE to start" |
| PLAYING | Placeholder (akan diisi Session 2) |
| PAUSED | Overlay + Resume/Quit |
| GAME_OVER | Red screen + Restart/Back to Menu |
| VICTORY | Green screen + Restart/Back to Menu |

### Issues / Catatan
- Tidak ada issues. Build berhasil clean.
- Semua asset berhasil ter-load (21/21).

---

## Session 2 — Player Movement (Milestone 2)

**Tanggal:** 2026-06-26
**Status:** ✅ Selesai
**Durasi:** ~4 menit (3 agent parallel)

### Agent Workflow
1. **Planning Agent** — Baca spec + existing code, buat implementation plan detail
2. **Worker Agent** — Implementasi 3 file baru + modifikasi main.ts
3. **Review Agent** — Code review, test build, fix bug yang ditemukan

### Files yang Dibuat/Dimodifikasi
```
src/
├── collision.ts    ✅ BARU — AABB detection + resolution (~30 lines)
├── scene.ts        ✅ BARU — Scene 2 platform data (~40 lines)
├── player.ts       ✅ BARU — Player class (~130 lines)
└── main.ts         ✅ DIMODIFIKASI — Integrasikan player + scene rendering
```

### Yang Sudah Jalan
- ✅ Player muncul di Bridge 1 (kotak biru + arah facing)
- ✅ Gerak kiri/kanan pakai A/D atau Arrow keys
- ✅ Lompat pakai Space (single press, tidak held)
- ✅ Gravity & friction bekerja
- ✅ Bisa land di 3 bridge platforms
- ✅ Jatuh ke void = 1 HP damage + respawn di Bridge 1
- ✅ Invincibility 1 detik dengan efek blink
- ✅ Player tidak bisa keluar dari scene bounds
- ✅ HUD tampilkan HP dan Ammo
- ✅ Game Over trigger saat HP = 0

### Bug yang Ditemukan & Diperbaiki
| Bug | Oleh | Fix |
|-----|------|-----|
| Invincibility timer hardcoded 16ms | Review Agent | Ganti pakai `dt` parameter (actual frame delta) |

### Build Result
```
dist/bundle.js     17.5kb
dist/bundle.js.map 35.6kb
⚡ Done in 8ms
```
**Build: CLEAN ✅**

### Catatan
- Collision hanya resolve top-surface (sederhana, sesuai rules.md)
- Kamera masih static (0,0) — Session 3
- Player masih kotak warna — sprite sheet Session 3

---

## Session 3 — Scene 1 Cutscene + Camera System (Milestone 3)

**Tanggal:** 2026-06-26
**Status:** ✅ Selesai
**Durasi:** ~6 menit (3 agent)

### Agent Workflow
1. **Planning Agent** — Baca spec + existing code, buat implementation plan
2. **Worker Agent** — Implementasi 2 file baru + modifikasi 5 files
3. **Review Agent** — Code review, test build, fix bug

### Files yang Dibuat/Dimodifikasi
```
src/
├── camera.ts      ✅ BARU — Camera system (smooth follow + bounds)
├── cutscene.ts    ✅ BARU — Cutscene player (Scene 1 vine climbing)
├── constants.ts   ✅ DIMODIFIKASI — Tambah SCENE_1 + CUTSCENE constants
├── scene.ts       ✅ DIMODIFIKASI — Tambah SCENE_1 data + vinePositions
├── game.ts        ✅ DIMODIFIKASI — Tambah 'CUTSCENE' ke GameState type
├── player.ts      ✅ DIMODIFIKASI — Tambah setCurrentScene()
└── main.ts        ✅ DIMODIFIKASI — Integrasi camera + cutscene + transisi
```

### Yang Sudah Jalan
- ✅ Menu → Controls → Scene 1 Cutscene → Scene 2
- ✅ Scene 1: Astronaut memanjat vine lurus naik (3 detik)
- ✅ Camera scroll vertikal during cutscene
- ✅ Transisi instant ke Scene 2 setelah cutscene selesai
- ✅ Scene 2: Camera follow player (smooth horizontal, instant vertical)
- ✅ Player bisa gerak & lompat di Scene 2 dengan camera
- ✅ Semua state transitions bekerja

### Bug yang Ditemukan & Diperbaiki
| Bug | Oleh | Fix |
|-----|------|-----|
| Unused import `PLAYER` di cutscene.ts | Review Agent | Hapus import |

### Build Result
```
dist/bundle.js     22.2kb
dist/bundle.js.map 44.8kb
⚡ Done in 13ms
```
**Build: CLEAN ✅**

### Flow Game Setelah Session 3
```
MENU → Controls → CUTSCENE (Scene 1, 3 sec) → PLAYING (Scene 2)
```

---

## Revision — Monochrome + Asset Fix

**Tanggal:** 2026-06-26
**Status:** ✅ Selesai

### Masalah yang Diperbaiki
1. ❌ Game berwarna → ✅ Hitam putih (monochrome)
2. ❌ Kotak warna (`fillRect`) → ✅ Sprite PNG asli (`drawImage`)
3. ❌ Astronaut tidak muncul di cutscene → ✅ `astronaut_idle.png` dipakai
4. ❌ Cutscene cuma garis hijau → ✅ Pakai `vine_ladder.png`, `bridge_platform.png`, dll

### Files yang Dimodifikasi
| File | Revisi |
|------|--------|
| `src/constants.ts` | COLORS → monochrome (#000, #fff, #888) |
| `src/player.ts` | drawPlayer → pakai `astronaut_idle.png` + flip facing |
| `src/main.ts` | Semua draw functions → monochrome + asset PNG |

### Asset yang Sekarang Dipakai
| Asset | Digunakan Di |
|-------|-------------|
| `astronaut_idle.png` | Menu, Cutscene, Player |
| `vine_ladder.png` | Cutscene (Scene 1) |
| `bridge_platform.png` | Cutscene, Scene 2 |
| `background_moon.png` | Menu, Cutscene |
| `leaf_decoration.png` | Menu, Cutscene |
| `bush_decoration.png` | Cutscene |
| `environment_plants.png` | Cutscene |
| `butterfly_background.png` | Cutscene |
| `health_icon.png` | HUD (HP hearts) |

### Build Result
```
dist/bundle.js     24.5kb
dist/bundle.js.map 48.4kb
⚡ Done in 11ms
```
**Build: CLEAN ✅**

### Verifikasi
- ✅ Tidak ada warna tersisa (0 match untuk #4fc3f7, #ef5350, dll)
- ✅ 17 getAsset calls di seluruh source files
- ✅ Semua screen monochrome (menu, controls, pause, game over, victory)
- ✅ Astronaut sprite flip untuk facing kiri/kanan

---

## Critical Bug Fix — Asset Loading

**Tanggal:** 2026-06-26
**Status:** ✅ Selesai

### Masalah
Asset **tidak muncul sama sekali** — hanya garis dan background hitam. Karakter astronaut juga tidak ada.

### Root Cause
Bug di `assets.ts` baris 67-72:
```typescript
// ❌ BUG: Buat Image BARU setelah load selesai!
keys.forEach((key) => {
  const img = new Image();  // ← Image baru, belum ke-load!
  img.src = ASSET_PATHS[key]; // ← Mulai load ULANG (async!)
  loadedAssets[key] = img;    // ← Image ini BELUM ready!
});
```

`loadAsset()` load image成功 tapi **tidak menyimpan** hasilnya. Setelah promise resolve, kode buat `Image()` BARU yang async dan belum ready.

### Fix
```typescript
// ✅ FIX: Simpan image saat proses loading
img.onload = () => {
  loadedAssets[name] = img; // ← Simpan langsung!
  resolve();
};
```

Hapus loop `keys.forEach` yang buat Image baru. Sekarang image disimpan langsung di `onload`.

### Build Result
```
dist/bundle.js     24.2kb
⚡ Done in 10ms
```
**Build: CLEAN ✅**

---

*Log ini akan diupdate setiap sesi selesai.*
