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
  const budgetElement = documentRef.createElement("small");

  element.className = "money-counter";
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "polite");
  labelElement.className = "money-counter__label";
  labelElement.src = MONEY_THUMB_IMAGE_URL;
  labelElement.alt = "";
  labelElement.setAttribute("aria-hidden", "true");
  valuesElement.className = "money-counter__values";
  amountElement.className = "money-counter__amount";
  budgetElement.className = "money-counter__budget";
  budgetElement.hidden = true;
  valuesElement.append(amountElement, budgetElement);
  element.append(labelElement, valuesElement);
  root.append(element);

  let renderedAmount = null;
  let targetAmount = null;
  let animationTimerId = null;
  let closingPlan = Object.freeze({
    grossServiceCostsInCents: 0,
    publicSupportInCents: 0,
    amountToReserveInCents: 0
  });

  const clearAnimationTimer = () => {
    if (animationTimerId === null) {
      return;
    }

    windowRef.clearTimeout(animationTimerId);
    animationTimerId = null;
  };

  const formatMoney = (amountInCents, options = {}) => (
    translator.formatCurrency(amountInCents / 100, options)
  );
  const renderAmount = (moneyInCents) => {
    const amount = moneyInCents / 100;
    const {
      grossServiceCostsInCents,
      publicSupportInCents,
      amountToReserveInCents
    } = closingPlan;
    const freeToInvestInCents = Math.max(
      0,
      moneyInCents - amountToReserveInCents
    );
    const reserveShortfallInCents = Math.max(
      0,
      amountToReserveInCents - moneyInCents
    );

    element.classList.toggle(
      "money-counter--shortfall",
      reserveShortfallInCents > 0
    );
    amountElement.textContent = translator.formatCurrency(amount, {
      notation: "compact"
    });
    budgetElement.hidden = grossServiceCostsInCents <= 0;

    if (!budgetElement.hidden) {
      if (reserveShortfallInCents > 0) {
        budgetElement.textContent = translator.t("hud.moneyBudget.shortfall", {
          shortfall: formatMoney(reserveShortfallInCents),
          free: formatMoney(freeToInvestInCents)
        });
      } else if (amountToReserveInCents > 0) {
        budgetElement.textContent = translator.t("hud.moneyBudget.reserve", {
          reserve: formatMoney(amountToReserveInCents),
          free: formatMoney(freeToInvestInCents)
        });
      } else {
        budgetElement.textContent = translator.t("hud.moneyBudget.covered", {
          free: formatMoney(freeToInvestInCents)
        });
      }
    }

    element.setAttribute(
      "aria-label",
      grossServiceCostsInCents > 0 ?
        translator.t("hud.moneyBudget.aria", {
          amount: translator.formatCurrency(amount),
          costs: formatMoney(grossServiceCostsInCents),
          support: formatMoney(publicSupportInCents),
          reserve: formatMoney(amountToReserveInCents),
          free: formatMoney(freeToInvestInCents)
        }) :
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
    render(value) {
      const moneyInCents = typeof value === "object" && value !== null ?
        value.moneyInCents :
        value;
      const nextAmount = Number.isSafeInteger(moneyInCents) ?
        Math.max(0, moneyInCents) :
        0;
      const nextPlan = typeof value === "object" && value !== null ?
        value.closingPlan :
        null;

      closingPlan = Object.freeze({
        grossServiceCostsInCents: Math.max(
          0,
          Math.trunc(Number(nextPlan?.grossServiceCostsInCents) || 0)
        ),
        publicSupportInCents: Math.max(
          0,
          Math.trunc(Number(nextPlan?.publicSupportInCents) || 0)
        ),
        amountToReserveInCents: Math.max(
          0,
          Math.trunc(Number(nextPlan?.amountToReserveInCents) || 0)
        )
      });

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
