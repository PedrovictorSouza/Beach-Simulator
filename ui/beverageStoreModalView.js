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

  const hide = () => {
    overlayElement.classList.remove("beverage-store-modal--visible");
    overlayElement.hidden = true;
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
    show() {
      overlayElement.hidden = false;
      void overlayElement.offsetWidth;
      overlayElement.classList.add("beverage-store-modal--visible");
      dialogElement.focus();
    }
  });
}
