import { FREE_BLOCK_TYPES } from "../gameplay/freeBlockBuildSystem.js";
import { isPositionInsideTerrainColliderFootprint } from "../gameplay/placementBlockers.js";
import { createConstructionBuildRuntimeBundle } from "./construction/constructionBuildRuntimeBundle.js";
import { createGameplayGroundActionFeedbackRuntime } from "./groundActionFeedbackRuntime.js";
import { resolveConstructionDisplacementPosition } from "./fieldMoveRuntime/buildBlockRuntime.js";
import { getActorDebugPosition } from "./presentation/interactionDebugColliders.js";
import { resolveBuildBlockPreviewValidity } from "./buildBlockDebugOverlay.js";
import { SOUND_EVENT_IDS } from "./soundEventRuntime.js";

export function createGameLoopConstructionBuildRuntimeBundle({
  audio,
  clamp01,
  controls,
  hud,
  rendering,
  session,
  runtimes = {},
  callbacks = {},
  createGroundActionFeedbackRuntime = createGameplayGroundActionFeedbackRuntime,
  createRuntime = createConstructionBuildRuntimeBundle
} = {}) {
  const groundActionFeedbackRuntime = createGroundActionFeedbackRuntime({
    clamp01,
    playInvalidSfx: () => audio.playFieldMoveInvalid()
  });
  const {
    companionConstructionBlockerRuntime,
    freeBlockBuildSessionRuntime,
    playerModelRuntime,
    worldObjectPlacementBlockerRuntime
  } = runtimes;
  const {
    createFoundationBuildZoneCameraFocusRuntime,
    getTerrainColliders,
    playInstanceObjectSfx,
    playSoundEvent
  } = callbacks;
  const constructionBuildRuntimeBundle = createRuntime({
    controls,
    rendering,
    session,
    runtimes: {
      companionConstructionBlockerRuntime,
      freeBlockBuildSessionRuntime,
      groundActionFeedbackRuntime,
      playerModelRuntime,
      worldObjectPlacementBlockerRuntime
    },
    callbacks: {
      createFoundationBuildZoneCameraFocusRuntime,
      getTerrainColliders,
      getActorPosition: getActorDebugPosition,
      isPositionInsideCollider: isPositionInsideTerrainColliderFootprint,
      resolvePreviewValidity: resolveBuildBlockPreviewValidity,
      resolveDisplacementPosition: resolveConstructionDisplacementPosition,
      playPlacedSound: playInstanceObjectSfx,
      playInvalidSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL),
      playImpactSound: () => playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_IMPACT),
      pushNotice: (notice) => hud?.pushNotice?.(notice)
    },
    config: {
      wallBlockType: FREE_BLOCK_TYPES.WALL
    }
  });

  return {
    groundActionFeedbackRuntime,
    ...constructionBuildRuntimeBundle
  };
}
