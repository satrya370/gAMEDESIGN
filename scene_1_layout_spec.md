# Scene 1 Cutscene — Pixel-Perfect Layout Specification

## Canvas Dimensions
- **Max canvas**: 1920 × 1080 (scaled to fit window)
- **Aspect ratio**: 16:9

---

## REFERENCE LAYOUT (scene_01.png)

The reference image defines the following pixel-perfect layout:

### 1. Background
- **Color**: `#f7f7f4` (off-white/cream)
- **Fill**: Full canvas

### 2. Scene Area
- **Top**: y ≈ 0 (scene starts at the VERY TOP of the canvas)
- **Bottom**: y = canvas height (scene extends to very bottom)
- **Full height**: 100% of canvas height

### 3. Left Wall — bush_decoration
- **Position**: x = 0, y = 0 (top-left corner)
- **Width**: ~30% of canvas width
- **Height**: 100% of canvas (top to bottom, FULL)
- **Behavior**: Green bush foliage FILLS the entire left strip from y=0 to y=canvasHeight

### 4. Right Wall — leaf_decoration
- **Position**: x = leftWallWidth + gapWidth, y = 0 (top)
- **Width**: ~50% of canvas width
- **Height**: 100% of canvas (top to bottom, FULL)
- **Behavior**: Teal/green leaf FILLS the entire right strip from y=0 to y=canvasHeight

### 5. Gap (between walls)
- **Position**: Between left wall end and right wall start
- **Width**: ~20% of canvas width
- **Height**: 100% of canvas (full height)

### 6. Bridge Platform — bridge_platform
- **Position**: At the TOP of the scene
- **X**: Starts from left wall end, extends to right wall edge
- **Y**: y ≈ 0 (at the very top)
- **Width**: Spans gap + part of right wall
- **Height**: ~80px (natural aspect ratio of the bridge asset)
- **Behavior**: Fully visible at the top, connecting across the gap to the right wall

### 7. Left Vine — vine_ladder
- **Position**: Attached to the RIGHT EDGE of the bush (left wall)
- **X**: x ≈ wallLeftWidth (right edge of bush)
- **Y start**: y ≈ bridge bottom (near top)
- **Y end**: Extends most of the scene height (almost to bottom)
- **Width**: ~30px
- **Height**: ~70-80% of scene height

### 8. Right Vine — vine_ladder  
- **Position**: Attached to the LEFT EDGE of the leaf (right wall)
- **X**: x ≈ wallRightX (left edge of right wall)
- **Y start**: y ≈ bridge bottom (near top)
- **Y end**: Extends most of the scene height (almost to bottom)
- **Width**: ~30px
- **Height**: ~70-80% of scene height

### 9. Astronaut
- **Position**: ON the right vine, climbing upward
- **X**: x ≈ wallRightX - 30 (just left of the right vine)
- **Y**: Somewhere on the right vine (animated sliding up)
- **Size**: ~60 × 75 px

### 10. Butterflies
- **Position**: In the gap between walls
- **Count**: 3-4 butterflies
- **Positions**: Scattered throughout the gap area (top, middle, bottom)
- **Size**: ~20-28px each
- **Behavior**: Gentle floating animation

### 11. Fog/Clouds
- **Position**: In the gap area, background layer
- **Count**: 2-3 soft fog circles
- **Size**: ~160-180px radius
- **Alpha**: Very low (0.15-0.25), subtle gray/white

---

## CURRENT IMPLEMENTATION (drawCutscene function)

### Current Layout Values (from code at main.ts:576-659):
```typescript
const sceneTop = h * 0.30;           // ❌ Starts 30% from top
const sceneBottom = h;               // ✅ Ends at bottom
const sceneHeight = sceneBottom - sceneTop;  // = 70% of height

const wallLeftWidth = w * 0.30;      // 30% width for left wall
const gapWidth = w * 0.20;           // 20% width for gap
const wallRightWidth = w * 0.50;     // 50% width for right wall
const wallRightX = wallLeftWidth + gapWidth;  // = 50% from left
```

---

## EVERY VISUAL DIFFERENCE — DETAILED

### DIFFERENCE 1: Scene Top Position (CRITICAL)
| Aspect | Reference | Current | Fix |
|--------|-----------|---------|-----|
| sceneTop | y = 0 | y = h × 0.30 | Change to `sceneTop = 0` |
| Gap at top | None | 30% of canvas empty | Remove the 0.30 offset |

