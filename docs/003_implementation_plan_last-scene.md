# 003 - Implementation Plan: Last Cutscenes

> Date: 2026-06-27
> Scope: Scene 4 (rocket repair) and final launch cutscene
> Output target: implementation-ready plan, not code

---

## 1. Reference Mapping

Reference images found:

- `C:\GameDesign\example_scene\scene_04.png`
- `C:\GameDesign\example_scene\scene_05.png`

Important note:

- There is no `scene_06.png` in `example_scene`.
- Based on `spec.md`, the last two cutscenes are:
  - Scene 4 = rocket repair
  - Scene 5 = rocket launch
- For this plan, "scene_06 alias cutscene terakhir" is treated as the logical final launch cutscene shown by `scene_05.png`.

---

## 2. Visual Analysis

### Scene 4 reference (`scene_04.png`)

Observed composition:

- Fixed 16:9 composition.
- Pale sky background with partial moon in the top-left.
- Large broad leaves fill the left and center background in 3 main vertical groups.
- Dense dark bush mass runs along the bottom edge.
- A rocky mound occupies the lower-right corner.
- Astronaut stands left of the rocket, near the mound.
- Repair icon cluster appears above astronaut level, between astronaut and rocket.
- Rocket is already upright on the mound in the shown frame.

Implication:

- The reference screenshot is not the "broken opening frame".
- It is a mid-to-late repair frame where the scene has already resolved into a near-finished rocket.

### Final launch reference (`scene_05.png`)

Observed composition:

- Same environment and camera framing as Scene 4.
- Astronaut is no longer outside the rocket.
- Rocket has lifted upward into the upper-right quadrant.
- Visible thrust/flame trails extend below the engines.
- Rocky mound remains on the ground at lower-right.
- Forest layer stays fixed; launch motion is carried by the rocket and thrust, not by scrolling terrain.

Implication:

- Scene 5 must reuse the same clearing layout as Scene 4.
- The launch cutscene should feel like a continuation, not a new scene.

---

## 3. Asset Reality Check

Available relevant assets in the active repo:

- `background_moon.png`
- `leaf_decoration.png`
- `bush_decoration.png`
- `rock_platform_large.png`
- `astronaut_idle.png`
- `rocket_broken.png`
- `rocket_part_01.png`
- `rocket_part_03.png`
- `rocket_part_04.png`
- `portal_effect.png`

Actual alpha-tight bounds already verified:

- `rocket_broken.png`: `622,262,597,539`
- `rocket_part_01.png`: `663,231,421,604`
- `rocket_part_03.png`: `626,268,668,544`
- `rocket_part_04.png`: `558,232,799,690`
- `rock_platform_large.png`: `706,228,508,624`

Important constraint:

- The repo does not contain a dedicated upright shuttle sprite matching the reference silhouette.
- `rocket_broken.png` is usable as a broken-state motif, but its icon-like diagonal silhouette does not match the reference well enough to serve as the final repaired rocket by itself.

Recommended art strategy:

- Do not rely on a single asset swap from `rocket_broken.png` to a nonexistent finished shuttle sprite.
- Render the final rocket as a cutscene-specific composite/procedural upright shuttle silhouette.
- Use existing rocket assets as repair fragments, overlays, or material cues during the repair animation.

---

## 4. Layout Source of Truth

Create one shared layout object:

`LAST_SCENE_LAYOUT`

Use it for both Scene 4 and Scene 5 so background, mound, moon, and plant placement remain identical.

Recommended design-space coordinates for `1920x1080`:

