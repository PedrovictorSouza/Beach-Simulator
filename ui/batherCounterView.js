const BATHER_THUMB_IMAGE_URL = new URL(
  "../2d-objects/HUD/bather-thumb.png",
  import.meta.url
).href;

export function createBatherCounterView({ root }) {
  if (!root) {
    throw new Error("BatherCounterView precisa de um elemento root.");
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

  return Object.freeze({
    render(count) {
      const nextCount = Math.max(0, Math.trunc(Number(count) || 0));

      if (nextCount === renderedCount) {
        return;
      }

      renderedCount = nextCount;
      countElement.textContent = String(nextCount);
      const noun = nextCount === 1 ? "bather" : "bathers";
      element.setAttribute("aria-label", `${nextCount} ${noun} on the beach`);
    }
  });
}
