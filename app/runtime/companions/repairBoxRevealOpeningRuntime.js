import {
  isRevealBoxBotVisible,
  revealBotAtRepairPosition,
  setRevealBoxBotVisible,
  updateBotRevealFall
} from "../botRevealMotion.js";

const GAMEPLAY_REPAIR_BOX_FLOAT_HEIGHT = 0.74;
const GAMEPLAY_REPAIR_BOX_REVEAL_BOX_DURATION = 4.35;
const GAMEPLAY_REPAIR_BOX_REVEAL_VISIBLE_PROGRESS = 0.72;
const GAMEPLAY_REPAIR_BOX_REVEAL_FLASH_PEAK_OPACITY = 1;
const GAMEPLAY_REPAIR_BOX_REVEAL_BOT_FALL_HEIGHT = 1.82;
const GAMEPLAY_REPAIR_BOX_REVEAL_BOT_FALL_END_PROGRESS = 0.96;

export function createGameplayRepairBoxRevealRuntimeBundle({
  mount,
  worldCanvas,
  camera,
  clamp01,
  getRepairBoxPosition,
  playRevealSfx
} = {}) {
  const repairBoxRevealFlashRuntime = createRepairBoxRevealFlashRuntime({
    mount,
    worldCanvas,
    camera,
    clamp01,
    peakOpacity: GAMEPLAY_REPAIR_BOX_REVEAL_FLASH_PEAK_OPACITY,
    repairBoxFloatHeight: GAMEPLAY_REPAIR_BOX_FLOAT_HEIGHT,
    getRepairBoxPosition
  });
  const repairBoxRevealOpeningRuntime = createRepairBoxRevealOpeningRuntime({
    getRepairBoxPosition,
    fallHeight: GAMEPLAY_REPAIR_BOX_REVEAL_BOT_FALL_HEIGHT,
    defaultDuration: GAMEPLAY_REPAIR_BOX_REVEAL_BOX_DURATION,
    defaultVisibleProgress: GAMEPLAY_REPAIR_BOX_REVEAL_VISIBLE_PROGRESS,
    defaultFallEndProgress: GAMEPLAY_REPAIR_BOX_REVEAL_BOT_FALL_END_PROGRESS,
    clamp01,
    flashRuntime: repairBoxRevealFlashRuntime,
    playRevealSfx
  });

  return {
    repairBoxRevealFlashRuntime,
    repairBoxRevealOpeningRuntime
  };
}

export function createRepairBoxRevealFlashRuntime({
  mount,
  worldCanvas,
  camera,
  clamp01,
  peakOpacity,
  repairBoxFloatHeight,
  getRepairBoxPosition
}) {
  let element = null;

  function getOverlayElement() {
    if (
      element ||
      typeof HTMLElement === "undefined" ||
      !(mount instanceof HTMLElement) ||
      typeof document === "undefined"
    ) {
      return element;
    }

    element = document.createElement("div");
    element.dataset.repairBoxRevealFlash = "true";
    element.hidden = true;
    element.style.cssText = [
      "position:absolute",
      "inset:0",
      "z-index:11",
      "opacity:0",
      "pointer-events:none",
      "mix-blend-mode:screen",
      "will-change:opacity,background",
      "background:#fff"
    ].join(";");
    mount.append(element);
    return element;
  }

  function getOrigin(encounter) {
    const repairBoxPosition = getRepairBoxPosition(encounter);

    if (
      !Array.isArray(repairBoxPosition) ||
      !worldCanvas?.width ||
      !worldCanvas?.height ||
      typeof camera?.project !== "function"
    ) {
      return "50% 55%";
    }

    const projected = camera.project(
      [
        repairBoxPosition[0],
        repairBoxPosition[1] + repairBoxFloatHeight,
        repairBoxPosition[2]
      ],
      worldCanvas.width,
      worldCanvas.height
    );

    if (!projected || projected.depth > 1) {
      return "50% 55%";
    }

    const originX = clamp01(projected.x / worldCanvas.width) * 100;
    const originY = clamp01(projected.y / worldCanvas.height) * 100;
    return `${originX.toFixed(2)}% ${originY.toFixed(2)}%`;
  }

  function setOpacity(opacity, encounter) {
    const normalizedOpacity = clamp01(opacity);

    if (normalizedOpacity <= 0.01) {
      if (element) {
        element.hidden = true;
        element.style.opacity = "0";
      }
      return;
    }

    const overlayElement = getOverlayElement();
    if (!overlayElement) {
      return;
    }

    const origin = getOrigin(encounter);
    overlayElement.hidden = false;
    overlayElement.style.opacity = normalizedOpacity.toFixed(3);
    overlayElement.style.background = [
      `radial-gradient(circle at ${origin}, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 18%, rgba(255,255,255,0.76) 38%, rgba(255,255,255,0.34) 62%, rgba(255,255,255,0) 84%)`,
      "linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.42))"
    ].join(",");
  }

  function update({ opening, encounter }) {
    const flashDuration = Number(opening?.flashDuration || 0);
    const flashStart = Number(opening?.flashStart || 0);

    if (!opening?.active || flashDuration <= 0) {
      setOpacity(0);
      return;
    }

    const flashProgress =
      (Number(opening.elapsed || 0) - flashStart) / flashDuration;
    if (flashProgress < 0 || flashProgress > 1) {
      setOpacity(0);
      return;
    }

    const pulse = Math.sin(clamp01(flashProgress) * Math.PI);
    setOpacity(pulse * peakOpacity, encounter);
  }

  return {
    setOpacity,
    update
  };
}