```ts
export const LAST_SCENE_LAYOUT = {
  viewport: { width: 1920, height: 1080 },
  moon: { x: -36, y: -28, width: 250, height: 250 },
  leafColumns: [
    { x: 80, y: 180, width: 250, height: 620, alpha: 0.88, flipX: false },
    { x: 500, y: 170, width: 250, height: 640, alpha: 0.88, flipX: true },
    { x: 930, y: 185, width: 250, height: 620, alpha: 0.88, flipX: false },
  ],
  rearLeaves: [
    { x: -10, y: 310, width: 290, height: 430, alpha: 0.35, flipX: true },
    { x: 320, y: 300, width: 300, height: 430, alpha: 0.28, flipX: false },
    { x: 770, y: 325, width: 300, height: 410, alpha: 0.28, flipX: true },
  ],
  bushBand: { x: -70, y: 790, width: 1360, height: 320 },
  mound: { x: 1420, y: 620, width: 540, height: 420 },
  rocketPad: { x: 1615, y: 290, width: 230, height: 360 },
  astronautRepair: { x: 1490, y: 510, width: 115, height: 170 },
  repairIcons: { x: 1548, y: 445, width: 90, height: 90 },
  launchPath: {
    startX: 1615,
    startY: 290,
    endX: 1600,
    endY: -260,
  },
} as const;
```

Tuning tolerance:

- Final placement may shift by about `3-5%` after screenshot comparison.

---

## 5. Scene 4 Plan: Rocket Repair

### Placement

- Background stays fixed.
- Astronaut stands on the left side of the mound, facing the rocket.
- Rocket stands upright on the mound, right edge of screen.
- Repair icon cluster floats above astronaut shoulder height, closer to rocket than to screen center.

### Render plan

Layer order:

1. pale background fill
2. moon
3. rear leaves
4. main leaves
5. bottom bush band
6. mound rock
7. rocket repair state
8. repair icons
9. astronaut

### Rocket visual strategy

Use 3 states across the 5-second cutscene:

1. `0.00-0.20`
   Broken state:
   - base shuttle silhouette dim/partial
   - one or two missing components
   - faint crack or incomplete outline

2. `0.20-0.78`
   Repair state:
   - recovered parts fly into alignment
   - line art becomes darker and more complete
   - small pulse/glow around wrench/gear

3. `0.78-1.00`
   Repaired state:
   - rocket matches the upright clean silhouette seen in the reference
   - no launch flame yet

### Animation timeline

Recommended timeline over `SCENES.SCENE_4_DURATION = 5000`:

- `0-700 ms`: static reveal, astronaut idle near rocket
- `700-2200 ms`: wrench + gear pulse and orbit
- `1400-3200 ms`: part fragments slide/fade into rocket
- `2800-4200 ms`: repaired outline resolves to full rocket
- `4200-5000 ms`: hold final repaired pose, then instant transition to Scene 5

### Asset usage

- `background_moon.png` for moon
- `leaf_decoration.png` repeated for broad leaves
- `bush_decoration.png` tiled for bottom hedge
- `rock_platform_large.png` for mound
- `astronaut_idle.png` for astronaut
- `rocket_broken.png` only as broken-state overlay cue, not as the final repaired rocket
- `rocket_part_01.png`, `rocket_part_03.png`, `rocket_part_04.png` as fly-in repair fragments if needed

---

## 6. Scene 5 Plan: Rocket Launch

### Placement

- Reuse `LAST_SCENE_LAYOUT` exactly.
- Astronaut is visible only in the entry phase, then disappears into the rocket.
- Rocket starts from Scene 4 repaired pose on the mound.

### Render plan

Layer order:

1. pale background fill
2. moon
3. rear leaves
4. main leaves
5. bottom bush band
6. mound rock
7. astronaut if still outside rocket
8. rocket
9. thrust/flame/smoke

### Animation timeline

Recommended timeline over `SCENES.SCENE_5_DURATION = 8000`:

1. `0.00-0.18`
   Boarding:
   - astronaut walks or slides a short distance into rocket door
   - astronaut alpha fades to 0 once aligned with doorway

2. `0.18-0.35`
   Ignition:
   - engine flame flicker starts
   - small vertical rocket shake
   - flame length oscillates

3. `0.35-0.72`
   Slow lift:
   - rocket rises from mound
   - mound and forest stay fixed
   - slight camera follow only after rocket has clearly left the mound

4. `0.72-1.00`
   Acceleration:
   - rocket rises faster
   - thrust length increases
   - rocket exits top of frame
   - fade to Victory

### Thrust effect

No dedicated flame asset is present, so use procedural thrust:

