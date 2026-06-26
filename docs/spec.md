# Planet of the Unbound — Software Specification

> **Version:** 1.1 (revised after commit 66b42c2)  
> **Date:** 2026-06-24 (revised 2026-06-25)  
> **Type:** Browser-based 2D Platformer Shooter Prototype  
> **Engine:** HTML5 Canvas + TypeScript (esbuild bundled)

---

## 1. Game Overview

**Title:** Planet of the Unbound  
**Genre:** 2D Platformer Shooter  
**Platform:** Web Browser  
**Prototype Duration:** ~60–90 seconds total gameplay (excluding cutscenes)  
**Audio:** Silent (no sound effects, no background music)

**Synopsis:**  
Seorang astronot terdampar di planet asing yang dipenuhi hutan rimbun. Untuk kembali ke bumi, astronot harus menjelajahi 3 area berbeda, mengumpulkan 3 rocket parts, mengalahkan musuh termasuk boss alien besar, memperbaiki roket, dan melarikan diri dari planet.

---

## 2. Technology Stack

| Component       | Technology                        |
|-----------------|-----------------------------------|
| Rendering       | HTML5 Canvas API                  |
| Language        | TypeScript (ES6+) — compiled via esbuild |
| Backend         | None                              |
| Audio           | None                              |
| Build           | Static files, open `index.html`   |
| Browser Support | Chrome, Firefox, Edge, Safari     |

---

## 3. Project Structure

```
planet-of-the-unbound/
├── index.html
├── styles.css
├── src/
│   ├── main.js            # Entry point, game loop
│   ├── game.js            # Game state machine, scene manager
│   ├── player.js          # Player class (movement, health, ammo, invincibility)
│   ├── enemy.js           # Enemy classes (small alien, boss, UFO)
│   ├── projectile.js      # Projectile classes (laser, rock bullet, meteor, UFO bullet)
│   ├── scene.js           # Scene class (level data, platforms, objects)
│   ├── camera.js          # Camera system (follow, scroll, bounds)
│   ├── collision.js       # AABB collision detection & resolution
│   ├── ui.js              # HUD, menus, game over, victory screens
│   ├── input.js           # Keyboard & mouse input handler
│   ├── cutscene.js        # Cutscene player (Scene 1, 4, 5)
│   ├── constants.js       # Game constants (gravity, speed, sizes)
│   └── assets.js          # Asset loader (images)
├── assets/
│   └── images/
│       ├── astronaut_idle.png
│       ├── alien_shooter.png
│       ├── background_moon.png
│       ├── environment_plants.png
│       ├── rocket_broken.png
│       ├── meteor_projectile.png
│       ├── rocket_part_01.png
│       ├── rocket_part_02.png
│       ├── rocket_part_03.png
│       ├── leaf_decoration.png
│       ├── laser_bullet.png
│       ├── rocket_part_04.png
│       ├── rock_platform_large.png
│       ├── bullet_boss.png
│       ├── bridge_platform.png
│       ├── health_icon.png
│       ├── laser_weapon.png
│       ├── bush_decoration.png
│       ├── vine_ladder.png
│       ├── portal_effect.png
│       ├── rocket_part_05.png
│       ├── butterfly_background.png
│       ├── rocket_part_06.png
│       └── rocket_part_07.png
└── README.md
```

---

## 4. Asset Manifest

### 4.1 Character Sprites

| File Name              | Usage                          | Notes                          |
|------------------------|--------------------------------|--------------------------------|
| `astronaut_idle.png`   | Player character               | Main player sprite             |
| `alien_shooter.png`    | Small alien enemy              | Used for normal enemies        |

### 4.2 Environment

| File Name               | Usage                    | Notes                          |
|-------------------------|--------------------------|--------------------------------|
| `background_moon.png`   | Background moon          | Parallax background element    |
| `environment_plants.png`| Environment plants       | Background vegetation          |
| `leaf_decoration.png`   | Leaf decoration          | Vine/leaf visual on bridges    |
| `bush_decoration.png`   | Bush decoration          | Bottom layer foliage           |
| `vine_ladder.png`       | Climbable vines          | Used in Scene 1 climbing area  |
| `butterfly_background.png` | Background butterflies | Ambient background particles   |

### 4.3 Platforms

| File Name              | Usage                    | Notes                          |
|------------------------|--------------------------|--------------------------------|
| `bridge_platform.png`  | Bridge platform          | Main platform used in Scene 2 & 3 |
| `rock_platform_large.png` | Large rock platform  | Alternative platform variant   |

### 4.4 Projectiles

| File Name              | Usage                    | Notes                          |
|------------------------|--------------------------|--------------------------------|
| `laser_bullet.png`     | Player laser projectile  | Fired by player, horizontal    |
| `bullet_boss.png`      | Boss rock bullet         | Thrown by boss alien           |
| `meteor_projectile.png`| Boss meteor ulti         | One-time AoE attack from above |

### 4.5 Collectibles & Objects

