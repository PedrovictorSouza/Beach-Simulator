export const DEFAULT_ITEM_MAX_STACK_SIZE = 64;

function normalizeStackText(value, fallback = "") {
  const resolved = String(value || "").trim();
  return resolved || fallback;
}

function normalizePositiveInteger(value, fallback = null) {
  const resolved = Math.trunc(Number(value));
  return Number.isFinite(resolved) && resolved > 0 ? resolved : fallback;
}

function normalizeQuantity(value) {
  const resolved = Math.trunc(Number(value));
  return Number.isFinite(resolved) && resolved > 0 ? resolved : 0;
}

function cloneStackValue(value) {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneStackValue(item)));
  }

  if (value && typeof value === "object") {
    return Object.freeze(Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, cloneStackValue(nestedValue)])
    ));
  }

  return value;
}

function resolveRegistryEntry(itemId, registry) {
  if (!registry || typeof registry !== "object") {
    return null;
  }

  if (typeof registry.has === "function" && typeof registry.get === "function") {
    return registry.has(itemId) ? registry.get(itemId) : null;
  }

  if (typeof registry.get === "function") {
    return registry.get(itemId);
  }

  return null;
}

function resolveItemMetadata(itemId, options = {}) {
  const registryEntry = resolveRegistryEntry(itemId, options.registry);
  const directItem = options.item && typeof options.item === "object" ? options.item : null;
  const source = registryEntry || directItem;

  if (!source) {
    return null;
  }

  return source.metadata || source;
}

export function resolveInventoryItemStackRules(itemId, options = {}) {
  const normalizedItemId = normalizeStackText(itemId);
  const metadata = resolveItemMetadata(normalizedItemId, options);
  const stack = metadata?.stack && typeof metadata.stack === "object" ? metadata.stack : {};
  const stackable = typeof stack.stackable === "boolean" ? stack.stackable : true;
  const maxStackSize = stackable ?
    normalizePositiveInteger(stack.maxStackSize ?? stack.maxSize, DEFAULT_ITEM_MAX_STACK_SIZE) :
    1;

  return Object.freeze({
    itemId: normalizedItemId,
    stackable,
    maxStackSize
  });
}

function normalizeStackKey(stack = {}, data = null) {
  return normalizeStackText(stack.stackKey) || JSON.stringify(data || {});
}

export function createInventoryItemStack(stack = {}, options = {}) {
  if (!stack || typeof stack !== "object") {
    throw new TypeError("inventory item stack must be an object");
  }

  const itemId = normalizeStackText(stack.itemId || stack.id);
  if (!itemId) {
    throw new TypeError("inventory item stack requires an itemId");
  }

  const rules = resolveInventoryItemStackRules(itemId, options);
  const requestedQuantity = normalizeQuantity(stack.quantity ?? stack.count ?? stack.amount);
  const quantity = Math.min(requestedQuantity, rules.maxStackSize);
  const data = stack.data ? cloneStackValue(stack.data) : Object.freeze({});

  return Object.freeze({
    itemId,
    quantity,
    requestedQuantity,
    overflowQuantity: Math.max(0, requestedQuantity - quantity),
    stackable: rules.stackable,
    maxStackSize: rules.maxStackSize,
    space: Math.max(0, rules.maxStackSize - quantity),
    empty: quantity <= 0,
    stackKey: normalizeStackKey(stack, data),
    data
  });
}

export function splitItemQuantityIntoStacks(itemId, quantity, options = {}) {
  const rules = resolveInventoryItemStackRules(itemId, options);
  let remainingQuantity = normalizeQuantity(quantity);
  const stacks = [];

  while (remainingQuantity > 0) {
    const stackQuantity = Math.min(remainingQuantity, rules.maxStackSize);
    stacks.push(createInventoryItemStack({
      itemId: rules.itemId,
      quantity: stackQuantity,
      data: options.data
    }, options));
    remainingQuantity -= stackQuantity;
  }

  return Object.freeze(stacks);
}

export function getInventoryItemStackSpace(stack = {}, options = {}) {
  return createInventoryItemStack(stack, options).space;
}

export function canMergeInventoryItemStacks(targetStack = {}, incomingStack = {}, options = {}) {
  const target = createInventoryItemStack(targetStack, options);
  const incoming = createInventoryItemStack(incomingStack, options);

  return Boolean(
    !target.empty &&
    !incoming.empty &&
    target.stackable &&
    incoming.stackable &&
    target.itemId === incoming.itemId &&
    target.stackKey === incoming.stackKey &&
    target.space > 0
  );
}

export function mergeInventoryItemStacks(targetStack = {}, incomingStack = {}, options = {}) {
  const target = createInventoryItemStack(targetStack, options);
  const incoming = createInventoryItemStack(incomingStack, options);

  if (!canMergeInventoryItemStacks(target, incoming, options)) {
    return Object.freeze({
      stack: target,
      remainder: incoming.empty ? null : incoming,
      movedQuantity: 0
    });
  }

  const movedQuantity = Math.min(target.space, incoming.quantity);
  const stack = createInventoryItemStack({
    itemId: target.itemId,
    quantity: target.quantity + movedQuantity,
    stackKey: target.stackKey,
    data: target.data
  }, options);
  const remainderQuantity = incoming.quantity - movedQuantity;
  const remainder = remainderQuantity > 0 ?
    createInventoryItemStack({
      itemId: incoming.itemId,
      quantity: remainderQuantity,
      stackKey: incoming.stackKey,
      data: incoming.data
    }, options) :
    null;

  return Object.freeze({
    stack,
    remainder,
    movedQuantity
  });
}
