import { SCENES } from './constants';
import { SCENE_1 } from './scene';

export interface CutsceneState {
  active: boolean;
  elapsed: number;
  duration: number;
  astronautX: number;
  astronautY: number;
  sceneIndex: number;
}

let cutscene: CutsceneState = {
  active: false,
  elapsed: 0,
  duration: 0,
  astronautX: 0,
  astronautY: 0,
  sceneIndex: 0,
};

export function startCutscene(sceneIndex: number, startX: number, startY: number): void {
  cutscene.active = true;
  cutscene.elapsed = 0;
  cutscene.astronautX = startX;
  cutscene.astronautY = startY;
  cutscene.sceneIndex = sceneIndex;

  switch (sceneIndex) {
    case 1:
      cutscene.duration = SCENES.SCENE_1_DURATION;
      break;
    case 4:
      cutscene.duration = SCENES.SCENE_4_DURATION;
      break;
    case 5:
      cutscene.duration = SCENES.SCENE_5_DURATION;
      break;
    default:
      cutscene.duration = 3000;
  }
}

export function updateCutscene(dt: number): void {
  if (!cutscene.active) return;

  cutscene.elapsed += dt;

  // Scene 1: slide up vine (ease-in-out)
  if (cutscene.sceneIndex === 1) {
    const t = Math.min(cutscene.elapsed / cutscene.duration, 1);
    // Ease-in-out untuk efek slide
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    // Normalized: 1 = bawah, 0 = atas
    cutscene.astronautY = 1 - eased;
    cutscene.astronautX = 0; // Tidak dipakai, posisi fix di drawCutscene
  }

  if (cutscene.elapsed >= cutscene.duration) {
    cutscene.active = false;
  }
}

export function getCutscene(): CutsceneState {
  return cutscene;
}

export function isCutsceneDone(): boolean {
  return !cutscene.active;
}