| File Name              | Usage                    | Notes                          |
|------------------------|--------------------------|--------------------------------|
| `rocket_part_01.png`   | Rocket part 1            | Collectible in Scene 2         |
| `rocket_part_02.png`   | Rocket part 2            | Collectible in Scene 3         |
| `rocket_part_03.png`   | Rocket part 3            | Collectible in Scene 3 (post-boss) |
| `rocket_broken.png`    | Broken rocket            | Scene 4 & 5 key object         |
| `portal_effect.png`    | Portal                   | Scene transition marker        |
| `laser_weapon.png`     | Laser weapon icon        | HUD weapon display             |
| `health_icon.png`      | Health icon              | HUD health display             |

---

## 5. Game State Machine

```
┌─────────┐
│  MENU   │ ← Start Game
└────┬────┘
     ↓
┌─────────────┐
│  CONTROLS   │ ← Interactive controls screen
└────┬────────┘
     ↓
┌──────────┐
│ PLAYING  │ ← Main gameplay (Scene 1–5)
└──┬───┬───┘
   │   │
   ↓   ↓
┌──────┐  ┌──────────┐
│PAUSED│  │ GAME_OVER│ ← Health reaches 0
└──┬───┘  └────┬─────┘
   │           │
   ↓           ↓
┌──────────┐  ┌──────────┐
│ PLAYING  │  │ VICTORY  │ ← All rocket parts + reach rocket
└──────────┘  └──────────┘
```

### State Transitions

| From         | To           | Trigger                           |
|--------------|--------------|-----------------------------------|
| MENU         | CUTSCENE     | Start Game pressed (Space/Click)  |
| CUTSCENE     | PLAYING      | Cutscene ends (auto)              |
| PLAYING      | PAUSED       | Esc pressed                       |
| PAUSED       | PLAYING      | Resume clicked                    |
| PAUSED       | MENU         | Quit clicked                      |
| PLAYING      | GAME_OVER    | Player HP reaches 0               |
| GAME_OVER    | PLAYING      | Restart clicked (back to Scene 1) |
| GAME_OVER    | MENU         | Back to Menu clicked              |
| PLAYING      | VICTORY      | Scene 5 cutscene complete         |
| VICTORY      | PLAYING      | Restart clicked                   |
| VICTORY      | MENU         | Back to Menu clicked              |

> **⚠️ Revisi v1.1:** CONTROLS screen dihapus dari flow. MENU → langsung ke CUTSCENE (Scene 1). Alasan: menyederhanakan onboarding, player belajar sambil bermain.

---

## 6. Scene Descriptions

### 6.0 Gameplay Flow

```
Scene 1 (Cutscene, 3s)
    ↓ walk off screen
Scene 2 (Playable, horizontal scroll)
    ↓ walk into portal
Scene 3 (Playable, horizontal scroll)
    ↓ walk off screen
Scene 4 (Cutscene, 5s)
    ↓ auto transition
Scene 5 (Cutscene, 8s)
    ↓ auto transition
Victory Screen
```

**Important:** No backtracking. Each scene has a barrier preventing return to previous scenes.

---

### 6.1 Scene 1 — Vine Climbing (Cutscene)

**Type:** Cutscene (automatic, no player control)  
**Duration:** 3 seconds  
**Camera:** Vertical scroll (follows astronaut climbing upward)  
**Enemies:** None  
**Collectibles:** None

**Layout:**
- Two vine structures (vine_ladder.png) — one left, one right
- Behind left vine: dark forest trees (environment_plants.png)
- Behind right vine: dense leafy branches (leaf_decoration.png)
- Bridge platform at the top (bridge_platform.png)
- Butterflies in background (butterfly_background.png)
- Fog/atmospheric layer

**Cutscene Sequence:**
1. Astronaut appears at bottom of scene
2. Astronaut climbs the right vine upward
3. Camera scrolls vertically following astronaut
4. Astronaut reaches the bridge platform at top
5. Scene ends → instant transition to Scene 2

**Visual Notes:**
- Dense alien forest atmosphere
- Thin fog layer
- White particles floating in background

---

### 6.2 Scene 2 — First Encounter (Playable)

**Type:** Playable level  
**Camera:** Horizontal scroll (follows player)  
**Enemies:** 1 Small Alien (2 HP)  
**Collectibles:** 1 Rocket Part  
**Battery:** 8 (auto-refill on scene entry)

**Layout (revised v1.1):**
- 4 bridge_platform arranged in 2 tiers (bukan 3 sejajar)
- Bottom tier: 3 bridges di y=645, y=625, y=610 (lebar 400-650)
- Upper tier: 1 bridge di y=245 (lebar 430)
- Left bridge: astronaut entry point (from Scene 1)
- Upper bridge: rocket_part_02.png (collectible)
- Right bridge: small alien patrol area
- Portal at upper area (portal_effect.png) — transition to Scene 3
- Vine decorations growing upward from bridges
- Forest/bush layer at bottom (bush_decoration.png)
- Background: moon (background_moon.png), butterflies, fog (parallax layers)
- Void below bridges (fall damage)

> **⚠️ Revisi v1.1:** World size diperbesar dari 1200x600 ke 1920x1080. Platform layout berubah total — sekarang 4 platform bertingkat (bukan 3 sejajar). Player spawn di (95, 580). Portal di (900, 180, 70x90).

**Platform Details (revised):**
- 4 bridges dalam 2 tier (bottom + upper)
- Bottom tier: 3 bridges dengan gap kecil
- Upper tier: 1 bridge sebagai tujuan
- Gaps require jumping to cross
- Falling into gap = fall damage (void)

