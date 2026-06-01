export function createRunBreadcrumbPromptRuntime({
  durationMs
}) {
  let shown = false;
  let until = 0;

  function trigger(now) {
    if (shown) {
      return false;
    }

    shown = true;
    until = now + durationMs;
    return true;
  }

  function isVisible(now) {
    return until > now;
  }

  return {
    trigger,
    isVisible
  };
}
