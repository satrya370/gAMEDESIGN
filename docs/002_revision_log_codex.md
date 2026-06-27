# 002 Revision Log Codex

> Date: 2026-06-27
> Project: `C:\GameDesign\planet-of-the-unbound`
> Author: Codex
> Scope: Scene 1 visual revision, Scene 2/2.5/3 gameplay progression, difficulty tuning, UI state fixes

---

## Summary

Revisi ini melanjutkan perbaikan visual Scene 1 agar lebih dekat ke reference, lalu menambahkan loop gameplay inti yang sebelumnya belum ada:

- Scene 1 cutscene memakai layout design-space 1920x1080
- Scene 2 memiliki 3 alien shooter dan 1 rocket part
- Scene 2.5 ditambahkan sebagai scene transisi baru dengan 3 alien shooter dan 1 rocket part
- Scene 3 ditambahkan sebagai arena boss dengan 1 boss dan 1 UFO serta rocket part terakhir
- Objective HUD, ammo usage, projectile, pickup rocket part, dan transisi antar scene sekarang aktif
- Difficulty diturunkan: alien lebih grounded di platform, peluru lebih lambat, ammo player naik menjadi 15
- Restart, pause, dan kembali ke menu dari state mati/victory diperbaiki agar bisa dipakai

---

## Root Causes Found

Masalah utama yang ditemukan selama revisi:

1. Scene 1 sebelumnya masih memakai layout persentase lokal, bukan source of truth tunggal.
2. Crop beberapa asset scene salah atau terlalu sempit, terutama `leaf_decoration`.
3. Canvas belum DPR-aware dan belum memakai design-space uniform scaling.
4. Scene 2 sebelumnya hanya placeholder visual, belum punya enemy runtime, projectile, collectible, objective, atau transisi scene.
5. Alien di gameplay terlihat melayang karena posisi dan ukuran sprite tidak dikunci baik ke platform.
6. Alien bisa bergerak terlalu bebas sehingga gap/platform challenge tidak terbaca seperti desain level.
7. Tombol state seperti Game Over, Victory, dan Pause masih tampil sebagai gambar teks tanpa handler klik yang benar.

---

## Files Changed

- `src/scene.ts`
- `src/game.ts`
- `src/constants.ts`
- `src/cutscene.ts`
- `src/player.ts`
- `src/main.ts`

---

## Changes By Area

### 1. Scene 1 Cutscene

- Menambahkan `DESIGN_WIDTH`, `DESIGN_HEIGHT`, `SCENE_1_LAYOUT`, dan `SCENE_1_LEAF_STRANDS` di `src/scene.ts`
- Menghapus duplicate Scene 1 constants dan `as any`
- Memindahkan layout Scene 1 menjadi single source of truth
- Menambahkan design-space transform 16:9 di `src/main.ts`
- Mengganti render bush dari single fill menjadi dense tiled clusters
- Mengganti render leaf kanan menjadi multiple vertical strands
- Mengganti bridge kanan menjadi modular repeated pattern
- Membuat vine Scene 1 lebih lurus dengan helper vine vertikal
- Mengubah animasi astronaut agar slide naik sepanjang vine kanan, lalu vine kanan dirender ulang di depan astronaut supaya kontak visual lebih kuat
- Menambahkan debug overlay layout opsional

### 2. Canvas / Rendering

- `src/game.ts` sekarang memakai ukuran viewport browser sebenarnya
- Backing canvas memakai `devicePixelRatio`
- Canvas CSS dan pixel size sekarang dipisah dengan benar

### 3. Scene 2 / 2.5 / 3 Layout

- Menambahkan `SCENE_2_LAYOUT`, `SCENE_2_5_LAYOUT`, dan `SCENE_3_LAYOUT`
- Menambahkan data runtime scene:
  - `SCENE_2`
  - `SCENE_2_5`
  - `SCENE_3`