**Impact**: In the reference, the scene fills from the very top. In current, there's a large empty band at the top (30% of canvas). This causes ALL elements to be pushed down.

### DIFFERENCE 2: Left Wall bush_decoration Height
| Aspect | Reference | Current | Fix |
|--------|-----------|---------|-----|
| Y start | 0 | h × 0.30 | sceneTop = 0 |
| Y end | canvas height | canvas height | Same |
| Fill | FULL height, top to bottom | Only middle 70% | Fix sceneTop |
| Visual | Complete green strip | Partial with gap at top | Fix sceneTop |

### DIFFERENCE 3: Right Wall leaf_decoration Height
| Aspect | Reference | Current | Fix |
|--------|-----------|---------|-----|
| Y start | 0 | h × 0.30 | sceneTop = 0 |
| Y end | canvas height | canvas height | Same |
| Fill | FULL height, top to bottom | Only middle 70% | Fix sceneTop |
| Visual | Complete teal strip, full height | Partial strip, gap at top | Fix sceneTop |

### DIFFERENCE 4: Bridge Position
| Aspect | Reference | Current | Fix |
|--------|-----------|---------|-----|
| Y position | y = 0 (top of scene) | y = h × 0.30 | sceneTop = 0 |
| Visibility | Fully visible at top | Pushed down, potentially cut | Fix sceneTop |
| Width | Spans from left wall to right wall | wallRightWidth only | May need width adjustment |

### DIFFERENCE 5: Vine Left Position
| Aspect | Reference | Current | Fix |
|--------|-----------|---------|-----|
| Y start | Near top (bridge area) | h × 0.30 | sceneTop = 0 |
| Y end | Near bottom | h (canvas bottom) | Same |
| Visual | Connected to bush, visible full length | May appear floating if bush doesn't fill | Fix sceneTop |

### DIFFERENCE 6: Vine Right Position
| Aspect | Reference | Current | Fix |
|--------|-----------|---------|-----|
| Y start | Near top (bridge area) | h × 0.30 | sceneTop = 0 |
| Y end | Near bottom | h (canvas bottom) | Same |
| Visual | Connected to leaf, visible full length | May appear floating | Fix sceneTop |

### DIFFERENCE 7: Astronaut Position
| Aspect | Reference | Current | Fix |
|--------|-----------|---------|-----|
| X position | On right vine | wallRightX - 30 | Same |
| Y position | Animated on right vine | sceneTop + astronautY * sceneHeight | Fix sceneTop |
| Visual | Climbing right vine | May be mispositioned | Fix sceneTop |

### DIFFERENCE 8: Fog Position
| Aspect | Reference | Current | Fix |
|--------|-----------|---------|-----|
| Y center | In gap, spread vertically | sceneTop + sceneHeight * 0.4/0.6 | Fix sceneTop |
| X center | In gap area | wallLeftWidth + gapWidth / 2 | Same |
| Visual | Subtle in gap background | May be too low due to sceneTop | Fix sceneTop |

### DIFFERENCE 9: Butterfly Positions
| Aspect | Reference | Current | Fix |
|--------|-----------|---------|-----|
| Y positions | Spread in gap (top to bottom) | sceneTop + sceneHeight * 0.3/0.5/0.7 | Fix sceneTop |
| X positions | In gap area | wallLeftWidth + gapWidth * 0.3/0.6/0.5 | Same |
| Visual | Distributed throughout gap | Pushed down | Fix sceneTop |

### DIFFERENCE 10: Bridge Width/Visibility
| Aspect | Reference | Current | Fix |
|--------|-----------|---------|-----|
| Width | Full bridge spanning gap | wallRightWidth only | May need to span more |
| Height | 80px | 80px | Same |

---

## ROOT CAUSE ANALYSIS

**The primary issue is `sceneTop = h * 0.30`.**

In the reference image, the scene starts at the very TOP of the canvas (y=0). The current code starts the scene at 30% of the canvas height, leaving a large empty band at the top.

