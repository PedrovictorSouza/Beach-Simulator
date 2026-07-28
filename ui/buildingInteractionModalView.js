const BUILDING_LABELS = Object.freeze({
  kiosk: "Kiosk",
  "beverage-store": "Beverage store"
});

function getBuildingLabel(buildingType) {
  return BUILDING_LABELS[buildingType] || "Building";
}

export function createBuildingInteractionModalView({ root }) {
  if (!root) {
    throw new Error("BuildingInteractionModalView precisa de um elemento root.");
  }

  const documentRef = root.ownerDocument;
  const overlayElement = documentRef.createElement("div");
  const dialogElement = documentRef.createElement("section");
  const titleElement = documentRef.createElement("h2");
  const actionListElement = documentRef.createElement("div");

  overlayElement.className = "building-interaction-modal";
  overlayElement.hidden = true;
  dialogElement.className = "building-interaction-modal__dialog";
  dialogElement.tabIndex = -1;
  dialogElement.setAttribute("role", "dialog");
  dialogElement.setAttribute("aria-modal", "true");
  titleElement.className = "building-interaction-modal__title";
  actionListElement.className = "building-interaction-modal__actions";
  dialogElement.append(titleElement, actionListElement);
  overlayElement.append(dialogElement);
  root.append(overlayElement);

  let closeHandler = null;
  let open = false;
  let closeTimer = null;
  const closeAnimationMs = 250;
  const schedule = documentRef.defaultView?.setTimeout?.bind(documentRef.defaultView) || setTimeout;
  const cancelSchedule = documentRef.defaultView?.clearTimeout?.bind(documentRef.defaultView) || clearTimeout;

  const renderActions = (actions) => {
    actionListElement.replaceChildren();

    for (const action of Array.isArray(actions) ? actions : []) {
      const actionElement = documentRef.createElement("button");
      const descriptionElement = documentRef.createElement("p");

      actionElement.type = "button";
      actionElement.className = "building-interaction-modal__action";
      actionElement.textContent = String(action?.label || "Select");
      actionElement.disabled = Boolean(action?.disabled);
      descriptionElement.className = "building-interaction-modal__description";
      descriptionElement.textContent = String(action?.description || "");
      actionElement.addEventListener("click", () => action?.onSelect?.());
      actionListElement.append(actionElement);

      if (descriptionElement.textContent) {
        actionListElement.append(descriptionElement);
      }
    }
  };

  const hide = () => {
    if (!open) {
      return;
    }

    open = false;
    overlayElement.classList.remove("building-interaction-modal--visible");
    overlayElement.classList.add("building-interaction-modal--closing");
    const handler = closeHandler;
    closeHandler = null;
    handler?.();

    closeTimer = schedule(() => {
      overlayElement.hidden = true;
      overlayElement.classList.remove("building-interaction-modal--closing");
      closeTimer = null;
    }, closeAnimationMs);
  };

  overlayElement.addEventListener("click", (event) => {
    if (event.target === overlayElement) {
      hide();
    }
  });
  overlayElement.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      hide();
    }
  });

  return Object.freeze({
    show({ buildingType, actions = [], onClose = null } = {}) {
      if (closeTimer !== null) {
        cancelSchedule(closeTimer);
        closeTimer = null;
      }

      const label = getBuildingLabel(buildingType);
      titleElement.textContent = label;
      renderActions(actions);
      dialogElement.setAttribute("aria-label", `${label} interaction`);
      closeHandler = typeof onClose === "function" ? onClose : null;
      open = true;
      overlayElement.hidden = false;
      overlayElement.classList.remove("building-interaction-modal--closing");
      void overlayElement.offsetWidth;
      overlayElement.classList.add("building-interaction-modal--visible");
      dialogElement.focus();
    },
    close() {
      hide();
    },
    isOpen() {
      return open;
    }
  });
}