- Scene 2 dan 2.5 memakai bridge bertingkat dan vines dekoratif
- Scene 3 memakai arena panjang datar untuk boss fight

### 4. Player / Ammo / Climb

- Menambahkan helper `refillAmmo`, `consumeAmmo`, dan `setPlayerPosition` di `src/player.ts`
- Menambahkan vine-touch climb logic ringan agar bridge atas Scene 2 bisa dinaiki melalui vine yang memang climbable
- Ammo player dinaikkan dari `8` menjadi `15`

### 5. Enemy / Projectile Runtime

- Menambahkan runtime state untuk:
  - enemy
  - projectile
  - rocket part
  - objective text
  - scene transition
- Scene 2 sekarang punya 3 alien shooter
- Scene 2.5 sekarang punya 3 alien shooter
- Scene 3 sekarang punya:
  - 1 boss
  - 1 UFO
- Player sekarang bisa menembak laser
- Alien menembakkan projectile horizontal
- Boss menembakkan rock bullet dan memicu meteor sekali
- UFO menembakkan projectile ke arah player

### 6. Objective / Collectible

- Menambahkan 3 rocket parts:
  - Scene 2: `rocket_part_01`
  - Scene 2.5: `rocket_part_02`
  - Scene 3: `rocket_part_03`
- Objective HUD sekarang update:
  - `Find the missing rocket parts`
  - `Rocket Parts: 1/3`
  - `Rocket Parts: 2/3`
  - `All parts found! Return to rocket`

### 7. Scene Flow

- Scene 1 cutscene selesai -> Scene 2
- Scene 2 tepi kanan -> Scene 2.5
- Scene 2.5 tepi kanan -> Scene 3
- Scene 3 tepi kanan setelah enemy habis dan part terakhir diambil -> Victory

Catatan:

- Scene 4 dan Scene 5 belum dihubungkan pada revisi ini.
- Flow akhir masih sementara berhenti di `VICTORY` setelah Scene 3 clear.

### 8. Difficulty Tuning

- Ammo player dinaikkan menjadi 15
- Small alien diposisikan lebih rendah agar tidak tampak seperti terbang
- Small alien dikunci ke batas platform spawn, jadi tidak melewati gap antar platform
- Kecepatan gerak small alien diturunkan
- Peluru small alien diperlambat
- Cooldown antar tembakan small alien diperpanjang
- Peluru boss diperlambat
- Cooldown serangan boss diperpanjang
- UFO diperlambat dan ritme tembaknya diturunkan

### 9. Menu / Pause / Death State Fixes

- Restart dari `GAME_OVER` sekarang benar-benar restart run
- Restart dari `VICTORY` sekarang benar-benar restart run
- `Back to Menu` sekarang reset progression state
- Pause menu sekarang bisa resume dan quit dengan klik mouse
- Game Over dan Victory sekarang punya handler klik untuk tombol layar

---

## Final Asset Crops Used

```ts
astronaut_idle:   { sx: 642, sy: 148, sw: 633, sh: 775 }
bridge_platform:  { sx: 385, sy: 439, sw: 1264, sh: 202 }
bullet_boss:      { sx: 507, sy: 278, sw: 895, sh: 526 }
bush_decoration:  { sx: 412, sy: 319, sw: 1102, sh: 440 }
butterfly_background: { sx: 768, sy: 354, sw: 373, sh: 373 }
health_icon:      { sx: 662, sy: 303, sw: 603, sh: 543 }
laser_bullet:     { sx: 628, sy: 331, sw: 565, sh: 287 }
laser_weapon:     { sx: 672, sy: 300, sw: 665, sh: 524 }
leaf_decoration:  { sx: 762, sy: 230, sw: 396, sh: 620 }
meteor_projectile:{ sx: 611, sy: 271, sw: 688, sh: 513 }
portal_effect:    { sx: 634, sy: 266, sw: 697, sh: 679 }
rocket_part_01:   { sx: 664, sy: 232, sw: 419, sh: 601 }
rocket_part_02:   { sx: 652, sy: 242, sw: 587, sh: 593 }
rocket_part_03:   { sx: 626, sy: 268, sw: 668, sh: 544 }
vine_ladder:      { sx: 898, sy: 95, sw: 179, sh: 890 }
```

