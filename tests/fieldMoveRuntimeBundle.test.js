import { describe, expect, it, vi } from "vitest";

import {
  createGameplayFieldMoveRuntimeBundle,
  createFieldMoveRuntimeBundle
} from "../app/runtime/fieldMoveRuntime/fieldMoveRuntimeBundle.js";

function createHarness(overrides = {}) {
  const squirtle = {
    recovered: true,
    modelInstance: { active: false, yaw: 0 },
    position: [0, 0.04, 0]
  };
  const charmander = {
    modelInstance: { active: false, yaw: 0 },
    position: [0, 0.04, 0],
    visible: true
  };
  const bulbasaur = {
    modelInstance: { active: false, yaw: 0 },
    position: [0, 0.04, 0],
    visible: true
  };
  const timburr = {
    modelInstance: { active: false, yaw: 0 },
    position: [0, 0.04, 0],
    visible: true
  };
  const session = {
    actTwoSquirtle: squirtle,
    bulbasaurEncounter: bulbasaur,
    charmanderEncounter: charmander,
    timburrEncounter: timburr,
    groundDeadInstances: [],
    squirtleWaterGunAction: null,
    squirtleWaterGunQueue: [],
    charmanderFireAction: null,
    bulbasaurLeafageAction: null,
    timburrBuildBlockAction: null,
    lastTimburrBuildBlockInvalidReason: null,
    playerCharacter: {
      getPosition: vi.fn(() => [9, 0.04, 9])
    },
    ...overrides.session
  };
  const controls = {
    inventory: {},
    playerSkills: {
      buildBlock: true
    },
    storyState: {
      flags: {
        timburrRevealed: true
      }
    },
    ...overrides.controls
  };
  const runtimes = {
    companionAbilityResourcesRuntime: {
      consumeSquirtleWaterStamina: vi.fn(() => true),
      getSquirtleWaterGunImpactTime: vi.fn(() => 0.2),
      getSquirtleWaterGunSpeedMultiplier: vi.fn(() => 1),
      getSquirtleWaterGunSprayDuration: vi.fn(() => 0.5),
      getSquirtleWaterStaminaState: vi.fn(() => ({ charging: false, current: 3 })),
      isSquirtleWaterCharging: vi.fn(() => false)
    },
    companionConstructionBlockerRuntime: {
      cancelBlockedAction: vi.fn(),
      getBlockers: vi.fn(() => []),
      isBlocked: vi.fn(() => false),
      tryMove: vi.fn((companion, nextPosition) => {
        companion.position = nextPosition;
        return true;
      })
    },
    companionFacingRuntime: {
      getRobotModelYawToward: vi.fn(() => 0.75),
      getSquirtleModelYawToward: vi.fn(() => 0.5)
    },
    companionModelSyncRuntime: {
      syncBulbasaur: vi.fn(),
      syncCharmander: vi.fn(),
      syncSquirtle: vi.fn()
    },
    fieldMoveApproachPositionRuntime: {
      getBulbasaurLeafageApproachPosition: vi.fn(() => [0, 0.04, 0]),
      getCharmanderFireApproachPosition: vi.fn(() => [0, 0.04, 0]),
      getSquirtleWaterGunApproachPosition: vi.fn(() => [0, 0.04, 0]),
      getTimburrBuildBlockApproachPosition: vi.fn(() => [0, 0.04, 0])
    },
    fieldMoveImpactRuntime: {
      applyBulbasaurLeafageImpact: vi.fn(() => true),
      applyCharmanderFireImpact: vi.fn(() => true),
      applySquirtleWaterGunImpact: vi.fn(() => true)
    },
    freeBlockBuildRuntime: {
      applyTimburrImpact: vi.fn(() => true),
      resolveBuildTarget: vi.fn(() => ({
        targetCell: { x: 1, z: 2 },
        targetPosition: [1, 0.04, 2],
        valid: true
      }))
    },
    ...overrides.runtimes
  };
  const callbacks = {
    canUseFireWithCarbon: vi.fn(() => true),
    pushNotice: vi.fn(),
    shouldTimburrBuildBlockCastFromBlockedApproach: vi.fn(() => false),
    ...overrides.callbacks
  };

  return {
    bundle: createFieldMoveRuntimeBundle({
      controls,
      session,
      runtimes,
      callbacks,
      botNames: {
        builder: "Builder Bot",
        grow: "Grow Bot",
        hydro: "Hydro Bot",
        thermal: "Thermal Bot"
      },
      modelFaceYawOffsets: {
        bulbasaur: 0,
        charmander: 0,
        timburr: 0
      },
      notices: {
        leafDenBusy: "Leaf Den is busy"
      }
    }),
    callbacks,
    controls,
    runtimes,
    session
  };
}

