export function createCompanionLostHintRuntime({
  initialDelayMs,
  repeatMs,
  durationMs
}) {
  let hintKey = null;
  let nextAt = 0;
  let activeUntil = 0;
  let activeHint = null;

  function reset() {
    hintKey = null;
    nextAt = 0;
    activeUntil = 0;
    activeHint = null;
  }

  function get(hint, now) {
    if (!hint) {
      reset();
      return null;
    }

    if (hint.key !== hintKey) {
      hintKey = hint.key;
      nextAt = now + initialDelayMs;
      activeUntil = 0;
      activeHint = null;
      return null;
    }

    if (activeHint && now < activeUntil) {
      return {
        ...activeHint,
        worldPosition: hint.worldPosition
      };
    }

    if (now < nextAt) {
      return null;
    }

    activeHint = hint;
    activeUntil = now + durationMs;
    nextAt = now + repeatMs;
    return hint;
  }

  return {
    get,
    reset
  };
}
