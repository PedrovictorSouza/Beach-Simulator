export function createBuildingButtonView({ root, onActivate = () => {} } = {}) {
  if (!root) {
    throw new Error("BuildingButtonView precisa de um elemento root.");
  }

  if (typeof onActivate !== "function") {
    throw new Error("BuildingButtonView precisa de um callback de ativacao valido.");
  }

  const documentRef = root.ownerDocument;
  const buttonElement = documentRef.createElement("button");

  buttonElement.type = "button";
  buttonElement.className = "building-button";
  buttonElement.textContent = "Building";
  buttonElement.disabled = true;
  buttonElement.setAttribute("aria-disabled", "true");
  buttonElement.addEventListener("click", onActivate);
  root.append(buttonElement);

  return Object.freeze({
    render({ enabled = false, used = false } = {}) {
      const available = Boolean(enabled) && !used;

      buttonElement.disabled = !available;
      buttonElement.classList.toggle("building-button--available", available);
      buttonElement.setAttribute("aria-disabled", String(!available));
      buttonElement.setAttribute(
        "aria-label",
        used ? "Building already selected" :
          available ? "Build your first construction" :
            "Building requires 5 dollars"
      );
    }
  });
}
