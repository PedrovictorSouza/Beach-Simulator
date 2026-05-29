function normalizeRegistryId(id) {
  return String(id || "").trim();
}

function normalizeRegistryText(value, fallback = "") {
  const resolved = String(value || "").trim();
  return resolved || fallback;
}

function freezeStringList(values = []) {
  const source = Array.isArray(values) ? values : [];
  const uniqueValues = [];
  const seen = new Set();

  for (const value of source) {
    const normalizedValue = normalizeRegistryText(value);
    if (!normalizedValue || seen.has(normalizedValue)) {
      continue;
    }

    seen.add(normalizedValue);
    uniqueValues.push(normalizedValue);
  }

  return Object.freeze(uniqueValues);
}

function normalizeCategoryId(category) {
  const rawValue = category && typeof category === "object" ? category.id : category;
  return normalizeRegistryText(rawValue);
}

function addCategory(categories, seen, category, source) {
  const id = normalizeCategoryId(category);
  if (!id || seen.has(id)) {
    return;
  }

  seen.add(id);
  categories.push(Object.freeze({ id, source }));
}

function buildWorldObjectCategories(entry = {}) {
  const categories = [];
  const seen = new Set();

  for (const category of Array.isArray(entry.categories) ? entry.categories : []) {
    addCategory(categories, seen, category, "explicit");
  }

  addCategory(categories, seen, entry.kind, "kind");
  addCategory(categories, seen, entry.placementMode, "placementMode");

  for (const tag of Array.isArray(entry.tags) ? entry.tags : []) {
    addCategory(categories, seen, tag, "tag");
  }

  return Object.freeze(categories);
}

function cloneRegistryValue(value) {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneRegistryValue(item)));
  }

  if (value && typeof value === "object") {
    return Object.freeze(Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, cloneRegistryValue(nestedValue)])
    ));
  }

  return value;
}

function normalizeOptionalRegistryText(value) {
  const normalizedValue = normalizeRegistryText(value);
  return normalizedValue || null;
}

function normalizeWorldPositionMetadata(position) {
  if (!Array.isArray(position) || position.length !== 3) {
    return null;
  }

  const normalizedPosition = position.map((value) => Number(value));
  return normalizedPosition.every((value) => Number.isFinite(value)) ?
    Object.freeze(normalizedPosition) :
    null;
}

function normalizeFootprintMetadata(footprint) {
  if (!footprint || typeof footprint !== "object") {
    return null;
  }

  const width = Math.max(1, Math.trunc(Number(footprint.width ?? footprint.x ?? 1)));
  const height = Math.max(1, Math.trunc(Number(footprint.height ?? footprint.y ?? footprint.depth ?? 1)));

  return Object.freeze({
    width: Number.isFinite(width) ? width : 1,
    height: Number.isFinite(height) ? height : 1
  });
}

function resolvePlacementRuleType(placementMode, placementRules = {}) {
  return normalizeRegistryText(
    placementRules.type ?? placementRules.ruleType,
    placementMode === "crafted-placeable" ? "grid-footprint" : "authored-fixed"
  );
}

function buildPlacementRequirementDefaults(placementMode) {
  if (placementMode === "crafted-placeable") {
    return ["grid-cell", "empty-footprint", "source-item", "grid-placeable"];
  }

  if (placementMode === "authored") {
    return ["world-position"];
  }

  return ["grid-cell"];
}

function buildPlacementBlockerDefaults(placementMode) {
  if (placementMode === "crafted-placeable") {
    return ["world-bounds", "occupied-footprint"];
  }

  if (placementMode === "authored") {
    return ["occupied-footprint"];
  }

  return [];
}

