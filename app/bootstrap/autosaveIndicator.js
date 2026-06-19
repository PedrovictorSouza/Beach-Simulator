export function createAutosaveIndicator({ documentRef, mount, windowRef }) {
  const root = mount || documentRef?.body || null;
  let hideTimeout = null;
  let element = null;

  function ensureElement() {
    if (element || !root || !documentRef?.createElement) {
      return element;
    }

    element = documentRef.createElement("div");
    element.textContent = "Saving...";
    element.setAttribute("aria-live", "polite");
    Object.assign(element.style, {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: "40",
      pointerEvents: "none",
      color: "#ffffff",
      fontFamily: "var(--game-ui-font, monospace)",
      fontSize: "32px",
      lineHeight: "1",
      letterSpacing: "0",
      textAlign: "center",
      textShadow: "2px 2px 0 #11111b",
      opacity: "0",
      transition: "opacity 120ms linear"
    });
    root.appendChild(element);
    return element;
  }

  function show() {
    const indicator = ensureElement();
    if (!indicator) {
      return;
    }

    indicator.style.opacity = "1";
    if (hideTimeout) {
      windowRef.clearTimeout?.(hideTimeout);
    }
    hideTimeout = windowRef.setTimeout?.(() => {
      indicator.style.opacity = "0";
      hideTimeout = null;
    }, 900);
  }

  return {
    show
  };
}
