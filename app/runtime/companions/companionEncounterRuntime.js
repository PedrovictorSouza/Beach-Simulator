import { shouldCompleteThermalCabinHomeBeat } from "../trainHouseDance.js";

export function createCompanionEncounterRuntime({
  session = {},
  controls = {},
  repairBoxRevealOpeningRuntime = null,
  bulbasaurWorkbenchGuideRuntime = null,
  companionModelSyncRuntime = null,
  companionIdleMotionRuntime = null,
  constructionHelperMotionRuntime = null,
  companionFollowMovementRuntime = null,
  callbacks = {},
  config = {}
} = {}) {
  const isLeafDenConstructionActive =
    callbacks.isLeafDenConstructionActive || (() => false);

  function updateBulbasaur(deltaTime) {
    const encounter = session.bulbasaurEncounter;

    if (
      repairBoxRevealOpeningRuntime?.update?.(deltaTime, encounter, {
        syncModelInstance: () => companionModelSyncRuntime?.syncBulbasaur?.()
      })
    ) {
      return;
    }

    if (
      controls.storyState?.flags?.bulbasaurRevealed &&
      encounter &&
      !encounter.visible &&
      Array.isArray(encounter.repairPosition)
    ) {
      repairBoxRevealOpeningRuntime?.revealAtRepairPosition?.(encounter);
      if (encounter.repairModuleInstance) {
        encounter.repairModuleInstance.active = false;
      }
    }

    if (bulbasaurWorkbenchGuideRuntime?.isActive?.()) {
      bulbasaurWorkbenchGuideRuntime.advance(deltaTime, encounter);
      companionModelSyncRuntime?.syncBulbasaur?.();
      return;
    }

    if (encounter) {
      encounter.workbenchGuideWaypointIndex = 0;
    }

    if (!encounter?.visible || !encounter.position) {
      companionModelSyncRuntime?.syncBulbasaur?.();
      return;
    }

    companionIdleMotionRuntime?.updateJumpArc?.(encounter, {
      deltaTime,
      modelFaceYawOffset: config.bulbasaurModelFaceYawOffset
    });
    companionModelSyncRuntime?.syncBulbasaur?.();
  }

  function updateCharmander(deltaTime, { activeMoveId = null } = {}) {
    const encounter = session.charmanderEncounter;

    if (
      repairBoxRevealOpeningRuntime?.update?.(deltaTime, encounter, {
        syncModelInstance: () => companionModelSyncRuntime?.syncCharmander?.()
      })
    ) {
      return;
    }

    if (!encounter || !controls.storyState?.flags?.charmanderRevealed) {
      return;
    }

    encounter.visible = true;

    if (!encounter.position) {
      encounter.position = session.playerCharacter?.getPosition?.() || [0, 0.02, 0];
    }

    if (isLeafDenConstructionActive()) {
      constructionHelperMotionRuntime?.moveToLeafDen?.(encounter, {
        offset: [-1.08, 0, 0.82],
        modelFaceYawOffset: config.charmanderModelFaceYawOffset
      });
      companionModelSyncRuntime?.syncCharmander?.();
      return;
    }

    if (
      controls.storyState.flags.charmanderFollowing &&
      session.playerCharacter &&
      !session.charmanderFireAction &&
      !isLeafDenConstructionActive()
    ) {
      companionFollowMovementRuntime?.moveFormationMemberTowardPlayer?.(encounter, {
        companionId: "charmander",
        activeMoveId,
        deltaTime,
        speed: config.charmanderFollowSpeed,
        defaultDistance: config.charmanderFollowDistance,
        modelFaceYawOffset: config.charmanderModelFaceYawOffset
      });
    } else if (!session.charmanderFireAction) {
      companionIdleMotionRuntime?.faceTowardPlayer?.(encounter, {
        modelFaceYawOffset: config.charmanderModelFaceYawOffset
      });
    }

    if (
      session.campfire?.position &&
      (
        controls.storyState.flags.charmanderFollowing ||
        controls.storyState.flags.charmanderRevealed
      ) &&
      !controls.storyState.flags.charmanderCampfireLit
    ) {
      if (shouldCompleteThermalCabinHomeBeat({
        thermalBotFollowing: controls.storyState.flags.charmanderFollowing,
        thermalBotRegistered: controls.storyState.flags.charmanderRevealed,
        thermalBotPosition: encounter.position,
        playerPosition: session.playerCharacter?.getPosition?.(),
        trainHousePosition: session.campfire.position,
        alreadyComplete: controls.storyState.flags.charmanderCampfireLit
      })) {
        encounter.litCampfire = true;
        controls.storyState.flags.charmanderCampfireLit = true;
        controls.storyState.flags.charmanderFollowing = false;
        controls.onCharmanderCampfireLit?.();
      }
    }

    companionModelSyncRuntime?.syncCharmander?.();
  }

  function updateTimburr(deltaTime, { activeMoveId = null } = {}) {
    const encounter = session.timburrEncounter;

    if (!encounter || !controls.storyState?.flags?.timburrRevealed) {
      return;
    }

    encounter.visible = true;

    if (!encounter.position) {
      encounter.position = session.playerCharacter?.getPosition?.() || [0, 0.02, 0];
    }

    if (isLeafDenConstructionActive()) {
      constructionHelperMotionRuntime?.moveToLeafDen?.(encounter, {
        offset: [1.04, 0, -0.76],
        modelFaceYawOffset: Number(
          encounter.modelFaceYawOffset ?? config.timburrModelFaceYawOffset
        )
      });
      return;
    }

    if (session.timburrBuildBlockAction) {
      return;
    }

    if (
      controls.storyState.flags.timburrFollowing &&
      session.playerCharacter &&
      !isLeafDenConstructionActive()
    ) {
      companionFollowMovementRuntime?.moveFormationMemberTowardPlayer?.(encounter, {
        companionId: "timburr",
        activeMoveId,
        deltaTime,
        speed: config.timburrFollowSpeed,
        defaultDistance: config.timburrFollowDistance,
        modelFaceYawOffset: Number(
          encounter.modelFaceYawOffset ?? config.timburrModelFaceYawOffset
        )
      });
    }
  }

  return {
    updateBulbasaur,
    updateCharmander,
    updateTimburr
  };
}
