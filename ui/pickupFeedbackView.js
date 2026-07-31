const FEEDBACK_DURATION_MS = 700;
const MONEY_GAIN_DURATION_MS = 850;
const MONEY_GAIN_ARC_HEIGHT_PX = 54;
const STAGE_MARGIN_PX = 32;
const MONEY_IMAGE_URL = new URL(
  "../2d-objects/money.png",
  import.meta.url
).href;

export function createPickupFeedbackView({ root, translator, windowRef = window }) {
  if (!translator) {
    throw new Error("Pickup feedback view precisa de um tradutor.");
  }

  const layer = root.ownerDocument.createElement("div");

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

  const getRootPoint = (element) => {
    const rootRect = root.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const scaleX = root.clientWidth > 0 ?
      rootRect.width / root.clientWidth :
      1;
    const scaleY = root.clientHeight > 0 ?
      rootRect.height / root.clientHeight :
      1;

    return {
      x: (
        elementRect.left - rootRect.left + elementRect.width * 0.5
      ) / (scaleX || 1),
      y: (
        elementRect.top - rootRect.top + elementRect.height * 0.5
      ) / (scaleY || 1)
    };
  };

  const scheduleFrame = windowRef.requestAnimationFrame?.bind(windowRef) ||
    ((callback) => windowRef.setTimeout(callback, 16));

  const animateMoneyGain = ({ x, y, targetElement }) => {
    if (
      !targetElement ||
      !Number.isFinite(x) ||
      !Number.isFinite(y)
    ) {
      return false;
    }

    const element = root.ownerDocument.createElement("img");
    const target = getRootPoint(targetElement);
    const start = { x, y };
    const control = {
      x: (start.x + target.x) * 0.5,
      y: Math.min(start.y, target.y) - MONEY_GAIN_ARC_HEIGHT_PX
    };
    const startTime = windowRef.performance?.now?.() ?? Date.now();
    const reduceMotion = windowRef.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const duration = reduceMotion ? 180 : MONEY_GAIN_DURATION_MS;

    element.className = "money-gain-animation";
    element.src = MONEY_IMAGE_URL;
    element.alt = translator.t("feedback.pickup.moneyGained");
    element.setAttribute("aria-hidden", "true");
    element.style.left = `${start.x}px`;
    element.style.top = `${start.y}px`;
    layer.append(element);

    const update = () => {
      const elapsed = (windowRef.performance?.now?.() ?? Date.now()) - startTime;
      const linearProgress = Math.min(1, Math.max(0, elapsed / duration));
      const progress = 1 - (1 - linearProgress) ** 3;
      const inverseProgress = 1 - progress;
      const nextX = inverseProgress ** 2 * start.x +
        2 * inverseProgress * progress * control.x +
        progress ** 2 * target.x;
      const nextY = inverseProgress ** 2 * start.y +
        2 * inverseProgress * progress * control.y +
        progress ** 2 * target.y;

      element.style.left = `${nextX}px`;
      element.style.top = `${nextY}px`;
      element.style.opacity = `${1 - linearProgress * 0.15}`;
      element.style.transform = `translate(-50%, -50%) scale(${1.05 - progress * 0.25})`;

      if (linearProgress >= 1) {
        element.remove();
        return;
      }

      scheduleFrame(update);
    };

    scheduleFrame(update);
    return true;
  };

  return Object.freeze({
    showCollection({
      x,
      y,
      valuable,
      messageId,
      messageParams,
      text,
      durationMs = FEEDBACK_DURATION_MS
    }) {
      const element = root.ownerDocument.createElement("span");
      const duration = Math.max(
        FEEDBACK_DURATION_MS,
        Math.trunc(Number(durationMs) || FEEDBACK_DURATION_MS)
      );
      const resolvedText = messageId
        ? translator.t(messageId, messageParams)
        : text || translator.t("feedback.pickup.money", {
          amount: translator.formatCurrency(1)
        });

      element.className = valuable ?
        "pickup-feedback pickup-feedback--valuable" :
        "pickup-feedback";
      element.textContent = resolvedText;
      place(element, { x, y });
      layer.append(element);
      windowRef.setTimeout(() => element.remove(), duration);
    },
    showMoneyGain({ x, y, targetElement }) {
      return animateMoneyGain({ x, y, targetElement });
    }
  });
}