---

## Verification Performed

### Build / Typecheck

- `npm run build` -> success
- `npx -p typescript tsc --noEmit` -> success

### Screenshots Captured

- `verification/scene1-1920x1080-mid.png`
- `verification/scene1-1366x768-mid.png`
- `verification/scene1-1536x864-mid.png`
- `verification/scene2-1920x1080-start.png`

### Verified Manually

- Scene 1 composition lebih dekat ke reference
- Scene 1 vine lebih lurus dan astronaut lebih menempel ke vine kanan
- Scene 2 menampilkan objective text dan 3 alien
- Rocket part Scene 2 terlihat pada layout gameplay
- Difficulty visual dan projectile pacing sudah diturunkan dibanding iterasi sebelumnya

---

## Known Limitations

1. Scene 4 dan Scene 5 belum diimplementasikan sesuai flow final di spec.
2. UFO tidak memiliki asset sprite terpisah, sehingga masih dirender procedural.
3. Boss masih memakai asset `alien_shooter.png` yang dibesarkan karena tidak ada sprite boss khusus.
4. Belum ada full automated walkthrough dari Scene 2 -> Scene 2.5 -> Scene 3 -> end state.
5. Sistem combat masih prototype-grade dan belum mencakup polish effect seperti muzzle flash, hit flash detail, atau pickup sparkle penuh.

---

## Current Status

Revisi saat ini membawa project dari placeholder visual menjadi playable prototype dengan:

- Scene 1 cutscene yang lebih akurat
- Scene 2, Scene 2.5, dan Scene 3 yang punya gameplay loop dasar
- Enemy shooting dan player shooting aktif
- Collectible rocket parts aktif
- Objective HUD aktif
- Difficulty awal sudah diturunkan
- State restart/menu sudah lebih usable

Langkah berikutnya yang direkomendasikan:

1. Sambungkan Scene 3 -> Scene 4 -> Scene 5 sesuai spec
2. Tambahkan barrier/no-backtracking yang lebih eksplisit
3. Lengkapi boss/UFO polish dan balance pass
4. Tambahkan verifikasi flow penuh dari start sampai victory

---

## 2026-06-27 Follow-up: Movement, Aiming, Shooting, and Progression

### Additional Root Causes

1. Player shooting masih bergantung pada `justPressed.shoot`, sehingga input yang tertahan atau event yang tidak masuk tepat pada frame gameplay bisa terasa seperti tidak menembak.
2. Arah peluru player masih mengikuti `facing` kiri/kanan, bukan pointer.
3. Tombol overlay memakai koordinat backing canvas pada layar DPR tinggi, sementara UI digambar dalam logical canvas coordinates.
4. Scene exit belum mewajibkan rocket part scene aktif sudah dikoleksi, sehingga part bisa diskip.

### Changes

- `src/input.ts`
  - Menambahkan `Enter` sebagai tombol shoot.
  - `Space` dan `Enter/J` sekarang memanggil `preventDefault()` agar input browser tidak mengganggu kontrol.
  - Posisi pointer awal diset ke tengah viewport agar aiming keyboard punya default yang masuk akal.