**Enemy Behavior (Small Alien):**
- Patrols right bridge area
- Detects player within range
- Moves toward player (chase behavior)
- Deals 1 damage on contact
- 2 HP (dies after 2 laser hits)

---

### 6.3 Scene 3 — Boss Area (Playable)

**Type:** Playable level (boss fight)  
**Camera:** Horizontal scroll (wider arena)  
**Enemies:** 1 Small Alien (2 HP) + 1 Boss Alien (5 HP) + 1 UFO (2 HP)  
**Collectibles:** 1 Rocket Part (appears after boss is defeated)  
**Battery:** 8 (auto-refill on scene entry)

**Layout:**
- Single long bridge_platform spanning the full arena width
- Flat arena — horizontal movement only
- Vine hanging from above (decoration)
- Forest/bushes at bottom
- Butterflies in background
- Void below bridge (fall damage)

**Gameplay Sequence:**
1. Astronaut enters from left side
2. Small alien appears from right edge, chases player
3. Boss alien appears from right edge (larger sprite)
4. UFO appears from top-right area
5. Player must fight all 3 enemies while dodging attacks
6. After boss is defeated, rocket_part appears
7. Player collects rocket part → objective complete
8. Player walks off right side → transition to Scene 4

**Enemy Behaviors:**

**Small Alien (2 HP):**
- Appears from right edge of screen
- Chases player horizontally
- Deals 1 damage on contact
- Dies after 2 laser hits

**Boss Alien (5 HP):**
- Appears from right edge of screen (larger sprite)
- Chases player
- Attack 1: Throws rock bullets (bullet_boss.png) toward player
  - Multiple rocks thrown in sequence
  - Rocks travel horizontally toward player position
- Attack 2: Meteor ulti (one-time)
  - Meteor falls from above at random positions
  - Not auto-targeted (random placement)
  - Player must dodge by moving
  - Only triggers once during the fight
- Deals 1 damage on contact
- Dies after 5 laser hits

**UFO (2 HP):**
- Appears from top-right area
- Floats/moves in upper portion of arena
- Shoots aimed bullets toward player
- Bullets travel toward player position
- Deals 1 damage on bullet contact
- Dies after 2 laser hits

**Post-Boss:**
- After boss dies, remaining small alien and UFO can still attack
- Rocket part spawns in arena
- Player collects it → all 3 parts collected
- Objective text updates: "Return to the rocket"
- Player walks off right → Scene 4

---

### 6.4 Scene 4 — Rocket Repair (Cutscene)

**Type:** Cutscene (automatic, no player control)  
**Duration:** 5 seconds  
**Camera:** Single screen (no scroll)  
**Enemies:** None  
**Layout:** Forest clearing with broken rocket

**Cutscene Sequence:**
1. Scene opens showing broken rocket (rocket_broken.png) in forest clearing
2. Astronaut stands near rocket
3. Repair icons appear (gear and wrench visual)
4. Animation shows rocket being repaired
5. Rocket status changes to "repaired"
6. Scene ends → instant transition to Scene 5

**Visual Notes:**
- Alien forest environment
- Broken rocket as central object
- Repair animation (simple visual effect)

---

### 6.5 Scene 5 — Rocket Launch (Cutscene)

**Type:** Cutscene (automatic, no player control)  
**Duration:** 8 seconds  
**Camera:** Single screen (no scroll)  
**Enemies:** None  
**Layout:** Same forest clearing as Scene 4

**Cutscene Sequence:**
1. Astronaut enters rocket
2. Rocket engines ignite (flame/thrust effect at bottom)
3. Rocket slowly lifts off from ground
4. Rocket accelerates upward
5. Rocket exits screen upward
6. Background shows alien forest and planet
7. Fade to Victory Screen

**Visual Notes:**
- Rocket launch with thrust effect
- Camera may slightly follow rocket upward
- Alien forest visible in background

---

## 7. Player System

### 7.1 Stats

| Stat               | Value     | Notes                              |
|--------------------|-----------|-------------------------------------|
| Health             | 3 HP      | No recovery during game             |
| Ammo (Battery)     | 8 shots   | Auto-refill on scene transition     |
| Invincibility      | 1 second  | After taking damage                 |
| Movement Speed     | Medium    | Tunable in constants.js             |
| Jump Strength      | Medium-High | Tunable in constants.js           |
| Gravity            | Enabled   | Standard platformer gravity         |
| Climb Speed        | Medium    | When on vine                        |

### 7.2 Actions

| Action            | Input              | Notes                              |
|-------------------|--------------------|-------------------------------------|
| Move Left         | A / Arrow Left     | Horizontal movement                 |
| Move Right        | D / Arrow Right    | Horizontal movement                 |
| Jump              | Space / W / Arrow Up | When grounded only                |
| Climb Up          | W / Arrow Up       | Only when touching vine             |
| Climb Down        | S / Arrow Down     | Only when touching vine             |
| Shoot Laser       | Left Click / J     | Fires projectile in facing direction |
| Restart           | R                  | Restarts from Scene 1               |
| Pause             | Esc                | Opens pause menu                    |

### 7.3 Damage Sources

