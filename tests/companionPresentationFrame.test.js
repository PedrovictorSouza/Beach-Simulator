import { describe, expect, it, vi } from "vitest";

import {
  createCompanionRenderFrameRuntime,
  updateCompanionPresentationFrame,
  updateCompanionRenderFrame
} from "../app/runtime/companions/companionPresentationFrame.js";

function createNextFrame() {
  return {
    render: {
      genericBillboards: []
    }
  };
}

function createBaseSession() {
  return {
    squirtleWaterStaminaFillTexture: "water-stamina",
    squirtleWaterStaminaBackTexture: "stamina-back",
    charmanderCarbonFillTexture: "carbon-fill",
    squirtleWaterSprayTexture: "water-spray",
    charmanderFireTexture: "fire",
    campfireTexture: "campfire",
    natureRevivalSparkTexture: "leaf",
    squirtleChargingParticleTexture: "charge",
    bulbasaurEncounter: {
      visible: true,
      texture: "bulbasaur",
      position: [3, 0, 4],
      size: [0.9, 0.9]
    },
    charmanderEncounter: {
      visible: true,
      texture: "charmander",
      position: [5, 0, 6],
      size: [0.8, 0.8]
    },
    timburrEncounter: {
      visible: false,
      texture: "timburr",
      position: [7, 0, 8],
      size: [0.8, 0.8]
    }
  };
}

const rendering = {
  fullUvRect: [0, 0, 1, 1]
};

const camera = {
  getBillboardAxes: () => ({ right: [1, 0, 0] }),
  getPose: () => ({ direction: [0, 0, -1] })
};