export function normalizeWorldObjectPlacementRules(entry = {}) {
  if (!entry || typeof entry !== "object") {
    throw new TypeError("world object placement rules require an object");
  }

  const placementRules = entry.placementRules && typeof entry.placementRules === "object" ? entry.placementRules : {};
  const placementMode = normalizeRegistryText(entry.placementMode, "authored");
  const footprint = normalizeFootprintMetadata(placementRules.footprint || entry.footprint) ||
    Object.freeze({ width: 1, height: 1 });
  const allowRotation = typeof placementRules.allowRotation === "boolean" ?
    placementRules.allowRotation :
    placementMode === "crafted-placeable";

  return Object.freeze({
    type: resolvePlacementRuleType(placementMode, placementRules),
    placementMode,
    footprint,
    surface: normalizeRegistryText(placementRules.surface, "ground"),
    collision: normalizeRegistryText(placementRules.collision, "solid-footprint"),
    rotation: normalizeRegistryText(placementRules.rotation, allowRotation ? "quarter-turn" : "fixed"),
    allowRotation,
    requires: freezeStringList(placementRules.requires || buildPlacementRequirementDefaults(placementMode)),
    blockers: freezeStringList(placementRules.blockers || buildPlacementBlockerDefaults(placementMode))
  });
}

export function normalizeWorldObjectMetadata(entry = {}, { index = 0 } = {}) {
  if (!entry || typeof entry !== "object") {
    throw new TypeError(`world object metadata at index ${index} must be an object`);
  }

  const id = normalizeRegistryId(entry.id);
  if (!id) {
    throw new TypeError(`world object metadata at index ${index} requires an id`);
  }

  const kind = normalizeRegistryText(entry.kind, "object");
  const placementMode = normalizeRegistryText(entry.placementMode, "authored");
  const tags = freezeStringList(entry.tags);
  const categories = buildWorldObjectCategories({
    categories: entry.categories,
    kind,
    placementMode,
    tags
  });

  return Object.freeze({
    id,
    label: normalizeRegistryText(entry.label, id),
    kind,
    placementMode,
    tags,
    categories,
    categoryIds: Object.freeze(categories.map((category) => category.id)),
    lifecycle: freezeStringList(entry.lifecycle),
    emits: freezeStringList(entry.emits),
    position: normalizeWorldPositionMetadata(entry.position),
    footprint: normalizeFootprintMetadata(entry.footprint),
    placementRules: normalizeWorldObjectPlacementRules({
      ...entry,
      placementMode
    }),
    activation: entry.activation ? cloneRegistryValue(entry.activation) : null,
    runtimeRefs: entry.runtimeRefs ? cloneRegistryValue(entry.runtimeRefs) : Object.freeze({}),
    stationId: normalizeOptionalRegistryText(entry.stationId),
    sourceItemId: normalizeOptionalRegistryText(entry.sourceItemId),
    recipeId: normalizeOptionalRegistryText(entry.recipeId),
    gridPlaceableId: normalizeOptionalRegistryText(entry.gridPlaceableId),
    prefabKey: normalizeOptionalRegistryText(entry.prefabKey)
  });
}

export function getWorldObjectCategoryIds(entry = {}) {
  const source = entry && typeof entry === "object" && entry.metadata ? entry.metadata : entry;

  if (Array.isArray(source?.categoryIds)) {
    return Object.freeze(source.categoryIds.map((categoryId) => normalizeCategoryId(categoryId)).filter(Boolean));
  }

  return Object.freeze(buildWorldObjectCategories(source).map((category) => category.id));
}

export function hasWorldObjectCategory(entry = {}, categoryId) {
  const normalizedCategoryId = normalizeCategoryId(categoryId);
  return Boolean(normalizedCategoryId && getWorldObjectCategoryIds(entry).includes(normalizedCategoryId));
}

export function getWorldObjectPlacementRules(entry = {}) {
  const source = entry && typeof entry === "object" && entry.metadata ? entry.metadata : entry;
  return source?.placementRules || normalizeWorldObjectPlacementRules(source);
}

export function hasWorldObjectPlacementRequirement(entry = {}, requirement) {
  const normalizedRequirement = normalizeRegistryText(requirement);
  return Boolean(normalizedRequirement && getWorldObjectPlacementRules(entry).requires.includes(normalizedRequirement));
}

