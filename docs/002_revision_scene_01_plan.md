# 002 — Revision Plan: Scene 1 Cutscene Visual Overhaul

> **Target:** Scene 1 (Vine Climbing Cutscene)  
> **Reference:** `C:\GameDesign\example_scene\scene_01.png`  
> **Date:** 2026-06-26  
> **Issue:** Cutscene Scene 1 saat ini hitam pekat, asset tidak terlihat karena background gelap menyatu dengan asset gelap, dan pemetaan asset tidak sesuai referensi.

---

## 1. Analisis Referensi (scene_01.png)

### Layout Visual

```
┌─────────────────────────────────────────┐
│  [HUD di pojok kiri atas]               │
│                                         │
│  ╔═══════[BRIDGE PLATFORM]═════════╗    │ ← Atas: bridge horizontal lebar
│  ║                                  ║    │
│  ▓▓▓▓▓▓▓▓▓▓||          ||▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Bush+Vine(kiri) & Leaf+Vine(kanan)
│  ▓▓▓▓▓▓▓▓▓▓||          ||▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓||   ⭐⭐   ||▓▓▓▓▓▓▓▓▓▓▓▓  │    (⭐ = butterfly di tengah)
│  ▓▓▓▓▓▓▓▓▓▓||   ~~~    ||▓▓▓▓▓▓▓▓▓▓▓▓  │    (~~~ = soft fog)
│  ▓▓▓▓▓▓▓▓▓▓||          ||▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓||          ||▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓||          ||▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓||          ||▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓||   🧑‍🚀    ||▓▓▓▓▓▓▓▓▓▓▓▓  │    (🧑‍🚀 = astronaut di tengah)
│  ▓▓▓▓▓▓▓▓▓▓||          ||▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓||          ||▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓||          ||▓▓▓▓▓▓▓▓▓▓▓▓  │
└─────────────────────────────────────────┘
     ↑                      ↑
  BUSH+VINE(kiri)      LEAF+VINE(kanan)
  ▓▓ = bush padat       ▓▓ = leaf padat
  || = vine menempel     || = vine menempel
```

### Elemen yang Terlihat di Referensi

| # | Elemen | Posisi | Warna | Asset yang Cocok |
|---|--------|--------|-------|------------------|
| 1 | Background | Seluruh layar | Putih terang / abu-abu muda | — (fill solid) |
| 2 | Tembok Kiri | Sisi kiri, atas-bawah | Padat gelap | `bush_decoration.png` |
| 3 | Vine Kiri | Di sebelah kanan bush | Gelap | `vine_ladder.png` |
| 4 | Tembok Kanan | Sisi kanan, atas-bawah | Padat gelap | `leaf_decoration.png` |
| 5 | Vine Kanan | Di sebelah kiri leaf | Gelap | `vine_ladder.png` |
| 6 | Bridge Atas | Di atas, horizontal | Abu-abu terang | `bridge_platform.png` |
| 7 | Astronaut | Di tengah open space | Putih/cerah | `astronaut_idle.png` (crop) |
| 8 | Fog/Kabut | Area tengah | Abu-abu transparan | `drawSoftFog()` |
| 9 | Butterfly | Melayang di tengah | Putih kecil | `butterfly_background.png` (crop) |

### Catatan Penting dari Referensi

- **TIDAK ADA moon** di scene 01 — bulan/planet tidak muncul di latar
- **TIDAK ADA environment_plants** sebagai tembok — tembok kiri lebih padat dan gelap tanpa batang individu
- Background **bukan hitam** — terang dengan kabut abu-abu
- **Vine di kiri DAN kanan** — menempel dengan bush (kiri) dan leaf (kanan)
- **TIDAK ada vine di tengah** — tengah adalah open space
- Astronaut **di tengah open space**, memanjat vine kanan ke atas

---

## 2. Analisis Implementasi Sekarang (drawCutscene di main.ts)

### Kode Sekarang (main.ts:569-632)

