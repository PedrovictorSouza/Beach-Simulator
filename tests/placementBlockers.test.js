import { describe, expect, it } from "vitest";
import {
  createPlayerConstructionPlacementBlockers,
  createPlayerConstructionTerrainColliders,
  getRotatedFootprintSize,
  isPositionBlockedByTerrainColliders,
  isPositionInsideTerrainColliderFootprint
} from "../app/gameplay/placementBlockers.js";
import {
  formatBuildBlockDebugLines,
  resolveBuildBlockPreviewValidity,
  shouldTimburrBuildBlockCastFromBlockedApproach
} from "../app/runtime/gameLoop.js";
import {
  resolveConstructionDisplacementPosition,
  resolveTimburrBuildBlockApproachPosition
} from "../app/runtime/fieldMoveRuntime/buildBlockRuntime.js";

describe("placement blockers", () => {
  it("keeps player constructions in the placement blocker list", () => {
    const blockers = createPlayerConstructionPlacementBlockers({
      session: {
        strawBed: {
          position: [2, 0.02, 3],
          size: [0, 0]
        },
        campfire: {
          position: [6, 0.02, 3],
          yaw: Math.PI * 0.5
        },
        leafDen: {
          position: [10, 0.02, 3],
          yaw: Math.PI * 0.5
        },
        playerHouses: [
          {
            id: "house-2",
            position: [14, 0.02, 3]
          }
        ]
      },
      storyState: {
        flags: {
          strawBedPlacedInBulbasaurHabitat: true,
          campfireSpatOut: true,
          leafDenKitPlaced: true,
          leafDenBuilt: true
        }
      }
    });

    expect(blockers).toEqual([
      {
        id: "solar-station",
        kind: "solarStation",
        position: [2, 0.02, 3],
        size: [2.2, 2.2]
      },
      {
        id: "train-house",
        kind: "trainHouse",
        position: [6, 0.02, 3],
        size: [1.45, 1.7]
      },
      {
        id: "house",
        kind: "house",
        position: [10, 0.02, 3],
        size: [2.9, 3.9]
      },
      {
        id: "player-house:house-2",
        kind: "playerHouse",
        position: [14, 0.02, 3],
        size: [3.9, 2.9]
      }
    ]);
  });

  it("does not block inactive story constructions", () => {
    expect(createPlayerConstructionPlacementBlockers({
      session: {
        strawBed: { position: [2, 0.02, 3] },
        campfire: { position: [6, 0.02, 3] },
        leafDen: { position: [10, 0.02, 3] }
      },
      storyState: { flags: {} }
    })).toEqual([]);
  });

  it("swaps rectangular footprint axes on quarter-turn rotation", () => {
    expect(getRotatedFootprintSize([3.9, 2.9], Math.PI * 0.5)).toEqual([2.9, 3.9]);
    expect(getRotatedFootprintSize([3.9, 2.9], Math.PI)).toEqual([3.9, 2.9]);
  });

  it("converts construction blockers into solid terrain colliders", () => {
    expect(createPlayerConstructionTerrainColliders({
      session: {
        leafDen: {
          position: [10, 0.02, 3],
          yaw: Math.PI * 0.5
        }
      },
      storyState: {
        flags: {
          leafDenBuilt: true
        }
      }
    })).toEqual([
      {
        id: "player-construction-collider:house",
        kind: "house",
        position: [10, 0, 3],
        size: [2.9, 2.4, 3.9],
        surfaceY: 2.4,
        blocksPlayer: true,
        padding: 0.12
      }
    ]);
  });

  it("detects companion-sized positions blocked by construction colliders", () => {
    const colliders = createPlayerConstructionTerrainColliders({
      session: {
        leafDen: {
          position: [10, 0.02, 3]
        }
      },
      storyState: {
        flags: {
          leafDenBuilt: true
        }
      }
    });

    expect(isPositionInsideTerrainColliderFootprint([10, 0.04, 3], colliders[0])).toBe(true);
    expect(isPositionBlockedByTerrainColliders([10, 0.04, 3], colliders)).toBe(true);
    expect(isPositionBlockedByTerrainColliders([16, 0.04, 3], colliders)).toBe(false);
    expect(isPositionBlockedByTerrainColliders([10, 2.4, 3], colliders)).toBe(false);
  });

  it("does not let neighboring free block colliders close an empty cell gap", () => {
    const colliders = createPlayerConstructionTerrainColliders({
      session: {
        freeBlockInstances: [
          {
            id: "left-wall",
            active: true,
            offset: [1.5, 0.03, 2.5]
          },
          {
            id: "right-wall",
            active: true,
            offset: [3.5, 0.03, 2.5]
          }
        ]
      }
    });

    expect(isPositionBlockedByTerrainColliders([1.5, 0.04, 2.5], colliders)).toBe(true);
    expect(isPositionBlockedByTerrainColliders([2.5, 0.04, 2.5], colliders)).toBe(false);
    expect(isPositionBlockedByTerrainColliders([3.5, 0.04, 2.5], colliders)).toBe(true);
  });

  it("turns Leafage native trees into one-cell player colliders", () => {
    const colliders = createPlayerConstructionTerrainColliders({
      session: {
        groundGrassPatches: [
          {
            id: "leafage-native-tree-ground-1",
            leafageObjectId: "nativeTree",
            state: "alive",
            position: [5, 0.02, 7]
          },
          {
            id: "leafage-garden-ground-2",
            leafageObjectId: "garden1",
            state: "alive",
            position: [8, 0.02, 7]
          }
        ]
      }
    });

    expect(colliders).toEqual([
      {
        id: "leafage-native-tree-collider:leafage-native-tree-ground-1",
        kind: "leafageNativeTree",
        position: [5, 0, 7],
        size: [1, 2.2, 1],
        surfaceY: 2.2,
        blocksPlayer: true,
        padding: 0.08
      }
    ]);
    expect(isPositionBlockedByTerrainColliders([5, 0.04, 7], colliders)).toBe(true);
    expect(isPositionBlockedByTerrainColliders([6.2, 0.04, 7], colliders)).toBe(false);
  });

  it("moves Builder Bot approach off an occupied side when building an empty gap", () => {
    const colliders = createPlayerConstructionTerrainColliders({
      session: {
        freeBlockInstances: [
          {
            id: "left-wall",
            active: true,
            offset: [1.5, 0.03, 2.5]
          },
          {
            id: "right-wall",
            active: true,
            offset: [3.5, 0.03, 2.5]
          }
        ]
      }
    });
    const targetPosition = [2.5, 0.03, 2.5];
    const blockedPreferredApproach = [1.46, 0.04, 2.5];

    expect(isPositionBlockedByTerrainColliders(blockedPreferredApproach, colliders)).toBe(true);

    const approachPosition = resolveTimburrBuildBlockApproachPosition({
      targetPosition,
      timburrPosition: [0, 0.04, 2.5],
      isBlocked: (position) => isPositionBlockedByTerrainColliders(position, colliders)
    });

    expect(approachPosition).not.toEqual(blockedPreferredApproach);
    expect(isPositionBlockedByTerrainColliders(approachPosition, colliders)).toBe(false);
  });

  it("uses the player position when Builder Bot has no approach position yet", () => {
    expect(resolveTimburrBuildBlockApproachPosition({
      targetPosition: [2.5, 0.03, 2.5],
      playerPosition: [2.5, 0.04, 5.5],
      standDistance: 1
    })).toEqual([2.5, 0.04, 3.5]);
  });

  it("pushes the player away from a newly placed construction target", () => {
    const colliders = createPlayerConstructionTerrainColliders({
      session: {
        freeBlockInstances: [
          {
            id: "new-wall",
            active: true,
            offset: [2.5, 0.03, 2.5]
          },
          {
            id: "north-wall",
            active: true,
            offset: [2.5, 0.03, 3.5]
          }
        ]
      }
    });
    const targetPosition = [2.5, 0.03, 2.5];
    const playerPosition = [2.5, 0.04, 2.5];

    const nextPlayerPosition = resolveConstructionDisplacementPosition({
      targetPosition,
      playerPosition,
      cellSize: 1,
      isBlocked: (position) => isPositionBlockedByTerrainColliders(position, colliders)
    });

    expect(nextPlayerPosition).not.toEqual(playerPosition);
    expect(isPositionBlockedByTerrainColliders(nextPlayerPosition, colliders)).toBe(false);
  });

  it("formats build block debug state for the in-game overlay", () => {
    expect(formatBuildBlockDebugLines({
      valid: false,
      reason: "duplicate-block",
      rawTargetCell: { x: 3, y: 1 },
      targetCell: { x: 4, y: 1 },
      playerCell: { x: 4, y: 2 },
      rawTargetBlockType: "wall",
      targetBlockType: null,
      wood: 6,
      validationReason: "duplicate-block",
      blockedByConstruction: false,
      blockingColliderIds: [],
      targetPosition: [4.5, 0.03, 1.5]
    })).toEqual([
      "BuildBlock RED reason=duplicate-block",
      "raw=3,1 target=4,1 player=4,2",
      "rawBlock=wall targetBlock=empty wood=6",
      "validation=duplicate-block blocked=no",
      "colliders=none",
      "world=4.50,0.03,1.50"
    ]);
  });

  it("keeps construction colliders diagnostic for build block preview validity", () => {
    expect(resolveBuildBlockPreviewValidity({
      validation: {
        valid: true,
        reason: null
      },
      blockingColliderIds: ["player-construction-collider:greenhouse:greenhouse-0"]
    })).toEqual({
      valid: true,
      reason: null,
      blockedByConstruction: true
    });
  });

  it("keeps validation failures authoritative for build block preview validity", () => {
    expect(resolveBuildBlockPreviewValidity({
      validation: {
        valid: false,
        reason: "duplicate-block"
      },
      blockingColliderIds: []
    })).toEqual({
      valid: false,
      reason: "duplicate-block",
      blockedByConstruction: false
    });
  });

  it("lets Builder Bot cast when only a static construction blocks the approach", () => {
    expect(shouldTimburrBuildBlockCastFromBlockedApproach([
      {
        id: "player-construction-collider:greenhouse:greenhouse-0",
        kind: "greenhouse"
      }
    ])).toBe(true);
  });

  it("does not bypass approach when a free block blocks Builder Bot", () => {
    expect(shouldTimburrBuildBlockCastFromBlockedApproach([
      {
        id: "free-block-collider:left-wall",
        kind: "freeBlock"
      }
    ])).toBe(false);
  });
});
