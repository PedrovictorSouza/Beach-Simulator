export function createFoundationBuildZoneCameraFocusRuntime({
  durationMs,
  focusFlag
}) {
  let focus = null;

  function update({
    now,
    missionActive,
    zoneAvailable,
    zoneSignature,
    flags = {},
    startFocus,
    onFocusStarted
  } = {}) {
    if (!missionActive || !zoneAvailable) {
      focus = null;
      return false;
    }

    const focusActive = focus?.zoneSignature === zoneSignature &&
      focus.until > now;

    if (focusActive) {
      return true;
    }

    if (flags[focusFlag] === zoneSignature) {
      focus = null;
      return false;
    }

    if (!startFocus?.()) {
      return false;
    }

    flags[focusFlag] = zoneSignature;
    focus = {
      zoneSignature,
      until: now + durationMs
    };
    onFocusStarted?.();
    return true;
  }

  return {
    update
  };
}
