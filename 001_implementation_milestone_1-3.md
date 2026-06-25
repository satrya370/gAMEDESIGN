# 001 Implementation Plan — Milestone 1-3

> **Game:** Planet of the Unbound
> **Scope:** Milestone 1 (Project Setup) → Milestone 2 (Player Movement) → Milestone 3 (Scene 1 Cutscene)
> **Date:** 2026-06-26

---

## 📌 Session Overview

| Session | Milestone | Fokus |
|---------|-----------|-------|
| **Session 1** | Milestone 1 | Project setup, HTML Canvas, game loop, input handler, asset loader |
| **Session 2** | Milestone 2 | Player movement, gravitasi, lompat, collision platform, animasi dasar |
| **Session 3** | Milestone 3 | Scene 1 cutscene, kamera vertical scroll, vine climbing, transisi ke Scene 2 |

---

## ✅ Key Decisions (Q&A Results)

| # | Pertanyaan | Jawaban |
|---|-----------|---------|
| 1 | Canvas Size | **Responsive dengan max resolution** (max 1920x1080) |
| 2 | Module System | **Clean & well-organized file structure** — bisa jalan lokal langsung, pembagian file rapi dan mudah dijalankan |
| 3 | Sprite Rendering | **Langsung pakai asset asli** (`astronaut_idle.png`, dll) — gapapa kalau ada yang kurang pas |
| 4 | Animasi Player | **Sprite sheet** — atlas dengan frame-by-frame animation (lebih smooth) |
| 5 | Platform Layout | **Langsung buat sesuai spec** — 3 bridge dengan jarak & posisi yang udah ditentuin |
| 6 | Kamera Follow | **Hybrid** — smooth di horizontal, instant di vertical |
| 7 | Vine Climbing | **Lurus naik** — astronaut gerak vertikal ke atas saja (simple & clean) |

---

## Session 1 — Project Setup (Milestone 1)

### Task List
- [x] Buat folder struktur sesuai spec (`planet-of-the-unbound/`, `src/`, `assets/images/`)
- [x] Setup `index.html` dengan Canvas element
- [x] Implement responsive canvas sizing (max 1920x1080)
- [x] Buat game loop (`requestAnimationFrame`)
- [x] Implement input handler (keyboard + mouse)
- [x] Buat `constants.js` dengan nilai dari spec
- [x] Buat `assets.js` untuk load semua image sprites
- [x] Load dan tampilkan placeholder sprites di canvas

### Files yang dibuat
```
planet-of-the-unbound/
├── index.html
├── styles.css
├── src/
│   ├── main.js         ← Entry point, game loop
│   ├── constants.js    ← Semua tuning values
│   ├── assets.js       ← Asset loader
│   └── input.js        ← Keyboard & mouse handler
└── assets/
    └── images/         ← Copy dari GameAset
```

### Spesifikasi Canvas
- Responsive: isi browser window
- Max resolution: 1920x1080
- Aspect ratio: tetap (tidak stretch)
- Background: gelap/atmospheric

---

## Session 2 — Player Movement (Milestone 2)

### Task List
- [x] Buat `player.js` — class Player
- [x] Implement gerak kiri/kanan dengan friction
- [x] Implement sistem gravitasi
- [x] Implement lompat (hanya saat grounded)
- [x] Buat `scene.js` — class Scene dengan platforms
- [x] Implement collision AABB (player vs platform)
- [x] Buat `collision.js` — collision detection & resolution
- [x] Implement basic animation states (idle, walk, jump, climb)
- [x] Tampilkan HUD placeholder (HP, ammo)

### Files yang dibuat
```
planet-of-the-unbound/
├── src/
│   ├── player.js       ← Player class
│   ├── scene.js        ← Scene class (level data)
│   └── collision.js    ← AABB collision
```

### Spesifikasi Animasi
- Pakai **sprite sheet** approach
- State: idle, walk, jump, climb
- Frame-by-frame animation untuk smooth movement
- Gunakan `astronaut_idle.png` sebagai base (bisa expand nanti)

### Platform Layout Scene 2
- 3 bridge platforms sesuai spec
- Bridge 1 (kiri): entry point
- Bridge 2 (tengah): rocket part location
- Bridge 3 (kanan): alien patrol area
- Gaps di antara bridge untuk jumping

---

## Session 3 — Scene 1 Cutscene (Milestone 3)

### Task List
- [x] Buat `cutscene.js` — class Cutscene
- [x] Implement Scene 1 cutscene: vine climbing otomatis
- [x] Implement kamera vertical scroll (follow astronaut naik)
- [x] Buat `camera.js` — camera system
- [x] Setup timer 3 detik untuk cutscene
- [x] Implement transisi instant ke Scene 2 saat cutscene selesai
- [x] Setup scene state machine (SCENE_1 → SCENE_2)

### Files yang dibuat
```
planet-of-the-unbound/
├── src/
│   ├── cutscene.js     ← Cutscene player
│   └── camera.js       ← Camera system
```

### Spesifikasi Kamera
- **Horizontal:** Smooth follow (lerp-based)
- **Vertical:** Instant follow
- Smoothing factor: ~0.1 (tunable)
- Camera bounds: clamp ke scene boundaries

### Spesifikasi Vine Climbing
- Astronaut gerak **lurus naik** (vertikal saja)
- Duration: 3 detik
- Kamera follow vertikal secara instant
- Transisi instant ke Scene 2 setelah selesai

---

## 📊 Progress Tracker

| Session | Status | Notes |
|---------|--------|-------|
| Session 1 | ✅ Selesai | Project setup, canvas, game loop, input, asset loader |
| Session 2 | ✅ Selesai | Player movement, collision, scene, HUD |
| Session 3 | ✅ Selesai | Cutscene Scene 1, camera system, transisi |

---

## 🎯 Acceptance Criteria (Milestone 1-3)

Setelah 3 session selesai, game harus bisa:
1. ✅ Buka di browser (`index.html`)
2. ✅ Canvas responsive dengan max 1920x1080
3. ✅ Game loop berjalan 60fps
4. ✅ Input keyboard & mouse terdeteksi
5. ✅ Semua asset sprites ter-load
6. ✅ Player bisa gerak kiri/kanan dengan friction
7. ✅ Player bisa lompat
8. ✅ Player terkena gravitasi
9. ✅ Player bisa land di platform
10. ✅ Animasi sprite berjalan (idle, walk, jump)
11. ✅ Scene 1 cutscene otomatis berjalan 3 detik
12. ✅ Kamera follow player (hybrid smooth/instant)
13. ✅ Transisi Scene 1 → Scene 2 berhasil

---

*Status: ✅ Final — Siap untuk implementasi*
