import { describe, expect, it } from "vitest";
import { DEFAULT_PLACEABLE_OBJECTS, GRID_PLACEABLE_IDS } from "../app/gameplay/gridBuildingSystem.js";
import {
  WORLD_OBJECT_ACTIVATION_TYPE,
  WORLD_OBJECT_IDS,
  WORLD_OBJECT_KIND,
  WORLD_OBJECT_PLACEMENT_MODE,
  WORLD_OBJECT_TAG,
  getWorldObjectById,
  listWorldObjects,
  validateWorldObjectCatalog
} from "../app/gameplay/worldObjectCatalog.js";

describe("world object catalog", () => {
  it("defines the current MVP anchors in stable order", () => {
    expect(listWorldObjects().map((object) => object.id)).toEqual([
      WORLD_OBJECT_IDS.WORKBENCH,
      WORLD_OBJECT_IDS.ORGANIC_BUS,
      WORLD_OBJECT_IDS.GREENHOUSE
    ]);
    expect(validateWorldObjectCatalog()).toEqual([]);
    expect(Object.isFrozen(listWorldObjects())).toBe(true);
    expect(Object.isFrozen(getWorldObjectById(WORLD_OBJECT_IDS.ORGANIC_BUS).footprint)).toBe(true);
    expect(Object.isFrozen(getWorldObjectById(WORLD_OBJECT_IDS.GREENHOUSE).tags)).toBe(true);
  });

  it("marks Workbench and Organic Bus as authored world anchors", () => {
    expect(getWorldObjectById(WORLD_OBJECT_IDS.WORKBENCH)).toMatchObject({
      kind: WORLD_OBJECT_KIND.STATION,
      placementMode: WORLD_OBJECT_PLACEMENT_MODE.AUTHORED,
      activation: {
        type: WORLD_OBJECT_ACTIVATION_TYPE.OPEN_CONTAINER,
        containerId: "workbench"
      },
      runtimeRefs: {
        interactableId: "workbench",
        landmarkId: "workbench"
      }
    });

    expect(getWorldObjectById(WORLD_OBJECT_IDS.ORGANIC_BUS)).toMatchObject({
      kind: WORLD_OBJECT_KIND.ECOLOGY_SITE,
      placementMode: WORLD_OBJECT_PLACEMENT_MODE.AUTHORED,
      footprint: { width: 5, height: 5 },
      activation: {
        type: WORLD_OBJECT_ACTIVATION_TYPE.RESTORE_SITE,
        requiredCapability: "water-restoration"
      },
      runtimeRefs: {
        legacyId: "leppa-tree",
        sessionKey: "leppaTree"
      }
    });

    expect(getWorldObjectById(WORLD_OBJECT_IDS.WORKBENCH).tags).toContain(WORLD_OBJECT_TAG.INTERACTABLE);
    expect(getWorldObjectById(WORLD_OBJECT_IDS.ORGANIC_BUS).tags).toContain(WORLD_OBJECT_TAG.INTERACTABLE);
  });

  it("groups Organic Bus and Greenhouse as ecology footprint objects", () => {
    const organicBus = getWorldObjectById(WORLD_OBJECT_IDS.ORGANIC_BUS);
    const greenhouse = getWorldObjectById(WORLD_OBJECT_IDS.GREENHOUSE);

    expect(organicBus.kind).toBe(WORLD_OBJECT_KIND.ECOLOGY_SITE);
    expect(greenhouse.kind).toBe(WORLD_OBJECT_KIND.ECOLOGY_SITE);
    expect(organicBus.tags).toEqual(expect.arrayContaining([
      WORLD_OBJECT_TAG.RESTORATION,
      WORLD_OBJECT_TAG.HABITAT,
      WORLD_OBJECT_TAG.FOOTPRINT
    ]));
    expect(greenhouse.tags).toEqual(expect.arrayContaining([
      WORLD_OBJECT_TAG.RESTORATION,
      WORLD_OBJECT_TAG.HABITAT,
      WORLD_OBJECT_TAG.FOOTPRINT
    ]));
    expect(organicBus.emits).toContain("leppaTreeRevived");
    expect(greenhouse.emits).toContain("greenhousePlaced");
  });

  it("keeps Greenhouse aligned with the grid placeable catalog", () => {
    const greenhouseObject = getWorldObjectById(WORLD_OBJECT_IDS.GREENHOUSE);
    const greenhousePlaceable = DEFAULT_PLACEABLE_OBJECTS.find((placeable) => {
      return placeable.id === GRID_PLACEABLE_IDS.GREENHOUSE;
    });

    expect(greenhouseObject).toMatchObject({
      id: greenhousePlaceable.id,
      gridPlaceableId: greenhousePlaceable.id,
      sourceItemId: greenhousePlaceable.sourceItemId,
      prefabKey: greenhousePlaceable.prefabKey,
      footprint: greenhousePlaceable.footprint,
      placementMode: WORLD_OBJECT_PLACEMENT_MODE.CRAFTED_PLACEABLE,
      stationId: WORLD_OBJECT_IDS.WORKBENCH
    });
  });

  it("validates malformed world object definitions", () => {
    expect(validateWorldObjectCatalog({
      requiredIds: ["alpha", "missing"],
      objects: [
        {
          id: "alpha",
          label: "Alpha",
          kind: WORLD_OBJECT_KIND.STATION,
          placementMode: WORLD_OBJECT_PLACEMENT_MODE.AUTHORED,
          position: [0, 0, 0],
          activation: { type: WORLD_OBJECT_ACTIVATION_TYPE.OPEN_CONTAINER }
        },
        {
          id: "alpha",
          label: "",
          kind: "unknown",
          placementMode: WORLD_OBJECT_PLACEMENT_MODE.CRAFTED_PLACEABLE,
          footprint: { width: 0, height: 1 },
          activation: { type: "unknown" },
          emits: [""]
        },
        {
          label: "No id"
        }
      ]
    })).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "duplicate-world-object-id", objectId: "alpha" }),
      expect.objectContaining({ type: "missing-world-object-label", objectId: "alpha" }),
      expect.objectContaining({ type: "unknown-world-object-kind", objectId: "alpha" }),
      expect.objectContaining({ type: "missing-placeable-source-item", objectId: "alpha" }),
      expect.objectContaining({ type: "missing-grid-placeable-id", objectId: "alpha" }),
      expect.objectContaining({ type: "malformed-world-object-footprint", objectId: "alpha" }),
      expect.objectContaining({ type: "unknown-world-object-activation", objectId: "alpha" }),
      expect.objectContaining({ type: "malformed-world-object-event", objectId: "alpha" }),
      expect.objectContaining({ type: "missing-world-object-id", index: 2 }),
      expect.objectContaining({ type: "missing-required-world-object", objectId: "missing" })
    ]));
  });
});
