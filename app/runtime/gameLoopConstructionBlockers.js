import {
  createGameplayConstructionBlockerRuntimeBundle
} from "./construction/constructionBlockerRuntimeBundle.js";
import {
  createGameplayConstructionTerrainColliderProvider
} from "./construction/constructionGameplayConfig.js";
import { SOUND_EVENT_IDS } from "./soundEventRuntime.js";
import { treeFootprint } from "../../world/islandWorld.js";

export function createGameLoopConstructionBlockerRuntimeBundle({
  controls,
  hud,
  session,
  callbacks = {},
  createTerrainColliderProvider = createGameplayConstructionTerrainColliderProvider,
  createRuntimeBundle = createGameplayConstructionBlockerRuntimeBundle
} = {}) {
  const {
    playSoundEvent = () => {}
  } = callbacks;

  const getPlayerConstructionTerrainColliders =
    createTerrainColliderProvider({
      session,
      getStoryState: () => controls.storyState
    });

  const constructionBlockerRuntimeBundle = createRuntimeBundle({
    controls,
    hud,
    session,
    treeFootprint,
    callbacks: {
      getTerrainColliders: getPlayerConstructionTerrainColliders,
      playBlockedSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL)
    }
  });

  return {
    getPlayerConstructionTerrainColliders,
    ...constructionBlockerRuntimeBundle
  };
}
