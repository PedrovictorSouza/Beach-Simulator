import {
  GAME_INPUT_ACTION_REGISTRY,
  KEYBOARD_CONTROL_ACTIONS,
  normalizeKeyboardControls
} from "./gameInputBindings.js";

export const INPUT_BINDINGS_SCHEMA_VERSION = 2;

export const INPUT_BINDING_TYPES = Object.freeze({
  KEYBOARD: "keyboard",
  GAMEPAD_BUTTON: "gamepadButton",
  GAMEPAD_AXIS: "gamepadAxis"
});

export const GAMEPAD_LAYOUT_MODE = Object.freeze({
  AUTO: "auto",
  XBOX: "xbox",
  PLAYSTATION: "playstation",
  NINTENDO: "nintendo",
  GENERIC: "generic"
});

export const GAMEPAD_STICK_PRESETS = Object.freeze({
  LEFT_MOVE_RIGHT_LOOK: "leftMoveRightLook",
  RIGHT_MOVE_LEFT_LOOK: "rightMoveLeftLook"
});

function cloneBinding(binding) {
  return Object.freeze({ ...binding });
}

function compactBindings(bindings = []) {
  const seen = new Set();
  const compacted = [];

  for (const binding of bindings) {
    const normalizedBinding = normalizeInputBinding(binding);
    if (!normalizedBinding) {
      continue;
    }

    const key = getBindingConflictKey(normalizedBinding);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    compacted.push(cloneBinding(normalizedBinding));
  }

  return Object.freeze(compacted);
}

function normalizeKeyboardBinding(binding) {
  const code = typeof binding?.code === "string" ? binding.code : "";
  return code ? {
    type: INPUT_BINDING_TYPES.KEYBOARD,
    code
  } : null;
}

function normalizeGamepadButtonBinding(binding) {
  const button = Number(binding?.button);
  return Number.isInteger(button) && button >= 0 ? {
    type: INPUT_BINDING_TYPES.GAMEPAD_BUTTON,
    button
  } : null;
}

function normalizeGamepadAxisBinding(binding) {
  const axis = Number(binding?.axis);
  const direction = Number(binding?.direction);
  return Number.isInteger(axis) && axis >= 0 && (direction === -1 || direction === 1) ? {
    type: INPUT_BINDING_TYPES.GAMEPAD_AXIS,
    axis,
    direction
  } : null;
}

export function normalizeInputBinding(binding) {
  if (!binding || typeof binding !== "object") {
    return null;
  }

  if (binding.type === INPUT_BINDING_TYPES.KEYBOARD) {
    return normalizeKeyboardBinding(binding);
  }

  if (binding.type === INPUT_BINDING_TYPES.GAMEPAD_BUTTON) {
    return normalizeGamepadButtonBinding(binding);
  }

  if (binding.type === INPUT_BINDING_TYPES.GAMEPAD_AXIS) {
    return normalizeGamepadAxisBinding(binding);
  }

  return null;
}

export function getBindingConflictKey(binding) {
  const normalizedBinding = normalizeInputBinding(binding);
  if (!normalizedBinding) {
    return "";
  }

  if (normalizedBinding.type === INPUT_BINDING_TYPES.KEYBOARD) {
    return `${normalizedBinding.type}:${normalizedBinding.code}`;
  }

  if (normalizedBinding.type === INPUT_BINDING_TYPES.GAMEPAD_BUTTON) {
    return `${normalizedBinding.type}:${normalizedBinding.button}`;
  }

  return `${normalizedBinding.type}:${normalizedBinding.axis}:${normalizedBinding.direction}`;
}

function getActionIds(actions = GAME_INPUT_ACTION_REGISTRY) {
  return (actions || [])
    .map((action) => action?.id)
    .filter(Boolean);
}

function getDefaultKeyboardBindingsForAction(action) {
  const codes = action.defaultKeyboardCodes?.length ?
    action.defaultKeyboardCodes :
    (action.defaultKeyboardCode ? [action.defaultKeyboardCode] : []);

  return codes.map((code) => ({
    type: INPUT_BINDING_TYPES.KEYBOARD,
    code
  }));
}

function getDefaultGamepadBindingsForAction(action) {
  return Number.isInteger(action.defaultGamepadButton) ? [{
    type: INPUT_BINDING_TYPES.GAMEPAD_BUTTON,
    button: action.defaultGamepadButton
  }] : [];
}

export function createDefaultInputBindings({
  actions = GAME_INPUT_ACTION_REGISTRY
} = {}) {
  const keyboard = {};
  const gamepadBindings = {};

  for (const action of actions || []) {
    if (!action?.id) {
      continue;
    }

    keyboard[action.id] = compactBindings(getDefaultKeyboardBindingsForAction(action));
    gamepadBindings[action.id] = compactBindings(getDefaultGamepadBindingsForAction(action));
  }

  return {
    schemaVersion: INPUT_BINDINGS_SCHEMA_VERSION,
    keyboard,
    gamepad: {
      layout: GAMEPAD_LAYOUT_MODE.AUTO,
      stickPreset: GAMEPAD_STICK_PRESETS.LEFT_MOVE_RIGHT_LOOK,
      bindings: gamepadBindings
    }
  };
}