describe("companion presentation frame", () => {
  it("adds companion status, fallback and interaction gizmo billboards", () => {
    const session = createBaseSession();
    const nextFrame = createNextFrame();

    updateCompanionPresentationFrame({
      session,
      nextFrame,
      playerSkills: {
        waterGun: true,
        fire: true
      },
      activeMoveId: "waterGun",
      rendering,
      camera,
      now: 0,
      getSquirtleWorldPosition: () => [1, 0, 2],
      getCharmanderWorldPosition: () => [2, 0, 3],
      getSquirtleMouthPosition: () => [1, 0.6, 2],
      getCharmanderMouthPosition: () => [2, 0.6, 3],
      getBulbasaurGrowEmitterPosition: () => [3, 0.7, 4],
      getSquirtleWaterStaminaState: () => ({
        current: 50,
        visualCurrent: 50,
        max: 100
      }),
      getCharmanderCarbonEnergyState: () => ({
        current: 0.75,
        visualCurrent: 0.75
      }),
      isSquirtleWaterCharging: () => false,
      interactionRadiusGizmoConfig: {
        dotCount: 4,
        dotSize: 0.16,
        interactDistance: 2
      }
    });

    const billboards = nextFrame.render.genericBillboards;
    expect(billboards.some((billboard) => billboard.texture === "water-stamina")).toBe(true);
    expect(billboards.some((billboard) => billboard.texture === "carbon-fill")).toBe(true);
    expect(billboards).toContainEqual({
      texture: "bulbasaur",
      position: [3, 0, 4],
      size: [0.9, 0.9],
      uvRect: rendering.fullUvRect
    });
    expect(billboards).toContainEqual({
      texture: "charmander",
      position: [5, 0, 6],
      size: [0.8, 0.8],
      uvRect: rendering.fullUvRect
    });
    expect(billboards).toContainEqual({
      texture: null,
      position: null,
      size: null,
      uvRect: rendering.fullUvRect
    });
    expect(billboards.filter((billboard) => billboard.texture === "leaf")).toHaveLength(4);
  });

  it("adds companion field move and charging billboards from active actions", () => {
    const session = {
      ...createBaseSession(),
      bulbasaurEncounter: {
        ...createBaseSession().bulbasaurEncounter,
        modelInstance: {}
      },
      charmanderEncounter: {
        ...createBaseSession().charmanderEncounter,
        modelInstance: {}
      },
      timburrEncounter: {
        ...createBaseSession().timburrEncounter,
        modelInstance: {}
      },
      squirtleWaterGunAction: {
        phase: "spray",
        sprayElapsed: 0,
        sprayDuration: 1,
        impactTime: 999,
        targetPosition: [4, 0, 2]
      },
      charmanderFireAction: {
        phase: "spray",
        sprayElapsed: 0,
        targetPosition: [4, 0, 3]
      },
      bulbasaurLeafageAction: {
        phase: "cast",
        castElapsed: 0,
        targetPosition: [4, 0, 4]
      }
    };
    const nextFrame = createNextFrame();

    updateCompanionPresentationFrame({
      session,
      nextFrame,
      playerSkills: {},
      activeMoveId: null,
      rendering,
      camera,
      now: 1000,
      getSquirtleWorldPosition: () => [1, 0, 2],
      getCharmanderWorldPosition: () => [2, 0, 3],
      getSquirtleMouthPosition: () => [1, 0.6, 2],
      getCharmanderMouthPosition: () => [2, 0.6, 3],
      getBulbasaurGrowEmitterPosition: () => [3, 0.7, 4],
      getSquirtleWaterStaminaState: () => ({
        current: 100,
        visualCurrent: 100,
        max: 100
      }),
      getCharmanderCarbonEnergyState: () => ({
        current: 1,
        visualCurrent: 1
      }),
      isSquirtleWaterCharging: () => true,
      interactionRadiusGizmoConfig: {
        dotCount: 4,
        dotSize: 0.16,
        interactDistance: 2
      }
    });

    const textures = new Set(
      nextFrame.render.genericBillboards.map((billboard) => billboard.texture)
    );
    expect(textures.has("water-spray")).toBe(true);
    expect(textures.has("fire")).toBe(true);
    expect(textures.has("leaf")).toBe(true);
    expect(textures.has("charge")).toBe(true);
  });

  it("syncs and activates assembled Act Two Squirtle before companion presentation", () => {
    const session = {
      ...createBaseSession(),
      actTwoSquirtle: {
        visible: false,
        recovered: false,
        assemblyState: "assembled",
        modelInstance: {
          active: false
        }
      }
    };
    const nextFrame = createNextFrame();
    const syncSquirtleModelInstance = vi.fn();

    updateCompanionRenderFrame({
      session,
      nextFrame,
      playerSkills: {},
      activeMoveId: null,
      rendering,
      camera,
      now: 1000,
      storyState: { questIndex: 1 },
      isActTwoTutorialStarted: () => false,
      syncSquirtleModelInstance,
      getSquirtleWorldPosition: () => [1, 0, 2],
      getCharmanderWorldPosition: () => [2, 0, 3],
      getSquirtleMouthPosition: () => [1, 0.6, 2],
      getCharmanderMouthPosition: () => [2, 0.6, 3],
      getBulbasaurGrowEmitterPosition: () => [3, 0.7, 4],
      getSquirtleWaterStaminaState: () => ({
        current: 100,
        visualCurrent: 100,
        max: 100
      }),
      getCharmanderCarbonEnergyState: () => ({
        current: 1,
        visualCurrent: 1
      }),
      isSquirtleWaterCharging: () => false,
      interactionRadiusGizmoConfig: {
        dotCount: 4,
        dotSize: 0.16,
        interactDistance: 2
      }
    });

    expect(syncSquirtleModelInstance).toHaveBeenCalledTimes(1);
    expect(session.actTwoSquirtle.modelInstance.active).toBe(true);
  });

  it("keeps Act Two Squirtle visible while field move presentation needs it", () => {
    const session = {
      ...createBaseSession(),
      actTwoSquirtle: {
        visible: false,
        recovered: false,
        assemblyState: "hidden",
        modelInstance: {
          active: false
        }
      },
      squirtleWaterGunAction: {
        phase: "spray",
        sprayElapsed: 0,
        sprayDuration: 1,
        impactTime: 999,
        targetPosition: [4, 0, 2]
      }
    };
    const nextFrame = createNextFrame();

    updateCompanionRenderFrame({
      session,
      nextFrame,
      playerSkills: {},
      activeMoveId: null,
      rendering,
      camera,
      now: 1000,
      storyState: { questIndex: 0 },
      isActTwoTutorialStarted: () => false,
      syncSquirtleModelInstance: vi.fn(),
      getSquirtleWorldPosition: () => [1, 0, 2],
      getCharmanderWorldPosition: () => [2, 0, 3],
      getSquirtleMouthPosition: () => [1, 0.6, 2],
      getCharmanderMouthPosition: () => [2, 0.6, 3],
      getBulbasaurGrowEmitterPosition: () => [3, 0.7, 4],
      getSquirtleWaterStaminaState: () => ({
        current: 100,
        visualCurrent: 100,
        max: 100
      }),
      getCharmanderCarbonEnergyState: () => ({
        current: 1,
        visualCurrent: 1
      }),
      isSquirtleWaterCharging: () => false,
      interactionRadiusGizmoConfig: {
        dotCount: 4,
        dotSize: 0.16,
        interactDistance: 2
      }
    });

    expect(session.actTwoSquirtle.modelInstance.active).toBe(true);
  });

  it("creates a companion render frame runtime from captured dependencies", () => {
    const session = {
      ...createBaseSession(),
      actTwoSquirtle: {
        visible: false,
        recovered: false,
        assemblyState: "assembled",
        modelInstance: {
          active: false
        }
      }
    };
    const nextFrame = createNextFrame();
    const syncSquirtleModelInstance = vi.fn();
    const runtime = createCompanionRenderFrameRuntime({
      session,
      getPlayerSkills: () => ({}),
      getStoryState: () => ({ questIndex: 1 }),
      rendering,
      camera,
      isActTwoTutorialStarted: () => false,
      syncSquirtleModelInstance,
      getSquirtleWorldPosition: () => [1, 0, 2],
      getCharmanderWorldPosition: () => [2, 0, 3],
      getSquirtleMouthPosition: () => [1, 0.6, 2],
      getCharmanderMouthPosition: () => [2, 0.6, 3],
      getBulbasaurGrowEmitterPosition: () => [3, 0.7, 4],
      getSquirtleWaterStaminaState: () => ({
        current: 100,
        visualCurrent: 100,
        max: 100
      }),
      getCharmanderCarbonEnergyState: () => ({
        current: 1,
        visualCurrent: 1
      }),
      isSquirtleWaterCharging: () => false,
      interactionRadiusGizmoConfig: {
        dotCount: 4,
        dotSize: 0.16,
        interactDistance: 2
      }
    });

    runtime.update({
      nextFrame,
      activeMoveId: null,
      now: 1000
    });

    expect(syncSquirtleModelInstance).toHaveBeenCalledTimes(1);
    expect(session.actTwoSquirtle.modelInstance.active).toBe(true);
  });
});
