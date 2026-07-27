const START_TRANSITION_DURATION_MS = 350;

export function createStartScreenView({ root }) {
  if (!root) {
    throw new Error("StartScreenView precisa de um elemento root.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("section");
  const title = documentRef.createElement("h1");
  const button = documentRef.createElement("button");
  let ready = false;
  let startRequested = false;
  let resolveStart;
  let transitionTimeoutId = null;

  element.className = "start-screen";
  element.setAttribute("aria-label", "Beach Simulator start screen");

  title.className = "start-screen__title";
  title.textContent = "BEACH SIMULATOR";

  button.className = "start-screen__button";
  button.type = "button";
  button.disabled = true;
  button.textContent = "LOADING...";

  const startPromise = new Promise((resolve) => {
    resolveStart = resolve;
  });
  const handleStart = () => {
    if (!ready || startRequested) {
      return;
    }

    startRequested = true;
    button.disabled = true;
    element.classList.add("start-screen--leaving");
    transitionTimeoutId = root.ownerDocument.defaultView.setTimeout(
      resolveStart,
      START_TRANSITION_DURATION_MS
    );
  };

  button.addEventListener("click", handleStart);
  element.append(title, button);
  root.append(element);

  return Object.freeze({
    setReady() {
      if (startRequested) {
        return;
      }

      ready = true;
      button.disabled = false;
      button.textContent = "START";
      button.focus();
    },
    waitForStart() {
      return startPromise;
    },
    destroy() {
      root.ownerDocument.defaultView.clearTimeout(transitionTimeoutId);
      button.removeEventListener("click", handleStart);
      element.remove();
    }
  });
}