function getInputBindingList(source, actionId) {
  const value = source?.[actionId];
  if (typeof value === "string") {
    return value ? [{ type: INPUT_BINDING_TYPES.KEYBOARD, code: value }] : [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return [];
}

function applyBindingMapWithConflicts(targetMap, sourceMap, actionIds) {
  for (const actionId of actionIds) {
    const bindings = compactBindings(getInputBindingList(sourceMap, actionId));
    if (!bindings.length && !Object.hasOwn(sourceMap || {}, actionId)) {
      continue;
    }

    targetMap[actionId] = [];
    for (const binding of bindings) {
      assignBindingToMap(targetMap, actionId, binding, { append: true });
    }
  }
}

function assignBindingToMap(targetMap, actionId, binding, { append = true } = {}) {
  const normalizedBinding = normalizeInputBinding(binding);
  if (!normalizedBinding) {
    targetMap[actionId] = [];
    return targetMap;
  }

  const conflictKey = getBindingConflictKey(normalizedBinding);
  for (const [candidateActionId, bindings] of Object.entries(targetMap)) {
    targetMap[candidateActionId] = (bindings || []).filter((candidateBinding) => (
      candidateActionId === actionId ||
      getBindingConflictKey(candidateBinding) !== conflictKey
    ));
  }

  const nextBindings = append ? [...(targetMap[actionId] || [])] : [];
  nextBindings.push(normalizedBinding);
  targetMap[actionId] = compactBindings(nextBindings);
  return targetMap;
}

export function normalizeInputBindings(inputBindings = {}, legacyKeyboardControls = null, {
  actions = GAME_INPUT_ACTION_REGISTRY
} = {}) {
  const actionIds = getActionIds(actions);
  const defaults = createDefaultInputBindings({ actions });
  const keyboard = Object.fromEntries(actionIds.map((actionId) => [
    actionId,
    [...(defaults.keyboard[actionId] || [])]
  ]));
  const gamepadBindings = Object.fromEntries(actionIds.map((actionId) => [
    actionId,
    [...(defaults.gamepad.bindings[actionId] || [])]
  ]));

  if (legacyKeyboardControls) {
    const normalizedLegacyKeyboard = normalizeKeyboardControls(legacyKeyboardControls);
    applyBindingMapWithConflicts(keyboard, normalizedLegacyKeyboard, actionIds);
  }

  applyBindingMapWithConflicts(keyboard, inputBindings?.keyboard, actionIds);
  applyBindingMapWithConflicts(gamepadBindings, inputBindings?.gamepad?.bindings, actionIds);

  const layout = Object.values(GAMEPAD_LAYOUT_MODE).includes(inputBindings?.gamepad?.layout) ?
    inputBindings.gamepad.layout :
    GAMEPAD_LAYOUT_MODE.AUTO;
  const stickPreset = Object.values(GAMEPAD_STICK_PRESETS).includes(inputBindings?.gamepad?.stickPreset) ?
    inputBindings.gamepad.stickPreset :
    GAMEPAD_STICK_PRESETS.LEFT_MOVE_RIGHT_LOOK;

  return {
    schemaVersion: INPUT_BINDINGS_SCHEMA_VERSION,
    keyboard: Object.fromEntries(actionIds.map((actionId) => [
      actionId,
      compactBindings(keyboard[actionId])
    ])),
    gamepad: {
      layout,
      stickPreset,
      bindings: Object.fromEntries(actionIds.map((actionId) => [
        actionId,
        compactBindings(gamepadBindings[actionId])
      ]))
    }
  };
}

export function assignInputBinding(inputBindings = {}, {
  actionId,
  binding,
  device = null,
  append = false
} = {}) {
  const normalized = normalizeInputBindings(inputBindings);
  const normalizedBinding = normalizeInputBinding(binding);
  const targetDevice = device || normalizedBinding?.type || INPUT_BINDING_TYPES.KEYBOARD;
  const actionIds = getActionIds();

  if (!actionIds.includes(actionId)) {
    return normalized;
  }

  if (targetDevice === INPUT_BINDING_TYPES.KEYBOARD) {
    assignBindingToMap(normalized.keyboard, actionId, normalizedBinding, { append });
    return normalizeInputBindings(normalized);
  }

  assignBindingToMap(normalized.gamepad.bindings, actionId, normalizedBinding, { append });
  return normalizeInputBindings(normalized);
}

export function deriveLegacyKeyboardControls(inputBindings = {}) {
  const normalized = normalizeInputBindings(inputBindings);
  const keyboardControls = {};

  for (const action of KEYBOARD_CONTROL_ACTIONS) {
    const firstKeyboardBinding = normalized.keyboard[action.id]
      ?.find((binding) => binding.type === INPUT_BINDING_TYPES.KEYBOARD);
    keyboardControls[action.id] = firstKeyboardBinding?.code || "";
  }

  return normalizeKeyboardControls(keyboardControls);
}

export function normalizeControlsState(controlsState = {}) {
  const input = normalizeInputBindings(
    controlsState?.input,
    controlsState?.keyboard
  );

  return {
    schemaVersion: INPUT_BINDINGS_SCHEMA_VERSION,
    keyboard: deriveLegacyKeyboardControls(input),
    input
  };
}
