import {
  createInventoryItemStack,
  mergeInventoryItemStacks,
  splitItemQuantityIntoStacks
} from "./inventoryItemStack.js";

function normalizeResourceText(value, fallback = "") {
  const resolved = String(value || "").trim();
  return resolved || fallback;
}

function normalizeQuantity(value) {
  const resolved = Math.trunc(Number(value));
  return Number.isFinite(resolved) && resolved > 0 ? resolved : 0;
}

function cloneStackData(data) {
  if (Array.isArray(data)) {
    return Object.freeze(data.map((item) => cloneStackData(item)));
  }

  if (data && typeof data === "object") {
    return Object.freeze(Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, cloneStackData(value)])
    ));
  }

  return data;
}

function getStackDataKey(data) {
  return JSON.stringify(data || {});
}

function getResourceStackFilter(operation = {}) {
  const itemId = normalizeResourceText(operation.itemId || operation.id);
  const hasDataFilter = operation.data != null;
  const dataKey = hasDataFilter ? getStackDataKey(operation.data) : null;

  return (stack) => {
    if (!stack || stack.itemId !== itemId) {
      return false;
    }

    if (!hasDataFilter) {
      return true;
    }

    return getStackDataKey(stack.data) === dataKey;
  };
}

export function normalizeInventoryResourceStacks(stacks = [], options = {}) {
  if (!Array.isArray(stacks)) {
    throw new TypeError("inventory resource stacks must be an array");
  }

  return Object.freeze(stacks
    .filter(Boolean)
    .map((stack) => createInventoryItemStack(stack, options))
    .filter((stack) => !stack.empty));
}

export function countInventoryResource(stacks = [], operation = {}, options = {}) {
  const normalizedStacks = normalizeInventoryResourceStacks(stacks, options);
  const matchesStack = getResourceStackFilter(operation);

  return normalizedStacks
    .filter((stack) => matchesStack(stack))
    .reduce((total, stack) => total + stack.quantity, 0);
}

export function hasInventoryResource(stacks = [], operation = {}, options = {}) {
  const quantity = normalizeQuantity(operation.quantity ?? operation.count ?? operation.amount);
  return countInventoryResource(stacks, operation, options) >= quantity;
}

export function addInventoryResource(stacks = [], operation = {}, options = {}) {
  const itemId = normalizeResourceText(operation.itemId || operation.id);
  if (!itemId) {
    throw new TypeError("inventory resource add operation requires an itemId");
  }

  const quantity = normalizeQuantity(operation.quantity ?? operation.count ?? operation.amount);
  const normalizedStacks = [...normalizeInventoryResourceStacks(stacks, options)];
  let remainingQuantity = quantity;
  let addedQuantity = 0;
  const incomingData = operation.data ? cloneStackData(operation.data) : Object.freeze({});
  let incomingStacks = splitItemQuantityIntoStacks(itemId, remainingQuantity, {
    ...options,
    data: incomingData
  });

  for (let index = 0; index < normalizedStacks.length && incomingStacks.length > 0; index += 1) {
    let targetStack = normalizedStacks[index];
    const nextIncomingStacks = [];

    for (const incomingStack of incomingStacks) {
      const result = mergeInventoryItemStacks(targetStack, incomingStack, options);
      targetStack = result.stack;
      addedQuantity += result.movedQuantity;
      remainingQuantity -= result.movedQuantity;

      if (result.remainder) {
        nextIncomingStacks.push(result.remainder);
      }
    }

    normalizedStacks[index] = targetStack;
    incomingStacks = Object.freeze(nextIncomingStacks);
  }

  if (remainingQuantity > 0) {
    const appendedStacks = splitItemQuantityIntoStacks(itemId, remainingQuantity, {
      ...options,
      data: incomingData
    });
    normalizedStacks.push(...appendedStacks);
    addedQuantity += appendedStacks.reduce((total, stack) => total + stack.quantity, 0);
    remainingQuantity = 0;
  }

  return Object.freeze({
    stacks: Object.freeze(normalizedStacks),
    addedQuantity,
    remainderQuantity: remainingQuantity,
    changed: addedQuantity > 0
  });
}

export function removeInventoryResource(stacks = [], operation = {}, options = {}) {
  const itemId = normalizeResourceText(operation.itemId || operation.id);
  if (!itemId) {
    throw new TypeError("inventory resource remove operation requires an itemId");
  }

  const quantity = normalizeQuantity(operation.quantity ?? operation.count ?? operation.amount);
  const normalizedStacks = normalizeInventoryResourceStacks(stacks, options);
  const matchesStack = getResourceStackFilter({ ...operation, itemId });
  let remainingQuantity = quantity;
  let removedQuantity = 0;
  const nextStacks = [];

  for (const stack of normalizedStacks) {
    if (remainingQuantity <= 0 || !matchesStack(stack)) {
      nextStacks.push(stack);
      continue;
    }

    const removedFromStack = Math.min(stack.quantity, remainingQuantity);
    const remainingInStack = stack.quantity - removedFromStack;
    removedQuantity += removedFromStack;
    remainingQuantity -= removedFromStack;

    if (remainingInStack > 0) {
      nextStacks.push(createInventoryItemStack({
        itemId: stack.itemId,
        quantity: remainingInStack,
        stackKey: stack.stackKey,
        data: stack.data
      }, options));
    }
  }

  return Object.freeze({
    stacks: Object.freeze(nextStacks),
    removedQuantity,
    missingQuantity: remainingQuantity,
    changed: removedQuantity > 0,
    complete: remainingQuantity === 0
  });
}
