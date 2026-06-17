import { describe, expect, it, vi } from "vitest";

import {
  createGameplayCompanionMotionRuntimeBundle,
  createCompanionMotionRuntimeBundle
} from "../app/runtime/companions/companionMotionRuntimeBundle.js";

function createHarness() {
  const controls = {
    getActiveMoveId: vi.fn(() => null),
    storyState: {
      flags: {
        bulbasaurWorkbenchGuideAvailable: true,
        squirtleFollowing: true
      }
    }
  };
  const session = {
    actTwoSquirtle: {
      assemblyState: "assembled",
      modelInstance: {},
      position: [0, 0.04, -4],
      recovered: true
    },
    bulbasaurEncounter: {
      position: [2, 0.04, 2]
    },
    playerCharacter: {
      getPosition: vi.fn(() => [0, 0.04, 0])
    },
    playerModelInstance: {
      yaw: 0
    }
  };
  const companionConstructionBlockerRuntime = {
    tryMove: vi.fn((companion, nextPosition) => {
      companion.position = nextPosition;
      return true;
    })
  };
  const companionFacingRuntime = {
    getRobotModelYawToward: vi.fn(() => 1.25)
  };
  const companionModelSyncRuntime = {
    syncBulbasaur: vi.fn(),
    syncSquirtle: vi.fn()
  };
  const waterGunRuntime = {
    getQueue: vi.fn(() => [])
  };

  return {
    bundle: createCompanionMotionRuntimeBundle({
      controls,
      session,
      runtimes: {
        companionConstructionBlockerRuntime,
        companionFacingRuntime,
        companionModelSyncRuntime,
        waterGunRuntime
      },
      config: {
        arriveDistance: 0.1,
        bulbasaurFollowDistance: 2,
        bulbasaurFollowSpeed: 2,
        bulbasaurIdlePatrolRadius: 1,
        bulbasaurModelFaceYawOffset: 0.2,
        bulbasaurWorkbenchGuideRampApproachMargin: 0.3,
        bulbasaurWorkbenchGuideRampColliderId: "workbench-ramp-collider",
        bulbasaurWorkbenchGuideSideApproachMargin: 0.4,
        bulbasaurWorkbenchGuideSpeed: 1,
        bulbasaurWorkbenchGuideStart: [1, 0.02, 1],
        bulbasaurWorkbenchGuideWaypointDistance: 0.08,
        botPlayerAttentionDistance: 4,
        robotIdlePatrolArriveDistance: 0.05,
        robotIdlePatrolPauseDuration: 0.25,
        robotIdlePatrolSpeed: 0.5,
        squirtleFollowDistance: 2,
        squirtleFollowSpeed: 2,
        squirtleIdlePatrolRadius: 1,
        squirtleModelFaceYawOffset: 0.1,
        workbenchPosition: [4, 0.02, 4]
      }
    }),
    companionConstructionBlockerRuntime,
    companionModelSyncRuntime,
    session,
    waterGunRuntime
  };
}

describe("createCompanionMotionRuntimeBundle", () => {
  it("wires companion follow, guide and patrol runtimes with the existing public contract", () => {
    const {
      bundle,
      companionConstructionBlockerRuntime,
      companionModelSyncRuntime,
      session,
      waterGunRuntime
    } = createHarness();

    expect(bundle.bulbasaurWorkbenchGuideRuntime.isActive()).toBe(true);

    bundle.companionFollowDirectionRuntime.update(1, 0);
    bundle.companionGroundPatrolFrameRuntime.updateSquirtle(1, {
      active: true,
      activeMoveId: null
    });

    expect(waterGunRuntime.getQueue).toHaveBeenCalled();
    expect(companionConstructionBlockerRuntime.tryMove).toHaveBeenCalled();
    expect(companionModelSyncRuntime.syncSquirtle).toHaveBeenCalled();
    expect(session.actTwoSquirtle.position[0]).toBeLessThan(0);
  });

  it("wires gameplay companion motion defaults", () => {
    const controls = {
      getActiveMoveId: vi.fn(() => null),
      storyState: {
        flags: {
          bulbasaurWorkbenchGuideAvailable: true,
          squirtleFollowing: true
        }
      }
    };
    const session = {
      actTwoSquirtle: {
        assemblyState: "assembled",
        modelInstance: {},
        position: [0, 0.04, -4],
        recovered: true
      },
      bulbasaurEncounter: {
        position: [2, 0.04, 2]
      },
      playerCharacter: {
        getPosition: vi.fn(() => [0, 0.04, 0])
      },
      playerModelInstance: {
        yaw: 0
      }
    };
    const companionConstructionBlockerRuntime = {
      tryMove: vi.fn((companion, nextPosition) => {
        companion.position = nextPosition;
        return true;
      })
    };
    const companionModelSyncRuntime = {
      syncBulbasaur: vi.fn(),
      syncSquirtle: vi.fn()
    };

    const bundle = createGameplayCompanionMotionRuntimeBundle({
      controls,
      session,
      runtimes: {
        companionConstructionBlockerRuntime,
        companionModelSyncRuntime
      }
    });

    expect(bundle.bulbasaurWorkbenchGuideRuntime.isActive()).toBe(true);

    bundle.companionFollowDirectionRuntime.update(1, 0);
    bundle.companionGroundPatrolFrameRuntime.updateSquirtle(1, {
      active: true,
      activeMoveId: null
    });

    expect(companionConstructionBlockerRuntime.tryMove).toHaveBeenCalled();
    expect(companionModelSyncRuntime.syncSquirtle).toHaveBeenCalled();
  });
});
