import { describe, expect, it, vi } from "vitest";

import {
  findNearbyDryGrassHintTarget,
  findNearbyDryGrassWorldPromptTarget
} from "../app/runtime/presentation/dryGrassPromptTargets.js";

describe("dry grass prompt targets", () => {
  it("finds the nearest reachable dead grass patch backed by an active purifiable ground cell", () => {
    const result = findNearbyDryGrassWorldPromptTarget({
      playerPosition: [0.25, 0, 0],
      groundGrassPatches: [
        {
          id: "alive",
          cellId: "cell-alive",
          state: "alive",
          position: [0.1, 0, 0],
          size: [1, 1]
        },
        {
          id: "far",
          cellId: "cell-far",
          state: "dead",
          position: [8, 0, 0],
          size: [1, 1]
        },
        {
          id: "near",
          cellId: "cell-near",
          state: "dead",
          position: [0.4, 0, 0],
          size: [1, 1]
        }
      ],
      groundDeadInstances: [
        {
          id: "cell-far",
          offset: [8, 0, 0],
          tileSpan: 1.425,
          active: true,
          purifiable: true
        },
        {
          id: "cell-near",
          offset: [0.4, 0, 0],
          tileSpan: 1.425,
          active: true,
          purifiable: true
        }
      ]
    });

    expect(result).toEqual({
      patch: expect.objectContaining({ id: "near" }),
      groundCell: expect.objectContaining({ id: "cell-near" }),
      distance: expect.any(Number)
    });
  });

  it("ignores invalid dry grass world prompt candidates", () => {
    expect(findNearbyDryGrassWorldPromptTarget({
      playerPosition: [0, 0, 0],
      groundGrassPatches: [
        {
          id: "inactive",
          cellId: "cell-inactive",
          state: "dead",
          position: [0.1, 0, 0],
          size: [1, 1]
        },
        {
          id: "not-purifiable",
          cellId: "cell-not-purifiable",
          state: "dead",
          position: [0.2, 0, 0],
          size: [1, 1]
        }
      ],
      groundDeadInstances: [
        {
          id: "cell-inactive",
          offset: [0.1, 0, 0],
          tileSpan: 1.425,
          active: false,
          purifiable: true
        },
        {
          id: "cell-not-purifiable",
          offset: [0.2, 0, 0],
          tileSpan: 1.425,
          active: true,
          purifiable: false
        }
      ]
    })).toBeNull();
  });

  it("finds dead grass hint targets and derives stable fallback ids", () => {
    expect(findNearbyDryGrassHintTarget({
      playerPosition: [1.1, 0, 1],
      groundGrassPatches: [
        {
          cellId: "dry-cell",
          state: "dead",
          position: [1, 0, 1],
          size: [1.2, 0.8]
        }
      ]
    })).toEqual({
      patch: expect.objectContaining({ cellId: "dry-cell" }),
      targetId: "dry-cell",
      distance: expect.any(Number)
    });

    expect(findNearbyDryGrassHintTarget({
      playerPosition: [2, 0, 3],
      groundGrassPatches: [
        {
          state: "dead",
          position: [2, 0, 3],
          size: [1, 1]
        }
      ]
    })?.targetId).toBe("dry-grass-2:3");
  });

  it("includes Leppa Tree perimeter cells only when the opening request is active", () => {
    const getLeppaTreeSurroundingGroundCells = vi.fn(() => [
      {
        id: "tile-a",
        offset: [3, 0, 4],
        tileSpan: 1.425
      }
    ]);

    expect(findNearbyDryGrassHintTarget({
      playerPosition: [3.1, 0, 4],
      leppaTree: { id: "leppa" },
      groundDeadInstances: [{ id: "tile-a" }],
      openingLeppaTreeRequestActive: true,
      getLeppaTreeSurroundingGroundCells
    })).toEqual({
      groundCell: expect.objectContaining({ id: "tile-a" }),
      targetId: "leppa-tree-tile:tile-a",
      worldPosition: [3, 0.04, 4],
      distance: expect.any(Number)
    });
    expect(getLeppaTreeSurroundingGroundCells).toHaveBeenCalledWith(
      { id: "leppa" },
      [{ id: "tile-a" }]
    );

    getLeppaTreeSurroundingGroundCells.mockClear();
    expect(findNearbyDryGrassHintTarget({
      playerPosition: [3.1, 0, 4],
      openingLeppaTreeRequestActive: false,
      getLeppaTreeSurroundingGroundCells
    })).toBeNull();
    expect(getLeppaTreeSurroundingGroundCells).not.toHaveBeenCalled();
  });
});
