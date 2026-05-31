export function createPlayerCounterPromptRuntime({
  durationMs
}) {
  let prompt = null;

  function trigger(text, now) {
    if (!text) {
      return;
    }

    prompt = {
      text,
      expiresAt: now + durationMs
    };
  }

  function triggerQuestCounter({ count, total, label, now }) {
    const safeTotal = Math.max(1, Number(total || 1));
    const safeCount = Math.min(safeTotal, Math.max(0, Number(count || 0)));
    if (safeCount <= 0) {
      return;
    }

    trigger(`${safeCount}/${safeTotal} ${label}`, now);
  }

  function get(now) {
    if (!prompt || prompt.expiresAt <= now) {
      prompt = null;
      return null;
    }

    return prompt.text;
  }

  return {
    trigger,
    triggerQuestCounter,
    get
  };
}
