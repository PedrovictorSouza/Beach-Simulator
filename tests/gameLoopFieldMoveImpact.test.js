import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopFieldMoveImpactRuntime
} from "../app/runtime/gameLoopFieldMoveImpact.js";

describe("createGameLoopFieldMoveImpactRuntime", () => {
  it("wires field move impact dependencies for the game loop", () => {
    const fieldMoveImpactRuntime = { id: "impact" };
    const createRuntime = vi.fn(() => fieldMoveImpactRuntime);
    const playerActionRuntime = {
      performHarvest: vi.fn(() => true)
    };
    const getNowMs = vi.fn(() => 1000);
    const playInstanceObjectSfx = vi.fn();
    const runtimes = {
      companionAbilityResourcesRuntime: { id: "resources" },
      groundActionFeedbackRuntime: { id: "ground-feedback" },
      playerActionRuntime,
      supplyCounterPromptController: { id: "counter" }
    };

    const result = createGameLoopFieldMoveImpactRuntime({
      controls: { id: "controls" },
      hud: { id: "hud" },
      session: { id: "session" },
      runtimes,
      callbacks: {
        getNowMs,
        playInstanceObjectSfx
      },
      createRuntime
    });

    expect(result).toBe(fieldMoveImpactRuntime);
    expect(createRuntime).toHaveBeenCalledWith({
      session: { id: "session" },
      controls: { id: "controls" },
      carbonItemId: "carbon",
      companionAbilityResourcesRuntime: runtimes.companionAbilityResourcesRuntime,
      getNowMs,
      groundActionFeedbackRuntime: runtimes.groundActionFeedbackRuntime,
      hud: { id: "hud" },
      performGameplayHarvestAction: expect.any(Function),
      playInstanceObjectSfx,
      supplyCounterPromptController: runtimes.supplyCounterPromptController
    });

    expect(createRuntime.mock.calls[0][0].performGameplayHarvestAction("target"))
      .toBe(true);
    expect(playerActionRuntime.performHarvest).toHaveBeenCalledWith("target");
  });
});