- `src/main.ts`
  - Menambahkan held-fire cooldown `PLAYER_SHOT_COOLDOWN_MS = 165`.
  - Player bisa menembak dengan klik, `J`, atau `Enter`.
  - Peluru player sekarang dihitung dari pointer world-space: `vx/vy` mengikuti arah pointer.
  - Player menghadap kiri/kanan berdasarkan posisi pointer.
  - Pistol procedural kecil dirender dari tangan player dan diputar mengikuti aim angle.
  - Projectile laser player dirender rotasi sesuai arah gerak dan diberi core line agar lebih terlihat.
  - `getCanvasPointer()` dikembalikan ke logical canvas coordinates sehingga tombol Pause/Game Over/Victory benar pada DPR tinggi.
  - Scene 2 dan Scene 2.5 tidak bisa lanjut ke scene berikutnya sebelum rocket part scene tersebut diambil.
  - Victory Scene 3 sekarang mensyaratkan `collectedParts >= 3`.
  - Menambahkan debug-only query untuk verifikasi: `aimX`, `aimY`, dan `debugAutoShoot=1`.

- `src/player.ts`
  - Worker pass menambahkan hitbox inset, crouch hurtbox, movement acceleration, air drag, dan fall gravity tuning agar movement terasa lebih berjalan dan tidak melayang.

- `src/constants.ts`
  - Worker pass menambahkan tuning movement dan projectile:
    - `PLAYER.GROUND_ACCELERATION`
    - `PLAYER.AIR_ACCELERATION`
    - `PLAYER.AIR_DRAG`
    - `PLAYER.FALL_GRAVITY_MULTIPLIER`
    - `PLAYER.CROUCH_SPEED_MULTIPLIER`
    - `PLAYER.HITBOX_*`
    - `PROJECTILES.ALIEN_BULLET`

### Verification

- `npx -p typescript tsc --noEmit` -> success
- `npm run build` -> success
- Screenshot baru:
  - `verification/scene2-1920x1080-pointer-aim.png`
  - `verification/scene2-1920x1080-pointer-shot.png`
  - `verification/scene2-1920x1080-pointer-shot-near.png`
  - `verification/scene2-1920x1080-pointer-shot-final.png`

### Code Review Follow-up

Reviewer `gpt-5.5` menemukan:

1. Rocket part bisa diskip dan tetap victory.
2. Mouse button hit-test salah pada DPR tinggi.

Keduanya sudah diperbaiki di `src/main.ts`.

---

## 2026-06-27 Follow-up: Weapon, Pointer, UFO, Boss, and Portals

### Root Causes

1. Pistol player sebelumnya di-anchor terlalu generik ke pusat body, jadi terlihat melayang dan memotong badan.
2. Canvas masih memakai browser crosshair default yang putih.
3. UFO Scene 3 masih procedural, terlalu tinggi, dan tidak memakai asset yang dimaksud.
4. Boss bisa menembak tanpa menyamakan arah sprite dengan arah projectile.
5. `rocket_part_02` ternyata adalah asset UFO, bukan rocket part collectible.
6. Portal belum hadir konsisten pada scene transisi di ujung layar.

### Changes

- `src/main.ts`
  - Crop asset diperbarui:
    - `portal_effect` -> `630,265,704,683`
    - `rocket_part_02` -> `650,240,592,596`
    - `rocket_part_04` -> `558,232,799,690`
  - Pistol player diganti ke bentuk procedural kecil, di-anchor ke sisi tangan yang menghadap pointer.
  - Custom cursor canvas digambar hitam/gelap, dan cursor browser disembunyikan.
  - UFO sekarang dirender dari asset `rocket_part_02`.
  - Boss sekarang selalu menghadap arah tembak sebelum spawn projectile.
  - Projectile boss dipercepat dan TTL diperpanjang agar range terasa cukup jauh.
  - `RocketPartRuntime` sekarang memakai `rocket_part_04` untuk collectible scene 2.5.

- `src/scene.ts`
  - Scene 2 portal dipindah ke ujung kanan area transisi.
  - Scene 2.5 ditambahkan portal di ujung kanan.
  - Scene 3 ditambahkan portal di ujung kanan.
  - Collectible Scene 2.5 tetap di platform atas tetapi sekarang memakai dimensi yang cocok untuk `rocket_part_04`.