- white-to-gray tapered flame cone
- 2-3 semi-transparent exhaust strands
- subtle additive glow near nozzle
- deterministic jitter, no `Math.random()` in render loop

### Camera rule

- Scene 5 should remain mostly fixed.
- Allow only a small upward camera follow during the last `25-30%` of the launch.
- Do not scroll enough to lose the forest clearing completely before the rocket exits.

---

## 7. Code Integration Plan

### Files to change

- `src/scene.ts`
  - add `LAST_SCENE_LAYOUT`
  - optionally expose `SCENE_4_LAYOUT` and `SCENE_5_LAYOUT` as aliases/wrappers around the shared layout

- `src/constants.ts`
  - keep existing Scene 4/5 durations
  - add optional cutscene timing constants for repair and launch phases

- `src/cutscene.ts`
  - extend `sceneIndex === 4` and `sceneIndex === 5` updates
  - keep `progress` as the main driver
  - no need for heavy mutable state if sub-animations are derived from `progress`

- `src/main.ts`
  - replace single `drawScene1Cutscene()` dispatch with:
    - `drawScene1Cutscene()`
    - `drawScene4RepairCutscene()`
    - `drawScene5LaunchCutscene()`
  - add transition logic:
    - Scene 3 clear -> Scene 4 cutscene
    - Scene 4 complete -> Scene 5 cutscene
    - Scene 5 complete -> Victory screen

### Recommended state approach

Keep the current cutscene model simple:

```ts
interface CutsceneState {
  active: boolean;
  elapsed: number;
  duration: number;
  progress: number;
  sceneIndex: number; // 1, 4, 5
}
```

Then derive sub-animations in render helpers:

- `repairT = clamp01(mapRange(progress, 0.20, 0.78))`
- `boardT = clamp01(mapRange(progress, 0.00, 0.18))`
- `igniteT = clamp01(mapRange(progress, 0.18, 0.35))`
- `liftT = clamp01(mapRange(progress, 0.35, 0.72))`
- `exitT = clamp01(mapRange(progress, 0.72, 1.00))`

This matches the current codebase style better than introducing a separate cutscene state machine class.

---

## 8. Recommended Drawing Strategy

### Background

- Reuse the current design-space renderer (`1920x1080`, letterbox/pillarbox preserved).
- Keep the pale scene palette identical to Scene 4 and Scene 5 references.

### Leaves

- Do not use one stretched leaf image for the whole forest wall.
- Build 3 major columns from repeated `leaf_decoration` placements with mirrored variants and alpha separation.

### Bushes

- Use tiled `bush_decoration` across the bottom band.
- Add 2-3 overlap clusters for a dense silhouette.

### Rocket

Because the repaired shuttle silhouette is missing from repo assets:

- Preferred approach:
  draw a cutscene-specific upright shuttle in canvas line art, consistent with the reference.

- Asset support:
  use `rocket_broken.png` and recovered parts only for repair fragments and transitional overlays.

This is the cleanest way to match the reference without inventing a fake crop from unrelated icons.

---

## 9. Acceptance Criteria

Implementation is correct when:

- Scene 4 reads immediately as "repairing rocket in forest clearing"
- Scene 5 reads immediately as "same place, rocket launching"
- Astronaut is outside the rocket in Scene 4 and disappears into the rocket in Scene 5
- Rocket placement stays on the right-side mound in both scenes
- Moon remains partial in the top-left
- Forest layers remain fixed between Scene 4 and Scene 5
- Repair icons are visible in Scene 4
- Thrust effect is visible in Scene 5
- Scene 4 lasts 5 seconds
- Scene 5 lasts 8 seconds
- Scene 5 ends in Victory, not back into gameplay

---

## 10. Implementation Notes

Two explicit constraints should guide the actual coding work:

1. Do not duplicate the background layout between Scene 4 and Scene 5.
   Use one shared layout object.

2. Do not force `rocket_broken.png` to impersonate the final upright rocket.
   It will look wrong against the reference.
   Treat the final repaired rocket as a cutscene-specific rendered object, supported by existing assets where useful.