```typescript
function drawCutscene(ctx, w, h) {
  // Background HITAM
  ctx.fillStyle = COLORS.VOID;  // #000000 ← HITAM PENUH
  ctx.fillRect(0, 0, w, h);

  // Moon (kecil, kanan atas, alpha 0.1)
  ctx.drawImage(moonImg, w * 0.7, 20, 150, 150);

  // Butterfly (kecil, tanpa crop)
  ctx.drawImage(bflyImg, 50, 200, 40, 40);

  // Plants (environment_plants di kiri-kanan bawah)
  ctx.drawImage(plantsImg, 0, h - 120, 200, 120);  // ← terlalu abu-abu muda

  // Bush (bush_decoration kecil di bawah)
  ctx.drawImage(bushImg, 0, h - 60, 180, 60);  // ← cuma bawah, tipis!

  // Leaf (leaf_decoration kecil di pojok atas)
  ctx.drawImage(leafImg, 20, 10, 100, 70);  // ← terlalu kecil, cuma pojok

  // Vine (vine_ladder di posisi kiri & kanan)
  for (const vine of SCENE_1.vinePositions) {
    ctx.drawImage(vineImg, vine.x - cam.x, vine.y - cam.y, 32, vine.height);
  }  // ← ada dua vine (kiri x=80, kanan x=320), bukan di tengah!

  // Bridge (tanpa crop langsung)
  ctx.drawImage(bridgeImg, plat.x - cam.x, plat.y - cam.y, plat.width, plat.height);

  // Astronaut (tanpa crop langsung)
  ctx.drawImage(astronautImg, drawX, drawY, PLAYER.WIDTH, PLAYER.HEIGHT);
}
```

### Masalah yang Ditemukan

| # | Masalah | Dampak |
|---|---------|--------|
| **A** | Background `COLORS.VOID` = `#000000` (hitam) | Asset gelap (bush, leaf, vine) **menyatu** dengan background → tidak terlihat |
| **B** | Moon dipakai di kanan atas | Ilegal — tidak ada di referensi scene_01.png |
| **C** | Vine ada 2: di kiri (x=80) & kanan (x=320) | Harusnya **1 vine di tengah** sebagai tangga astronaut |
| **D** | `environment_plants.png` dipakai untuk tembok kiri | Asset ini tanaman berbatang abu-abu muda — **terlalu terang & tidak padat**, tidak mirip tembok hitam referensi |
| **E** | `bush_decoration.png` cuma dipakai di bawah kecil | Harusnya **menutupi seluruh sisi kiri dari atas ke bawah** |
| **F** | `leaf_decoration.png` cuma 100x70 di pojok | Harusnya **menutupi seluruh sisi kanan dari atas ke bawah** |
| **G** | Semua asset digambar pakai `drawImage` **tanpa crop** | Asset PNG adalah **sprite sheet** — kalau tidak di-crop, gambar seluruh sheet kecil jadi tidak jelas |
| **H** | `SCENE_1.worldWidth` = 400 | Terlalu sempit — tembok kiri & kanan saling mendempet, tidak ada ruang tengah |
| **I** | Astronaut spawn di (320, 700) — dekat vine kanan | Harusnya di **bawah vine tengah** |

### Root Cause Visual (Kenapa Nampak Hitam Semua)

```
Background = #000000 (hitam)
        +
Bush decoration = warna gelap (hitam-abu-abu)
        +
Leaf decoration = warna gelap (hitam-abu-abu)
        +
Vine ladder = warna gelap (hitam)
        =
SEMUA MENYATU JADI HITAM PEKAT, TIDAK ADA KONTRAS
```

---

## 3. Asset Mapping Revisi

### Pemetaan Asset yang Benar untuk Scene 1

