export function createFieldMoveInvalidTargetPromptRuntime({
  leafageDurationMs,
  fireDurationMs
}) {
  let leafageUntil = 0;
  let fireUntil = 0;

  function triggerLeafage(now) {
    leafageUntil = now + leafageDurationMs;
  }

  function resetLeafage() {
    leafageUntil = 0;
  }

  function isLeafageVisible(now) {
    return leafageUntil > now;
  }

  function triggerFire(now) {
    fireUntil = now + fireDurationMs;
  }

  function resetFire() {
    fireUntil = 0;
  }

  function isFireVisible(now) {
    return fireUntil > now;
  }

  return {
    isFireVisible,
    isLeafageVisible,
    resetFire,
    resetLeafage,
    triggerFire,
    triggerLeafage
  };
}
