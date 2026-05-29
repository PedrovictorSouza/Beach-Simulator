function normalizeRegistryId(id) {
  return String(id || "").trim();
}

function normalizeRegistryText(value, fallback = "") {
  const resolved = String(value || "").trim();
  return resolved || fallback;
}

function normalizeOptionalRegistryText(value) {
  const normalizedValue = normalizeRegistryText(value);
  return normalizedValue || null;
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

function normalizePositiveInteger(value) {
  if (value == null) {
    return null;
  }

  const resolved = Math.trunc(Number(value));
  return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
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

function buildItemResourceCategories(entry = {}) {
  const categories = [];
  const seen = new Set();

  for (const category of Array.isArray(entry.categories) ? entry.categories : []) {
    addCategory(categories, seen, category, "explicit");
  }

  addCategory(categories, seen, entry.group, "group");
  addCategory(categories, seen, entry.kind, "kind");

  for (const tag of Array.isArray(entry.tags) ? entry.tags : []) {
    addCategory(categories, seen, tag, "tag");
  }

  return Object.freeze(categories);
}

function normalizeItemStackMetadata(entry = {}) {
  const stack = entry.stack && typeof entry.stack === "object" ? entry.stack : {};
  const maxStackSize = normalizePositiveInteger(
    entry.maxStackSize ?? entry.stackSize ?? stack.maxStackSize ?? stack.maxSize
  );
  const stackable = typeof entry.stackable === "boolean" ?
    entry.stackable :
    typeof stack.stackable === "boolean" ?
      stack.stackable :
      true;

  return Object.freeze({
    stackable,
    maxStackSize
  });
}

export function normalizeItemResourceMetadata(entry = {}, { index = 0 } = {}) {
  if (!entry || typeof entry !== "object") {
    throw new TypeError(`item/resource metadata at index ${index} must be an object`);
  }

  const id = normalizeRegistryId(entry.id);
  if (!id) {
    throw new TypeError(`item/resource metadata at index ${index} requires an id`);
  }

  const kind = normalizeRegistryText(entry.kind, "resource");
  const group = normalizeRegistryText(entry.group, kind);
  const tags = freezeStringList(entry.tags);
  const categories = buildItemResourceCategories({
    categories: entry.categories,
    group,
    kind,
    tags
  });

  return Object.freeze({
    id,
    label: normalizeRegistryText(entry.label, id),
    kind,
    group,
    tags,
    categories,
    categoryIds: Object.freeze(categories.map((category) => category.id)),
    stack: normalizeItemStackMetadata(entry),
    icon: entry.icon ? cloneRegistryValue(entry.icon) : null,
    sourceObjectId: normalizeOptionalRegistryText(entry.sourceObjectId),
    worldObjectId: normalizeOptionalRegistryText(entry.worldObjectId),
    recipeId: normalizeOptionalRegistryText(entry.recipeId),
    currencyId: normalizeOptionalRegistryText(entry.currencyId),
    runtimeRefs: entry.runtimeRefs ? cloneRegistryValue(entry.runtimeRefs) : Object.freeze({}),
    data: entry.data ? cloneRegistryValue(entry.data) : Object.freeze({})
  });
}

export function getItemResourceCategoryIds(entry = {}) {
  const source = entry && typeof entry === "object" && entry.metadata ? entry.metadata : entry;

  if (Array.isArray(source?.categoryIds)) {
    return Object.freeze(source.categoryIds.map((categoryId) => normalizeCategoryId(categoryId)).filter(Boolean));
  }

  return Object.freeze(buildItemResourceCategories(source).map((category) => category.id));
}

export function hasItemResourceCategory(entry = {}, categoryId) {
  const normalizedCategoryId = normalizeCategoryId(categoryId);
  return Boolean(normalizedCategoryId && getItemResourceCategoryIds(entry).includes(normalizedCategoryId));
}

function normalizeRegistryEntry(entry, index) {
  if (!entry || typeof entry !== "object") {
    throw new TypeError(`item/resource registry entry at index ${index} must be an object`);
  }

  const metadata = normalizeItemResourceMetadata(entry, { index });

  return Object.freeze({
    ...cloneRegistryValue(entry),
    ...metadata,
    metadata
  });
}

export function createItemResourceRegistry(entries = [], { fallbackId = null } = {}) {
  if (!Array.isArray(entries)) {
    throw new TypeError("item/resource registry entries must be an array");
  }

  const byId = new Map();
  const indexById = new Map();
  const orderedEntries = entries.map((entry, index) => {
    const normalizedEntry = normalizeRegistryEntry(entry, index);

    if (byId.has(normalizedEntry.id)) {
      throw new Error(`Duplicate item/resource id: ${normalizedEntry.id}`);
    }

    byId.set(normalizedEntry.id, normalizedEntry);
    indexById.set(normalizedEntry.id, index);
    return normalizedEntry;
  });
  const normalizedFallbackId = fallbackId == null ? null : normalizeRegistryId(fallbackId);

  if (normalizedFallbackId && !byId.has(normalizedFallbackId)) {
    throw new Error(`Unknown fallback item/resource id: ${normalizedFallbackId}`);
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
      throw new Error(`Unknown item/resource id: ${normalizedId || "(empty)"}`);
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
      const record = byId.get(normalizeRegistryId(id));
      return record ? hasItemResourceCategory(record, categoryId) : false;
    },
    listByCategory(categoryId) {
      const normalizedCategoryId = normalizeCategoryId(categoryId);

      if (!normalizedCategoryId) {
        return Object.freeze([]);
      }

      return Object.freeze(orderedEntries.filter((entry) => hasItemResourceCategory(entry, normalizedCategoryId)));
    },
    listByKind(kind) {
      const normalizedKind = normalizeRegistryText(kind);

      if (!normalizedKind) {
        return Object.freeze([]);
      }

      return Object.freeze(orderedEntries.filter((entry) => entry.metadata.kind === normalizedKind));
    },
    listByGroup(group) {
      const normalizedGroup = normalizeRegistryText(group);

      if (!normalizedGroup) {
        return Object.freeze([]);
      }

      return Object.freeze(orderedEntries.filter((entry) => entry.metadata.group === normalizedGroup));
    },
    list() {
      return Object.freeze([...orderedEntries]);
    }
  });
}