| Source                    | Damage | Notes                              |
|---------------------------|--------|-------------------------------------|
| Enemy contact             | 1 HP   | Touching any enemy sprite           |
| Enemy projectile contact  | 1 HP   | Rock bullet, UFO bullet, meteor     |
| Fall into void            | 1 HP   | Falling below screen / off platform |

### 7.4 Invincibility System

- After taking damage, player becomes invincible for 1 second (1000ms)
- Player sprite blinks during invincibility
- Player cannot take additional damage during this period
- Visual: sprite opacity toggles between 100% and 50%

### 7.5 Death Condition

- When HP reaches 0:
  - GAME_OVER state triggered
  - Full restart from Scene 1 on restart
  - All progress lost (rocket parts, enemy kills)

---

## 8. Enemy System

### 8.1 Small Alien

| Property          | Value                              |
|-------------------|------------------------------------|
| HP                | 2                                  |
| Damage            | 1 (contact)                        |
| Behavior          | Chase player                       |
| Speed             | Medium (slower than player)        |
| Spawn             | Appears from right edge of screen  |
| Death             | Disappears with minimal effect     |
| Asset             | `alien_shooter.png`                |

**Behavior Details:**
- Patrols a small area initially
- Detects player within a defined range
- Moves toward player horizontally
- Deals damage on direct contact
- Dies after 2 laser hits
- Does not respawn

**Distribution:**
- Scene 2: 1 small alien
- Scene 3: 1 small alien

### 8.2 Boss Alien

| Property          | Value                              |
|-------------------|------------------------------------|
| HP                | 5                                  |
| Damage            | 1 (contact + projectiles)          |
| Behavior          | Chase + ranged attacks             |
| Speed             | Medium (similar to small alien)    |
| Size              | ~2x larger than small alien        |
| Spawn             | Appears from right edge of screen  |
| Death             | Defeated, rocket part spawns       |
| Asset             | `alien_shooter.png` (scaled up)    |

**Attack Patterns:**

**Rock Bullet Attack:**
- Throws rock bullets (bullet_boss.png) toward player
- Multiple rocks thrown in sequence
- Rocks travel horizontally
- Rocks destroyed on hitting wall/platform or player
- Periodic attack (every few seconds)

**Meteor Ulti (One-Time):**
- Triggers once during the fight (at specific HP threshold or time)
- Multiple meteors fall from above
- Meteors land at random positions across the arena
- NOT auto-targeted (random placement, player must read and dodge)
- Visual: flaming meteor falling from top of screen
- Uses `meteor_projectile.png` asset

**Distribution:**
- Scene 3: 1 boss alien

### 8.3 UFO

| Property          | Value                              |
|-------------------|------------------------------------|
| HP                | 2                                  |
| Damage            | 1 (projectile only)                |
| Behavior          | Float + aimed shots                |
| Speed             | Slow horizontal movement           |
| Position          | Upper portion of arena             |
| Spawn             | Appears from top-right             |
| Death             | Disappears with minimal effect     |
| Asset             | N/A (uses existing assets or placeholder) |

**Behavior Details:**
- Floats in upper area of arena
- Moves horizontally (slow patrol)
- Shoots bullets aimed at player position
- Bullets travel toward player
- Deals damage via projectiles only (no contact damage)
- Dies after 2 laser hits
- Does not respawn

**Distribution:**
- Scene 3: 1 UFO

---

## 9. Projectile System

### 9.1 Player Laser

| Property          | Value                              |
|-------------------|------------------------------------|
| Speed             | Fast (horizontal)                  |
| Direction         | Based on player facing direction   |
| Damage            | 1 per hit                          |
| Range             | Crosses full screen width          |
| Collision         | Destroyed on: enemy hit, wall hit, screen edge |
| Ammo Cost         | 1 per shot                         |
| Asset             | `laser_bullet.png`                 |

### 9.2 Boss Rock Bullet

| Property          | Value                              |
|-------------------|------------------------------------|
| Speed             | Medium (horizontal)                |
| Direction         | Toward player position at fire time |
| Damage            | 1 per hit                          |
| Collision         | Destroyed on: wall/platform hit, screen edge |
| Visual            | `bullet_boss.png`                  |

### 9.3 Boss Meteor

| Property          | Value                              |
|-------------------|------------------------------------|
| Speed             | Fast (vertical, falling)           |
| Direction         | Downward (from top of screen)      |
| Damage            | 1 per hit                          |
| Pattern           | Random positions (not player-targeted) |
| Count             | Multiple meteors in sequence       |
| Trigger           | One-time during boss fight         |
| Visual            | `meteor_projectile.png`            |

### 9.4 UFO Bullet

| Property          | Value                              |
|-------------------|------------------------------------|
| Speed             | Medium                             |
| Direction         | Aimed toward player position       |
| Damage            | 1 per hit                          |
| Collision         | Destroyed on: wall/platform hit, screen edge |
| Visual            | Placeholder or existing asset      |

---

## 10. Camera System

### 10.1 Camera Behavior Per Scene

