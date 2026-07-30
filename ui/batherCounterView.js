const BATHER_THUMB_IMAGE_URL = new URL(
  "../2d-objects/HUD/bather-thumb.png",
  import.meta.url
).href;
const BATHER_COUNT_FEEDBACK_CLASSES = Object.freeze([
  "bather-counter__label--increased",
  "bather-counter__label--decreased"
]);

export function createBatherCounterView({ root, translator }) {
  if (!root) {
    throw new Error("BatherCounterView precisa de um elemento root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("BatherCounterView precisa de um translator.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("div");
  const labelElement = documentRef.createElement("img");
  const countElement = documentRef.createElement("strong");

  element.className = "bather-counter";
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "polite");
  labelElement.className = "bather-counter__label";
  labelElement.src = BATHER_THUMB_IMAGE_URL;
  labelElement.alt = "";
  labelElement.setAttribute("aria-hidden", "true");
  countElement.className = "bather-counter__count";
  element.append(labelElement, countElement);
  root.append(element);

  let renderedCount = null;

  const renderState = (count) => {
    const nextCount = Math.max(0, Math.trunc(Number(count) || 0));
    const previousCount = renderedCount;

    renderedCount = nextCount;
    countElement.textContent = String(nextCount);
    if (previousCount !== null && nextCount !== previousCount) {
      labelElement.classList.remove(...BATHER_COUNT_FEEDBACK_CLASSES);
      void labelElement.offsetWidth;
      labelElement.classList.add(
        nextCount > previousCount ?
          BATHER_COUNT_FEEDBACK_CLASSES[0] :
          BATHER_COUNT_FEEDBACK_CLASSES[1]
      );
    }
    const countLabel = translator.t(
      nextCount === 1 ? "hud.bathers.singular" : "hud.bathers.plural"
    );
    element.setAttribute(
      "aria-label",
      translator.t("hud.bathers.onBeach", {
        count: translator.formatNumber(nextCount),
        label: countLabel
      })
    );
  };
  translator.subscribe(() => {
    if (renderedCount !== null) {
      renderState(renderedCount);
    }
  });

  return Object.freeze({
    render(count) {
      renderState(count);
    }
  });
}
