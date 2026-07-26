import { getWorldObjectScreenPosition } from "../interaction/worldObjectInteraction.js";
import {
  getSpawnableObjectDto,
  SPAWNABLE_OBJECT_TRAITS
} from "../spawn/spawnableObjectDto.js";

const DEFAULT_DELAY_MS = Object.freeze({ min: 3000, max: 5000 });

export function createCleanBeachGuide({
  root,
  canvas,
  camera,
  sceneObjects,
  taskListModel,
  playerExperienceModel,
  onboardingView,
  isRunActive,
  taskId,
  windowRef = window,
  delayMs = DEFAULT_DELAY_MS
}) {
  let timeoutId = null;
  let targetId = null;
  let needsRender = false;

  const project = (objectId) => {
    const viewport = {
      width: canvas.clientWidth,
      height: canvas.clientHeight
    };

    return getWorldObjectScreenPosition({
      objectId,
      sceneObjects,
      viewProjection: camera.getViewProjection(viewport.width, viewport.height),
      viewport
    });
  };

  const render = () => {
    if (!needsRender || !targetId) {
      return;
    }

    needsRender = false;
    const projected = isRunActive() ? project(targetId) : null;

    if (!projected) {
      onboardingView.hideWorldHint();
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    onboardingView.showWorldHint({
      x: canvasRect.left - rootRect.left + projected.x,
      y: canvasRect.top - rootRect.top + projected.y
    });
  };

  const findCandidates = () => {
    const canvasRect = canvas.getBoundingClientRect();
    const hudRects = [
      root.querySelector(".hud-stack")?.getBoundingClientRect(),
      root.querySelector(".time-counter")?.getBoundingClientRect()
    ].filter(Boolean);

    return sceneObjects.flatMap((sceneObject) => sceneObject.instances
      .filter((instance) => {
        const traits = getSpawnableObjectDto(instance.spawnableType).traits;

        return traits.includes(SPAWNABLE_OBJECT_TRAITS.DIRTY) ||
          traits.includes(SPAWNABLE_OBJECT_TRAITS.PICKUP);
      })
      .map((instance) => {
        const screenPosition = project(instance.id);

        if (!screenPosition) {
          return null;
        }

        const clientX = canvasRect.left + screenPosition.x;
        const clientY = canvasRect.top + screenPosition.y;
        const obscuredByHud = hudRects.some((rect) => (
          clientX >= rect.left && clientX <= rect.right &&
          clientY >= rect.top && clientY <= rect.bottom
        ));
        const onCanvas = (
          screenPosition.x >= 0 && screenPosition.x <= canvas.clientWidth &&
          screenPosition.y >= 0 && screenPosition.y <= canvas.clientHeight
        );

        return { id: instance.id, preferred: onCanvas && !obscuredByHud };
      })
      .filter(Boolean));
  };

  const schedule = () => {
    windowRef.clearTimeout(timeoutId);
    targetId = null;
    needsRender = false;
    onboardingView.hideWorldHint();

    const task = taskListModel.getSnapshot().find(({ id }) => id === taskId);

    if (!isRunActive() || !task || task.progress >= task.target) {
      return;
    }

    const delay = delayMs.min + Math.random() * (delayMs.max - delayMs.min);
    timeoutId = windowRef.setTimeout(() => {
      const candidates = findCandidates();

      if (candidates.length === 0) {
        schedule();
        return;
      }

      const preferred = candidates.filter((candidate) => candidate.preferred);
      const pool = preferred.length > 0 ? preferred : candidates;

      targetId = pool[Math.floor(Math.random() * pool.length)].id;
      playerExperienceModel.recordGuidanceNeeded();
      needsRender = true;
      render();
    }, delay);
  };

  return Object.freeze({
    schedule,
    render,
    markProjectionDirty() {
      needsRender = Boolean(targetId);
    }
  });
}
