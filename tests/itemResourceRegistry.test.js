import { describe, expect, it } from "vitest";
import {
  createItemResourceRegistry,
  getItemResourceCategoryIds,
  hasItemResourceCategory,
  normalizeItemResourceMetadata
} from "../app/gameplay/itemResourceRegistry.js";

describe("item/resource registry", () => {
  it("normalizes immutable item/resource metadata", () => {
    const metadata = normalizeItemResourceMetadata({
      id: "wood",
      label: "Wood",
      kind: "material",
      group: "materials",
      categories: ["supplies"],
      tags: ["organic", "buildable", "organic"],
      maxStackSize: 99,
      icon: { type: "image", src: "Objects/wood.png" },
      sourceObjectId: "tree",
      recipeId: "foundation-wall",
      runtimeRefs: { color: "#8c5a34" },
      data: { tier: "starter" }
    });

    expect(metadata).toEqual({
      id: "wood",
      label: "Wood",
      kind: "material",
      group: "materials",
      tags: ["organic", "buildable"],
      categories: [
        { id: "supplies", source: "explicit" },
        { id: "materials", source: "group" },
        { id: "material", source: "kind" },
        { id: "organic", source: "tag" },
        { id: "buildable", source: "tag" }
      ],
      categoryIds: ["supplies", "materials", "material", "organic", "buildable"],
      stack: { stackable: true, maxStackSize: 99 },
      icon: { type: "image", src: "Objects/wood.png" },
      sourceObjectId: "tree",
      worldObjectId: null,
      recipeId: "foundation-wall",
      currencyId: null,
      runtimeRefs: { color: "#8c5a34" },
      data: { tier: "starter" }
    });
    expect(Object.isFrozen(metadata)).toBe(true);
    expect(Object.isFrozen(metadata.tags)).toBe(true);
    expect(Object.isFrozen(metadata.categories)).toBe(true);
    expect(Object.isFrozen(metadata.stack)).toBe(true);
    expect(Object.isFrozen(metadata.icon)).toBe(true);
    expect(Object.isFrozen(metadata.runtimeRefs)).toBe(true);
    expect(Object.isFrozen(metadata.data)).toBe(true);
  });

  it("creates a stable registry with fallback and index lookup", () => {
    const registry = createItemResourceRegistry([
      { id: "unknown", label: "Unknown", kind: "system", stackable: false },
      { id: "wood", label: "Wood", kind: "material", group: "materials", tags: ["organic"] },
      { id: "gear", label: "Gear", kind: "currency", group: "tokens", categories: ["supplies"] }
    ], { fallbackId: "unknown" });

    expect(registry.size).toBe(3);
    expect(registry.fallbackId).toBe("unknown");
    expect(registry.has("wood")).toBe(true);
    expect(registry.get("wood")?.label).toBe("Wood");
    expect(registry.get("missing")?.id).toBe("unknown");
    expect(registry.require("gear")?.kind).toBe("currency");
    expect(registry.getByIndex(1)?.id).toBe("wood");
    expect(registry.indexOf("gear")).toBe(2);
    expect(registry.ids()).toEqual(["unknown", "wood", "gear"]);
    expect(Object.isFrozen(registry.ids())).toBe(true);
  });

  it("queries by category, group, and kind", () => {
    const registry = createItemResourceRegistry([
      { id: "wood", kind: "material", group: "materials", tags: ["organic"] },
      { id: "leaves", kind: "material", group: "materials", tags: ["organic"] },
      { id: "bio-grow", kind: "ability", group: "bot-tools", categories: ["tools"] }
    ]);

    expect(registry.categoryIds()).toEqual(["materials", "material", "organic", "tools", "bot-tools", "ability"]);
    expect(registry.hasCategory("wood", "organic")).toBe(true);
    expect(registry.listByCategory("organic").map((item) => item.id)).toEqual(["wood", "leaves"]);
    expect(registry.listByGroup("materials").map((item) => item.id)).toEqual(["wood", "leaves"]);
    expect(registry.listByKind("ability").map((item) => item.id)).toEqual(["bio-grow"]);
  });

  it("derives category helpers from records or raw metadata", () => {
    const raw = { kind: "material", group: "materials", tags: ["organic"] };
    const record = normalizeItemResourceMetadata({ id: "leaves", ...raw });

    expect(getItemResourceCategoryIds(raw)).toEqual(["materials", "material", "organic"]);
    expect(getItemResourceCategoryIds({ metadata: record })).toEqual(["materials", "material", "organic"]);
    expect(hasItemResourceCategory(record, "organic")).toBe(true);
    expect(hasItemResourceCategory(record, "currency")).toBe(false);
  });

  it("rejects malformed and duplicate item/resource entries", () => {
    expect(() => normalizeItemResourceMetadata(null))
      .toThrow("item/resource metadata at index 0 must be an object");
    expect(() => normalizeItemResourceMetadata({ label: "Missing id" }))
      .toThrow("item/resource metadata at index 0 requires an id");
    expect(() => createItemResourceRegistry(null))
      .toThrow("item/resource registry entries must be an array");
    expect(() => createItemResourceRegistry([
      { id: "wood" },
      { id: "wood" }
    ])).toThrow("Duplicate item/resource id: wood");
    expect(() => createItemResourceRegistry([{ id: "wood" }], { fallbackId: "missing" }))
      .toThrow("Unknown fallback item/resource id: missing");
    expect(() => createItemResourceRegistry([{ id: "wood" }]).require("missing"))
      .toThrow("Unknown item/resource id: missing");
  });
});
