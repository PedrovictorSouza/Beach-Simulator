import { describe, expect, it, vi } from "vitest";

import {
  createGameplayCompanionPresentationRuntimeBundle,
  createCompanionPresentationRuntimeBundle
} from "../app/runtime/companions/companionPresentationRuntimeBundle.js";

function createHarness() {
  const controls = {
    playerSkills: {
      waterGun: true
    },
    storyState: {
      flags: {},
      questIndex: 1
    }
  };
  const session = {
    actTwoSquirtle: {
      assemblyState: "assembled",
      modelInstance: {},
      position: [1, 0.04, 2],
      recovered: true,
      visible: true
    },
    bulbasaurEncounter: null,
    charmanderEncounter: null,
    timburrEncounter: null,
    squirtleWaterStaminaFillTexture: "fill",
    squirtleWaterStaminaBackTexture: "back",
    squirtleChargingParticleTexture: "charge",
    squirtleWaterSprayTexture: "spray"
  };
  const fieldMoveActorPositionRuntime = {
    getBulbasaurGrowEmitterPosition: vi.fn(() => [0, 0.4, 0]),
    getCharmanderMouthPosition: vi.fn(() => [0, 0.4, 0]),
    getCharmanderWorldPosition: vi.fn(() => [0, 0.04, 0]),
    getSquirtleMouthPosition: vi.fn(() => [1, 0.4, 2]),
    getSquirtleWorldPosition: vi.fn(() => [1, 0.04, 2])
  };
  const worldSceneSyncRuntime = {
    syncInteractablePosition: vi.fn()
  };
  const nextFrame = {
    render: {
      genericBillboards: []
    }
  };

  return {
    bundle: createCompanionPresentationRuntimeBundle({
      camera: {
        getBillboardAxes: vi.fn(() => ({ right: [1, 0, 0] })),
        getPose: vi.fn(() => ({ direction: [0, 0, -1] }))
      },
      controls,
      rendering: {
        fullUvRect: [0, 0, 1, 1]
      },
      session,
      runtimes: {
        fieldMoveActorPositionRuntime,
        worldSceneSyncRuntime
      },
      callbacks: {
        getEncounterRepairBoxPosition: vi.fn(() => [0, 0.04, 0]),
        isActTwoTutorialStarted: vi.fn(() => false),
        isRevealBoxBotVisible: vi.fn(() => true),
        onSquirtleRechargeComplete: vi.fn()
      },
      math: {
        clamp01: (value) => Math.max(0, Math.min(1, value)),
        easeOutCubic: (value) => value,
        lerp: (start, end, progress) => start + (end - start) * progress,
        moveValueToward: (current, target) => target
      },
      config: {
        bulbasaurModelScale: 0.65,
        charmanderModelScale: 0.75,
        interactionRadiusGizmoConfig: {},
        repairBoxActiveTint: [1, 1, 1],
        repairBoxActiveTintStrength: 0.5,
        repairBoxBobHeight: 0.1,
        repairBoxBobSpeed: 1,
        repairBoxFloatHeight: 0.2,
        repairBoxInactiveAlpha: 0.35,
        repairBoxInvestigationOffset: [0, 0, 0],
        repairBoxModelPitchOffset: 0,
        repairBoxOpenBackstep: 0,
        repairBoxOpenLift: 0,
        repairBoxOpenPitch: 0,
        repairBoxOpenRoll: 0,
        repairBoxRevealBoxDuration: 1,
        repairBoxRevealBoxOpenStartProgress: 0.25,
        repairBoxRevealBoxShakeEndProgress: 0.75,
        repairBoxRevealBoxSpinAcceleration: 1,
        repairBoxRustleLift: 0,
        repairBoxRustlePitch: 0,
        repairBoxRustleRoll: 0,
        repairBoxRustleYaw: 0,
        repairBoxSpinSpeed: 1,
        robotModelScale: 0.5,
        squirtleReassemblyPartScale: 0.4,
        timburrModelScale: 0.58
      }
    }),
    fieldMoveActorPositionRuntime,
    nextFrame,
    session,
    worldSceneSyncRuntime
  };
}

describe("createCompanionPresentationRuntimeBundle", () => {
  it("wires companion model sync, ability resources and render frame runtimes", () => {
    const {
      bundle,
      fieldMoveActorPositionRuntime,
      nextFrame,
      session,
      worldSceneSyncRuntime
    } = createHarness();

    bundle.companionModelSyncRuntime.syncSquirtle();

    expect(session.actTwoSquirtle.modelInstance.offset).toEqual([1, 0.04, 2]);
    expect(session.actTwoSquirtle.modelInstance.scale).toBe(0.5);
    expect(worldSceneSyncRuntime.syncInteractablePosition)
      .toHaveBeenCalledWith("squirtle", [1, 0.04, 2]);

    expect(bundle.companionAbilityResourcesRuntime.getSquirtleWaterStaminaState())
      .toMatchObject({ current: 3, max: 3 });

    bundle.companionRenderFrameRuntime.update({
      activeMoveId: "waterGun",
      nextFrame,
      now: 1000
    });

    expect(fieldMoveActorPositionRuntime.getSquirtleWorldPosition)
      .toHaveBeenCalled();
    expect(nextFrame.render.genericBillboards.length).toBeGreaterThan(0);
  });

  it("wires gameplay companion presentation defaults", () => {
    const session = {
      actTwoSquirtle: {
        assemblyState: "assembled",
        modelInstance: {},
        position: [1, 0.04, 2],
        recovered: true,
        visible: true
      },
      squirtleWaterStaminaFillTexture: "fill",
      squirtleWaterStaminaBackTexture: "back",
      squirtleChargingParticleTexture: "charge",
      squirtleWaterSprayTexture: "spray"
    };

    const bundle = createGameplayCompanionPresentationRuntimeBundle({
      camera: {
        getBillboardAxes: vi.fn(() => ({ right: [1, 0, 0] })),
        getPose: vi.fn(() => ({ direction: [0, 0, -1] }))
      },
      controls: {
        playerSkills: {},
        storyState: { flags: {} }
      },
      rendering: {
        fullUvRect: [0, 0, 1, 1]
      },
      session,
      callbacks: {
        getEncounterRepairBoxPosition: vi.fn(() => [0, 0.04, 0]),
        isActTwoTutorialStarted: vi.fn(() => false),
        isRevealBoxBotVisible: vi.fn(() => true),
        onSquirtleRechargeComplete: vi.fn()
      },
      math: {
        clamp01: (value) => Math.max(0, Math.min(1, value)),
        easeOutCubic: (value) => value,
        lerp: (start, end, progress) => start + (end - start) * progress,
        moveValueToward: (current, target) => target
      }
    });

    bundle.companionModelSyncRuntime.syncSquirtle();

    expect(session.actTwoSquirtle.modelInstance.scale).toBe(0.5);
    expect(bundle.repairBoxMotionRuntime.getFloatOffset([0, 0, 0]))
      .toEqual([0, 0.74, 0]);
  });
});