export function createRepairBoxRevealOpeningRuntime({
  getRepairBoxPosition = () => null,
  fallHeight = 0,
  defaultDuration = 1,
  defaultVisibleProgress = 1,
  defaultFallEndProgress = 1,
  clamp01 = (value) => Math.min(1, Math.max(0, value)),
  flashRuntime = null,
  playRevealSfx = () => {}
} = {}) {
  function revealAtRepairPosition(encounter, { falling = false } = {}) {
    return revealBotAtRepairPosition({
      encounter,
      falling,
      getRepairBoxPosition,
      fallHeight
    });
  }

  function updateRevealFall(opening, encounter, progress) {
    updateBotRevealFall({
      opening,
      encounter,
      progress,
      clamp01,
      defaultVisibleProgress,
      defaultFallEndProgress
    });
  }

  function update(deltaTime, encounter, { syncModelInstance } = {}) {
    const opening = encounter?.revealBoxOpening;

    if (!opening?.active) {
      return false;
    }

    if (!Array.isArray(encounter.repairPosition)) {
      opening.active = false;
      flashRuntime?.setOpacity?.(0);
      return false;
    }

    opening.duration = Number(opening.duration || defaultDuration);
    opening.elapsed = Math.min(
      opening.duration,
      Number(opening.elapsed || 0) + deltaTime
    );
    const progress = clamp01(opening.elapsed / opening.duration);
    flashRuntime?.update?.({ opening, encounter });
    if (!opening.sfxStarted) {
      playRevealSfx();
      opening.sfxStarted = true;
    }

    const visibleProgress = clamp01(
      Number(opening.visibleProgress ?? defaultVisibleProgress)
    );

    if (progress >= visibleProgress && !isRevealBoxBotVisible(opening)) {
      revealAtRepairPosition(encounter, { falling: true });
      setRevealBoxBotVisible(opening);
      if (opening.hideBoxWhenVisible && encounter.repairModuleInstance) {
        encounter.repairModuleInstance.active = false;
      }
    }
    updateRevealFall(opening, encounter, progress);

    if (progress >= 1) {
      revealAtRepairPosition(encounter);
      if (encounter.repairModuleInstance) {
        encounter.repairModuleInstance.active = false;
      }
      opening.active = false;
      const onComplete = opening.onComplete;
      opening.onComplete = null;
      encounter.revealBoxOpening = null;
      flashRuntime?.setOpacity?.(0);
      syncModelInstance?.();
      if (typeof onComplete === "function") {
        onComplete();
      }
      return true;
    }

    syncModelInstance?.();
    return true;
  }

  return {
    revealAtRepairPosition,
    update,
    updateRevealFall
  };
}
