import { describe, expect, it } from "vitest";
import { resolveInitialSceneIdForApplicationBoot } from "../app/bootstrap/createApplicationRuntime.js";
import { DEV_SCENE } from "../app/runtime/runtimeFlags.js";
import { GAME_FLOW } from "../gameFlow.js";

describe("application boot scene", () => {
  it("keeps the default load on the start screen even when a manual save exists", () => {
    expect(resolveInitialSceneIdForApplicationBoot({
      launchInitialGameFlow: GAME_FLOW.START,
      manualSavePoint: {
        playerPosition: [1, 0, 2]
      },
      runtimeFlags: {}
    })).toBe(GAME_FLOW.START);
  });

  it("still allows explicit gameplay boot to resume directly into gameplay", () => {
    expect(resolveInitialSceneIdForApplicationBoot({
      launchInitialGameFlow: GAME_FLOW.GAMEPLAY,
      manualSavePoint: {
        playerPosition: [1, 0, 2]
      },
      runtimeFlags: {}
    })).toBe(GAME_FLOW.GAMEPLAY);
  });

  it("keeps direct scene overrides explicit", () => {
    expect(resolveInitialSceneIdForApplicationBoot({
      devSceneOverride: DEV_SCENE.GAMEPLAY,
      launchInitialGameFlow: GAME_FLOW.START,
      runtimeFlags: {}
    })).toBe(GAME_FLOW.GAMEPLAY);

    expect(resolveInitialSceneIdForApplicationBoot({
      devSceneOverride: DEV_SCENE.INTRO,
      launchInitialGameFlow: GAME_FLOW.START,
      runtimeFlags: {}
    })).toBe(GAME_FLOW.INTRO);
  });
});
