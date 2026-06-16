import { describe, expect, it } from "vitest";

import {
  BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL,
  buildFoundationBuildZoneBlockers,
  buildBuilderTutorialFoundationCandidateOrigins,
  canStackFreeBlockPlacement,
  createBuilderTutorialFoundationBuildZone,
  createFoundationBuildZoneRuntime,
  createUnavailableFoundationBuildZonePlacementResult,
  createUnavailableFoundationBuildZoneValidation,
  findAvailableBuilderTutorialFoundationBuildZone,
  applyFoundationBuildZoneCompleteEffects,
  getBuilderTutorialFoundationZoneSignature,
  getSavedBuilderTutorialFoundationOriginCell,
  getFoundationBuildZoneProgressCount,
  getSavedFoundationBuildZoneOriginCell,
  hasFoundationWallObjective,
  isBuilderTutorialFoundationBuildZoneBlocked,
  isBuilderTutorialFoundationOriginInsideGrid,
  isFoundationFreeBlockAllowedInZone,
  resolveActiveBuilderTutorialFoundationBuildZone,
  saveBuilderTutorialFoundationOriginCell,
  saveFoundationBuildZoneOriginCell,
  shouldShowFoundationBuildZone
} from "../app/runtime/construction/foundationBuildZone.js";

describe("foundation build zone", () => {
  it("creates the builder tutorial foundation zone with the existing defaults", () => {
    const zone = createBuilderTutorialFoundationBuildZone();

    expect(BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL).toEqual({
      x: 107,
      y: 98
    });
    expect(zone).toMatchObject({
      id: "builder-tutorial-foundation",
      originCell: { x: 107, y: 98 },
      width: 6,
      height: 4
    });
    expect(zone.cells).toHaveLength(24);
    expect(zone.borderCells).toBe(zone.cells);
    expect(Object.isFrozen(zone)).toBe(true);
  });

  it("creates builder tutorial foundation candidate origins with the existing search radius", () => {
    const origins = buildBuilderTutorialFoundationCandidateOrigins();

    expect(origins).toHaveLength(1089);
    expect(origins[0]).toEqual({ x: 107, y: 98 });
    expect(origins.at(-1)).toEqual({ x: 123, y: 114 });
  });

  it("gets builder tutorial foundation zone signatures", () => {
    expect(getBuilderTutorialFoundationZoneSignature({
      originCell: { x: 107, y: 98 },
      width: 6,
      height: 4
    })).toBe("107:98:6:4");
  });

  it("builds foundation zone blockers from active placement sources", () => {
    const blockers = buildFoundationBuildZoneBlockers({
      terrainColliders: [
        { id: "free", kind: "freeBlock", position: [9, 0, 9], size: [1, 1, 1] },
        { id: "rock", kind: "rock", position: [1, 0, 2], size: [2, 1, 4] }
      ],
      freeBlockInstances: [
        { id: "placed", active: true, offset: [3, 0, 4] },
        { id: "inactive", active: false, offset: [5, 0, 5] },
        { id: "allowed", active: true, offset: [7, 0, 7] }
      ],
      isFoundationFreeBlockAllowed: (instance) => instance.id === "allowed",
      worldObjectBlockers: [
        { id: "house", kind: "worldObject", position: [5, 0, 6], size: [2, 3] }
      ],
      playerPosition: [0, 0, 0],
      npcActors: [
        { id: "npc1", position: [8, 0, 8] },
        { id: "hidden", position: [9, 0, 9] }
      ],
      isNpcActive: (npcActor) => npcActor.id !== "hidden",
      getActorPosition: (npcActor) => npcActor.position,
      interactables: [
        { id: "terminal", position: [10, 0, 10], interactDistance: 2 },
        { id: "off", position: [11, 0, 11] }
      ],
      isInteractableActive: (interactable) => interactable.id !== "off",
      companions: [
        { id: "squirtle", position: [12, 0, 12] },
        { id: "hidden", visible: false, position: [13, 0, 13] },
        { repairPosition: [14, 0, 14] }
      ],
      resourceNodes: [
        { id: "wood", position: [15, 0, 15] },
        { id: "gone", position: [16, 0, 16] }
      ],
      isResourceNodeActive: (resourceNode) => resourceNode.id !== "gone",
      drops: [
        { id: "wood-1", position: [17, 0, 17] },
        { id: "collected", collected: true, position: [18, 0, 18] }
      ],
      groundPatches: [
        { id: "grass", position: [19, 0, 19] },
        { cellId: "flower-cell", position: [20, 0, 20] },
        { id: "invalid" }
      ]
    });

    expect(blockers.map((blocker) => `${blocker.kind}:${blocker.id}`)).toEqual([
      "rock:rock",
      "freeBlock:free-block:placed",
      "worldObject:house",
      "player:player",
      "npc:npc:npc1",
      "interactable:interactable:terminal",
      "companion:companion:squirtle",
      "companion:companion",
      "resource:resource:wood",
      "drop:drop:wood-1",
      "groundPatch:grass",
      "groundPatch:flower-cell"
    ]);
    expect(blockers[0]).toMatchObject({
      minX: 0,
      maxX: 2,
      minZ: 0,
      maxZ: 4
    });
  });

  it("creates a runtime that wires foundation zone sources and completion effects", () => {
    const buildZone = createBuilderTutorialFoundationBuildZone({ x: 0, y: 0 });
    const feedbackCalls = [];
    const session = {
      freeBlockBuildState: {
        getBlockAtCell: () => null
      },
      freeBlockInstances: [
        {
          id: "placed-block",
          active: true,
          offset: [3, 0, 3]
        }
      ],
      playerCharacter: {
        getPosition: () => [1, 0, 1]
      },
      npcActors: [
        {
          id: "npc",
          position: [2, 0, 2]
        }
      ],
      interactables: [
        {
          id: "terminal",
          position: [4, 0, 4]
        }
      ],
      actTwoSquirtle: {
        id: "hydro",
        position: [5, 0, 5]
      },
      resourceNodes: [
        {
          id: "wood",
          position: [6, 0, 6]
        }
      ],
      woodDrops: [
        {
          id: "drop",
          position: [7, 0, 7]
        }
      ],
      groundGrassPatches: [
        {
          id: "grass",
          position: [8, 0, 8]
        }
      ],
      groundFlowerPatches: [],
      constructionCloudBursts: [
        {
          id: "active",
          position: [9, 0, 9],
          startedAt: 450,
          durationMs: 100
        }
      ]
    };
    const controls = {
      storyState: {
        flags: {}
      }
    };
    const freeBlockBuildSessionRuntime = {
      getGridConfig: () => ({
        cellSize: 1,
        origin: { x: 0, y: 0, z: 0 },
        width: 16,
        height: 16,
        visualOffsetY: 0.03
      }),
      getFoundationBuildZoneProgressCount: () => 0,
      syncActiveBuildZone: ({
        flags,
        getFoundationProgressCount,
        isBuildZoneBlocked
      }) => {
        expect(flags).toBe(controls.storyState.flags);
        expect(getFoundationProgressCount(buildZone)).toBe(0);
        expect(isBuildZoneBlocked(buildZone)).toBe(true);
        session.activeFreeBlockBuildZone = buildZone;
        session.freeBlockBuildZoneUnavailable = false;
        return buildZone;
      },
      isBuildZoneUnavailable: () => false,
      getBuildZoneCenterPosition: () => [2.5, 0.03, 2.5],
      buildFoundationBuildZoneGroundCells: () => [
        {
          id: "foundation-ground"
        }
      ],
      buildFoundationCompletionInteriorGroundCells: () => [
        {
          id: "foundation-interior"
        }
      ],
      getBuildZoneProgress: () => ({
        complete: true
      }),
      canStackFreeBlockPlacement: () => true
    };
    const runtime = createFoundationBuildZoneRuntime({
      session,
      controls,
      rendering: {
        isNpcActive: () => true,
        isInteractableActive: () => true,
        isResourceNodeActive: () => true
      },
      freeBlockBuildSessionRuntime,
      worldObjectPlacementBlockerRuntime: {
        getBlockers: () => [
          {
            id: "tree",
            kind: "tree",
            position: [0, 0, 0],
            size: [1, 1]
          }
        ]
      },
      groundActionFeedbackRuntime: {
        triggerFeedback: (...args) => feedbackCalls.push(args)
      },
      config: {
        wallBlockType: "wall"
      },
      callbacks: {
        getTerrainColliders: () => [
          {
            id: "rock",
            kind: "rock",
            position: [0, 0, 0],
            size: [1, 1, 1]
          }
        ],
        getActorPosition: (actor) => actor.position,
        getPerformanceNow: () => 123,
        getNowMs: () => 500
      }
    });

    expect(runtime.getBlockers(buildZone).map((blocker) => blocker.kind)).toEqual([
      "rock",
      "freeBlock",
      "tree",
      "player",
      "npc",
      "interactable",
      "companion",
      "resource",
      "drop",
      "groundPatch"
    ]);
    expect(runtime.getActiveBuildZone()).toBe(buildZone);
    expect(runtime.buildGroundCells(
      { id: "build-first-base" },
      null
    )).toEqual([
      {
        id: "foundation-ground"
      }
    ]);
    expect(runtime.canStack()).toBe(true);

    expect(runtime.syncCompletionEffects()).toEqual({
      complete: true
    });
    expect(feedbackCalls).toEqual([
      [
        [
          {
            id: "foundation-interior"
          }
        ],
        "foundationComplete",
        123,
        {
          durationMs: 3000
        }
      ]
    ]);
    expect(controls.storyState.flags).toEqual({
      builderTutorialFoundationInteriorEffectPlayed: true,
      builderTutorialFoundationCompleteEffectPlayed: true
    });
    expect(session.constructionCloudBursts).toEqual([
      {
        id: "active",
        position: [9, 0, 9],
        startedAt: 450,
        durationMs: 100
      },
      {
        id: "builder-tutorial-foundation-complete",
        position: [2.5, 0.03, 2.5],
        startedAt: 500,
        durationMs: 1800
      }
    ]);
  });

  it("detects blocked builder tutorial foundation zones by rect overlap", () => {
    expect(isBuilderTutorialFoundationBuildZoneBlocked({
      zoneRect: null,
      blockers: []
    })).toBe(true);

    expect(isBuilderTutorialFoundationBuildZoneBlocked({
      zoneRect: {
        minX: 0,
        maxX: 2,
        minZ: 0,
        maxZ: 2
      },
      blockers: [
        {
          minX: 4,
          maxX: 5,
          minZ: 4,
          maxZ: 5
        }
      ]
    })).toBe(false);

    expect(isBuilderTutorialFoundationBuildZoneBlocked({
      zoneRect: {
        minX: 0,
        maxX: 2,
        minZ: 0,
        maxZ: 2
      },
      blockers: [
        {
          minX: 1,
          maxX: 3,
          minZ: 1,
          maxZ: 3
        }
      ]
    })).toBe(true);
  });

  it("checks builder tutorial foundation origins against the build grid", () => {
    const gridConfig = {
      width: 256,
      height: 256
    };

    expect(isBuilderTutorialFoundationOriginInsideGrid({
      originCell: { x: 107, y: 98 },
      gridConfig
    })).toBe(true);
    expect(isBuilderTutorialFoundationOriginInsideGrid({
      originCell: { x: 251, y: 253 },
      gridConfig
    })).toBe(false);
  });

  it("reads and writes builder tutorial foundation origin flags", () => {
    const flags = {
      builderTutorialFoundationOriginCell: {
        x: "111",
        y: "112"
      }
    };

    expect(getSavedBuilderTutorialFoundationOriginCell({ flags })).toEqual({
      x: 111,
      y: 112
    });
    expect(getSavedBuilderTutorialFoundationOriginCell({ flags: {} })).toEqual({
      x: 107,
      y: 98
    });

    expect(saveBuilderTutorialFoundationOriginCell({
      flags,
      originCell: {
        x: "113",
        y: "114"
      }
    })).toEqual({
      x: 113,
      y: 114
    });
    expect(flags.builderTutorialFoundationOriginCell).toEqual({
      x: 113,
      y: 114
    });
  });

  it("resolves the active builder tutorial foundation zone from saved or available origins", () => {
    const savedAvailable = resolveActiveBuilderTutorialFoundationBuildZone({
      savedOriginCell: { x: 107, y: 98 },
      isBuildZoneBlocked: () => false
    });

    expect(savedAvailable).toMatchObject({
      unavailable: false,
      originCellToSave: { x: 107, y: 98 }
    });
    expect(savedAvailable.buildZone.originCell).toEqual({ x: 107, y: 98 });

    const alternativeZone = createBuilderTutorialFoundationBuildZone({ x: 108, y: 99 });
    const alternativeAvailable = resolveActiveBuilderTutorialFoundationBuildZone({
      savedOriginCell: { x: 107, y: 98 },
      getFoundationProgressCount: () => 0,
      isBuildZoneBlocked: () => true,
      findAvailableBuildZone: () => alternativeZone
    });

    expect(alternativeAvailable).toMatchObject({
      buildZone: alternativeZone,
      unavailable: false,
      originCellToSave: { x: 108, y: 99 }
    });

    const blockedWithProgress = resolveActiveBuilderTutorialFoundationBuildZone({
      savedOriginCell: { x: 107, y: 98 },
      getFoundationProgressCount: () => 1,
      isBuildZoneBlocked: () => true,
      findAvailableBuildZone: () => alternativeZone
    });

    expect(blockedWithProgress).toMatchObject({
      unavailable: true,
      originCellToSave: null
    });
    expect(blockedWithProgress.buildZone.originCell).toEqual({ x: 107, y: 98 });
  });

  it("finds the first in-grid unblocked builder tutorial foundation zone", () => {
    const visitedOrigins = [];
    const zone = findAvailableBuilderTutorialFoundationBuildZone({
      gridConfig: {
        width: 20,
        height: 20
      },
      candidateOrigins: [
        { x: 18, y: 18 },
        { x: 1, y: 1 },
        { x: 2, y: 2 }
      ],
      isBuildZoneBlocked: (candidateZone) => {
        visitedOrigins.push(candidateZone.originCell);
        return candidateZone.originCell.x === 1;
      }
    });

    expect(visitedOrigins).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ]);
    expect(zone.originCell).toEqual({ x: 2, y: 2 });
  });

  it("applies foundation completion effect flags and cloud burst payloads", () => {
    const flags = {};

    const effects = applyFoundationBuildZoneCompleteEffects({
      flags,
      position: [4, 0.03, 5],
      constructionCloudBursts: [
        { id: "expired", position: [0, 0, 0], startedAt: 1000, durationMs: 100 },
        { id: "active", position: [1, 0, 1], startedAt: 1000, durationMs: 1000 }
      ],
      nowMs: 1500
    });

    expect(flags).toEqual({
      builderTutorialFoundationInteriorEffectPlayed: true,
      builderTutorialFoundationCompleteEffectPlayed: true
    });
    expect(effects).toEqual({
      triggerInteriorFeedback: true,
      feedbackAbilityId: "foundationComplete",
      feedbackDurationMs: 3000,
      constructionCloudBursts: [
        { id: "active", position: [1, 0, 1], startedAt: 1000, durationMs: 1000 },
        {
          id: "builder-tutorial-foundation-complete",
          position: [4, 0.03, 5],
          startedAt: 1500,
          durationMs: 1800
        }
      ]
    });
  });

  it("does not replay foundation completion effects after both flags are set", () => {
    const flags = {
      builderTutorialFoundationInteriorEffectPlayed: true,
      builderTutorialFoundationCompleteEffectPlayed: true
    };

    expect(applyFoundationBuildZoneCompleteEffects({
      flags,
      position: [4, 0.03, 5],
      constructionCloudBursts: [],
      nowMs: 1500
    })).toEqual({
      triggerInteriorFeedback: false,
      feedbackAbilityId: "foundationComplete",
      feedbackDurationMs: 3000,
      constructionCloudBursts: null
    });
  });

  it("detects foundation wall objectives", () => {
    expect(hasFoundationWallObjective({
      objectives: [
        { targetId: "other" },
        { targetId: "foundation-wall" }
      ]
    })).toBe(true);
    expect(hasFoundationWallObjective({
      objectives: [
        { targetId: "other" }
      ]
    })).toBe(false);
    expect(hasFoundationWallObjective(null)).toBe(false);
  });

  it("shows the foundation build zone from active quest, system quest or objective", () => {
    expect(shouldShowFoundationBuildZone({
      activeQuest: { id: "build-first-base" }
    })).toBe(true);
    expect(shouldShowFoundationBuildZone({
      activeSystemQuest: { id: "build-first-base" }
    })).toBe(true);
    expect(shouldShowFoundationBuildZone({
      activeQuest: {
        id: "other",
        objectives: [{ targetId: "foundation-wall" }]
      }
    })).toBe(true);
    expect(shouldShowFoundationBuildZone({
      activeQuest: { id: "other" },
      activeSystemQuest: { id: "also-other" }
    })).toBe(false);
  });

  it("allows an existing free block only inside the active foundation zone", () => {
    const buildZone = {
      cells: [
        { x: 1, y: 2 }
      ]
    };
    const buildState = {
      getBlockAtCell(cell) {
        return cell.x === 1 && cell.y === 2 ? { blockType: "wall" } : null;
      }
    };

    expect(isFoundationFreeBlockAllowedInZone({
      instance: {
        freeBlockCell: { x: 1, y: 2 }
      },
      buildZone,
      buildState
    })).toBe(true);
    expect(isFoundationFreeBlockAllowedInZone({
      instance: {
        freeBlockCell: { x: 3, y: 4 }
      },
      buildZone,
      buildState
    })).toBe(false);
    expect(isFoundationFreeBlockAllowedInZone({
      instance: {
        freeBlockCell: { x: 1, y: 2 }
      },
      buildZone,
      buildState: null
    })).toBe(false);
  });

  it("uses completed progress first and falls back to saved floor blocks", () => {
    const buildZone = {
      cells: [
        { x: 1, y: 2 },
        { x: 3, y: 4 }
      ]
    };

    expect(getFoundationBuildZoneProgressCount({
      progress: { completedCount: 3 },
      buildZone,
      floorBlocks: []
    })).toBe(3);
    expect(getFoundationBuildZoneProgressCount({
      progress: { completedCount: 0 },
      buildZone,
      floorBlocks: [
        { cell: { x: 1, y: 2 } },
        { x: 3, y: 4 },
        { x: 5, y: 6 }
      ]
    })).toBe(2);
  });

  it("allows stacking only after the foundation progress is complete", () => {
    expect(canStackFreeBlockPlacement({
      progress: { complete: true }
    })).toBe(true);
    expect(canStackFreeBlockPlacement({
      progress: { complete: false }
    })).toBe(false);
    expect(canStackFreeBlockPlacement()).toBe(false);
  });

  it("reads saved origin cells with fallback normalization", () => {
    const originFlag = "foundationOrigin";
    const defaultOriginCell = { x: 10, y: 20 };

    expect(getSavedFoundationBuildZoneOriginCell({
      flags: {
        [originFlag]: { x: "12.8", z: "22.4" }
      },
      originFlag,
      defaultOriginCell
    })).toEqual({ x: 12, y: 22 });

    expect(getSavedFoundationBuildZoneOriginCell({
      flags: {},
      originFlag,
      defaultOriginCell
    })).toEqual(defaultOriginCell);
  });

  it("saves normalized origin cells without requiring a story state", () => {
    const flags = {};
    const originFlag = "foundationOrigin";

    expect(saveFoundationBuildZoneOriginCell({
      flags,
      originCell: { x: "5.9", z: "7.2" },
      originFlag,
      defaultOriginCell: { x: 0, y: 0 }
    })).toEqual({ x: 5, y: 7 });
    expect(flags[originFlag]).toEqual({ x: 5, y: 7 });

    expect(saveFoundationBuildZoneOriginCell({
      flags: null,
      originCell: { x: 1, y: 2 },
      originFlag,
      defaultOriginCell: { x: 0, y: 0 }
    })).toBeNull();
  });

  it("creates unavailable foundation zone placement payloads", () => {
    expect(createUnavailableFoundationBuildZonePlacementResult({
      blockType: "wall",
      targetCell: { x: 1, y: 2 }
    })).toEqual({
      placed: false,
      reason: "blocked-cell",
      blockType: "wall",
      block: null,
      targetCell: { x: 1, y: 2 }
    });
  });

  it("creates unavailable foundation zone validation payloads", () => {
    expect(createUnavailableFoundationBuildZoneValidation({
      targetCell: { x: 3, y: 4 }
    })).toEqual({
      valid: false,
      reason: "blocked-cell",
      targetCell: { x: 3, y: 4 }
    });
  });
});
