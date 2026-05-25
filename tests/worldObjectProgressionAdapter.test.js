import { describe, expect, it } from "vitest";
import {
  FIELD_TASK_IDS,
  SMALL_ISLAND_FIELD_TASKS
} from "../app/story/storyBeatData.js";
import {
  WORLD_OBJECT_ACTIVATION_TYPE,
  WORLD_OBJECT_IDS,
  WORLD_OBJECT_KIND,
  WORLD_OBJECT_PLACEMENT_MODE
} from "../app/gameplay/worldObjectCatalog.js";
import {
  createWorldObjectTaskProgressionLinks,
  getWorldObjectProgressionEventById,
  getWorldObjectTaskProgressionLinkByTaskId,
  listWorldObjectProgressionEvents,
  resolveWorldObjectProgressionEventFromFlag
} from "../app/gameplay/worldObjectProgressionAdapter.js";

describe("world object progression adapter", () => {
  it("flattens world object emitted events into progression records", () => {
    expect(listWorldObjectProgressionEvents()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        eventId: "leppaTreeRevived",
        objectId: WORLD_OBJECT_IDS.ORGANIC_BUS,
        objectKind: WORLD_OBJECT_KIND.ECOLOGY_SITE,
        placementMode: WORLD_OBJECT_PLACEMENT_MODE.AUTHORED,
        activationType: WORLD_OBJECT_ACTIVATION_TYPE.RESTORE_SITE
      }),
      expect.objectContaining({
        eventId: "greenhousePlaced",
        objectId: WORLD_OBJECT_IDS.GREENHOUSE,
        objectKind: WORLD_OBJECT_KIND.ECOLOGY_SITE,
        placementMode: WORLD_OBJECT_PLACEMENT_MODE.CRAFTED_PLACEABLE,
        activationType: WORLD_OBJECT_ACTIVATION_TYPE.PLACE_FROM_INVENTORY
      }),
      expect.objectContaining({
        eventId: "workbenchDiyRecipesReceived",
        objectId: WORLD_OBJECT_IDS.WORKBENCH,
        objectKind: WORLD_OBJECT_KIND.STATION,
        activationType: WORLD_OBJECT_ACTIVATION_TYPE.OPEN_CONTAINER
      })
    ]));
    expect(Object.isFrozen(listWorldObjectProgressionEvents())).toBe(true);
    expect(Object.isFrozen(getWorldObjectProgressionEventById("greenhousePlaced"))).toBe(true);
  });

  it("links current field tasks to object ids through completeFlag", () => {
    const links = createWorldObjectTaskProgressionLinks({
      tasks: SMALL_ISLAND_FIELD_TASKS
    });

    expect(getWorldObjectTaskProgressionLinkByTaskId(FIELD_TASK_IDS.REVIVE_LEPPA_TREE, { links })).toMatchObject({
      taskId: FIELD_TASK_IDS.REVIVE_LEPPA_TREE,
      completeFlag: "leppaTreeRevived",
      eventId: "leppaTreeRevived",
      objectId: WORLD_OBJECT_IDS.ORGANIC_BUS,
      objectKind: WORLD_OBJECT_KIND.ECOLOGY_SITE
    });
    expect(getWorldObjectTaskProgressionLinkByTaskId(FIELD_TASK_IDS.BUILD_GREENHOUSE, { links })).toMatchObject({
      taskId: FIELD_TASK_IDS.BUILD_GREENHOUSE,
      completeFlag: "greenhousePlaced",
      eventId: "greenhousePlaced",
      objectId: WORLD_OBJECT_IDS.GREENHOUSE,
      objectKind: WORLD_OBJECT_KIND.ECOLOGY_SITE
    });
    expect(getWorldObjectTaskProgressionLinkByTaskId(FIELD_TASK_IDS.BULBASAUR_DRY_GRASS_REQUEST, { links })).toBeNull();
    expect(Object.isFrozen(links)).toBe(true);
  });

  it("resolves a story flag back to the world object event that owns it", () => {
    expect(resolveWorldObjectProgressionEventFromFlag("leppaBerryCollected")).toMatchObject({
      eventId: "leppaBerryCollected",
      objectId: WORLD_OBJECT_IDS.ORGANIC_BUS
    });
    expect(resolveWorldObjectProgressionEventFromFlag("missingFlag")).toBeNull();
  });
});
