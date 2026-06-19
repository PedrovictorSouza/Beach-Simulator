import { createPlayerGameplayActionRuntimeBundle } from "../player/playerActionRuntimeBundle.js";
import { findNearbyDestroyableInstantiatedObject } from "../../world/islandWorld.js";
import {
  findAlreadyResolvedFieldMoveGroundCell
} from "./fieldMoveRuntime/fieldMoveGroundTargets.js";
import {
  SQUIRTLE_WATER_GUN_SPRAY_DURATION
} from "./fieldMoveRuntime/fieldMoveTuning.js";
import { resolveGameplayActionPermission } from "./gameLoopFramePolicies.js";
import {
  getFreeBlockInvalidPlacementNotice
} from "./construction/placementPreviewPrompts.js";
import { SOUND_EVENT_IDS } from "./soundEventRuntime.js";
import { SANDBOTS_BOT_NAMES } from "../story/sandbotsLexicon.js";

const LEAF_DEN_BUSY_NOTICE = "im busy, boss...";

export function createGameLoopPlayerActionRuntimeBundle({
  controls,
  session,
  gameplay,
  hud,
  runtimes = {},
  callbacks = {},
  config = {},
  createRuntime = createPlayerGameplayActionRuntimeBundle
} = {}) {
  const {
    debugInteractionFlow,
    getNowMs,
    getNowSeconds,
    isBusyCompanionTarget,
    onNpcInteractionStart,
    playSoundEvent,
    playTreeBirthSfx,
    queueChangedSupplyPickupFlyItems,
    queueLandscapeCutEffect,
    queueTreeRevivalLeafBurst
  } = callbacks;

  return createRuntime({
    controls,
    session,
    gameplay,
    hud,
    runtimes,
    callbacks: {
      debugInteractionFlow,
      findAlreadyResolvedFieldMoveGroundCell,
      findNearbyDestroyableInstantiatedObject,
      getFreeBlockInvalidPlacementNotice,
      getNowMs,
      getNowSeconds,
      isBusyCompanionTarget,
      onNpcInteractionStart,
      playSoundEvent,
      playTreeBirthSfx,
      queueChangedSupplyPickupFlyItems,
      queueLandscapeCutEffect,
      queueTreeRevivalLeafBurst,
      resolveGameplayActionPermission
    },
    soundEventIds: SOUND_EVENT_IDS,
    botNames: SANDBOTS_BOT_NAMES,
    config: {
      leafDenBusyNotice: LEAF_DEN_BUSY_NOTICE,
      restoredGrassMissionTargetCount: config.restoredGrassMissionTargetCount,
      waterGunFirstUsePromptFlag: config.waterGunFirstUsePromptFlag,
      waterGunSprayDuration: SQUIRTLE_WATER_GUN_SPRAY_DURATION
    }
  });
}
