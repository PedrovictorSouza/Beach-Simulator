import { createInventoryItemStack } from "./inventoryItemStack.js";
import { normalizeInventoryResourceStacks } from "./inventoryResourceOperations.js";

function normalizeCapacityText(value, fallback = "") {
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

function resolveCapacitySource(options = {}) {
  return options.capacity && typeof options.capacity === "object" ? options.capacity : options;
}

export function normalizeInventoryCapacityRules(options = {}) {
  const source = resolveCapacitySource(options);
  const maxSlots = normalizePositiveInteger(
    source.maxSlots ?? source.slotCount ?? source.maxStacks
  );

  return Object.freeze({
    maxSlots
  });
}

export function summarizeInventoryCapacity(stacks = [], options = {}) {
  const normalizedStacks = normalizeInventoryResourceStacks(stacks, options);
  const rules = normalizeInventoryCapacityRules(options);
  const usedSlots = normalizedStacks.length;
  const emptySlots = rules.maxSlots == null ?
    Number.POSITIVE_INFINITY :
    Math.max(0, rules.maxSlots - usedSlots);
  const totalQuantity = normalizedStacks.reduce((total, stack) => total + stack.quantity, 0);
  const totalFreeStackSpace = normalizedStacks.reduce((total, stack) => total + stack.space, 0);
  const overCapacity = rules.maxSlots != null && usedSlots > rules.maxSlots;

  return Object.freeze({
    maxSlots: rules.maxSlots,
    usedSlots,
    emptySlots,
    totalQuantity,
    totalFreeStackSpace,
    overCapacity,
    full: rules.maxSlots != null && !overCapacity && emptySlots === 0 && totalFreeStackSpace === 0
  });
}

function createCapacityProbe(operation = {}, options = {}) {
  const itemId = normalizeCapacityText(operation.itemId || operation.id);
  if (!itemId) {
    throw new TypeError("inventory capacity operation requires an itemId");
  }

  return createInventoryItemStack({
    itemId,
    quantity: 1,
    data: operation.data
  }, options);
}

function canStackAcceptProbe(stack, probe) {
  return Boolean(
    stack.itemId === probe.itemId &&
    stack.stackable &&
    probe.stackable &&
    stack.stackKey === probe.stackKey &&
    stack.space > 0
  );
}

export function getInventoryResourceCapacity(stacks = [], operation = {}, options = {}) {
  const normalizedStacks = normalizeInventoryResourceStacks(stacks, options);
  const summary = summarizeInventoryCapacity(normalizedStacks, options);
  const probe = createCapacityProbe(operation, options);
  const requestedQuantity = normalizeQuantity(operation.quantity ?? operation.count ?? operation.amount);
  const mergeSpace = normalizedStacks
    .filter((stack) => canStackAcceptProbe(stack, probe))
    .reduce((total, stack) => total + stack.space, 0);
  const emptySlotSpace = summary.emptySlots === Number.POSITIVE_INFINITY ?
    Number.POSITIVE_INFINITY :
    summary.emptySlots * probe.maxStackSize;
  const availableQuantity = emptySlotSpace === Number.POSITIVE_INFINITY ?
    Number.POSITIVE_INFINITY :
    mergeSpace + emptySlotSpace;
  const acceptedQuantity = availableQuantity === Number.POSITIVE_INFINITY ?
    requestedQuantity :
    Math.min(requestedQuantity, availableQuantity);
  const rejectedQuantity = Math.max(0, requestedQuantity - acceptedQuantity);

  return Object.freeze({
    itemId: probe.itemId,
    requestedQuantity,
    maxSlots: summary.maxSlots,
    usedSlots: summary.usedSlots,
    emptySlots: summary.emptySlots,
    mergeSpace,
    emptySlotSpace,
    availableQuantity,
    acceptedQuantity,
    rejectedQuantity,
    canFit: rejectedQuantity === 0
  });
}

export function canFitInventoryResource(stacks = [], operation = {}, options = {}) {
  return getInventoryResourceCapacity(stacks, operation, options).canFit;
}

export function clampInventoryResourceAddOperation(stacks = [], operation = {}, options = {}) {
  const capacity = getInventoryResourceCapacity(stacks, operation, options);

  return Object.freeze({
    ...operation,
    itemId: capacity.itemId,
    quantity: capacity.acceptedQuantity,
    rejectedQuantity: capacity.rejectedQuantity,
    capacity
  });
}
