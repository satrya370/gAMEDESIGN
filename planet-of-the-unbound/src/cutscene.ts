import { SCENES } from './constants';

export interface CutsceneState {
  active: boolean;
  elapsed: number;
  duration: number;
  progress: number;
  sceneIndex: number;
}

let cutscene: CutsceneState = {
  active: false,
  elapsed: 0,
  duration: 0,
  progress: 0,
  sceneIndex: 0,
};

export function startCutscene(sceneIndex: number, _startX: number, _startY: number): void {
  cutscene.active = true;
  cutscene.elapsed = 0;
  cutscene.progress = 0;
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
  cutscene.progress = Math.min(cutscene.elapsed / cutscene.duration, 1);

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