| Scene  | Type             | Scroll Direction | Notes                        |
|--------|------------------|------------------|------------------------------|
| Scene 1| Vertical scroll  | Up               | Follows astronaut climbing   |
| Scene 2| Horizontal scroll| Left-Right       | Follows player movement      |
| Scene 3| Horizontal scroll| Left-Right       | Wider arena, follows player  |
| Scene 4| Single screen    | None             | Fixed camera, no scroll      |
| Scene 5| Single screen    | None             | Fixed camera, slight upward follow on launch |

### 10.2 Camera Properties

- **Follow Mode:** Smooth follow (lerp-based, not instant snap)
- **Smoothing Factor:** ~0.1 (tunable in constants.js)
- **Bounds:** Camera clamped to scene boundaries (viewport-aware: max = worldSize - viewportSize)
- **Vertical Offset:** Camera keeps player slightly below center (better visibility ahead)
- **Horizontal Offset:** Camera keeps player slightly left of center (more view in direction of movement)

> **⚠️ Revisi v1.1:** Camera bounds sekarang memperhitungkan viewport size. `boundsMaxX = worldWidth - viewportWidth` (sebelumnya hanya `worldWidth`). Ini mencegah camera menampilkan area di luar level. `snapCamera()` juga sekarang memanggil clamp function.

### 10.3 Scene Boundaries

- Each scene has defined min/max X and Y coordinates
- Camera cannot scroll beyond these bounds
- Player cannot move beyond scene boundaries (blocked by invisible walls or edge of platforms)

---

## 11. Collision System

### 11.1 Collision Type

**AABB (Axis-Aligned Bounding Box)** — simple rectangular collision detection.

### 11.2 Collision Matrix

| Object A            | Object B              | Response                        |
|---------------------|-----------------------|---------------------------------|
| Player              | Platform              | Land on top (ground collision)  |
| Player              | Vine                  | Allow climbing                  |
| Player              | Enemy (contact)       | Deal 1 damage to player         |
| Player              | Enemy projectile      | Deal 1 damage to player         |
| Player              | Rocket part           | Collect item                    |
| Player              | Void (off-screen)     | Deal 1 damage to player         |
| Player              | Scene barrier         | Block movement (no backtracking)|
| Player              | Portal                | Transition to next scene        |
| Laser               | Enemy                 | Deal 1 damage to enemy          |
| Laser               | Platform / Wall       | Destroy laser                   |
| Laser               | Screen edge           | Destroy laser                   |
| Enemy projectile    | Platform / Wall       | Destroy projectile              |
| Enemy projectile    | Screen edge           | Destroy projectile              |
| Enemy               | Platform              | Ground collision (walk on top)  |
| Meteor              | Platform              | Destroy meteor (visual impact)  |
| Meteor              | Player                | Deal 1 damage to player         |

### 11.3 Collision Resolution

- **Player vs Platform:** Resolve vertically (push player up to platform surface)
- **Player vs Enemy:** Push player away from enemy center (knockback direction based on relative position)
- **Player vs Projectile:** Destroy projectile, apply damage
- **Player vs Collectible:** Destroy collectible, apply effect (add rocket part)

### 11.4 Edge Cases

- **High-velocity falling:** May pass through thin platforms → use swept AABB or limit max fall speed
- **Corner collision:** Player touching corner of two platforms → resolve against the platform with largest overlap
- **Invincibility collision:** During invincibility frames, collision detection still runs but damage is not applied
- **Multiple damage sources in same frame:** Only apply one instance of damage per frame (prevent multi-hit in single frame)

---

## 12. UI / HUD System

### 12.1 HUD Layout (During Gameplay)

Positioned at top-left corner of screen, persistent during Scene 2 and Scene 3.

```
┌──────────────────────────────────────┐
│ ┌────────┐                           │
│ │Portrait│  ♥ ♥ ♥                     │
│ │  Astr  │  🔫  ━━━  X 8             │
│ └────────┘                           │
│                                      │
│           [Gameplay Area]            │
│                                      │
└──────────────────────────────────────┘
```

**Elements:**
1. **Portrait Box:** Astronaut sprite in bordered box (top-left)
2. **Health:** 3 heart icons (health_icon.png), filled = alive, empty = lost
3. **Weapon Icon:** Laser weapon icon (laser_weapon.png)
4. **Ammo Display:** Bullet icon + "X" + remaining ammo number
5. **Objective Text:** Centered below HUD, shows current objective

### 12.2 Objective Text Updates

| Trigger                           | Objective Text                        |
|-----------------------------------|---------------------------------------|
| Scene 2 start                     | "Find the missing rocket parts"       |
| First rocket part collected       | "Rocket Parts: 1/3"                   |
| Second rocket part collected      | "Rocket Parts: 2/3"                   |
| All parts collected (Scene 3)     | "All parts found! Return to rocket"   |
| Scene 4 cutscene                  | (no HUD, cutscene)                    |
| Scene 5 cutscene                  | (no HUD, cutscene)                    |

### 12.3 Ammo Empty Display

When battery reaches 0:
- Ammo text changes to "EMPTY" in red
- Player cannot shoot until scene transition (auto-refill)

### 12.4 Main Menu Screen

**Type:** Full screen (Canvas-rendered)

**Elements:**
- Full-screen cover image: `start_screen.jpg` (center-crop scaled)
- 5 animated floating butterflies (sine-wave motion)
- No visible text buttons — press Space or Click to start

