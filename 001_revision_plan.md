# 001 Revision Plan — Visual & Asset Fix

> **Game:** Planet of the Unbound
> **Date:** 2026-06-26
> **Issue:** Game berwarna padahal seharusnya hitam putih + tidak pakai asset asli

---

## 🔍 Analisis Masalah

### Masalah 1: Warna vs Hitam Putih
**Saat ini:** Game pakai warna-warni (biru untuk player, coklat untuk platform, merah untuk enemy)
**Seharusnya:** Game HITAM PUTIH (monochrome) — background gelap, elemen putih/terang

**Bukti dari contoh:**
- `scene_menu.png`: Background hitam, text putih, astronaut sprite putih
- `scene_01.png`: Background hitam, vine putih, platform putih, elemen dekorasi putih

### Masalah 2: Tidak Pakai Asset Asli
**Saat ini:** Gambar kotak warna (`ctx.fillRect` dengan warna)
**Seharusnya:** Pakai sprite PNG yang sudah ada (`ctx.drawImage` dengan asset)

**Asset yang tersedia tapi tidak dipakai:**
- `astronaut_idle.png` — karakter astronaut
- `vine_ladder.png` — tangga vine untuk Scene 1
- `bridge_platform.png` — platform jembatan
- `environment_plants.png` — tanaman latar
- `leaf_decoration.png` — dekorasi daun
- `bush_decoration.png` — dekorasi semak
- `butterfly_background.png` — kupu-kupu latar
- `background_moon.png` — latar bulan

### Masalah 3: Astronaut Tidak Muncul di Cutscene
**Saat ini:** Cutscene gambar kotak biru
**Seharusnya:** Cutscene gambar `astronaut_idle.png` yang memanjat vine

---

## 📋 Revision Plan

### Revisi 1: Update Warna ke Monochrome
**File:** `src/constants.ts`

```typescript
// GANTI COLORS menjadi monochrome
export const COLORS = {
  BACKGROUND: '#000000',    // Hitam
  PLAYER: '#ffffff',        // Putih
  PLATFORM: '#ffffff',      // Putih
  ENEMY: '#ffffff',         // Putih
  VOID: '#000000',          // Hitam
  UI_TEXT: '#ffffff',        // Putih
  UI_ACCENT: '#888888',     // Abu-abu untuk accent
};
```

### Revisi 2: Update Menu ke Monochrome + Pakai Asset
**File:** `src/main.ts` — `drawMenu()`

- Background: hitam pekat
- Title: putih, font besar
- Subtitle: abu-abu
- Start button: outline putih (bukan kotak warna)
- **Tambah astronaut sprite** di kiri layar pakai `astronaut_idle.png`
- **Tambah decorative vines** di atas pakai `leaf_decoration.png`

### Revisi 3: Update Cutscene Pakai Asset Asli
**File:** `src/main.ts` — `drawCutscene()`

Sekarang:
```typescript
// ❌ Sekarang — kotak warna
ctx.fillStyle = '#2d5a1e';
ctx.fillRect(vine.x, vine.y, 16, vine.height);

ctx.fillStyle = COLORS.PLAYER;
ctx.fillRect(drawX, drawY, PLAYER.WIDTH, PLAYER.HEIGHT);
```

Revisi:
```typescript
// ✅ Seharusnya — pakai asset asli
const vineImg = getAsset('vine_ladder');
if (vineImg) {
  ctx.drawImage(vineImg, vine.x - cam.x, vine.y - cam.y, 64, vine.height);
}

const astronautImg = getAsset('astronaut_idle');
if (astronautImg) {
  ctx.drawImage(astronautImg, drawX, drawY, PLAYER.WIDTH, PLAYER.HEIGHT);
}
```

**Asset yang harus ditambahkan ke cutscene:**
- `vine_ladder.png` — 2 vine (kiri & kanan)
- `bridge_platform.png` — platform di atas
- `astronaut_idle.png` — karakter astronaut
- `environment_plants.png` — tanaman latar
- `leaf_decoration.png` — dekorasi daun
- `bush_decoration.png` — semak bawah
- `butterfly_background.png` — kupu-kupu latar
- `background_moon.png` — bulan latar

### Revisi 4: Update Scene 2 Rendering Pakai Asset
**File:** `src/main.ts` — `drawPlaying()`

Sekarang:
```typescript
// ❌ Kotak warna
ctx.fillStyle = COLORS.PLATFORM;
ctx.fillRect(plat.x - camX, plat.y - camY, plat.width, plat.height);
```

