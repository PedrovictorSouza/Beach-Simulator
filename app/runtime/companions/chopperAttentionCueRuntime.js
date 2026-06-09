export function resolveChopperAttentionCue({
  activeTaskId = null,
  activeSystemQuestId = null,
  chopperPosition = null,
  isPlayerNearWorldPosition = () => false,
  interactDistance = 0,
  text
} = {}) {
  const playerIsNearChopper =
    Array.isArray(chopperPosition) &&
    isPlayerNearWorldPosition(chopperPosition, interactDistance);
  const shouldCueChopper =
    (activeTaskId || activeSystemQuestId) === "wake-guide" &&
    Array.isArray(chopperPosition) &&
    !playerIsNearChopper;

  if (!shouldCueChopper) {
    return null;
  }

  return {
    text,
    worldPosition: chopperPosition
  };
}

export function createChopperAttentionCueRuntime({
  initialDelayMs,
  repeatMs,
  durationMs
}) {
  let nextAt = 0;
  let activeUntil = 0;
  let cycleId = 0;
  let soundCycleId = 0;

  function resetSchedule() {
    nextAt = 0;
    activeUntil = 0;
  }

  function get(cue, now) {
    if (!cue) {
      resetSchedule();
      return null;
    }

    if (nextAt <= 0) {
      nextAt = now + initialDelayMs;
      return null;
    }

    if (now >= nextAt && now >= activeUntil) {
      cycleId += 1;
      activeUntil = now + durationMs;
      nextAt = now + repeatMs;
    }

    if (now >= activeUntil) {
      return null;
    }

    return {
      ...cue,
      cycleId
    };
  }

  function consumeSoundCycle(nextCycleId) {
    if (nextCycleId === soundCycleId) {
      return false;
    }

    soundCycleId = nextCycleId;
    return true;
  }

  return {
    consumeSoundCycle,
    get,
    resetSchedule
  };
}
