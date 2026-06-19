import {
  createConstructionPresentationRuntimeBundle
} from "./construction/constructionPresentationRuntimeBundle.js";
import {
  applyPlayerPlacementSpawnToModelInstance
} from "./construction/playerPlacementSpawnEffect.js";
import { getYawToward } from "./modelFacing.js";
import { createNpcConversationFocusRuntime } from "./npcs/npcConversationFocusRuntime.js";
import { isWorldPositionWithinRenderDistance } from "./presentation/renderDistance.js";
import { applyTrainHouseDance } from "./trainHouseDance.js";

export function createGameLoopScenePresentationRuntimeBundle({
  companionFacingRuntime,
  controls,
  dialogueCamera,
  gameplayDialogue,
  session,
  workbenchRotationRuntime,
  callbacks = {},
  createConstructionPresentationRuntime = createConstructionPresentationRuntimeBundle,
  createNpcFocusRuntime = createNpcConversationFocusRuntime
} = {}) {
  const {
    getNowMs,
    getNowSeconds
  } = callbacks;

  const constructionPresentationRuntimeBundle =
    createConstructionPresentationRuntime({
      controls,
      session,
      workbenchRotationRuntime,
      callbacks: {
        applyTrainHouseDance,
        applyPlacementSpawn: applyPlayerPlacementSpawnToModelInstance,
        getRobotModelYawToward: companionFacingRuntime.getRobotModelYawToward,
        isWorldPositionWithinRenderDistance
      },
      getNowMs,
      getNowSeconds
    });

  const npcConversationFocusRuntime = createNpcFocusRuntime({
    controls,
    dialogueCamera,
    gameplayDialogue,
    getSquirtle: () => session.actTwoSquirtle,
    getSquirtleModelYawToward: companionFacingRuntime.getSquirtleModelYawToward,
    getYawToward
  });

  return {
    ...constructionPresentationRuntimeBundle,
    npcConversationFocusRuntime
  };
}