Revisi:
```typescript
// ✅ Pakai asset asli
const platformImg = getAsset('bridge_platform');
if (platformImg) {
  ctx.drawImage(platformImg, plat.x - camX, plat.y - camY, plat.width, plat.height);
}
```

### Revisi 5: Update Player Drawing Pakai Asset
**File:** `src/player.ts` — `drawPlayer()`

Sekarang:
```typescript
// ❌ Kotak warna
ctx.fillStyle = COLORS.PLAYER;
ctx.fillRect(drawX, drawY, PLAYER.WIDTH, PLAYER.HEIGHT);
```

Revisi:
```typescript
// ✅ Pakai asset asli + flip untuk facing
const astronautImg = getAsset('astronaut_idle');
if (astronautImg) {
  ctx.save();
  if (player.facing === 'left') {
    ctx.translate(drawX + PLAYER.WIDTH, drawY);
    ctx.scale(-1, 1);
    ctx.drawImage(astronautImg, 0, 0, PLAYER.WIDTH, PLAYER.HEIGHT);
  } else {
    ctx.drawImage(astronautImg, drawX, drawY, PLAYER.WIDTH, PLAYER.HEIGHT);
  }
  ctx.restore();
}
```

### Revisi 6: Update Controls Screen Monochrome
**File:** `src/main.ts` — `drawControls()`

- Background: hitam
- Text: putih
- Key labels: abu-abu
- Tidak ada warna biru

### Revisi 7: Update Pause/Game Over/Victory Monochrome
**File:** `src/main.ts` — `drawPaused()`, `drawGameOver()`, `drawVictory()`

- Background: hitam
- Text: putih
- Buttons: outline putih (bukan kotak warna)

### Revisi 8: Update HUD Monochrome
**File:** `src/main.ts` — `drawPlaying()`

- HP hearts: pakai `health_icon.png` (putih)
- Ammo: text putih
- Portrait: pakai `astronaut_idle.png` (putih)
- Weapon icon: pakai `laser_weapon.png` (putih)

---

## 🎨 Referensi Visual dari Contoh

### scene_menu.png (Menu)
```
┌─────────────────────────────────────┐
│  🌿🌿 (leaf decoration atas)        │
│                                     │
│  👨‍🚀 (astronaut_idle)   PLANET OF  │
│                         THE UNBOUND │
│                                     │
│              A lost astronaut...    │
│                                     │
│              [ START GAME ]         │
│              (outline putih)        │
│                                     │
│              Press SPACE to start   │
└─────────────────────────────────────┘
```

### scene_01.png (Scene 1 Cutscene)
```
┌─────────────────────────────────────┐
│  🌿 (leaf_decoration)    🌿        │
│                                     │
│         ┌──────────┐                │
│         │ bridge   │ (atas)         │
│         └──────────┘                │
│    │                    │           │
│    │ vine_ladder        │ vine      │
│    │                    │           │
│    │         👨‍🚀        │ (climbing)│
│    │                    │           │
│  🌿 (environment_plants)  🌿      │
│  ▓▓▓ (bush_decoration) ▓▓▓        │
└─────────────────────────────────────┘
```

---

## 📁 Files yang Perlu Dimodifikasi

| File | Revisi |
|------|--------|
| `src/constants.ts` | Update COLORS ke monochrome |
| `src/main.ts` | Semua draw functions → pakai asset + monochrome |
| `src/player.ts` | drawPlayer → pakai `astronaut_idle.png` + flip |
| `src/cutscene.ts` | Tidak ada perubahan (logic sama) |
| `src/scene.ts` | Tidak ada perubahan (data sama) |
| `src/camera.ts` | Tidak ada perubahan |
| `src/collision.ts` | Tidak ada perubahan |
| `src/input.ts` | Tidak ada perubahan |
| `src/assets.ts` | Tidak ada perubahan |

---

## ✅ Acceptance Criteria Setelah Revisi

1. ✅ Game HITAM PUTIH (monochrome) — tidak ada warna
2. ✅ Menu menampilkan astronaut sprite (`astronaut_idle.png`)
3. ✅ Menu menampilkan decorative vines (`leaf_decoration.png`)
4. ✅ Cutscene menampilkan vine pakai `vine_ladder.png`
5. ✅ Cutscene menampilkan astronaut pakai `astronaut_idle.png`
6. ✅ Cutscene menampilkan environment pakai asset asli
7. ✅ Scene 2 platform pakai `bridge_platform.png`
8. ✅ Player digambar pakai `astronaut_idle.png` + flip facing
9. ✅ HUD pakai `health_icon.png` dan `laser_weapon.png`
10. ✅ Semua screen (pause, game over, victory) monochrome

---

*Status: ✅ Siap untuk implementasi*
