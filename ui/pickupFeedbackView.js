const FEEDBACK_DURATION_MS = 700;
const HOOK_DURATION_MS = 3000;
const STAGE_MARGIN_PX = 32;

export function createPickupFeedbackView({ root, windowRef = window }) {
  const layer = root.ownerDocument.createElement("div");
  let hookElement = null;
  let hookTimeoutId = null;

  layer.className = "pickup-feedback-layer";
  layer.setAttribute("aria-live", "polite");
  root.append(layer);

  const place = (element, { x, y }) => {
    const left = Math.min(
      root.clientWidth - STAGE_MARGIN_PX,
      Math.max(STAGE_MARGIN_PX, x)
    );
    const top = Math.min(
      root.clientHeight - STAGE_MARGIN_PX,
      Math.max(STAGE_MARGIN_PX, y)
    );

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  };

  return Object.freeze({
    showValuableHook(position) {
      windowRef.clearTimeout(hookTimeoutId);
      hookElement?.remove();
      hookElement = root.ownerDocument.createElement("span");
      hookElement.className = "pickup-feedback-hook";
      hookElement.setAttribute("aria-hidden", "true");
      place(hookElement, position);
      layer.append(hookElement);
      hookTimeoutId = windowRef.setTimeout(() => hookElement?.remove(), HOOK_DURATION_MS);
    },
    showCollection({ x, y, valuable, text }) {
      const element = root.ownerDocument.createElement("span");

      element.className = valuable ?
        "pickup-feedback pickup-feedback--valuable" :
        "pickup-feedback";
      element.textContent = text || (valuable ? "$5" : "+1");
      place(element, { x, y });
      layer.append(element);
      windowRef.setTimeout(() => element.remove(), FEEDBACK_DURATION_MS);
    }
  });
}
