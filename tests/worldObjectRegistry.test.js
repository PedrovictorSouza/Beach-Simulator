import { describe, expect, it } from "vitest";
import {
  createWorldObjectRegistry,
  getWorldObjectCategoryIds,
  getWorldObjectPlacementRules,
  hasWorldObjectCategory,
  hasWorldObjectPlacementRequirement,
  normalizeWorldObjectPlacementRules,
  normalizeWorldObjectMetadata
} from "../app/gameplay/worldObjectRegistry.js";

describe("world object registry", () => {
  const registryEntries = [
    {
      id: "workbench",
      label: "Workbench",
      kind: "station",
      placementMode: "authored",
      categories: ["build-menu"],
      tags: ["fabrication", "interactable"],
      lifecycle: ["available"],
      position: [1, 0, 2],
      activation: { type: "open-container", containerId: "workbench" },
      runtimeRefs: { interactableId: "workbench" },
      footprint: { width: 2, height: 1 }
    },
    {
      id: "organic-bus",
      label: "Organic Bus",
      kind: "ecology-site",
      placementMode: "authored",
      categories: ["habitat-flow"],
      tags: ["restoration", "footprint"],
      footprint: { width: 10, height: 4 }
    }
  ];

  it("creates stable id lookups while preserving insertion order", () => {
    const registry = createWorldObjectRegistry(registryEntries);

    expect(registry.size).toBe(2);
    expect(registry.has("workbench")).toBe(true);
    expect(registry.get("workbench")).toMatchObject({
      id: "workbench",
      label: "Workbench"
    });
    expect(registry.getByIndex(1)?.id).toBe("organic-bus");
    expect(registry.indexOf("organic-bus")).toBe(1);
    expect(registry.ids()).toEqual(["workbench", "organic-bus"]);
    expect(registry.list().map((entry) => entry.id)).toEqual(["workbench", "organic-bus"]);
  });

  it("returns immutable records and nested metadata", () => {
    const registry = createWorldObjectRegistry(registryEntries);
    const workbench = registry.require("workbench");

    expect(Object.isFrozen(workbench)).toBe(true);
    expect(Object.isFrozen(workbench.tags)).toBe(true);
    expect(Object.isFrozen(workbench.footprint)).toBe(true);
    expect(Object.isFrozen(workbench.metadata)).toBe(true);
    expect(Object.isFrozen(workbench.metadata.activation)).toBe(true);
    expect(Object.isFrozen(workbench.metadata.runtimeRefs)).toBe(true);
    expect(Object.isFrozen(workbench.metadata.placementRules)).toBe(true);
    expect(Object.isFrozen(workbench.metadata.placementRules.footprint)).toBe(true);
    expect(Object.isFrozen(registry.list())).toBe(true);
    expect(workbench).not.toBe(registryEntries[0]);
  });

  it("normalizes world object metadata into a stable model", () => {
    expect(normalizeWorldObjectMetadata({
      id: " greenhouse ",
      label: "",
      kind: "ecology-site",
      placementMode: "crafted-placeable",
      categories: [" habitat-flow ", ""],
      tags: [" restoration ", "restoration", "", "footprint"],
      lifecycle: ["prepared", "placed"],
      emits: ["greenhouseCrafted"],
      position: ["1", 0, "2.5"],
      footprint: { width: "5", height: "3" },
      placementRules: {
        requires: ["grid-cell", "empty-footprint", "source-item", "source-item"],
        blockers: ["world-bounds", "occupied-footprint", ""]
      },
      activation: { type: "place-from-inventory", sourceItemId: "greenhouse" },
      runtimeRefs: { sessionCollectionKey: "greenhouses" },
      stationId: "workbench",
      sourceItemId: "greenhouse",
      recipeId: "greenhouse",
      gridPlaceableId: "greenhouse",
      prefabKey: "greenhouseModel"
    })).toEqual({
      id: "greenhouse",
      label: "greenhouse",
      kind: "ecology-site",
      placementMode: "crafted-placeable",
      tags: ["restoration", "footprint"],
      categories: [
        { id: "habitat-flow", source: "explicit" },
        { id: "ecology-site", source: "kind" },
        { id: "crafted-placeable", source: "placementMode" },
        { id: "restoration", source: "tag" },
        { id: "footprint", source: "tag" }
      ],
      categoryIds: ["habitat-flow", "ecology-site", "crafted-placeable", "restoration", "footprint"],
      lifecycle: ["prepared", "placed"],
      emits: ["greenhouseCrafted"],
      position: [1, 0, 2.5],
      footprint: { width: 5, height: 3 },
      placementRules: {
        type: "grid-footprint",
        placementMode: "crafted-placeable",
        footprint: { width: 5, height: 3 },
        surface: "ground",
        collision: "solid-footprint",
        rotation: "quarter-turn",
        allowRotation: true,
        requires: ["grid-cell", "empty-footprint", "source-item"],
        blockers: ["world-bounds", "occupied-footprint"]
      },
      activation: { type: "place-from-inventory", sourceItemId: "greenhouse" },
      runtimeRefs: { sessionCollectionKey: "greenhouses" },
      stationId: "workbench",
      sourceItemId: "greenhouse",
      recipeId: "greenhouse",
      gridPlaceableId: "greenhouse",
      prefabKey: "greenhouseModel"
    });
  });

  it("adds normalized metadata to registry records", () => {
    const registry = createWorldObjectRegistry(registryEntries);
    const workbench = registry.require("workbench");

    expect(workbench.metadata).toMatchObject({
      id: "workbench",
      label: "Workbench",
      kind: "station",
      placementMode: "authored",
      categoryIds: ["build-menu", "station", "authored", "fabrication", "interactable"],
      placementRules: {
        type: "authored-fixed",
        placementMode: "authored",
        footprint: { width: 2, height: 1 },
        surface: "ground",
        collision: "solid-footprint",
        rotation: "fixed",
        allowRotation: false,
        requires: ["world-position"],
        blockers: ["occupied-footprint"]
      },
      position: [1, 0, 2],
      activation: { type: "open-container", containerId: "workbench" },
      runtimeRefs: { interactableId: "workbench" }
    });
  });

  it("derives object categories from explicit categories, kind, placement mode, and tags", () => {
    const metadata = normalizeWorldObjectMetadata({
      id: "greenhouse",
      kind: "ecology-site",
      placementMode: "crafted-placeable",
      categories: ["habitat-flow"],
      tags: ["restoration", "footprint"]
    });

    expect(metadata.categories).toEqual([
      { id: "habitat-flow", source: "explicit" },
      { id: "ecology-site", source: "kind" },
      { id: "crafted-placeable", source: "placementMode" },
      { id: "restoration", source: "tag" },
      { id: "footprint", source: "tag" }
    ]);
    expect(getWorldObjectCategoryIds(metadata)).toEqual([
      "habitat-flow",
      "ecology-site",
      "crafted-placeable",
      "restoration",
      "footprint"
    ]);
    expect(hasWorldObjectCategory(metadata, "footprint")).toBe(true);
    expect(hasWorldObjectCategory(metadata, "missing")).toBe(false);
  });

  it("queries registry records by category without using fallback records", () => {
    const registry = createWorldObjectRegistry(registryEntries, { fallbackId: "workbench" });

    expect(registry.categoryIds()).toEqual([
      "build-menu",
      "station",
      "authored",
      "fabrication",
      "interactable",
      "habitat-flow",
      "ecology-site",
      "restoration",
      "footprint"
    ]);
    expect(registry.listByCategory("authored").map((entry) => entry.id)).toEqual(["workbench", "organic-bus"]);
    expect(registry.listByCategory("habitat-flow").map((entry) => entry.id)).toEqual(["organic-bus"]);
    expect(registry.hasCategory("workbench", "fabrication")).toBe(true);
    expect(registry.hasCategory("missing", "fabrication")).toBe(false);
  });

  it("normalizes placement rules per object type with defaults and overrides", () => {
    expect(normalizeWorldObjectPlacementRules({
      id: "workbench",
      placementMode: "authored",
      footprint: { width: 2, height: 1 }
    })).toEqual({
      type: "authored-fixed",
      placementMode: "authored",
      footprint: { width: 2, height: 1 },
      surface: "ground",
      collision: "solid-footprint",
      rotation: "fixed",
      allowRotation: false,
      requires: ["world-position"],
      blockers: ["occupied-footprint"]
    });

    expect(normalizeWorldObjectPlacementRules({
      id: "greenhouse",
      placementMode: "crafted-placeable",
      footprint: { width: 5, height: 3 },
      placementRules: {
        type: "restoration-footprint",
        surface: "living-ground",
        rotation: "fixed",
        allowRotation: false,
        requires: ["grid-cell", "empty-footprint", "greenhouse-kit"],
        blockers: ["world-bounds", "occupied-footprint", "dry-ground"]
      }
    })).toEqual({
      type: "restoration-footprint",
      placementMode: "crafted-placeable",
      footprint: { width: 5, height: 3 },
      surface: "living-ground",
      collision: "solid-footprint",
      rotation: "fixed",
      allowRotation: false,
      requires: ["grid-cell", "empty-footprint", "greenhouse-kit"],
      blockers: ["world-bounds", "occupied-footprint", "dry-ground"]
    });
  });

  it("queries registry records by placement rule type and requirement", () => {
    const registry = createWorldObjectRegistry(registryEntries);
    const organicBusRules = registry.getPlacementRules("organic-bus");

    expect(organicBusRules).toMatchObject({
      type: "authored-fixed",
      placementMode: "authored",
      footprint: { width: 10, height: 4 }
    });
    expect(registry.listByPlacementRuleType("authored-fixed").map((entry) => entry.id))
      .toEqual(["workbench", "organic-bus"]);
    expect(getWorldObjectPlacementRules(registry.require("organic-bus"))).toBe(organicBusRules);
    expect(hasWorldObjectPlacementRequirement(registry.require("organic-bus"), "world-position")).toBe(true);
    expect(hasWorldObjectPlacementRequirement(registry.require("organic-bus"), "source-item")).toBe(false);
  });

  it("supports an explicit fallback id for optional lookups", () => {
    const registry = createWorldObjectRegistry(registryEntries, { fallbackId: "workbench" });

    expect(registry.get("missing")?.id).toBe("workbench");
    expect(() => registry.require("missing")).toThrow("Unknown world object id: missing");
  });

  it("rejects malformed entries and duplicate ids", () => {
    expect(() => createWorldObjectRegistry(null)).toThrow("world object registry entries must be an array");
    expect(() => createWorldObjectRegistry([null])).toThrow("entry at index 0 must be an object");
    expect(() => createWorldObjectRegistry([{ label: "No id" }])).toThrow("entry at index 0 requires an id");
    expect(() => normalizeWorldObjectMetadata(null)).toThrow("metadata at index 0 must be an object");
    expect(() => normalizeWorldObjectMetadata({ label: "No id" })).toThrow("metadata at index 0 requires an id");
    expect(() => createWorldObjectRegistry([
      { id: "workbench" },
      { id: " workbench " }
    ])).toThrow("Duplicate world object id: workbench");
    expect(() => createWorldObjectRegistry(registryEntries, { fallbackId: "missing" }))
      .toThrow("Unknown fallback world object id: missing");
  });
});
