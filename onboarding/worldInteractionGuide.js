import { getWorldObjectScreenPosition } from "../interaction/worldObjectInteraction.js";

export function createWorldInteractionGuide({
  root,
  canvas,
  camera,
  sceneObjects,
  onboardingView,
  isRunActive
}) {
  let targetId = null;
  let needsRender = false;

  const render = () => {
    if (!targetId || !isRunActive()) {
      onboardingView.hideWorldHint();
      return;
    }

    const viewport = {
      width: canvas.clientWidth,
      height: canvas.clientHeight
    };
    const projected = getWorldObjectScreenPosition({
      objectId: targetId,
      sceneObjects,
      viewProjection: camera.getViewProjection(viewport.width, viewport.height),
      viewport
    });

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

  return Object.freeze({
    showForObject(objectId) {
      targetId = String(objectId || "").trim() || null;
      needsRender = Boolean(targetId);
      render();
    },
    hide() {
      targetId = null;
      needsRender = false;
      onboardingView.hideWorldHint();
    },
    hideForObject(objectId) {
      if (!targetId || targetId !== String(objectId || "").trim()) {
        return false;
      }

      targetId = null;
      needsRender = false;
      onboardingView.hideWorldHint();
      return true;
    },
    render() {
      if (needsRender) {
        needsRender = false;
        render();
      }
    },
    markProjectionDirty() {
      needsRender = Boolean(targetId);
    }
  });
}
