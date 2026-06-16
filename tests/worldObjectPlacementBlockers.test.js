import { describe, expect, it, vi } from "vitest";

import {
  createWorldObjectPlacementBlockerRuntime,
  getLeppaTreePlacementBlockerSize,
  getTreePlacementBlockerSize,
  getWorldObjectPlacementBlockers
} from "../app/runtime/construction/worldObjectPlacementBlockers.js";

describe("world object placement blockers", () => {
  it("sizes living and dead tree blockers from model footprint", () => {
    const treeFootprint = vi.fn(() => 2);

    expect(getTreePlacementBlockerSize({
      treeModel: {},
      instance: {
        alive: true
      },
      treeFootprint,
      treeFootprintScale: 0.5,
      deadTreeFootprintScale: 1.5,
      treeMinSize: 0.9,
      deadTreeMinSize: 1.35
    })).toEqual([1, 1]);

    expect(getTreePlacementBlockerSize({
      treeModel: {},
      instance: {
        alive: false
      },
      treeFootprint,
      treeFootprintScale: 0.5,
      deadTreeFootprintScale: 1.5,
      treeMinSize: 0.9,
      deadTreeMinSize: 1.35
    })).toEqual([3, 3]);
  });

  it("falls back to the tree minimum size when footprint is missing", () => {
    expect(getTreePlacementBlockerSize({
      treeModel: null,
      instance: {},
      treeFootprint: () => 0,
      treeFootprintScale: 0.5,
      deadTreeFootprintScale: 1.5,
      treeMinSize: 0.9,
      deadTreeMinSize: 1.35
    })).toEqual([0.9, 0.9]);
  });

  it("sizes Leppa Tree blockers from default size or grid footprint", () => {
    expect(getLeppaTreePlacementBlockerSize({
      session: {
        leppaTree: {
          footprint: {
            width: 1,
            height: 1
          }
        }
      },
      blockerSize: [2.35, 2.35],
      defaultCellSize: 1.425
    })).toEqual([2.35, 2.35]);

    expect(getLeppaTreePlacementBlockerSize({
      session: {
        buildGridConfig: {
          cellSize: 1.25
        },
        leppaTree: {
          footprint: {
            width: 3,
            height: 2
          }
        }
      },
      blockerSize: [2.35, 2.35],
      defaultCellSize: 1.425
    })).toEqual([3.75, 2.5]);
  });

  it("builds blockers for active palms and Leppa Tree", () => {
    expect(getWorldObjectPlacementBlockers({
      session: {
        palmModel: {},
        palmInstances: [
          {
            id: "palm-a",
            active: true,
            offset: [1, 0, 2],
            alive: true
          },
          {
            id: "palm-b",
            active: false,
            offset: [9, 0, 9]
          }
        ],
        buildGridConfig: {
          cellSize: 1
        },
        leppaTree: {
          id: "leppa",
          position: [4, 0, 5],
          footprint: {
            width: 2,
            height: 2
          }
        }
      },
      treeFootprint: () => 2,
      treeFootprintScale: 0.5,
      deadTreeFootprintScale: 1.5,
      treeMinSize: 0.9,
      deadTreeMinSize: 1.35,
      leppaTreeBlockerSize: [2.35, 2.35],
      leppaTreeDefaultCellSize: 1.425
    })).toEqual([
      {
        id: "tree:palm-a",
        kind: "tree",
        position: [1, 0, 2],
        size: [1, 1]
      },
      {
        id: "tree:leppa",
        kind: "tree",
        position: [4, 0, 5],
        size: [2, 2]
      }
    ]);
  });

  it("creates a runtime that injects world object blocker config", () => {
    const session = {
      palmModel: {},
      palmInstances: [
        {
          id: "palm-a",
          active: true,
          offset: [1, 0, 2],
          alive: false
        }
      ],
      buildGridConfig: {
        cellSize: 1
      },
      leppaTree: {
        id: "leppa",
        position: [4, 0, 5],
        footprint: {
          width: 2,
          height: 2
        }
      }
    };
    const runtime = createWorldObjectPlacementBlockerRuntime({
      session,
      treeFootprint: () => 2,
      treeFootprintScale: 0.5,
      deadTreeFootprintScale: 1.5,
      treeMinSize: 0.9,
      deadTreeMinSize: 1.35,
      leppaTreeBlockerSize: [2.35, 2.35],
      leppaTreeDefaultCellSize: 1.425
    });

    expect(runtime.getTreeBlockerSize({}, { alive: false })).toEqual([3, 3]);
    expect(runtime.getLeppaTreeBlockerSize()).toEqual([2, 2]);
    expect(runtime.getBlockers()).toEqual([
      {
        id: "tree:palm-a",
        kind: "tree",
        position: [1, 0, 2],
        size: [3, 3]
      },
      {
        id: "tree:leppa",
        kind: "tree",
        position: [4, 0, 5],
        size: [2, 2]
      }
    ]);
  });
});
