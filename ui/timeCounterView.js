function formatTime(remainingSeconds) {
  const totalSeconds = Math.max(0, Math.ceil(Number(remainingSeconds) || 0));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function createTimeCounterView({ root }) {
  if (!root) {
    throw new Error("TimeCounterView precisa de um elemento root.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("div");

  element.className = "time-counter";
  element.setAttribute("role", "timer");
  element.setAttribute("aria-live", "off");
  root.append(element);

  let renderedSecond = null;

  return Object.freeze({
    render({ remainingSeconds }) {
      const nextSecond = Math.max(0, Math.ceil(Number(remainingSeconds) || 0));

      if (nextSecond === renderedSecond) {
        return;
      }

      renderedSecond = nextSecond;
      element.textContent = formatTime(nextSecond);
      element.setAttribute("aria-label", `Time remaining: ${formatTime(nextSecond)}`);
    }
  });
}