**Interactions:**
- Press Space / Click → transition directly to CUTSCENE (Scene 1)

> **⚠️ Revisi v1.1:** Menu berubah dari teks statis + tombol ke full-screen cover image. CONTROLS screen dihapus — player langsung masuk game.

### 12.5 Controls Screen

**Type:** Full screen, interactive

**Elements:**
- Title: "Controls"
- Interactive control list:

| Input               | Action              |
|---------------------|---------------------|
| A / Arrow Left      | Move Left           |
| D / Arrow Right     | Move Right          |
| W / Arrow Up        | Climb Up / Jump     |
| S / Arrow Down      | Climb Down          |
| Space               | Jump                |
| Left Click / J      | Shoot Laser         |
| R                   | Restart             |
| Esc                 | Pause               |

- Player can try controls directly on this screen
- Small playable area or demo space to test movement
- "Back" button to return to Main Menu
- "Start" button to begin game

### 12.6 Pause Menu

**Type:** Overlay on gameplay (semi-transparent dark background)

**Elements:**
- Title: "PAUSED"
- Button: "Resume" → returns to PLAYING state
- Button: "Quit" → returns to MENU state

**Trigger:** Esc key during gameplay

### 12.7 Game Over Screen

**Type:** Full screen (PPT slide style, new screen)

**Elements:**
- Title: "GAME OVER"
- Subtitle: "The astronaut did not survive..."
- Button: "Restart" → restart from Scene 1
- Button: "Back to Menu" → returns to MENU state
- Dark/red atmospheric background

### 12.8 Victory Screen

**Type:** Full screen (PPT slide style, new screen)

**Elements:**
- Title: "MISSION COMPLETE"
- Subtitle lines:
  - "All rocket parts recovered."
  - "Rocket repaired successfully."
  - "Astronaut escaped the planet."
- Button: "Restart" → restart from Scene 1
- Button: "Back to Menu" → returns to MENU state
- Triumphant/atmospheric background

---

## 13. Cutscene System

### 13.1 Cutscene Timing

| Scene  | Duration | Camera            | Player Control |
|--------|----------|-------------------|----------------|
| Scene 1| 3 sec    | Vertical scroll   | None (auto)    |
| Scene 4| 5 sec    | Fixed single screen| None (auto)   |
| Scene 5| 8 sec    | Fixed single screen| None (auto)   |

### 13.2 Cutscene Behavior

- No player input accepted during cutscene
- Cutscenes play automatically from start to end
- No skip button (cutscenes are short)
- Transitions are instant (no fade or animation)
- Cutscenes use game sprites and simple animations

### 13.3 Cutscene Implementations

**Scene 1 — Vine Climbing:**
- Pre-defined path for astronaut sprite
- Astronaut moves upward along vine
- Camera scrolls vertically to follow
- 3-second duration

**Scene 4 — Rocket Repair:**
- Static scene with broken rocket
- Astronaut sprite near rocket
- Repair icon animation (gear/wrench pulsing)
- Rocket visual changes from broken to repaired
- 5-second duration

**Scene 5 — Rocket Launch:**
- Astronaut enters rocket (sprite disappears into rocket)
- Engine flame effect appears at rocket bottom
- Rocket moves upward slowly
- Rocket accelerates and exits screen
- Camera may slightly follow upward
- 8-second duration, then Victory Screen

---

## 14. Scene Transition System

### 14.1 Transition Type

**Instant switch** — scene changes immediately with no animation, fade, or transition effect.

### 14.2 Transition Triggers

| From Scene | To Scene | Trigger                                  |
|------------|----------|------------------------------------------|
| Scene 1    | Scene 2  | Cutscene ends (auto, 3 sec)              |
| Scene 2    | Scene 3  | Player walks into portal (right side)     |
| Scene 3    | Scene 4  | Player walks off right edge (after boss)  |
| Scene 4    | Scene 5  | Cutscene ends (auto, 5 sec)              |
| Scene 5    | Victory  | Cutscene ends (auto, 8 sec)              |

### 14.3 Barrier System

- Each scene has a left-side barrier preventing backtracking
- Player cannot walk back to previous scene
- Barrier is invisible wall at scene entry point
- Applies to both Scene 2 and Scene 3

### 14.4 State on Transition

| Data              | Behavior                              |
|-------------------|---------------------------------------|
| Player HP         | Persist (carries over between scenes) |
| Player Ammo       | Reset to 8 (auto-refill)              |
| Rocket Parts      | Persist (collected stays collected)   |
| Enemy HP          | Reset per scene (fresh enemies)       |
| Camera            | Reset to scene start position         |
| Player Position   | Reset to scene entry point            |

---

## 15. Visual Effects (Minimal)

### 15.1 Effects List

| Trigger            | Effect                                  |
|--------------------|-----------------------------------------|
| Player shoots laser| Small muzzle flash at weapon tip        |
| Laser hits enemy   | Brief flash on enemy sprite             |
| Enemy dies         | Enemy sprite disappears (simple fade)   |
| Player takes damage| Screen flash red (brief)                |
| Rocket part collected | Brief sparkle/glow on collectible    |
| Boss meteor lands  | Small impact effect at landing point    |

### 15.2 Background Particles

