import { describe, expect, it, vi } from "vitest";

import {
  createNaturePresentationFrameRuntime,
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

  it("runs the composed nature presentation pass without gameLoop-owned coordination", () => {
    const session = createBaseSession({
      playerCharacter: {
        getPosition: () => [0, 0, 0]
      },
      tallGrassInstances: [{ id: "stale-grass" }],
      groundGrassPatches: [
        {
          id: "runtime-grass",
          cellId: "runtime-cell",
          state: "alive",
          position: [1, 0, 0],
          size: [1, 1]
        }
      ],
      woodDrops: [
        { id: "wood-near", itemId: "wood", collected: false, position: [1, 0, 0], size: [0.4, 0.4] }
      ],
      snowstorm: { active: true },
      snowflakeTexture: "snowflake",
      gameplayOpeningShip: { visible: true }
    });
    const nextFrame = createNextFrame();
    const appendRenderables = vi.fn();
    const snowstormBillboard = { texture: "snowflake", position: [0, 1, 0] };
    const shipBillboard = { texture: "ship", position: [0, 2, 0] };
    const getSnowstormBillboardsForSession = vi.fn(() => [snowstormBillboard]);
    const appendOpeningShipBillboards = vi.fn(({ billboards }) => {
      billboards.push(shipBillboard);
    });
    const runtime = createNaturePresentationFrameRuntime({
      session,
      controls: { storyState: { flags: {} } },
      rendering: {
        fullUvRect: "uv",
        isResourceNodeActive: () => true
      },
      camera: {
        getPose: () => ({ target: [0, 0, 0] })
      },
      landscapeCutEffectRuntime: {
        appendRenderables
      },
      woodCollectPopRuntime: { getBillboards: () => [] },
      gearPickupParticleRuntime: { getBillboards: () => [] },
      sources: {
        getSnowstormBillboardsForSession,
        appendOpeningShipBillboards
      }
    });

    runtime.update({
      nextFrame,
      now: 100,
      cinematicActive: false
    });

    expect(session.tallGrassInstances).toEqual([
      expect.objectContaining({
        id: "tall-grass-runtime-grass"
      })
    ]);
    expect(nextFrame.render.woodDrops).toEqual([
      expect.objectContaining({ id: "wood-near" })
    ]);
    expect(appendRenderables).toHaveBeenCalledWith(expect.objectContaining({
      nextFrame,
      session
    }));
    expect(getSnowstormBillboardsForSession).toHaveBeenCalledWith(
      session.snowstorm,
      "snowflake",
      "uv"
    );
    expect(appendOpeningShipBillboards).toHaveBeenCalledWith(expect.objectContaining({
      billboards: nextFrame.render.genericBillboards,
      ship: session.gameplayOpeningShip
    }));
    expect(nextFrame.render.genericBillboards).toEqual(expect.arrayContaining([
      snowstormBillboard,
      shipBillboard
    ]));
  });

  it("updates passive nature effect runtimes with the frame delta", () => {
    const session = createBaseSession({
      natureRevivalEffects: [{ id: "revival-effect" }]
    });
    const updateNatureRevivalEffectsForSession = vi.fn();
    const treeRevivalLeafBurstFrameRuntime = { update: vi.fn() };
    const woodCollectPopRuntime = {
      update: vi.fn(),
      getBillboards: () => []
    };
    const gearPickupParticleRuntime = {
      update: vi.fn(),
      getBillboards: () => []
    };
    const runtime = createNaturePresentationFrameRuntime({
      session,
      controls: { storyState: { flags: {} } },
      rendering: {
        fullUvRect: "uv",
        isResourceNodeActive: () => true
      },
      camera: {
        getPose: () => ({ target: [0, 0, 0] })
      },
      landscapeCutEffectRuntime: {
        appendRenderables: vi.fn()
      },
      treeRevivalLeafBurstFrameRuntime,
      woodCollectPopRuntime,
      gearPickupParticleRuntime,
      sources: {
        updateNatureRevivalEffectsForSession
      }
    });

    runtime.updatePassiveEffects(0.25);

    expect(updateNatureRevivalEffectsForSession).toHaveBeenCalledWith(
      session.natureRevivalEffects,
      0.25
    );
    expect(treeRevivalLeafBurstFrameRuntime.update).toHaveBeenCalledWith(0.25);
    expect(woodCollectPopRuntime.update).toHaveBeenCalledWith(0.25);
    expect(gearPickupParticleRuntime.update).toHaveBeenCalledWith(0.25);
  });
});
