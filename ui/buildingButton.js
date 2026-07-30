const CREFT_THUMB_IMAGE_URL = new URL(
  "../2d-objects/HUD/creft-thumb.png",
  import.meta.url
).href;

export function createBuildingButtonView({
  root,
  translator,
  onActivate = () => {}
} = {}) {
  if (!root) {
    throw new Error("BuildingButtonView precisa de um elemento root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("BuildingButtonView precisa de um translator.");
  }

  if (typeof onActivate !== "function") {
    throw new Error("BuildingButtonView precisa de um callback de ativacao valido.");
  }

  const documentRef = root.ownerDocument;
  const buttonElement = documentRef.createElement("button");
  const imageElement = documentRef.createElement("img");
  const hintElement = documentRef.createElement("span");

  buttonElement.type = "button";
  buttonElement.className = "building-button";
  imageElement.className = "building-button__icon";
  imageElement.src = CREFT_THUMB_IMAGE_URL;
  imageElement.alt = "";
  imageElement.setAttribute("aria-hidden", "true");
  hintElement.className = "building-button__hint";
  hintElement.setAttribute("aria-hidden", "true");
  buttonElement.append(imageElement, hintElement);
  buttonElement.disabled = true;
  buttonElement.setAttribute("aria-disabled", "true");
  buttonElement.addEventListener("click", onActivate);
  root.append(buttonElement);

  let currentState = {
    enabled: false,
    moneyInCents: 0,
    costInCents: 500
  };
  const renderState = ({ enabled, moneyInCents, costInCents }) => {
    const available = Boolean(enabled);
    const normalizedMoneyInCents = Math.max(0, Math.trunc(Number(moneyInCents) || 0));
    const normalizedCostInCents = Math.max(0, Math.trunc(Number(costInCents) || 0));
    const missingMoneyInCents = Math.max(
      0,
      normalizedCostInCents - normalizedMoneyInCents
    );
    const missingMoney = Math.ceil(missingMoneyInCents / 100);

    buttonElement.disabled = !available;
    buttonElement.classList.toggle("building-button--available", available);
    buttonElement.setAttribute("aria-disabled", String(!available));
    hintElement.textContent = available ?
      translator.t("buildingButton.available") :
      translator.t("buildingButton.missing", { amount: missingMoney });
    buttonElement.setAttribute(
      "aria-label",
      available ?
        translator.t("buildingButton.availableAria") :
        translator.t("buildingButton.missingAria", { amount: missingMoney })
    );
  };
  translator.subscribe(() => renderState(currentState));

  return Object.freeze({
    render({ enabled = false, moneyInCents = 0, costInCents = 500 } = {}) {
      currentState = { enabled, moneyInCents, costInCents };
      renderState(currentState);
    }
  });
}