- Butterflies floating in background (passive, non-interactive)
- Thin fog layer (atmospheric)
- White particles floating (ambient)

These are decorative only and do not affect gameplay.

---

## 16. Input System

### 16.1 Input Mapping

```javascript
const INPUT = {
    moveLeft:    ['KeyA', 'ArrowLeft'],
    moveRight:   ['KeyD', 'ArrowRight'],
    climbUp:     ['KeyW', 'ArrowUp'],
    climbDown:   ['KeyS', 'ArrowDown'],
    jump:        ['Space', 'KeyW', 'ArrowUp'],
    shoot:       ['KeyJ', 'Mouse0'],  // Mouse0 = left click
    restart:     ['KeyR'],
    pause:       ['Escape']
};
```

### 16.2 Input Behavior

- Movement: held down = continuous movement
- Jump: single press = jump (not held)
- Shoot: single press per shot (not autofire)
- Climb: held down = continue climbing
- Pause: single press toggles pause

### 16.3 Input Blocking

- No input accepted during cutscenes (Scene 1, 4, 5)
- No input accepted on Menu, Controls, Game Over, Victory screens
- Movement input blocked during invincibility knockback (brief)

---

## 17. Platform Layout Specifications

### 17.1 Scene 2 Platforms

```
Scene 2 Layout (side view, revised v1.1):

    [Portal]
      |
    ┌─────────────┐
    │ Upper Bridge│  ← rocket_part_02 (y=245, w=430)
    └─────────────┘

    ┌──────────────────┐
    │   Bridge 1       │  ← Entry from Scene 1 (y=645, w=400)
    └──────────────────┘

              ┌────────────────────────────┐
              │       Bridge 2             │  ← Middle area (y=625, w=605)
              └────────────────────────────┘

                        ┌──────────────────────────────────┐
                        │           Bridge 3               │  ← Small Alien area (y=610, w=650)
                        └──────────────────────────────────┘

    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← Void (y=1120)
```

- 4 bridges dalam 2 tier (bottom + upper)
- Bottom tier: 3 bridges dengan gap kecil
- Upper tier: 1 bridge sebagai tujuan utama
- Void lebih dalam (y=1120) dibanding sebelumnya (y=500)
- World size: 1920 x 1080 (dari 1200 x 600)

### 17.2 Scene 3 Platform

```
Scene 3 Layout (side view):

    ┌─────────────────────────────────────────────┐
    │              Single Long Bridge              │  ← Flat arena
    └─────────────────────────────────────────────┘
    
    Astronaut ←→ Small Alien ←→ Boss Alien
                    UFO (above)
    
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← Void
```

- One continuous flat platform
- Full width of arena
- All enemies on same platform
- UFO floats above
- Void below = fall damage

---

## 18. Constants & Tuning Values

```javascript
// constants.js

export const GAME = {
    GRAVITY: 0.5,
    MAX_FALL_SPEED: 12,
    FRICTION: 0.8,
};

export const PLAYER = {
    SPEED: 4,
    JUMP_FORCE: -10,
    CLIMB_SPEED: 3,
    MAX_HP: 3,
    MAX_AMMO: 8,
    INVINCIBILITY_DURATION: 1000,  // ms
    WIDTH: 48,
    HEIGHT: 64,
};

export const ENEMIES = {
    SMALL_ALIEN: {
        HP: 2,
        SPEED: 2,
        DAMAGE: 1,
        DETECTION_RANGE: 300,
    },
    BOSS_ALIEN: {
        HP: 5,
        SPEED: 1.5,
        DAMAGE: 1,
        ROCK_ATTACK_INTERVAL: 2000,  // ms between rock throws
        METEOR_TRIGGER_HP: 3,        // triggers at 3 HP remaining
        METEOR_COUNT: 5,
        METEOR_INTERVAL: 500,        // ms between each meteor
    },
    UFO: {
        HP: 2,
        SPEED: 1,
        DAMAGE: 1,
        SHOOT_INTERVAL: 3000,        // ms between shots
    },
};

export const PROJECTILES = {
    LASER: {
        SPEED: 10,
        DAMAGE: 1,
    },
    ROCK_BULLET: {
        SPEED: 5,
        DAMAGE: 1,
    },
    METEOR: {
        SPEED: 8,
        DAMAGE: 1,
    },
    UFO_BULLET: {
        SPEED: 6,
        DAMAGE: 1,
    },
};

export const CAMERA = {
    SMOOTHING: 0.1,
    OFFSET_X: -150,   // player slightly left of center
    OFFSET_Y: 100,    // player slightly below center
};

export const SCENES = {
    SCENE_1_DURATION: 3000,   // ms
    SCENE_4_DURATION: 5000,   // ms
    SCENE_5_DURATION: 8000,   // ms
};
```

---

## 19. Development Milestones

> **Status per commit 66b42c2:** Milestone 1-4 ✅, Milestone 9 partial ✅

### Milestone 1 — Project Setup ✅
- [x] Create project structure (folders, files)
- [x] Setup HTML with Canvas element
- [x] Implement responsive canvas sizing
- [x] Create game loop (requestAnimationFrame)
- [x] Implement input handler (keyboard + mouse)
- [x] Load and display placeholder sprites

