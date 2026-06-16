import { describe, expect, it, vi } from "vitest";

import { createCompanionEncounterRuntime } from "../app/runtime/companions/companionEncounterRuntime.js";

function createRuntime({
  flags = {},
  sessionOverrides = {},
  leafDenActive = false
} = {}) {
  const session = {
    playerCharacter: {
      getPosition: () => [1, 0.04, 2]
    },
    bulbasaurEncounter: {
      visible: true,
      position: [2, 0.04, 3]
    },
    charmanderEncounter: {
      visible: false,
      position: [3, 0.04, 4]
    },
    timburrEncounter: {
      visible: false,
      position: [4, 0.04, 5],
      modelFaceYawOffset: 0.25
    },
    campfire: {
      position: [3.2, 0, 4.1]
    },
    ...sessionOverrides
  };
  const controls = {
    storyState: {
      flags: {
        ...flags
      }
    },
    onCharmanderCampfireLit: vi.fn()
  };
  const repairBoxRevealOpeningRuntime = {
    update: vi.fn(() => false),
    revealAtRepairPosition: vi.fn()
  };
  const bulbasaurWorkbenchGuideRuntime = {
    isActive: vi.fn(() => false),
    advance: vi.fn()
  };
  const companionModelSyncRuntime = {
    syncBulbasaur: vi.fn(),
    syncCharmander: vi.fn()
  };
  const companionIdleMotionRuntime = {
    updateJumpArc: vi.fn(),
    faceTowardPlayer: vi.fn()
  };
  const constructionHelperMotionRuntime = {
    moveToLeafDen: vi.fn()
  };
  const companionFollowMovementRuntime = {
    moveFormationMemberTowardPlayer: vi.fn()
  };
  const runtime = createCompanionEncounterRuntime({
    session,
    controls,
    repairBoxRevealOpeningRuntime,
    bulbasaurWorkbenchGuideRuntime,
    companionModelSyncRuntime,
    companionIdleMotionRuntime,
    constructionHelperMotionRuntime,
    companionFollowMovementRuntime,
    callbacks: {
      isLeafDenConstructionActive: () => leafDenActive
    },
    config: {
      bulbasaurModelFaceYawOffset: 0,
      charmanderModelFaceYawOffset: Math.PI,
      timburrModelFaceYawOffset: 0.5,
      charmanderFollowSpeed: 2,
      charmanderFollowDistance: 1.25,
      timburrFollowSpeed: 3,
      timburrFollowDistance: 1.5
    }
  });

  return {
    bulbasaurWorkbenchGuideRuntime,
    companionFollowMovementRuntime,
    companionIdleMotionRuntime,
    companionModelSyncRuntime,
    constructionHelperMotionRuntime,
    controls,
    repairBoxRevealOpeningRuntime,
    runtime,
    session
  };
}

describe("createCompanionEncounterRuntime", () => {
  it("updates Bulbasaur workbench guide before idle motion", () => {
    const {
      bulbasaurWorkbenchGuideRuntime,
      companionIdleMotionRuntime,
      companionModelSyncRuntime,
      runtime,
      session
    } = createRuntime();
    bulbasaurWorkbenchGuideRuntime.isActive.mockReturnValue(true);

    runtime.updateBulbasaur(0.25);

    expect(bulbasaurWorkbenchGuideRuntime.advance).toHaveBeenCalledWith(
      0.25,
      session.bulbasaurEncounter
    );
    expect(companionModelSyncRuntime.syncBulbasaur).toHaveBeenCalledTimes(1);
    expect(companionIdleMotionRuntime.updateJumpArc).not.toHaveBeenCalled();
  });

  it("updates Bulbasaur idle jump arc and syncs the model when visible", () => {
    const {
      companionIdleMotionRuntime,
      companionModelSyncRuntime,
      runtime,
      session
    } = createRuntime();

    runtime.updateBulbasaur(0.5);

    expect(companionIdleMotionRuntime.updateJumpArc).toHaveBeenCalledWith(
      session.bulbasaurEncounter,
      {
        deltaTime: 0.5,
        modelFaceYawOffset: 0
      }
    );
    expect(companionModelSyncRuntime.syncBulbasaur).toHaveBeenCalledTimes(1);
  });

  it("moves Charmander to Leaf Den construction when the helper construction is active", () => {
    const {
      companionFollowMovementRuntime,
      companionModelSyncRuntime,
      constructionHelperMotionRuntime,
      runtime,
      session
    } = createRuntime({
      flags: {
        charmanderRevealed: true,
        charmanderFollowing: true
      },
      leafDenActive: true
    });

    runtime.updateCharmander(0.25, { activeMoveId: "fire" });

    expect(constructionHelperMotionRuntime.moveToLeafDen).toHaveBeenCalledWith(
      session.charmanderEncounter,
      {
        offset: [-1.08, 0, 0.82],
        modelFaceYawOffset: Math.PI
      }
    );
    expect(companionModelSyncRuntime.syncCharmander).toHaveBeenCalledTimes(1);
    expect(companionFollowMovementRuntime.moveFormationMemberTowardPlayer).not.toHaveBeenCalled();
  });

  it("completes Charmander campfire beat with existing train-house distance policy", () => {
    const {
      controls,
      runtime,
      session
    } = createRuntime({
      flags: {
        charmanderRevealed: true,
        charmanderFollowing: true
      }
    });

    runtime.updateCharmander(0.25);

    expect(session.charmanderEncounter.litCampfire).toBe(true);
    expect(controls.storyState.flags.charmanderCampfireLit).toBe(true);
    expect(controls.storyState.flags.charmanderFollowing).toBe(false);
    expect(controls.onCharmanderCampfireLit).toHaveBeenCalledTimes(1);
  });

  it("moves following Timburr toward the player when revealed and idle", () => {
    const {
      companionFollowMovementRuntime,
      runtime,
      session
    } = createRuntime({
      flags: {
        timburrRevealed: true,
        timburrFollowing: true
      }
    });

    runtime.updateTimburr(0.125, { activeMoveId: "buildBlock" });

    expect(session.timburrEncounter.visible).toBe(true);
    expect(companionFollowMovementRuntime.moveFormationMemberTowardPlayer).toHaveBeenCalledWith(
      session.timburrEncounter,
      {
        companionId: "timburr",
        activeMoveId: "buildBlock",
        deltaTime: 0.125,
        speed: 3,
        defaultDistance: 1.5,
        modelFaceYawOffset: 0.25
      }
    );
  });
});