| Posisi | Asset Sekarang | Asset Revisi | Notes |
|--------|---------------|-------------|-------|
| **Background** | `COLORS.VOID` hitam | `#f7f7f4` (putih terang) + soft fog abu-abu | Sama seperti background Scene 2, bukan hitam |
| **Tembok Kiri** | `environment_plants.png` di bawah + `bush_decoration.png` tipis | `bush_decoration.png` — skala **besar**, menutupi penuh dari atas ke bawah | Asset ini padat & gelap, cocok untuk tembok kiri |
| **Vine Kiri** | Tidak ada | `vine_ladder.png` — di sebelah kanan bush, menempel | Vine vertical di sisi kiri |
| **Tembok Kanan** | `leaf_decoration.png` kecil di pojok atas | `leaf_decoration.png` — skala **besar**, menutupi penuh dari atas ke bawah, `flipX: true` | Asset ini massa daun menjuntai gelap |
| **Vine Kanan** | Tidak ada | `vine_ladder.png` — di sebelah kiri leaf, menempel | Vine vertical di sisi kanan, astronaut memanjat ini |
| **Bridge Atas** | Kecil, (100, 60, 200x20) | Lebar menutupi platform atas, pakai crop `bridge_platform` | Pakai `drawCroppedAsset()` |
| **Astronaut** | `drawImage` langsung tanpa crop | `drawCroppedAsset('astronaut_idle', ...)` | Crop coords: sx:642, sy:148, sw:633, sh:775 |
| **Butterfly** | `drawImage` langsung | `drawCroppedAsset('butterfly_background', ...)` kecil-kecil | Beberapa di area tengah, alpha rendah |
| **Moon** | Ada di kanan atas | **DIHAPUS** — tidak ada di referensi | — |
| **Fog** | Tidak ada | `drawSoftFog()` x3 di area tengah | Kabut abu-abu transparan seperti Scene 2 |

---

## 4. Revisi Data Scene 1

### File: `src/constants.ts`

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

### File: `src/scene.ts`

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

## 5. Revisi `drawCutscene()` di `src/main.ts`

### Langkah Rendering Baru (urutan z-index)

```
1. Background solid terang     (#f7f7f4)
2. Soft fog blobs              (3 fog di area tengah, alpha rendah)
3. Tembok Kiri                 (bush_decoration, skala besar, full height)
4. Tembok Kanan                (leaf_decoration, skala besar, flipX, full height)
5. Vine tengah                 (vine_ladder, crop, vertikal)
6. Bridge atas                 (bridge_platform, crop, horizontal)
7. Butterflies                 (butterfly_background, crop, kecil, terbang)
8. Astronaut                   (astronaut_idle, crop, naik vertikal)
```

### Pseudocode Revisi

```typescript
function drawCutscene(ctx, w, h) {
  const cs = getCutscene();
  const cam = getCamera();

  // 1. Background terang (bukan hitam!)
  ctx.fillStyle = '#f7f7f4';
  ctx.fillRect(0, 0, w, h);

  // 2. Soft fog blobs di area tengah (sama seperti Scene 2)
  drawSoftFog(ctx, w * 0.35 - cam.x * 0.12, h * 0.4 - cam.y * 0.08, 200, 0.25);
  drawSoftFog(ctx, w * 0.55 - cam.x * 0.12, h * 0.5 - cam.y * 0.08, 220, 0.20);
  drawSoftFog(ctx, w * 0.50 - cam.x * 0.10, h * 0.35 - cam.y * 0.08, 180, 0.15);

  // 3. Tembok Kiri — bush_decoration, full height, skala besar
  drawCroppedAsset(ctx, 'bush_decoration',
    -50 - cam.x * 0.05,      // x (sedikit parallax)
    -50 - cam.y * 0.05,      // y
    280,                      // width (lebar tembok)
    h + 100,                  // height (full screen + buffer)
    { alpha: 0.95 }
  );

  // 4. Tembok Kanan — leaf_decoration, full height, flipX
  drawCroppedAsset(ctx, 'leaf_decoration',
    w - 230 - cam.x * 0.05,  // x (sisi kanan)
    -50 - cam.y * 0.05,      // y
    260,                      // width
    h + 100,                  // height (full screen + buffer)
    { alpha: 0.95, flipX: true }
  );

  // 5. Vine tengah — 1 vine, astronaut memanjat di sini
  const vine = SCENE_1.vinePositions[0];
  drawCroppedAsset(ctx, 'vine_ladder',
    vine.x - cam.x, vine.y - cam.y,
    64, vine.height,
    { alpha: 0.90 }
  );

  // 6. Bridge atas
  const bridge = SCENE_1.platforms[0];
  drawBridge(ctx, bridge.x, bridge.y, bridge.width, cam.x, cam.y);
  // (drawBridge sudah pakai drawCroppedAsset bridge_platform)

  // 7. Butterflies — 3-4 kecil di area tengah
  const time = cs.elapsed / 1000;
  drawCroppedAsset(ctx, 'butterfly_background',
    w * 0.4 + Math.sin(time * 1.2) * 40 - cam.x * 0.15,
    h * 0.35 + Math.cos(time * 0.8) * 30 - cam.y * 0.15,
    30, 30,
    { alpha: 0.6 + Math.sin(time * 2) * 0.2 }
  );
  // ... tambah 2-3 butterfly lain dengan posisi & phase berbeda

  // 8. Astronaut memanjat vine tengah
  const drawX = cs.astronautX - cam.x;
  const drawY = cs.astronautY - cam.y;
  drawCroppedAsset(ctx, 'astronaut_idle',
    drawX - 15, drawY,  // -15 untuk center di vine
    78, 96,             // visual size (dari crop coords)
    { alpha: 1 }
  );
}
```

