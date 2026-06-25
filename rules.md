# Rules — Planet of the Unbound

> Aturan coding yang wajib diikuti saat implementasi game ini.
> Tujuannya: code yang **rapi, minimal, mudah dibaca, dan gampang troubleshoot**.

---

## 🎯 Prinsip Utama

1. **Minimal code** — Jangan over-engineer. Tulis sesedikit mungkin yang masih berfungsi.
2. **Mudah dibaca** — Orang lain (atau kamu 3 bulan lagi) harus bisa paham dalam 5 detik.
3. **Gampang troubleshoot** — Kalau error, harus ketahuan di file/line mana dalam 1 menit.
4. **Natural code** — Tulis seperti manusia nulis, bukan seperti AI generate. Hindari pola kaku.
5. **Praktis** — Kalau ada cara simpel, pakai cara simpel. Jangan bikin abstraksi yang belum dibutuhkan.

---

## 📁 Struktur File

### Aturan Pembagian File
```
planet-of-the-unbound/
├── index.html          ← Entry point, cukup load canvas + script
├── styles.css          ← Minimal CSS (canvas styling only)
├── src/
│   ├── main.js         ← Game loop, init, state machine
│   ├── constants.js    ← Semua angka/nilai tunable (satu tempat)
│   ├── assets.js       ← Load semua image, export object
│   ├── input.js        ← Keyboard + mouse handler
│   ├── player.js       ← Player class
│   ├── enemy.js        ← Semua enemy types (1 file, jangan dipisah)
│   ├── projectile.js   ← Semua projectile types (1 file)
│   ├── scene.js        ← Scene/level data
│   ├── camera.js       ← Camera follow
│   ├── collision.js    ← AABB detection + resolution
│   ├── ui.js           ← HUD, menus, screens
│   ├── cutscene.js     ← Cutscene player
│   └── game.js         ← Game state machine, scene manager
└── assets/
    └── images/         ← Semua gambar sprites
```

### Aturan Penamaan File
- **Lowercase + underscore**: `player.js`, `game_loop.js` (bukan `playerScript.js`)
- **1 file = 1 tanggung jawab**: `player.js` = semua yang tentang player
- **Jangan bikin folder berlebihan**: cukup `src/` dan `assets/`
- **Satu class per file utama**: file `player.js` isi `class Player` + helper functions

### Kapan Bikin File Baru?
- **Bikin file baru** kalau file sudah >300 baris dan ada bagian yang bisa dipisah logis
- **Jangan bikin file baru** kalau cuma beda 50-100 baris — lebih baik digabung
- **Gabungkan** tipe yang mirip: semua enemy di `enemy.js`, semua projectile di `projectile.js`

---

## ✍️ Penulisan Code

### Format & Style
```javascript
// ✅ BAIK — deskriptif, singkat, natural
const player = {
  x: 100,
  y: 200,
  hp: 3,
  speed: 4
};

// ❌ BURUK — over-documented, terlalu verbose
const playerInitialState = {
  horizontalPosition: 100,
  verticalPosition: 200,
  healthPoints: 3,
  movementSpeed: 4
};
```

### Nama Variable & Function
```javascript
// ✅ BAIK — jelas, pendek, natural
const GRAVITY = 0.5;
const MAX_HP = 3;

function updatePlayer(dt) { ... }
function isOnGround() { ... }
function spawnEnemy(x, y, type) { ... }

// ❌ BURUK — terlalu panjang atau ambigu
const GRAVITY_CONSTANT_FOR_PHYSICS_ENGINE = 0.5;
const PLAYER_MAXIMUM_HEALTH_POINTS = 3;

function updatePlayerPositionAndVelocityAndAnimation(deltaTime) { ... }
function checkIfPlayerIsCollidingWithPlatformBelow() { ... }
```

### Komentar
```javascript
// ✅ BAIK — komentar untuk menjelaskan MENGAPA, bukan APA
// Boss triggers meteor when HP drops below 3
if (boss.hp <= 3 && !boss.meteorUsed) {
  boss.meteorUsed = true;
  spawnMeteors();
}

// ❌ BURUK — komentar yang cuma ngulang code
// Check if boss HP is less than or equal to 3
if (boss.hp <= 3) {
  // If meteor hasn't been used yet
  if (!boss.meteorUsed) {
    // Set meteor used to true
    boss.meteorUsed = true;
    // Spawn meteors
    spawnMeteors();
  }
}
```

### Kapan Komentar Dibutuhkan?
- ✅ **Wajib**: penjelasan logika yang tidak obvious (trick, workaround, math)
- ✅ **Wajib**: TODO/FIXME untuk hal yang belum selesai
- ✅ **Bagus**: section header untuk pisahkan bagian dalam file panjang
- ❌ **Jangan**: komentar yang cuma ngulang apa yang code lakukan
- ❌ **Jangan**: komentar yang sudah basi/tidak relevan

---

## 🧱 Arsitektur Code

