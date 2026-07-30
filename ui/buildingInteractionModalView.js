export function createBuildingInteractionModalView({ root, translator }) {
  if (!root) {
    throw new Error("BuildingInteractionModalView precisa de um elemento root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("BuildingInteractionModalView precisa de um translator.");
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
  let openFrame = null;
  const closeAnimationMs = 250;
  const schedule = documentRef.defaultView?.setTimeout?.bind(documentRef.defaultView) || setTimeout;
  const cancelSchedule = documentRef.defaultView?.clearTimeout?.bind(documentRef.defaultView) || clearTimeout;
  const requestFrame = documentRef.defaultView?.requestAnimationFrame?.bind(
    documentRef.defaultView
  ) || ((callback) => schedule(callback, 0));
  const cancelFrame = documentRef.defaultView?.cancelAnimationFrame?.bind(
    documentRef.defaultView
  ) || cancelSchedule;

  const renderActions = (actions) => {
    actionListElement.replaceChildren();

    for (const action of Array.isArray(actions) ? actions : []) {
      const actionElement = documentRef.createElement("button");
      const descriptionElement = documentRef.createElement("p");
      const label = action?.messageId ?
        translator.t(action.messageId, action.messageParams) :
        String(action?.label || translator.t("common.select"));
      const description = action?.descriptionId ?
        translator.t(action.descriptionId, action.descriptionParams) :
        String(action?.description || "");

      actionElement.type = "button";
      actionElement.className = "building-interaction-modal__action";
      actionElement.textContent = label;
      actionElement.disabled = Boolean(action?.disabled);
      descriptionElement.className = "building-interaction-modal__description";
      descriptionElement.textContent = description;
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

    if (openFrame !== null) {
      cancelFrame(openFrame);
      openFrame = null;
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
      if (openFrame !== null) {
        cancelFrame(openFrame);
        openFrame = null;
      }

      const label = translator.t(`buildings.${buildingType}.label`);
      titleElement.textContent = label;
      renderActions(actions);
      dialogElement.setAttribute(
        "aria-label",
        translator.t("dialogs.buildingInteraction", { building: label })
      );
      closeHandler = typeof onClose === "function" ? onClose : null;
      open = true;
      overlayElement.hidden = false;
      overlayElement.classList.remove("building-interaction-modal--closing");
      overlayElement.classList.remove("building-interaction-modal--visible");

      // Let the closed transform be painted before starting the slide. This
      // avoids a partially-open panel when camera focus and modal opening are
      // requested by the same pointer event.
      openFrame = requestFrame(() => {
        openFrame = null;

        if (!open) {
          return;
        }

        overlayElement.classList.add("building-interaction-modal--visible");
      });

      try {
        dialogElement.focus({ preventScroll: true });
      } catch {
        dialogElement.focus();
      }
    },
    close() {
      hide();
    },
    isOpen() {
      return open;
    }
  });
}
