export const DEFAULT_TYPEWRITER_CHARACTER_DELAY_MS = 28;

function isNodeLike(value) {
  return Boolean(
    value &&
    typeof value === "object" &&
    Number.isInteger(value.nodeType)
  );
}

function createTypewriterSteps(content) {
  const segments = Array.isArray(content) ? content : [content];
  const steps = [];

  for (const segment of segments) {
    if (segment === null || segment === undefined) {
      continue;
    }

    if (isNodeLike(segment)) {
      steps.push(Object.freeze({ type: "node", value: segment }));
      continue;
    }

    for (const character of Array.from(String(segment))) {
      steps.push(Object.freeze({ type: "character", value: character }));
    }
  }

  return steps;
}

export function createTypewriter({
  target,
  windowRef = target?.ownerDocument?.defaultView,
  characterDelayMs = DEFAULT_TYPEWRITER_CHARACTER_DELAY_MS,
  onCharacter = () => {}
} = {}) {
  if (!target || typeof target.replaceChildren !== "function") {
    throw new Error("Typewriter precisa de um elemento de texto.");
  }

  if (
    !windowRef ||
    typeof windowRef.setInterval !== "function" ||
    typeof windowRef.clearInterval !== "function"
  ) {
    throw new Error("Typewriter precisa de uma janela valida.");
  }

  if (typeof onCharacter !== "function") {
    throw new Error("Typewriter precisa de um callback de caractere valido.");
  }

  const normalizedDelayMs = Math.max(
    1,
    Math.round(Number(characterDelayMs) || DEFAULT_TYPEWRITER_CHARACTER_DELAY_MS)
  );
  let intervalId = null;
  let resolvePlayback = null;
  let activeTextNode = null;

  const prefersReducedMotion = () => Boolean(
    windowRef.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  const finishPlayback = (completed) => {
    if (intervalId !== null) {
      windowRef.clearInterval(intervalId);
      intervalId = null;
    }

    const resolve = resolvePlayback;

    resolvePlayback = null;
    resolve?.(Object.freeze({ completed }));
  };
  const appendStep = (step, { announceCharacter = true } = {}) => {
    if (step.type === "node") {
      target.append(step.value);
      activeTextNode = null;
      return;
    }

    if (!activeTextNode) {
      activeTextNode = target.ownerDocument.createTextNode("");
      target.append(activeTextNode);
    }

    activeTextNode.appendData(step.value);
    if (announceCharacter && /\S/.test(step.value)) {
      onCharacter(step.value);
    }
  };
  const stop = () => {
    finishPlayback(false);
  };

  return Object.freeze({
    play(content) {
      const steps = createTypewriterSteps(content);

      stop();
      target.replaceChildren();
      activeTextNode = null;

      if (prefersReducedMotion() || steps.length === 0) {
        steps.forEach((step) => appendStep(step, {
          announceCharacter: false
        }));
        return Promise.resolve(Object.freeze({ completed: true }));
      }

      let stepIndex = 0;

      return new Promise((resolve) => {
        resolvePlayback = resolve;
        intervalId = windowRef.setInterval(() => {
          appendStep(steps[stepIndex]);
          stepIndex += 1;

          if (stepIndex >= steps.length) {
            finishPlayback(true);
          }
        }, normalizedDelayMs);
      });
    },
    getDurationMs(content) {
      if (prefersReducedMotion()) {
        return 0;
      }

      return createTypewriterSteps(content).length * normalizedDelayMs;
    },
    stop,
    destroy() {
      stop();
    }
  });
}
