const MONEY_THUMB_IMAGE_URL = new URL(
  "../2d-objects/HUD/money-thumb.png",
  import.meta.url
).href;

const MONEY_STEP_IN_CENTS = 100;
const MONEY_STEP_INTERVAL_MS = 100;

export function createMoneyCounterView({
  root,
  translator,
  windowRef = window
}) {
  if (!root) {
    throw new Error("MoneyCounterView precisa de um elemento root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("MoneyCounterView precisa de um translator.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("div");
  const labelElement = documentRef.createElement("img");
  const valuesElement = documentRef.createElement("div");
  const amountElement = documentRef.createElement("strong");

  element.className = "money-counter";
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "polite");
  labelElement.className = "money-counter__label";
  labelElement.src = MONEY_THUMB_IMAGE_URL;
  labelElement.alt = "";
  labelElement.setAttribute("aria-hidden", "true");
  valuesElement.className = "money-counter__values";
  amountElement.className = "money-counter__amount";
  valuesElement.append(amountElement);
  element.append(labelElement, valuesElement);
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
    const amount = moneyInCents / 100;

    amountElement.textContent = translator.formatCurrency(amount, {
      notation: "compact"
    });

    element.setAttribute(
      "aria-label",
      translator.t("hud.beachMoney", {
        amount: translator.formatCurrency(amount)
      })
    );
  };

  translator.subscribe(() => {
    if (renderedAmount !== null) {
      renderAmount(renderedAmount);
    }
  });

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
    getIconElement() {
      return labelElement;
    },
    render(value) {
      const nextAmount = Number.isSafeInteger(value) ?
        Math.max(0, value) :
        0;

      if (nextAmount === renderedAmount) {
        targetAmount = nextAmount;
        clearAnimationTimer();
        renderAmount(renderedAmount);
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
