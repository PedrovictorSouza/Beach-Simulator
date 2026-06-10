import { describe, expect, it } from "vitest";

import {
  updateNatureGrassRenderFrame,
  updateNatureRenderFrame
} from "../app/runtime/presentation/natureRenderFrame.js";

function createNextFrame() {
  return {
    render: {
      grassBillboards: [],
      flowerBillboards: [],
      genericBillboards: [],
      woodDrops: []
    }
  };
}

function createBaseSession(overrides = {}) {
  return {
    groundGrassPatches: [],
    groundFlowerPatches: [],
    woodDrops: [],
    leppaBerryDrops: [],
    resourceNodes: [],
    natureRevivalEffects: [],
    tallGrassInstances: [],
    leafageGardenInstances: [],
    leafageNativeTreeInstances: [],
    deadGrassInstances: [],
    tallGrassModel: { size: [1, 1, 1] },
    greenGrassTexture: "green-grass",
    deadGrassTexture: "dead-grass",
    greenFlowerTexture: "green-flower",
    deadFlowerTexture: "dead-flower",
    woodTexture: "wood",
    leavesTexture: "leaves",
    leppaBerryTexture: "leppa",
    natureRevivalSparkTexture: "spark",
    leppaTreeMusicalNoteTextures: [],
    leppaTree: null,
    ...overrides
  };
}

describe("nature render frame", () => {
  it("renders grass patches into model instances or billboard fallback buckets", () => {
    const session = createBaseSession({
      groundGrassPatches: [
        {
          id: "model-grass",
          cellId: "model-cell",
          state: "alive",
          position: [1, 0, 0],
          size: [1.3, 1.3]
        },
        {
          id: "billboard-grass",
          cellId: "billboard-cell",
          state: "alive",
          leafageObjectId: "garden1",
          position: [2, 0, 0],
          size: [1, 2]
        }
      ]
    });
    const nextFrame = createNextFrame();

    updateNatureGrassRenderFrame({
      session,
      nextFrame,
      storyState: { flags: {} },
      now: 100,
      grassBendPlayerPosition: null,
      natureRenderCenter: [0, 0, 0],
      grassCollisionObjects: []
    });

    expect(session.tallGrassInstances).toHaveLength(1);
    expect(session.tallGrassInstances[0]).toMatchObject({
      id: "tall-grass-model-grass",
      alpha: 1
    });
    expect(nextFrame.render.grassBillboards).toEqual([
      expect.objectContaining({
        texture: "green-grass",
        position: [2, 0, 0],
        size: [1, 2],
        alpha: 1
      })
    ]);
  });

  it("renders flowers, visible drops and leaf billboards through the same presentation pass", () => {
    const session = createBaseSession({
      groundFlowerPatches: [
        {
          id: "dead-flower",
          cellId: "flower-cell",
          state: "dead",
          position: [1, 0, 1],
          size: [0.8, 0.9]
        }
      ],
      woodDrops: [
        { id: "wood-near", itemId: "wood", collected: false, position: [1, 0, 0], size: [0.4, 0.4] },
        { id: "leaf-near", itemId: "leaves", collected: false, position: [2, 0, 0], size: [0.3, 0.3] },
        { id: "wood-far", itemId: "wood", collected: false, position: [200, 0, 0], size: [0.4, 0.4] },
        { id: "wood-collected", itemId: "wood", collected: true, position: [1, 0, 0], size: [0.4, 0.4] }
      ],
      leppaBerryDrops: [
        { id: "leppa-near", collected: false, position: [3, 0, 0], size: [0.5, 0.5] }
      ],
      resourceNodes: [
        { id: "leaf-resource", itemId: "leaves", position: [4, 0, 0] }
      ]
    });
    const nextFrame = createNextFrame();

    updateNatureRenderFrame({
      session,
      nextFrame,
      storyState: { flags: {} },
      rendering: {
        fullUvRect: "uv",
        isResourceNodeActive: () => true
      },
      now: 100,
      grassBendPlayerPosition: null,
      natureRenderCenter: [0, 0, 0],
      grassCollisionObjects: [],
      woodCollectPopRuntime: { getBillboards: () => [] },
      gearPickupParticleRuntime: { getBillboards: () => [] }
    });

    expect(nextFrame.render.flowerBillboards).toEqual([
      {
        texture: "dead-flower",
        position: [1, 0, 1],
        size: [0.8, 0.9]
      }
    ]);
    expect(nextFrame.render.woodTexture).toBe("wood");
    expect(nextFrame.render.woodDrops).toEqual([
      expect.objectContaining({ id: "wood-near" })
    ]);
    expect(nextFrame.render.genericBillboards).toEqual([
      expect.objectContaining({ texture: "leaves", position: [2, 0, 0] }),
      expect.objectContaining({ texture: "leaves", position: [4, 0.32, 0] }),
      expect.objectContaining({ texture: "leppa", position: [3, 0, 0] })
    ]);
  });
});
