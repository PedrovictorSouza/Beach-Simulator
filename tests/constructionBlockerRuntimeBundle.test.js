import { describe, expect, it, vi } from "vitest";

import {
  createConstructionBlockerRuntimeBundle,
  createGameplayConstructionBlockerRuntimeBundle
} from "../app/runtime/construction/constructionBlockerRuntimeBundle.js";
import {
  GAMEPLAY_CONSTRUCTION_CONFIG
} from "../app/runtime/construction/constructionGameplayConfig.js";

describe("createConstructionBlockerRuntimeBundle", () => {
  it("wires construction blocker runtimes with explicit construction-domain dependencies", () => {
    const controls = {
      storyState: {
        flags: {
          strawBedPlacedInBulbasaurHabitat: true
        }
      }
    };
    const session = {
      palmModel: { id: "palm-model" },
      palmInstances: [
        {
          id: "palm-1",
          active: true,
          alive: true,
          offset: [4, 0, 5]
        }
      ]
    };
    const terrainCollider = {
      blocksPlayer: true,
      position: [2, 0, 3],
      size: [1, 1, 1],
      surfaceY: 2.4,
      padding: 0
    };
    const getTerrainColliders = vi.fn(() => [terrainCollider]);
    const playBlockedSound = vi.fn();
    const pushNotice = vi.fn();
    const createPlayerConstructionPlacementBlockers = vi.fn(() => [
      {
        id: "solar-station",
        kind: "solarStation",
        position: [1, 0, 1],
        size: [2, 2]
      }
    ]);
    const getPlacementCollisionSize = vi.fn(() => [1, 1]);
    const getPlacementRect = vi.fn((position, size) => ({
      position,
      size
    }));
    const doPlacementRectsOverlap = vi.fn(() => false);

    const bundle = createConstructionBlockerRuntimeBundle({
      controls,
      hud: { pushNotice },
      session,
      treeFootprint: vi.fn(() => 1.5),
      callbacks: {
        createPlayerConstructionPlacementBlockers,
        getTerrainColliders,
        playBlockedSound
      },
      config: {
        deadTreeFootprintScale: 1,
        deadTreeMinSize: 0.75,
        footprints: {
          solarStation: [2, 2]
        },
        leppaTreeBlockerSize: [1, 1],
        leppaTreeDefaultCellSize: 1,
        treeFootprintScale: 1,
        treeMinSize: 0.75
      },
      geometry: {
        doPlacementRectsOverlap,
        getPlacementCollisionSize,
        getPlacementRect
      }
    });

    expect(bundle.companionConstructionBlockerRuntime.isBlocked([2, 0.04, 3]))
      .toBe(true);
    bundle.companionConstructionBlockerRuntime.cancelBlockedAction("Builder Bot");
    expect(getTerrainColliders).toHaveBeenCalled();
    expect(playBlockedSound).toHaveBeenCalledTimes(1);
    expect(pushNotice).toHaveBeenCalledWith("Builder Bot path is blocked.");

    expect(bundle.worldObjectPlacementBlockerRuntime.getBlockers()).toEqual([
      {
        id: "tree:palm-1",
        kind: "tree",
        position: [4, 0, 5],
        size: [1.5, 1.5]
      }
    ]);

    expect(bundle.solarStationPlacementBlockerRuntime.getBlockers()).toEqual([
      {
        id: "solar-station",
        kind: "solarStation",
        position: [1, 0, 1],
        size: [2, 2]
      },
      {
        id: "tree:palm-1",
        kind: "tree",
        position: [4, 0, 5],
        size: [1.5, 1.5]
      }
    ]);
    expect(createPlayerConstructionPlacementBlockers).toHaveBeenCalledWith({
      session,
      storyState: controls.storyState,
      footprints: {
        solarStation: [2, 2]
      }
    });
  });
});

describe("createGameplayConstructionBlockerRuntimeBundle", () => {
  it("provides gameplay construction blocker defaults from the construction domain", () => {
    const controls = { storyState: { flags: {} } };
    const session = {};
    const callbacks = {
      getTerrainColliders: vi.fn(() => []),
      playBlockedSound: vi.fn()
    };
    const treeFootprint = vi.fn(() => 1);
    const expectedBundle = {
      companionConstructionBlockerRuntime: {},
      solarStationPlacementBlockerRuntime: {},
      worldObjectPlacementBlockerRuntime: {}
    };
    const createRuntimeBundle = vi.fn(() => expectedBundle);

    const bundle = createGameplayConstructionBlockerRuntimeBundle({
      controls,
      hud: null,
      session,
      treeFootprint,
      callbacks,
      createRuntimeBundle
    });

    expect(bundle).toBe(expectedBundle);
    expect(createRuntimeBundle).toHaveBeenCalledWith({
      controls,
      hud: null,
      session,
      treeFootprint,
      callbacks,
      config: {
        footprints: {
          greenhouse: GAMEPLAY_CONSTRUCTION_CONFIG.previewFootprints.greenhouse,
          solarStation: GAMEPLAY_CONSTRUCTION_CONFIG.previewFootprints.solarStation,
          trainHouse: GAMEPLAY_CONSTRUCTION_CONFIG.previewFootprints.trainHouse,
          houseKit: GAMEPLAY_CONSTRUCTION_CONFIG.previewFootprints.houseKit,
          houseBuilt: GAMEPLAY_CONSTRUCTION_CONFIG.leafDenBuiltRotationFootprint
        }
      },
      geometry: {
        doPlacementRectsOverlap: expect.any(Function),
        getPlacementCollisionSize: expect.any(Function),
        getPlacementRect: expect.any(Function)
      }
    });
  });
});