function normalizeRegistryEntry(entry, index) {
  if (!entry || typeof entry !== "object") {
    throw new TypeError(`world object registry entry at index ${index} must be an object`);
  }

  const id = normalizeRegistryId(entry.id);
  if (!id) {
    throw new TypeError(`world object registry entry at index ${index} requires an id`);
  }

  const metadata = normalizeWorldObjectMetadata(entry, { index });

  return Object.freeze({
    ...cloneRegistryValue(entry),
    ...metadata,
    metadata
  });
}

export function createWorldObjectRegistry(entries = [], { fallbackId = null } = {}) {
  if (!Array.isArray(entries)) {
    throw new TypeError("world object registry entries must be an array");
  }

  const byId = new Map();
  const indexById = new Map();
  const orderedEntries = entries.map((entry, index) => {
    const normalizedEntry = normalizeRegistryEntry(entry, index);

    if (byId.has(normalizedEntry.id)) {
      throw new Error(`Duplicate world object id: ${normalizedEntry.id}`);
    }

    byId.set(normalizedEntry.id, normalizedEntry);
    indexById.set(normalizedEntry.id, index);
    return normalizedEntry;
  });
  const normalizedFallbackId = fallbackId == null ? null : normalizeRegistryId(fallbackId);

  if (normalizedFallbackId && !byId.has(normalizedFallbackId)) {
    throw new Error(`Unknown fallback world object id: ${normalizedFallbackId}`);
  }

  const registryCategoryIds = [];
  const seenRegistryCategoryIds = new Set();
  for (const entry of orderedEntries) {
    for (const categoryId of entry.metadata.categoryIds) {
      if (seenRegistryCategoryIds.has(categoryId)) {
        continue;
      }

      seenRegistryCategoryIds.add(categoryId);
      registryCategoryIds.push(categoryId);
    }
  }
  const frozenRegistryCategoryIds = Object.freeze(registryCategoryIds);

  function get(id) {
    const normalizedId = normalizeRegistryId(id);
    return byId.get(normalizedId) || (normalizedFallbackId ? byId.get(normalizedFallbackId) : null) || null;
  }

  function require(id) {
    const normalizedId = normalizeRegistryId(id);
    const record = byId.get(normalizedId);

    if (!record) {
      throw new Error(`Unknown world object id: ${normalizedId || "(empty)"}`);
    }

    return record;
  }

  return Object.freeze({
    size: orderedEntries.length,
    fallbackId: normalizedFallbackId,
    has(id) {
      return byId.has(normalizeRegistryId(id));
    },
    get,
    require,
    getByIndex(index) {
      const resolvedIndex = Math.trunc(Number(index));
      return Number.isInteger(resolvedIndex) ? orderedEntries[resolvedIndex] || null : null;
    },
    indexOf(id) {
      const normalizedId = normalizeRegistryId(id);
      return indexById.has(normalizedId) ? indexById.get(normalizedId) : -1;
    },
    ids() {
      return Object.freeze(orderedEntries.map((entry) => entry.id));
    },
    categoryIds() {
      return frozenRegistryCategoryIds;
    },
    hasCategory(id, categoryId) {
      const normalizedId = normalizeRegistryId(id);
      const record = byId.get(normalizedId);
      return record ? hasWorldObjectCategory(record, categoryId) : false;
    },
    listByCategory(categoryId) {
      const normalizedCategoryId = normalizeCategoryId(categoryId);
      if (!normalizedCategoryId) {
        return Object.freeze([]);
      }

      return Object.freeze(orderedEntries.filter((entry) => hasWorldObjectCategory(entry, normalizedCategoryId)));
    },
    getPlacementRules(id) {
      const record = get(id);
      return record ? record.metadata.placementRules : null;
    },
    listByPlacementRuleType(ruleType) {
      const normalizedRuleType = normalizeRegistryText(ruleType);
      if (!normalizedRuleType) {
        return Object.freeze([]);
      }

      return Object.freeze(orderedEntries.filter((entry) => entry.metadata.placementRules.type === normalizedRuleType));
    },
    list() {
      return Object.freeze([...orderedEntries]);
    }
  });
}