### Milestone 2 — Player Movement ✅
- [x] Left/right movement with friction
- [x] Gravity system
- [x] Jump mechanic
- [x] Ground collision (platform landing)
- [x] Basic animation states (idle, walk, jump, climb)

### Milestone 3 — Scene 1 Cutscene ✅
- [x] Vertical scrolling camera
- [x] Vine climbing animation (auto)
- [x] 3-second cutscene timer
- [x] Transition to Scene 2

### Milestone 4 — Scene 2 Level ✅
- [x] Create 4 bridge platforms (revised dari 3)
- [x] Horizontal scroll camera
- [x] Platform collision
- [x] Void detection (fall damage)
- [x] Portal transition to Scene 3
- [x] Barrier system (no backtracking)

### Milestone 5 — Shooting System 🔲
- [ ] Laser projectile creation
- [ ] Laser horizontal movement
- [ ] Ammo system (8 shots)
- [ ] Laser collision (enemy, wall, screen edge)
- [ ] Muzzle flash effect

### Milestone 6 — Enemies 🔲
- [ ] Small alien: movement, chase behavior, HP
- [ ] Enemy-player collision (damage)
- [ ] Enemy death (HP reaches 0)
- [ ] Boss alien: movement, rock bullet attack
- [ ] Boss meteor ulti (one-time, random)
- [ ] UFO: movement, aimed shots
- [ ] All enemy projectile systems

### Milestone 7 — Scene 3 Boss Arena 🔲
- [ ] Create flat arena platform
- [ ] Enemy spawn system (appear from edges)
- [ ] Boss fight flow (small alien → boss + UFO)
- [ ] Rocket part spawn after boss defeat
- [ ] Transition to Scene 4

### Milestone 8 — Cutscenes (Scene 4 & 5) 🔲
- [ ] Scene 4: Rocket repair cutscene (5 sec)
- [ ] Scene 5: Rocket launch cutscene (8 sec)
- [ ] Victory screen trigger

### Milestone 9 — UI & Menus ⚠️ (partial)
- [x] Main menu screen (cover image + animated butterflies)
- [x] ~~Interactive controls screen~~ — DIHAPUS dari flow (v1.1)
- [x] HUD (health, ammo, portrait, objective text)
- [x] Pause menu (Resume + Quit)
- [ ] Game over screen (PPT style)
- [ ] Victory screen (PPT style)

### Milestone 10 — Collectibles & Objective 🔲
- [ ] Rocket part collectible logic
- [ ] Counter display (0/3 → 1/3 → 2/3 → 3/3)
- [ ] Objective text updates
- [ ] "Return to rocket" trigger after 3/3

### Milestone 11 — Polish 🔲
- [ ] Invincibility frames (blinking effect) — partial: alpha toggle ada
- [ ] Minimal visual effects (muzzle flash, hit flash, pickup sparkle)
- [x] Background particles (butterflies, fog)
- [x] Camera smoothing (lerp)
- [ ] Balance tuning (speed, HP, ammo, timing)

### Milestone 12 — Testing & Bug Fixes 🔲
- [ ] Full playthrough test (start to victory)
- [ ] Death and restart test
- [ ] All collision edge cases
- [ ] Browser compatibility test
- [ ] Performance optimization

---

## 20. Acceptance Criteria

The prototype is COMPLETE when:

- [ ] Game opens in browser (index.html)
- [ ] Main menu displays with "Start Game" button
- [ ] Controls screen is interactive (player can test controls)
- [ ] Scene 1 plays as 3-second cutscene (vine climbing)
- [ ] Scene 2 is playable (3 bridges, 1 alien, 1 rocket part)
- [ ] Player can move, jump, climb, and shoot
- [ ] Player has 3 HP displayed in HUD
- [ ] Player has 8 ammo displayed in HUD
- [ ] Ammo auto-refills on scene transition
- [ ] Enemies deal damage on contact/projectile
- [ ] Player can kill enemies with laser
- [ ] Boss alien throws rock bullets and meteor ulti
- [ ] UFO shoots aimed bullets
- [ ] 3 rocket parts can be collected (1 per scene)
- [ ] Objective text updates correctly
- [ ] Scene 3 boss fight is completable
- [ ] Scene 4 plays as 5-second cutscene (rocket repair)
- [ ] Scene 5 plays as 8-second cutscene (rocket launch)
- [ ] Victory screen displays on completion
- [ ] Game Over screen displays when HP reaches 0
- [ ] Restart works from Game Over and Victory
- [ ] Pause menu works (Resume + Quit)
- [ ] No backtracking between scenes (barriers work)
- [ ] Fall damage works (void = damage)
- [ ] Invincibility frames work (1 sec blink)
- [ ] No audio (silent prototype)
- [ ] Canvas is responsive (adapts to browser window)
- [ ] Game runs at 60fps without lag

---

## 21. Future Considerations (Post-Prototype)

Not part of this prototype, but noted for future development:

- Sound effects and background music
- More enemy types (thorn plant, etc.)
- Additional levels / worlds
- Save system
- Score system
- More rocket parts (7 available in assets)
- Animated sprite sheets
- Parallax scrolling backgrounds
- Particle systems (dust, leaves, sparks)
- Mobile touch controls

---

*End of Specification*
