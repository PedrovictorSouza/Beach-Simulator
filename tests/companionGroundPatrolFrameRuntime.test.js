import { describe, expect, it, vi } from "vitest";

import {
  createCompanionGroundPatrolFrameRuntime
} from "../app/runtime/companions/companionGroundPatrolFrameRuntime.js";

function createRuntime(overrides = {}) {
  const followMovement = {
    moveTowardPlayer: vi.fn()
  };
  const idleMotion = {
    faceTowardPlayer: vi.fn(() => false),
    updatePatrol: vi.fn()
  };
  const sync = {
    squirtle: vi.fn(),
    bulbasaur: vi.fn()
  };
  const session = {
    actTwoSquirtle: {
      recovered: true,
      assemblyState: "assembled",
      patrol: { active: true }
    },
    bulbasaurEncounter: {
      visible: true,
      position: [0, 0.04, 0],
      patrol: { active: true }
    },
    ...overrides.session
  };
  const controls = {
    storyState: {
      flags: {
        ...overrides.flags
      }
    }
  };

  return {
    runtime: createCompanionGroundPatrolFrameRuntime({
      session,
      controls,
      followMovement,
      idleMotion,
      getSquirtleWaterGunQueue: vi.fn(() => []),
      isBulbasaurWorkbenchGuideActive: vi.fn(() => false),
      resolveFollowFormationIndex: vi.fn(() => 1),
      resolveFollowDistance: vi.fn(() => 2.5),
      syncSquirtleModelInstance: sync.squirtle,
      syncBulbasaurModelInstance: sync.bulbasaur,
      config: {
        squirtleFollowSpeed: 3,
        squirtleFollowDistance: 1.2,
        squirtleModelFaceYawOffset: 0.1,
        squirtleIdlePatrolRadius: 4,
        bulbasaurFollowSpeed: 2,
        bulbasaurFollowDistance: 1.5,
        bulbasaurModelFaceYawOffset: 0.2,
        bulbasaurIdlePatrolRadius: 5
      },
      ...overrides.runtime
    }),
    session,
    controls,
    followMovement,
    idleMotion,
    sync
  };
}

describe("createCompanionGroundPatrolFrameRuntime", () => {
  it("moves a following Squirtle toward its formation slot", () => {
    const {
      runtime,
      session,
      followMovement,
      idleMotion,
      sync
    } = createRuntime({
      flags: {
        squirtleFollowing: true
      }
    });

    runtime.updateSquirtle(0.25, {
      active: true,
      activeMoveId: "waterGun"
    });

    expect(followMovement.moveTowardPlayer).toHaveBeenCalledWith(
      session.actTwoSquirtle,
      {
        deltaTime: 0.25,
        speed: 3,
        followDistance: 2.5,
        modelFaceYawOffset: 0.1
      }
    );
    expect(idleMotion.faceTowardPlayer).not.toHaveBeenCalled();
    expect(sync.squirtle).toHaveBeenCalledTimes(1);
  });

  it("uses Bulbasaur idle patrol when not following and not facing the player", () => {
    const {
      runtime,
      session,
      idleMotion,
      sync
    } = createRuntime();

    runtime.updateBulbasaur(0.5, {
      active: true,
      activeMoveId: "leafage"
    });

    expect(idleMotion.faceTowardPlayer).toHaveBeenCalledWith(
      session.bulbasaurEncounter,
      { modelFaceYawOffset: 0.2 }
    );
    expect(idleMotion.updatePatrol).toHaveBeenCalledWith(
      session.bulbasaurEncounter,
      {
        deltaTime: 0.5,
        radius: 5,
        modelFaceYawOffset: 0.2
      }
    );
    expect(sync.bulbasaur).toHaveBeenCalledTimes(1);
  });

  it("clears patrol and syncs when movement is blocked", () => {
    const {
      runtime,
      session,
      followMovement,
      idleMotion,
      sync
    } = createRuntime();

    runtime.updateSquirtle(0.25, {
      active: false,
      activeMoveId: null
    });

    expect(session.actTwoSquirtle.patrol).toBeNull();
    expect(followMovement.moveTowardPlayer).not.toHaveBeenCalled();
    expect(idleMotion.updatePatrol).not.toHaveBeenCalled();
    expect(sync.squirtle).toHaveBeenCalledTimes(1);
  });
});
