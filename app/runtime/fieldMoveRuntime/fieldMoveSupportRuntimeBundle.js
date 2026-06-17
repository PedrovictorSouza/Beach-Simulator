import { createFieldMoveInvalidTargetPromptRuntime } from "../fieldMoveInvalidTargetPromptRuntime.js";
import { createFieldMoveActorPositionRuntime } from "./fieldMoveActorPositions.js";
import { createFieldMoveApproachPositionRuntime } from "./fieldMoveApproachPositions.js";

const DEFAULT_LEAFAGE_INVALID_TARGET_PROMPT_DURATION_MS = 1600;
const DEFAULT_FIRE_INVALID_TARGET_PROMPT_DURATION_MS = 1600;

export function createFieldMoveSupportRuntimeBundle({
  session = {},
  companionFacingRuntime = null,
  companionConstructionBlockerRuntime = null,
  config = {}
} = {}) {
  const fieldMoveInvalidTargetPromptRuntime = createFieldMoveInvalidTargetPromptRuntime({
    leafageDurationMs:
      config.leafageInvalidTargetPromptDurationMs ??
      DEFAULT_LEAFAGE_INVALID_TARGET_PROMPT_DURATION_MS,
    fireDurationMs:
      config.fireInvalidTargetPromptDurationMs ??
      DEFAULT_FIRE_INVALID_TARGET_PROMPT_DURATION_MS
  });
  const fieldMoveActorPositionRuntime = createFieldMoveActorPositionRuntime({
    getSquirtle: () => session.actTwoSquirtle,
    getCharmander: () => session.charmanderEncounter,
    getBulbasaur: () => session.bulbasaurEncounter,
    getSquirtleYaw: companionFacingRuntime?.getSquirtleLogicalFacingYaw,
    getCharmanderYaw: companionFacingRuntime?.getCharmanderLogicalFacingYaw,
    getBulbasaurYaw: companionFacingRuntime?.getBulbasaurLogicalFacingYaw
  });
  const fieldMoveApproachPositionRuntime = createFieldMoveApproachPositionRuntime({
    getSquirtlePosition: () =>
      session.actTwoSquirtle?.position ||
      session.actTwoSquirtle?.modelInstance?.offset,
    getBulbasaurPosition: () =>
      session.bulbasaurEncounter?.position ||
      session.bulbasaurEncounter?.modelInstance?.offset,
    getCharmanderPosition: () =>
      session.charmanderEncounter?.position ||
      session.charmanderEncounter?.modelInstance?.offset,
    getTimburrPosition: () => session.timburrEncounter?.position,
    isBuildBlockApproachBlocked: companionConstructionBlockerRuntime?.isBlocked
  });

  return {
    fieldMoveActorPositionRuntime,
    fieldMoveApproachPositionRuntime,
    fieldMoveInvalidTargetPromptRuntime
  };
}