### Catatan Penting

- **Semua asset wajib pakai `drawCroppedAsset()`** — jangan `drawImage` langsung, karena asset adalah sprite sheet
- **Background harus terang** `#f7f7f4` — ini adalah pemicu utama agar asset gelap terlihat
- **Tembok kiri & kanan** pakai parallax sangat lambat (`cam.x * 0.05`) agar terasa mendalam
- **Tembok kanan leaf** pakai `flipX: true` agar daun menjuntai menghadap ke kiri (ke tengah)
- **Butterflies** cukup 3-4 kecil, animasi sederhana dengan `Math.sin` untuk efek melayang
- **Astronaut** sebaiknya pakai visual size 78x96 (sama seperti player di Scene 2), center di vine

---

## 6. Perubahan Per File

### 6.1 `src/constants.ts`

| Baris | Sebelum | Sesudah |
|-------|---------|---------|
| `SCENE_1.WORLD_WIDTH` | `400` | `800` |
| `SCENE_1.VINE_LEFT_X` | `80` | Hapus |
| `SCENE_1.VINE_RIGHT_X` | `320` | Hapus |
| — | — | Tambah `VINE_CENTER_X: 400` |

### 6.2 `src/scene.ts`

| Baris | Sebelum | Sesudah |
|-------|---------|---------|
| `worldWidth` | `400` | `800` |
| `platforms` | `[{x:100, y:60, w:200, h:20}]` | `[{x:200, y:60, w:400, h:24}]` |
| `playerSpawn` | `{x:320, y:700}` | `{x:400, y:700}` |
| `vinePositions` | `[{x:80,..}, {x:320,..}]` | `[{x:400, y:80, height:640}]` |

### 6.3 `src/main.ts` — `drawCutscene()`

