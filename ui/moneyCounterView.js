const MONEY_THUMB_IMAGE_URL = new URL(
  "../2d-objects/HUD/money-thumb.png",
  import.meta.url
).href;

const DISPLAY_MONEY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2
});

const ACCESSIBLE_MONEY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

export function createMoneyCounterView({ root }) {
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

  return Object.freeze({
    render(moneyInCents) {
      const nextAmount = Number.isSafeInteger(moneyInCents) ?
        Math.max(0, moneyInCents) :
        0;

      if (nextAmount === renderedAmount) {
        return;
      }

      renderedAmount = nextAmount;
      amountElement.textContent = DISPLAY_MONEY_FORMATTER.format(nextAmount / 100);
      element.setAttribute(
        "aria-label",
        `Beach money: ${ACCESSIBLE_MONEY_FORMATTER.format(nextAmount / 100)}`
      );
    }
  });
}
