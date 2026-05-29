function normalizeModelText(value, fallback = "") {
  const resolved = String(value || "").trim();
  return resolved || fallback;
}

function normalizeOptionalModelText(value) {
  const normalizedValue = normalizeModelText(value);
  return normalizedValue || null;
}

function normalizePositiveQuantity(value, fieldName, itemId) {
  const resolved = Math.trunc(Number(value));

  if (!Number.isFinite(resolved) || resolved <= 0) {
    throw new TypeError(`${fieldName} quantity for ${itemId || "(missing item)"} must be greater than 0`);
  }

  return resolved;
}

function cloneModelValue(value) {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneModelValue(item)));
  }

  if (value && typeof value === "object") {
    return Object.freeze(Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, cloneModelValue(nestedValue)])
    ));
  }

  return value;
}

function freezeStringList(values = []) {
  const source = Array.isArray(values) ? values : [];
  const uniqueValues = [];
  const seen = new Set();

  for (const value of source) {
    const normalizedValue = normalizeModelText(value);

    if (!normalizedValue || seen.has(normalizedValue)) {
      continue;
    }

    seen.add(normalizedValue);
    uniqueValues.push(normalizedValue);
  }

  return Object.freeze(uniqueValues);
}

function hasSingleResourceShape(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && (
    value.itemId != null ||
    value.id != null ||
    value.resourceId != null
  ));
}

function normalizeResourceEntry(entry = {}, index = 0, fieldName = "resources") {
  if (!entry || typeof entry !== "object") {
    throw new TypeError(`${fieldName} entry at index ${index} must be an object`);
  }

  const itemId = normalizeModelText(entry.itemId || entry.id || entry.resourceId);

  if (!itemId) {
    throw new TypeError(`${fieldName} entry at index ${index} requires an itemId`);
  }

  const quantity = normalizePositiveQuantity(
    entry.quantity ?? entry.count ?? entry.amount,
    fieldName,
    itemId
  );

  return Object.freeze({
    itemId,
    quantity,
    data: entry.data ? cloneModelValue(entry.data) : null,
    role: normalizeOptionalModelText(entry.role),
    optional: Boolean(entry.optional)
  });
}

export function normalizeRecipeResourceEntries(resources = {}, { fieldName = "resources" } = {}) {
  if (resources == null) {
    return Object.freeze([]);
  }

  if (Array.isArray(resources)) {
    return Object.freeze(resources.map((entry, index) => normalizeResourceEntry(entry, index, fieldName)));
  }

  if (hasSingleResourceShape(resources)) {
    return Object.freeze([normalizeResourceEntry(resources, 0, fieldName)]);
  }

  if (typeof resources === "object") {
    return Object.freeze(Object.entries(resources)
      .filter(([, quantity]) => quantity != null)
      .map(([itemId, quantity], index) => normalizeResourceEntry({ itemId, quantity }, index, fieldName)));
  }

  throw new TypeError(`${fieldName} must be an object, array, or resource entry`);
}

export function recipeResourceEntriesToMap(entries = []) {
  const map = {};

  for (const entry of Array.isArray(entries) ? entries : []) {
    if (!entry?.itemId || entry.data || entry.optional) {
      continue;
    }

    map[entry.itemId] = (map[entry.itemId] || 0) + Number(entry.quantity || 0);
  }

  return Object.freeze(map);
}

function resolveCostSource(entry = {}) {
  return entry.cost ?? entry.ingredients ?? entry.requiredMaterials ?? entry.materialCost ?? {};
}

function resolveOutputSource(entry = {}) {
  return entry.output ?? entry.outputs ?? entry.result ?? {};
}

export function normalizeRecipeBuildCostModel(entry = {}, { index = 0 } = {}) {
  if (!entry || typeof entry !== "object") {
    throw new TypeError(`recipe/build cost model at index ${index} must be an object`);
  }

  const id = normalizeModelText(entry.id || entry.recipeId || entry.buildCostId);

  if (!id) {
    throw new TypeError(`recipe/build cost model at index ${index} requires an id`);
  }

  const kind = normalizeModelText(entry.kind || entry.sourceType, "recipe");
  const cost = normalizeRecipeResourceEntries(resolveCostSource(entry), { fieldName: "cost" });
  const output = normalizeRecipeResourceEntries(resolveOutputSource(entry), { fieldName: "output" });
  const costMap = recipeResourceEntriesToMap(cost);
  const outputMap = recipeResourceEntriesToMap(output);

  return Object.freeze({
    id,
    label: normalizeModelText(entry.label || entry.title || entry.name, id),
    kind,
    group: normalizeOptionalModelText(entry.group),
    stationId: normalizeOptionalModelText(entry.stationId || entry.station),
    sourceId: normalizeOptionalModelText(entry.sourceId || entry.recipeId || entry.buildCostId),
    outputItemId: normalizeOptionalModelText(entry.outputItemId || Object.keys(outputMap)[0]),
    tags: freezeStringList(entry.tags),
    cost,
    output,
    costMap,
    outputMap,
    totalCostQuantity: cost.reduce((total, resource) => total + resource.quantity, 0),
    totalOutputQuantity: output.reduce((total, resource) => total + resource.quantity, 0),
    metadata: entry.metadata ? cloneModelValue(entry.metadata) : Object.freeze({})
  });
}

export function createRecipeBuildCostRegistry(entries = []) {
  if (!Array.isArray(entries)) {
    throw new TypeError("recipe/build cost registry entries must be an array");
  }

  const byId = new Map();
  const indexById = new Map();
  const orderedEntries = entries.map((entry, index) => {
    const normalizedEntry = normalizeRecipeBuildCostModel(entry, { index });

    if (byId.has(normalizedEntry.id)) {
      throw new Error(`Duplicate recipe/build cost id: ${normalizedEntry.id}`);
    }

    byId.set(normalizedEntry.id, normalizedEntry);
    indexById.set(normalizedEntry.id, index);
    return normalizedEntry;
  });

  function get(id) {
    return byId.get(normalizeModelText(id)) || null;
  }

  function require(id) {
    const normalizedId = normalizeModelText(id);
    const record = byId.get(normalizedId);

    if (!record) {
      throw new Error(`Unknown recipe/build cost id: ${normalizedId || "(empty)"}`);
    }

    return record;
  }

  return Object.freeze({
    size: orderedEntries.length,
    has(id) {
      return byId.has(normalizeModelText(id));
    },
    get,
    require,
    getByIndex(index) {
      const resolvedIndex = Math.trunc(Number(index));
      return Number.isInteger(resolvedIndex) ? orderedEntries[resolvedIndex] || null : null;
    },
    indexOf(id) {
      const normalizedId = normalizeModelText(id);
      return indexById.has(normalizedId) ? indexById.get(normalizedId) : -1;
    },
    ids() {
      return Object.freeze(orderedEntries.map((entry) => entry.id));
    },
    listByKind(kind) {
      const normalizedKind = normalizeModelText(kind);
      return Object.freeze(orderedEntries.filter((entry) => entry.kind === normalizedKind));
    },
    listByStation(stationId) {
      const normalizedStationId = normalizeModelText(stationId);
      return Object.freeze(orderedEntries.filter((entry) => entry.stationId === normalizedStationId));
    },
    list() {
      return Object.freeze([...orderedEntries]);
    }
  });
}
