export function createBeverageStoreModalView({ root }) {
  if (!root) {
    throw new Error("BeverageStoreModalView precisa de um elemento root.");
  }

  const documentRef = root.ownerDocument;
  const overlayElement = documentRef.createElement("div");
  const dialogElement = documentRef.createElement("section");

  overlayElement.className = "beverage-store-modal";
  overlayElement.hidden = true;
  dialogElement.className = "beverage-store-modal__dialog";
  dialogElement.tabIndex = -1;
  dialogElement.setAttribute("role", "dialog");
  dialogElement.setAttribute("aria-modal", "true");
  dialogElement.setAttribute("aria-label", "Beverage store");
  overlayElement.append(dialogElement);
  root.append(overlayElement);

  let closeHandler = null;
  let open = false;
  let closeTimer = null;
  const closeAnimationMs = 250;
  const schedule = documentRef.defaultView?.setTimeout?.bind(documentRef.defaultView) || setTimeout;
  const cancelSchedule = documentRef.defaultView?.clearTimeout?.bind(documentRef.defaultView) || clearTimeout;

  const hide = () => {
    if (!open) {
      return;
    }

    open = false;
    overlayElement.classList.remove("beverage-store-modal--visible");
    overlayElement.classList.add("beverage-store-modal--closing");
    const handler = closeHandler;
    closeHandler = null;
    handler?.();

    closeTimer = schedule(() => {
      overlayElement.hidden = true;
      overlayElement.classList.remove("beverage-store-modal--closing");
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
    show({ onClose = null } = {}) {
      if (closeTimer !== null) {
        cancelSchedule(closeTimer);
        closeTimer = null;
      }

      closeHandler = typeof onClose === "function" ? onClose : null;
      open = true;
      overlayElement.hidden = false;
      overlayElement.classList.remove("beverage-store-modal--closing");
      void overlayElement.offsetWidth;
      overlayElement.classList.add("beverage-store-modal--visible");
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
