const CREFT_THUMB_IMAGE_URL = new URL(
  "../2d-objects/HUD/creft-thumb.png",
  import.meta.url
).href;

export function createBuildingButtonView({ root, onActivate = () => {} } = {}) {
  if (!root) {
    throw new Error("BuildingButtonView precisa de um elemento root.");
  }

  if (typeof onActivate !== "function") {
    throw new Error("BuildingButtonView precisa de um callback de ativacao valido.");
  }

  const documentRef = root.ownerDocument;
  const buttonElement = documentRef.createElement("button");
  const imageElement = documentRef.createElement("img");

  buttonElement.type = "button";
  buttonElement.className = "building-button";
  imageElement.className = "building-button__icon";
  imageElement.src = CREFT_THUMB_IMAGE_URL;
  imageElement.alt = "";
  imageElement.setAttribute("aria-hidden", "true");
  buttonElement.append(imageElement);
  buttonElement.disabled = true;
  buttonElement.setAttribute("aria-disabled", "true");
  buttonElement.addEventListener("click", onActivate);
  root.append(buttonElement);

  return Object.freeze({
    render({ enabled = false } = {}) {
      const available = Boolean(enabled);

      buttonElement.disabled = !available;
      buttonElement.classList.toggle("building-button--available", available);
      buttonElement.setAttribute("aria-disabled", String(!available));
      buttonElement.setAttribute(
        "aria-label",
        available ? "Choose a construction" : "Building requires 5 dollars"
      );
    }
  });
}
