const MONEY_THUMB_IMAGE_URL = new URL(
  "../2d-objects/HUD/money-thumb.png",
  import.meta.url
).href;

const DISPLAY_MONEY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const ACCESSIBLE_MONEY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const MONEY_STEP_IN_CENTS = 100;
const MONEY_STEP_INTERVAL_MS = 100;

export function createMoneyCounterView({ root, windowRef = window }) {
  if (!root) {
    throw new Error("MoneyCounterView precisa de um elemento root.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("div");
  const labelElement = documentRef.createElement("img");
  const amountElement = documentRef.createElement("strong");

  element.className = "money-counter";
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "polite");
  labelElement.className = "money-counter__label";
  labelElement.src = MONEY_THUMB_IMAGE_URL;
  labelElement.alt = "";
  labelElement.setAttribute("aria-hidden", "true");
  amountElement.className = "money-counter__amount";
  element.append(labelElement, amountElement);
  root.append(element);

  let renderedAmount = null;
  let targetAmount = null;
  let animationTimerId = null;

  const clearAnimationTimer = () => {
    if (animationTimerId === null) {
      return;
    }

    windowRef.clearTimeout(animationTimerId);
    animationTimerId = null;
  };

  const renderAmount = (moneyInCents) => {
    amountElement.textContent = DISPLAY_MONEY_FORMATTER.format(moneyInCents / 100);
    element.setAttribute(
      "aria-label",
      `Beach money: ${ACCESSIBLE_MONEY_FORMATTER.format(moneyInCents / 100)}`
    );
  };

  const advanceAnimation = () => {
    animationTimerId = null;

    if (renderedAmount === null || targetAmount === null || renderedAmount === targetAmount) {
      return;
    }

    const difference = targetAmount - renderedAmount;
    const step = Math.sign(difference) * Math.min(
      MONEY_STEP_IN_CENTS,
      Math.abs(difference)
    );
    renderedAmount += step;
    renderAmount(renderedAmount);

    if (renderedAmount !== targetAmount) {
      animationTimerId = windowRef.setTimeout(
        advanceAnimation,
        MONEY_STEP_INTERVAL_MS
      );
    }
  };

  return Object.freeze({
    getElement() {
      return element;
    },
    render(moneyInCents) {
      const nextAmount = Number.isSafeInteger(moneyInCents) ?
        Math.max(0, moneyInCents) :
        0;

      if (nextAmount === renderedAmount) {
        targetAmount = nextAmount;
        clearAnimationTimer();
        return;
      }

      targetAmount = nextAmount;

      if (renderedAmount === null) {
        renderedAmount = nextAmount;
        renderAmount(renderedAmount);
        return;
      }

      if (animationTimerId === null) {
        animationTimerId = windowRef.setTimeout(
          advanceAnimation,
          MONEY_STEP_INTERVAL_MS
        );
      }
    }
  });
}
