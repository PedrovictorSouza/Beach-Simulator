import {
  isRevealBoxBotVisible,
  revealBotAtRepairPosition,
  setRevealBoxBotVisible,
  updateBotRevealFall
} from "../botRevealMotion.js";

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
