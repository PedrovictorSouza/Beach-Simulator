export const MODAL_COMMANDS = Object.freeze({
  NEXT: "next",
  PREVIOUS: "previous",
  CONFIRM: "confirm",
  CLOSE: "close",
  CONSUME: "consume"
});

export const DEFAULT_MODAL_KEY_COMMANDS = Object.freeze({
  ArrowDown: MODAL_COMMANDS.NEXT,
  ArrowRight: MODAL_COMMANDS.NEXT,
  ArrowLeft: MODAL_COMMANDS.PREVIOUS,
  ArrowUp: MODAL_COMMANDS.PREVIOUS,
  Enter: MODAL_COMMANDS.CONFIRM,
  KeyX: MODAL_COMMANDS.CONFIRM,
  Escape: MODAL_COMMANDS.CLOSE,
  KeyB: MODAL_COMMANDS.CLOSE,
  Space: MODAL_COMMANDS.CLOSE
});

export function resolveModalCommand(eventOrCode, keyCommands = DEFAULT_MODAL_KEY_COMMANDS) {
  const code = typeof eventOrCode === "string" ? eventOrCode : eventOrCode?.code;
  return keyCommands[code] || MODAL_COMMANDS.CONSUME;
}

export function resolveModalPointerCommand(actionId, pointerCommands = {}) {
  return pointerCommands[actionId] || MODAL_COMMANDS.CONSUME;
}

export function getWrappedModalIndex(index = 0, totalItems = 0) {
  if (totalItems <= 0) {
    return 0;
  }

  return (index + totalItems) % totalItems;
}