### Jangan Over-Engineer!
```javascript
// ✅ BAIK — simpel, langsung jalan
function checkCollision(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

// ❌ BURUK — terlalu abstrak untuk game kecil
class CollisionSystem {
  constructor(config) {
    this.strategies = new Map();
    this.strategies.set('AABB', new AABBCollisionStrategy(config));
    this.strategies.set('Circle', new CircleCollisionStrategy(config));
  }
  
  detect(entityA, entityB, type = 'AABB') {
    return this.strategies.get(type).detect(entityA, entityB);
  }
}
```

### Hindari Pola AI Kaku
```javascript
// ✅ BAIK — natural, manusiawi
if (player.hp <= 0) {
  gameState = 'GAME_OVER';
  return;
}

// ❌ BURUK — pola AI yang terlalu "formal"
if (player && typeof player.hp !== 'undefined' && player.hp !== null) {
  if (player.hp <= 0) {
    this.setGameState(GameState.GAME_OVER);
    return;
  }
}

// ❌ BURUK — factory pattern yang tidak perlu
class GameStateFactory {
  static create(state) {
    switch(state) {
      case 'GAME_OVER': return new GameOverState();
      // ... 20 case lain
    }
  }
}
```

### Yang TIDAK Perlu Dibuat (Belum)
- ❌ Event emitter / pub-sub system
- ❌ Entity Component System (ECS)
- ❌ Plugin architecture
- ❌ State pattern / strategy pattern
- ❌ Factory classes
- ❌ Dependency injection
- ❌ Abstract classes / interfaces
- ❌ Custom event system (pakai native event listener saja)

### Yang SUDAH Cukup
- ✅ Object literal untuk data (player, enemy, config)
- ✅ Function untuk logika (update, draw, check)
- ✅ Class sederhana kalau ada banyak instance (Player, Enemy, Projectile)
- ✅ Array untuk collection (enemies[], projectiles[])

---

## 🔍 Troubleshooting

### Supaya Gampang Debug
```javascript
// ✅ BAIK — error jelas, langsung tahu masalahnya
function loadAsset(name) {
  const img = new Image();
  img.src = `assets/images/${name}.png`;
  img.onerror = () => console.error(`Gagal load: ${name}`);
  return img;
}

// ❌ BURUK — error tidak jelas, susah trace
function loadAsset(n) {
  const i = new Image();
  i.src = `assets/images/${n}.png`;
  return i;
}
```

### Console.log yang Berguna
```javascript
// ✅ BAIK — untuk debug, pakai label yang jelas
console.log('[Player] HP:', player.hp);
console.log('[Scene] Transition to Scene 2');
console.log('[Boss] Meteor triggered at HP:', boss.hp);

// ❌ BURUK — tidak informatif
console.log(player);
console.log('test');
console.log('here');
```

### Error Handling
- **Minimal tapi ada**: cukup `try-catch` untuk asset loading, jangan untuk semua hal
- **Console.error** untuk hal yang benar-benar error
- **Jangan silence error**: kalau ada error, biarkan muncul di console
- **Jangan over-handle**: tidak perlu fallback untuk semua kemungkinan

---

## 🎮 Game-Specific Rules

### Constants
- **Semua angka tunable** masuk ke `constants.js`
- **Jangan hardcode** angka di file lain — reference ke constants
- **Naming**: `GRAVITY`, `PLAYER_SPEED`, `BOSS_HP` (uppercase, snake_case)

### State Management
- **Simpel**: pakai object `game.state = 'PLAYING'`
- **Jangan bikin state machine class** — cukup switch/if-else di `game.js`
- **State transitions**: jelas, document di satu tempat

### Collision
- **Pakai AABB** saja (axis-aligned bounding box)
- **Jangan bikin collision layer/system** yang kompleks
- **Cukup function**: `checkCollision(a, b)` dan `resolveCollision(player, platform)`

### Enemy & Projectile
- **1 class per tipe** (SmallAlien, BossAlien, UFO)
- **Array untuk collection**: `enemies = []`, `projectiles = []`
- **Update & draw di loop**: iterate array, call update/draw per item
- **Hapus item mati**: filter array setiap frame

---

## 📏 Checklist Sebelum Submit

Setiap kali selesai nulis code, cek:

- [ ] **Bisa dibaca?** — Orang lain paham dalam 5 detik?
- [ ] **Ada error?** — Test di browser, cek console
- [ ] **Over-engineered?** — Kalau bisa dihapus tanpa hilang fungsi, hapus
- [ ] **Naming jelas?** — Variable/function name explain itself?
- [ ] **File rapi?** — Sesuai struktur di atas?
- [ ] **Constants di tempatnya?** — Angka di `constants.js`, bukan hardcode?
- [ ] **Komentar perlu?** — Kalau code sudah jelas, jangan komentar

---

## ⚡ Quick Reference

| Hal | Cara |
|-----|------|
| Angka tunable | `constants.js` |
| Asset loading | `assets.js` |
| Input handling | `input.js` |
| Game state | `game.js` (state machine) |
| Player logic | `player.js` |
| Enemy logic | `enemy.js` (semua tipe) |
| Collision | `collision.js` |
| Camera | `camera.js` |
| UI/HUD | `ui.js` |
| Cutscene | `cutscene.js` |

---

*Terakhir diupdate: 2026-06-26*