This single change cascades to ALL elements:
- bush_decoration: only covers middle 70% instead of full 100%
- leaf_decoration: only covers middle 70% instead of full 100%
- bridge: pushed down instead of being at the top
- vines: start lower than expected
- fog: positioned lower than reference
- butterflies: positioned lower than reference
- astronaut: animation range is wrong

---

## REQUIRED FIXES — PIXEL-PERFECT

### Fix 1: Scene Top Position
```typescript
// BEFORE (WRONG):
const sceneTop = h * 0.30;

// AFTER (CORRECT):
const sceneTop = 0;
```

### Fix 2: Ensure bush fills FULL height
```typescript
// Draw bush from TOP to BOTTOM of canvas
drawCroppedAsset(ctx, 'bush_decoration',
  0, 0,                    // x=0, y=0 (top-left)
  wallLeftWidth, h,        // width=30%, height=100%
  { alpha: 0.95 }
);
```

### Fix 3: Ensure leaf fills FULL height
```typescript
// Draw leaf from TOP to BOTTOM of canvas
drawCroppedAsset(ctx, 'leaf_decoration',
  wallRightX, 0,           // x=right wall start, y=0 (top)
  wallRightWidth, h,       // width=50%, height=100%
  { alpha: 0.95 }
);
```

### Fix 4: Bridge at top
```typescript
// Bridge at very top
drawCroppedAsset(ctx, 'bridge_platform',
  wallRightX, 0,           // x=right wall start, y=0
  wallRightWidth, 80,      // width=50%, height=80px
  { alpha: 0.95 }
);
```

### Fix 5: Vines from top to bottom
```typescript
// Left vine
drawCroppedAsset(ctx, 'vine_ladder',
  wallLeftWidth - 15, 0,   // x=right edge of bush, y=0
  30, h,                   // width=30px, height=100%
  { alpha: 0.90 }
);

// Right vine
drawCroppedAsset(ctx, 'vine_ladder',
  wallRightX - 15, 0,      // x=left edge of leaf, y=0
  30, h,                   // width=30px, height=100%
  { alpha: 0.90 }
);
```

### Fix 6: Fog positions
```typescript
// Fog in gap, centered vertically in full canvas
drawSoftFog(ctx, wallLeftWidth + gapWidth / 2, h * 0.35, 180, 0.25);
drawSoftFog(ctx, wallLeftWidth + gapWidth / 2 + 50, h * 0.55, 160, 0.20);
```

### Fix 7: Butterfly positions
```typescript
// Spread across full height in gap
const butterflies = [
  { bx: wallLeftWidth + gapWidth * 0.3, by: h * 0.25, ax: 30, ay: 20, sp: 1.2, ph: 0, sz: 25 },
  { bx: wallLeftWidth + gapWidth * 0.6, by: h * 0.45, ax: 25, ay: 15, sp: 0.8, ph: 1.5, sz: 20 },
  { bx: wallLeftWidth + gapWidth * 0.5, by: h * 0.65, ax: 35, ay: 25, sp: 1.0, ph: 3.0, sz: 28 },
];
```

### Fix 8: Astronaut animation range
```typescript
// Astronaut climbs from bottom to top of canvas
const astronautX = wallRightX - 30;
const astronautY = cs.astronautY * h;  // 0=top, 1=bottom
```

---

## COMPLETE CORRECTED drawCutscene FUNCTION