- `src/constants.ts`
  - HP boss dinaikkan dari `5` ke `8`.
  - Serangan boss di-tune:
    - `ROCK_ATTACK_INTERVAL` -> `2600`
    - `METEOR_TRIGGER_HP` -> `4`
    - `PROJECTILES.ROCK_BULLET.SPEED` -> `4.6`

- `styles.css`
  - `#gameCanvas { cursor: none; }`

### Verification

- `npx -p typescript tsc --noEmit` -> success
- `npm run build` -> success
- Screenshot baru:
  - `verification/scene2-1920x1080-gun-pointer-fixed-safe.png`
  - `verification/scene2_5-1920x1080-portal.png`
  - `verification/scene3-1920x1080-ufo-boss-safe.png`

---

## 2026-06-27 Follow-up: Scene 4 and Scene 5 Final Cutscenes

### Root Causes

1. Flow runtime masih berhenti ke `VICTORY` langsung setelah Scene 3, jadi Scene 4 dan 5 belum pernah dijalankan.
2. Cutscene state hanya benar-benar menggerakkan progress Scene 1.
3. Final cutscene belum punya source of truth layout sendiri, sehingga placement foliage, mound, astronaut, dan rocket belum bisa dijaga konsisten.
4. Reference final scene memakai komposisi clearing statis dengan foliage besar dan rocket upright, sedangkan repo hanya punya `rocket_broken` dan part assets, bukan sprite rocket final yang siap dipakai langsung.

### Changes

- `src/scene.ts`
  - Menambahkan `LAST_SCENE_LAYOUT` sebagai source of truth Scene 4 dan 5.
  - Layout ini menyatukan moon, rear plants, main plants, bush band, mound, rocket pad, repair icon area, astronaut repair position, rocket door, dan launch path.

- `src/cutscene.ts`
  - `progress` sekarang diupdate untuk seluruh cutscene, bukan Scene 1 saja.

- `src/main.ts`
  - Menambahkan crop final `environment_plants: 613,108,572,803`.
  - Menambahkan `SceneTransitionId` dan flow transisi:
    - Scene 3 complete -> `scene4_cutscene`
    - Scene 4 complete -> `scene5_cutscene`
    - Scene 5 complete -> `VICTORY`
  - Menambahkan debug entry:
    - `?debugCutscene=4&cutsceneProgress=...`
    - `?debugCutscene=5&cutsceneProgress=...`
  - Menambahkan dispatcher `drawActiveCutscene()` agar renderer Scene 1, 4, dan 5 terpisah.
  - Menyembunyikan pointer selama cutscene.
  - Menambahkan renderer final-scene:
    - `drawLastSceneEnvironment()`
    - `drawLastScenePlantGroup()`
    - `drawLastSceneBushBand()`
    - `drawLastSceneMound()`
    - `drawCutsceneAstronaut()`
    - `drawRepairIconCluster()`
    - `drawRepairFragments()`
    - `drawUprightRocket()`
    - `drawScene4RepairCutscene()`
    - `drawScene5LaunchCutscene()`
  - `environment_plants` dipakai sebagai foliage utama sesuai contoh dan koreksi user.
  - Rocket final dibuat sebagai silhouette upright procedural agar tetap konsisten dengan reference meski asset shuttle-final eksplisit tidak tersedia di repo.
  - `rocket_broken`, `rocket_part_01`, `rocket_part_03`, dan `rocket_part_04` dipakai sebagai cue repair state / fragment repair.

### Verification

- `npx -p typescript tsc --noEmit` -> success
- `npm run build` -> success
- Screenshot final:
  - `verification/scene4-cutscene-1920x1080.png`
  - `verification/scene5-cutscene-1920x1080.png`

### Notes

- Asset foliage utama yang dipakai untuk final cutscene adalah `environment_plants.png`.
- Rocket final masih procedural karena repo tidak menyediakan sprite shuttle upright final yang match dengan silhouette reference.

---

## 2026-06-27 Follow-up: Weapon Anchor, Backtracking, Boss Patrol, Portal, and HUD