| Baris | Sebelum | Sesudah |
|-------|---------|---------|
| Background fill | `COLORS.VOID` (#000000) | `'#f7f7f4'` |
| Moon drawing | Ada (w*0.7, 20, 150x150, alpha 0.1) | **DIHAPUS** |
| Plants drawing | `environment_plants` di bawah | **DIHAPUS** |
| Bush drawing | 180x60 di bawah | Skala besar 280 x (h+100) full kiri |
| Leaf drawing | 100x70 di pojok atas | Skala besar 260 x (h+100) full kanan, flipX |
| Vine drawing | Loop 2 vine (x=80, x=320) | 1 vine (x=400), tengah |
| Butterfly | `drawImage` langsung 2 static | `drawCroppedAsset`, 3-4 melayang animasi |
| Astronaut | `drawImage` langsung 48x64 | `drawCroppedAsset`, 78x96, center di vine |
| Bridge | `drawImage` langsung | `drawCroppedAsset` via `drawBridge()` |
| Fog | Tidak ada | `drawSoftFog` x3 di area tengah |

---

## 7. Visual: Sebelum vs Sesudah

### Sebelum (Sekarang)

```
┌─────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ← Background HITAM
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    (asset gelap tidak
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│     terlihat!)
│      [moon kecil]                       │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│  🌿                                       │ ← cuma sedikit tanaman
│  |                    |                 │ ← 2 vine di kiri & kanan
│  |        🧑‍🚀        |                 │ ← astronaut di kanan
│  |                    |                 │
│ 🌱🌱               🌱🌱               │ ← bush tipis bawah
└─────────────────────────────────────────┘
```

### Sesudah (Referensi)

```
┌─────────────────────────────────────────┐
│☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁☁│ ← Background TERANG
│☁☁☁☁☁☁☁☁☁☁[BRIDGE]☁☁☁☁☁☁☁☁☁☁☁☁☁│    + fog abu-abu
│▓▓▓▓▓▓▓▓▓▓☁☁☁☁☁☁☁▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓☁   ⭐   ☁▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓☁   ⭐   ☁▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    (⭐ = butterfly)
│▓▓▓▓▓▓▓▓▓▓☁       ☁▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓☁       ☁▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓☁       ☁▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ← Tembok padat kiri & kanan
│▓▓▓▓▓▓▓▓▓▓☁       ☁▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓☁  🧑‍🚀  ☁▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓☁  ||   ☁▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    (🧑‍🚀 = astronaut naik)
│▓▓▓▓▓▓▓▓▓▓☁  ||   ☁▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    (|| = vine tengah)
│▓▓▓▓▓▓▓▓▓▓☁  ||   ☁▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└─────────────────────────────────────────┘
     ↑                        ↑
  BUSH (kiri)            LEAF (kanan)
```

---

## 8. Checklist Implementation

- [ ] Ganti background `drawCutscene` dari `#000000` ke `#f7f7f4`
- [ ] Hapus moon dari `drawCutscene`
- [ ] Hapus `environment_plants` dari `drawCutscene`
- [ ] Tambah `drawSoftFog` x3 di area tengah cutscene
- [ ] Tembok kiri: `bush_decoration.png` full height, skala besar, pakai `drawCroppedAsset`
- [ ] Tembok kanan: `leaf_decoration.png` full height, skala besar, `flipX: true`
- [ ] Vine: hanya 1 vine di tengah (x=400), pakai `drawCroppedAsset`
- [ ] Bridge: lebarkan, pakai `drawCroppedAsset`
- [ ] Astronaut: pakai `drawCroppedAsset`, size 78x96, posisi center di vine
- [ ] Butterfly: 3-4 instance kecil, pakai `drawCroppedAsset`, animasi melayang
- [ ] Update `SCENE_1.WORLD_WIDTH` dari 400 ke 800
- [ ] Update `SCENE_1.platforms` — lebar 400, x=200
- [ ] Update `SCENE_1.vinePositions` — 1 vine di tengah (x=400)
- [ ] Update `SCENE_1.playerSpawn` — (400, 700)
- [ ] Update `cutscene.ts` — astronautX = VINE_CENTER_X (bukan VINE_RIGHT_X)
- [ ] Build test — cek console untuk error asset load
- [ ] Visual verify — screenshot bandingkan dengan scene_01.png

---

## 9. Risks & Notes

| # | Risk | Mitigasi |
|---|------|----------|
| 1 | `bush_decoration.png` skala besar jadi kabur | Crop coords benar, scale proportional dengan aspect ratio |
| 2 | `leaf_decoration.png` flipX hasilnya aneh | Test dulu — kalau aneh, pakai as-is tanpa flip |
| 3 | WorldWidth 800 > viewport 400 di mobile | Camera clamp akan handle, tembok tetap tampil |
| 4 | Astronaut size 78x96 terlalu besar di cutscene | Kalau terlalu besar, turunkan ke 48x64 atau 60x74 |
| 5 | Vine tengah (x=400) astronaut tidak center | Adjust offset drawX ±10-20 pixel |

---

*Plan generated by Hermes Agent — 2026-06-26*