```typescript
function drawCutscene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const cs = getCutscene();
  const time = cs.elapsed / 1000;

  // Scene = 100% of screen height (FULL)
  const sceneTop = 0;
  const sceneBottom = h;
  const sceneHeight = h;

  // Pembagian lebar: 30% kiri, 20% tengah, 50% kanan
  const wallLeftWidth = w * 0.30;
  const gapWidth = w * 0.20;
  const wallRightWidth = w * 0.50;
  const wallRightX = wallLeftWidth + gapWidth;

  // 1. Background terang
  ctx.fillStyle = '#f7f7f4';
  ctx.fillRect(0, 0, w, h);

  // 2. Soft fog di gap (tengah) — background layer
  drawSoftFog(ctx, wallLeftWidth + gapWidth / 2, h * 0.35, 180, 0.25);
  drawSoftFog(ctx, wallLeftWidth + gapWidth / 2 + 50, h * 0.55, 160, 0.20);

  // 3. Tembok KIRI — bush (30% lebar, FULL scene height = 100%)
  drawCroppedAsset(ctx, 'bush_decoration',
    0, sceneTop,
    wallLeftWidth, sceneHeight,
    { alpha: 0.95 }
  );

  // 4. Vine Kiri — di sisi kanan bush (dekorasi)
  drawCroppedAsset(ctx, 'vine_ladder',
    wallLeftWidth - 15, sceneTop,
    30, sceneHeight,
    { alpha: 0.90 }
  );

  // 5. Vine Kanan — di sisi kiri leaf (dipanjat karakter)
  drawCroppedAsset(ctx, 'vine_ladder',
    wallRightX - 15, sceneTop,
    30, sceneHeight,
    { alpha: 0.90 }
  );

  // 6. Tembok KANAN — leaf (50% lebar, FULL scene height = 100%)
  drawCroppedAsset(ctx, 'leaf_decoration',
    wallRightX, sceneTop,
    wallRightWidth, sceneHeight,
    { alpha: 0.95 }
  );

  // 7. Bridge di atas kanan (menempel leaf)
  drawCroppedAsset(ctx, 'bridge_platform',
    wallRightX, sceneTop,
    wallRightWidth, 80,
    { alpha: 0.95 }
  );

  // 8. Butterflies di gap (tengah) — spread across full height
  const butterflies = [
    { bx: wallLeftWidth + gapWidth * 0.3, by: h * 0.25, ax: 30, ay: 20, sp: 1.2, ph: 0, sz: 25 },
    { bx: wallLeftWidth + gapWidth * 0.6, by: h * 0.45, ax: 25, ay: 15, sp: 0.8, ph: 1.5, sz: 20 },
    { bx: wallLeftWidth + gapWidth * 0.5, by: h * 0.65, ax: 35, ay: 25, sp: 1.0, ph: 3.0, sz: 28 },
  ];
  for (const b of butterflies) {
    const bx = b.bx + Math.sin(time * b.sp + b.ph) * b.ax;
    const by = b.by + Math.cos(time * b.sp * 1.23 + b.ph) * b.ay;
    const alpha = 0.55 + Math.sin(time * 2 + b.ph) * 0.20;
    drawCroppedAsset(ctx, 'butterfly_background',
      bx, by,
      b.sz, b.sz,
      { alpha }
    );
  }

  // 9. Astronaut slide up vine kanan
  // cs.astronautY: 0 = atas, 1 = bawah
  const astronautX = wallRightX - 30;
  const astronautY = sceneTop + cs.astronautY * sceneHeight;
  if (!drawCroppedAsset(ctx, 'astronaut_idle', astronautX, astronautY, 60, 75, { alpha: 1 })) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(astronautX, astronautY, PLAYER.WIDTH, PLAYER.HEIGHT);
  }
}
```

---

## DRAW ORDER (Back to Front)

1. **Background fill** (`#f7f7f4`) — full canvas
2. **Fog/clouds** — radial gradients in gap (lowest z)
3. **Bush decoration** (left wall) — covers left 30%
4. **Left vine** — on right edge of bush
5. **Right vine** — on left edge of right wall
6. **Leaf decoration** (right wall) — covers right 50%
7. **Bridge platform** — at top, on right wall
8. **Butterflies** — in gap, animated
9. **Astronaut** — on right vine, animated (highest z)

---

## SUMMARY OF ALL CHANGES NEEDED

| # | Element | Issue | Fix |
|---|---------|-------|-----|
| 1 | `sceneTop` | Set to `h * 0.30` (30% down) | Change to `0` (top of canvas) |
| 2 | Bush height | Drawn at `sceneHeight` (70%) | Now full height (100%) |
| 3 | Leaf height | Drawn at `sceneHeight` (70%) | Now full height (100%) |
| 4 | Vine heights | Start at `sceneTop` (30%) | Now start at 0 (top) |
| 5 | Bridge Y | At `sceneTop` (30%) | Now at 0 (top) |
| 6 | Fog Y positions | Relative to `sceneTop` | Adjusted for full canvas |
| 7 | Butterfly Y positions | Relative to `sceneTop` | Adjusted for full canvas |
| 8 | Astronaut Y range | Relative to `sceneTop` | Adjusted for full canvas |

**The fix is straightforward**: Change `sceneTop` from `h * 0.30` to `0` and verify all elements render correctly at their new positions.