### Root Causes

1. Anchor pistol memakai collision hitbox, bukan visual sprite astronaut, sehingga pistol bisa terlihat turun ke kaki saat visual sprite lebih tinggi dari hitbox.
2. Projectile player memiliki TTL pendek, jadi tembakan ke pointer jauh bisa terasa tidak keluar atau hilang terlalu cepat.
3. Boss memakai patrol penuh platform dan chase logic, sehingga bisa bergerak terlalu jauh sampai mendekati/nabrak player.
4. Progression masih linear satu arah dan belum punya portal balik untuk mencari rocket part yang tertinggal.
5. Rocket part tracking hanya berupa total count, sehingga kurang aman untuk backtracking per-scene.
6. HUD terlalu besar dan objective berada di tengah atas.

### Changes

- `src/main.ts`
  - Player aim/pistol sekarang dihitung dari visual astronaut bounds, bukan `getPlayerAABB()`.
  - Pistol procedural dibuat lebih kecil dan diposisikan sebagai pistol genggam.
  - TTL player laser dinaikkan dari `1000ms` ke `2400ms`.
  - Rocket part tracking diganti ke `collectedPartIds: Set<PlayableSceneId>`.
  - Scene clear tracking ditambahkan lewat `clearedSceneIds`.
  - Scene 2 dan Scene 2.5 bisa lanjut meski part tertinggal.
  - Scene 4 final cutscene hanya bisa dimulai jika tiga part id sudah terkumpul, boss/scene 3 selesai, dan part Scene 3 dikoleksi.
  - Backtracking ditambahkan:
    - sisi kiri Scene 2.5 -> Scene 2
    - sisi kiri Scene 3 -> Scene 2.5
  - Scene yang sudah dilewati dan dikunjungi ulang tidak respawn alien.
  - Boss patrol dibatasi ke sekitar 30% area kanan platform dan chase dimatikan agar tidak mengejar sampai player.
  - Direction boss projectile dihitung dari center boss/player tepat sebelum spawn bullet.
  - Visual flip boss dipisahkan dari alien biasa agar arah sprite dan arah tembakan selaras.
  - HUD dikecilkan: icon astronaut, hearts, ammo/bullet, dan objective sekarang dikelompokkan di kiri atas.

- `src/scene.ts`
  - Menambahkan `backPortal` untuk Scene 2, Scene 2.5, dan Scene 3 layout.

### Verification

- `npx -p typescript tsc --noEmit` -> success
- `npm run build` -> success
- Screenshot baru:
  - `verification/scene2-aim-hud-portal-recheck.png`
  - `verification/scene2_5-back-portal-recheck.png`
  - `verification/scene3-boss-portal-recheck.png`

### Notes

- Full-access automatic permission tidak bisa diubah dari kode project; itu mengikuti sandbox/approval Codex session.

---

## 2026-06-27 Follow-up: Scene 4 Walk-to-Repair Animation

### Changes

- `src/scene.ts`
  - Menambahkan `repairPlatform` ke `LAST_SCENE_LAYOUT`.
  - Menambahkan `repairWalk` untuk posisi awal jalan dan posisi kerja astronaut.

- `src/main.ts`
  - Menambahkan `drawLastSceneRepairPlatform()` untuk platform kecil di atas mound menuju rocket.
  - Scene 4 sekarang memakai timeline:
    - awal cutscene: astronaut berjalan dari kiri platform ke rocket,
    - setelah sampai: ikon repair dan fragment rocket aktif,
    - akhir cutscene: rocket terlihat selesai diperbaiki.
  - Animasi astronaut diberi step bob saat berjalan dan gerak kecil saat memperbaiki.

### Verification

- `npx -p typescript tsc --noEmit` -> success
- `npm run build` -> success
- Screenshot baru:
  - `verification/scene4-walk-to-rocket.png`
  - `verification/scene4-repair-platform.png`