describe("createFieldMoveRuntimeBundle", () => {
  it("creates the field move runtimes with the existing action shapes", () => {
    const { bundle, session } = createHarness();
    const groundCell = {
      id: "ground-a",
      offset: [1, 0, 0]
    };

    expect(bundle.waterGunRuntime.startAction({ groundCell })).toBe("started");
    expect(session.squirtleWaterGunAction).toMatchObject({
      phase: "approach",
      groundCell,
      targetPosition: [1, 0.04, 0]
    });

    expect(bundle.leafageRuntime.startAction({ groundCell })).toBe("started");
    expect(session.bulbasaurLeafageAction).toMatchObject({
      phase: "approach",
      groundCell,
      targetPosition: [1, 0.04, 0]
    });

    expect(bundle.buildBlockRuntime.startAction()).toBe("started");
    expect(session.timburrBuildBlockAction).toMatchObject({
      phase: "approach",
      targetPosition: [1, 0.04, 2]
    });
  });

  it("keeps Fire Carbon rejection notice in the field move boundary", () => {
    const { bundle, callbacks, controls } = createHarness({
      callbacks: {
        canUseFireWithCarbon: vi.fn(() => false)
      }
    });

    expect(bundle.fireRuntime.startAction({
      groundCell: { id: "fire-ground", offset: [2, 0, 0] }
    })).toBe("no-carbon");

    expect(callbacks.canUseFireWithCarbon).toHaveBeenCalledWith({
      storyState: controls.storyState,
      inventory: controls.inventory
    });
    expect(callbacks.pushNotice)
      .toHaveBeenCalledWith("Thermal Bot needs Carbon to use Thermal Torch.");
  });

  it("wires gameplay field-move defaults", () => {
    const getRobotModelYawToward = vi.fn(() => 0.75);
    const pushNotice = vi.fn();
    const session = {
      bulbasaurEncounter: {
        modelInstance: { active: false, yaw: 0 },
        position: [0, 0.04, 0],
        visible: true
      },
      charmanderEncounter: {
        modelInstance: { active: false, yaw: 0 },
        position: [0, 0.04, 0],
        visible: true
      },
      groundDeadInstances: [],
      bulbasaurLeafageAction: null,
      charmanderFireAction: null,
      playerCharacter: {
        getPosition: vi.fn(() => [9, 0.04, 9])
      }
    };
    const controls = {
      inventory: {},
      storyState: { flags: {} }
    };
    const runtimes = {
      companionConstructionBlockerRuntime: {
        cancelBlockedAction: vi.fn(),
        isBlocked: vi.fn(() => false),
        tryMove: vi.fn((companion, nextPosition) => {
          companion.position = nextPosition;
          return true;
        })
      },
      companionFacingRuntime: {
        getRobotModelYawToward,
        getSquirtleModelYawToward: vi.fn(() => 0.5)
      },
      companionModelSyncRuntime: {
        syncBulbasaur: vi.fn(),
        syncCharmander: vi.fn()
      },
      fieldMoveApproachPositionRuntime: {
        getBulbasaurLeafageApproachPosition: vi.fn(() => [0, 0.04, 0]),
        getCharmanderFireApproachPosition: vi.fn(() => [0, 0.04, 0])
      },
      fieldMoveImpactRuntime: {
        applyBulbasaurLeafageImpact: vi.fn(() => true),
        applyCharmanderFireImpact: vi.fn(() => true)
      },
      leafDenConstructionPresentationRuntime: {
        isActive: vi.fn(() => true)
      }
    };

    const bundle = createGameplayFieldMoveRuntimeBundle({
      controls,
      session,
      runtimes,
      callbacks: {
        canUseFireWithCarbon: vi.fn(() => true),
        pushNotice
      }
    });

    expect(bundle.fireRuntime.startAction({
      groundCell: { id: "fire-ground", offset: [2, 0, 0] }
    })).toBe("busy");
    expect(pushNotice).toHaveBeenCalledWith("im busy, boss...");

    expect(bundle.leafageRuntime.startAction({
      groundCell: { id: "leafage-ground", offset: [1, 0, 0] }
    })).toBe("started");
    expect(getRobotModelYawToward).toHaveBeenCalledWith(
      [0, 0.04, 0],
      [1, 0.04, 0],
      0
    );
  });
});
