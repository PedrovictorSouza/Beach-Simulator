import { normalizeRecipeBuildCostModel } from "./recipeBuildCostModel.js";

export const BUILD_REQUIREMENT_STATUS = Object.freeze({
  READY: "ready",
  LOCKED: "locked",
  WRONG_STATION: "wrong-station",
  MISSING_RESOURCES: "missing-resources"
});

function normalizeRequirementText(value, fallback = "") {
  const resolved = String(value || "").trim();
  return resolved || fallback;
}

function normalizeInventoryQuantity(value) {
  const resolved = Math.trunc(Number(value));
  return Number.isFinite(resolved) && resolved > 0 ? resolved : 0;
}

function cloneRequirementValue(value) {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneRequirementValue(item)));
  }

  if (value && typeof value === "object") {
    return Object.freeze(Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, cloneRequirementValue(nestedValue)])
    ));
  }

  return value;
}

function getDataKey(data) {
  return JSON.stringify(data || {});
}

function hasMatchingData(stack = {}, resource = {}) {
  if (resource.data == null) {
    return true;
  }

  return getDataKey(stack.data) === getDataKey(resource.data);
}

export function countBuildRequirementInventoryResource(inventory = {}, resource = {}) {
  const itemId = normalizeRequirementText(resource.itemId || resource.id || resource.resourceId);

  if (!itemId) {
    return 0;
  }

  if (Array.isArray(inventory)) {
    return inventory
      .filter((stack) => stack?.itemId === itemId && hasMatchingData(stack, resource))
      .reduce((total, stack) => total + normalizeInventoryQuantity(stack.quantity ?? stack.count ?? stack.amount), 0);
  }

  if (!inventory || typeof inventory !== "object") {
    return 0;
  }

  return normalizeInventoryQuantity(inventory[itemId]);
}

function createResourceRequirementState(resource, inventory) {
  const availableQuantity = countBuildRequirementInventoryResource(inventory, resource);
  const requiredQuantity = normalizeInventoryQuantity(resource.quantity);
  const missingQuantity = Math.max(0, requiredQuantity - availableQuantity);

  return Object.freeze({
    itemId: resource.itemId,
    requiredQuantity,
    availableQuantity,
    missingQuantity,
    satisfied: missingQuantity === 0,
    optional: Boolean(resource.optional),
    role: resource.role || null,
    data: resource.data == null ? null : cloneRequirementValue(resource.data)
  });
}

function freezeResourceStates(states = []) {
  return Object.freeze(states.map((state) => Object.freeze(state)));
}

export function validateBuildRequirements(entry = {}, {
  inventory = {},
  unlocked = true,
  stationId = null
} = {}) {
  const model = normalizeRecipeBuildCostModel(entry);
  const requiredResources = freezeResourceStates(
    model.cost.map((resource) => createResourceRequirementState(resource, inventory))
  );
  const missingResources = freezeResourceStates(
    requiredResources.filter((resource) => !resource.optional && resource.missingQuantity > 0)
  );
  const satisfiedResources = freezeResourceStates(
    requiredResources.filter((resource) => resource.satisfied)
  );
  const normalizedStationId = normalizeRequirementText(stationId);
  const stationMismatch = Boolean(normalizedStationId && model.stationId && model.stationId !== normalizedStationId);
  const reasons = [];

  if (!unlocked) {
    reasons.push(BUILD_REQUIREMENT_STATUS.LOCKED);
  }

  if (stationMismatch) {
    reasons.push(BUILD_REQUIREMENT_STATUS.WRONG_STATION);
  }

  if (missingResources.length > 0) {
    reasons.push(BUILD_REQUIREMENT_STATUS.MISSING_RESOURCES);
  }

  const canBuild = reasons.length === 0;

  return Object.freeze({
    id: model.id,
    label: model.label,
    kind: model.kind,
    stationId: model.stationId,
    canBuild,
    status: canBuild ? BUILD_REQUIREMENT_STATUS.READY : reasons[0],
    reasons: Object.freeze(reasons),
    requiredResources,
    satisfiedResources,
    missingResources
  });
}

export function formatBuildRequirementSummary(validationResult = {}, {
  getItemLabel = (itemId) => itemId,
  includeSatisfied = false
} = {}) {
  const resources = includeSatisfied ?
    validationResult.requiredResources || [] :
    validationResult.missingResources || [];

  return resources
    .map((resource) => {
      const label = normalizeRequirementText(getItemLabel(resource.itemId), resource.itemId);
      return `${label} ${resource.availableQuantity}/${resource.requiredQuantity}`;
    })
    .join(" · ");
}
