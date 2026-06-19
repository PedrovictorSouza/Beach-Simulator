import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopWorldSpacePresentationFrameRuntime
} from "../app/runtime/gameLoopWorldSpacePresentation.js";
import { SOUND_EVENT_IDS } from "../app/runtime/soundEventRuntime.js";

describe("createGameLoopWorldSpacePresentationFrameRuntime", () => {
  it("builds the game-loop world-space presentation boundary", () => {
    const createdRuntime = { update: vi.fn() };
    const createRuntime = vi.fn(() => createdRuntime);
    const controls = { storyState: { flags: {} } };
    const session = { id: "session" };
    const gameplay = { id: "gameplay" };
    const playSoundEvent = vi.fn();
    const getEncounterRepairBoxPosition = vi.fn();
    const getLeppaTreeSurroundingGroundCells = vi.fn();
    const worldSceneSyncRuntime = {
      isPlayerNearWorldPosition: vi.fn()
    };
    const fieldMoveActorPositionRuntime = {
      getSquirtleWorldPosition: vi.fn()
    };
    const companionAbilityResourcesRuntime = {
      isSquirtleWaterCharging: vi.fn(() => true)
    };
    const constructionPlacementControlRuntime = {
      getFreeBlockBuildCostMarker: vi.fn(() => "cost")
    };
    const companionWorldSpeechCueRuntime = {
      getChopperAttentionCue: vi.fn(() => "cue"),
      getCompanionLostHint: vi.fn(() => "lost"),
      consumeChopperAttentionCueSoundCycle: vi.fn(() => true)
    };
    const fieldMoveInvalidTargetPromptRuntime = {
      isLeafageVisible: vi.fn(() => true),
      isFireVisible: vi.fn(() => false)
    };
    const runBreadcrumbPromptRuntime = {
      isVisible: vi.fn(() => true)
    };

    const runtime = createGameLoopWorldSpacePresentationFrameRuntime({
      controls,
      session,
      gameplay,
      createRuntime,
      runtimes: {
        companionAbilityResourcesRuntime,
        companionWorldSpeechCueRuntime,
        constructionPlacementControlRuntime,
        fieldMoveActorPositionRuntime,
        fieldMoveInvalidTargetPromptRuntime,
        runBreadcrumbPromptRuntime,
        worldSceneSyncRuntime
      },
      callbacks: {
        getEncounterRepairBoxPosition,
        getLeppaTreeSurroundingGroundCells,
        playSoundEvent
      },
      config: {
        restoredGrassMissionTargetCount: 3,
        waterGunFirstUsePromptFlag: "waterFlag"
      }
    });

    expect(runtime).toBe(createdRuntime);
    expect(createRuntime).toHaveBeenCalledWith(expect.objectContaining({
      controls,
      session,
      gameplay,
      repairBoxPromptDistance: 2.8,
      restoredGrassMissionTargetCount: 3,
      waterGunFirstUsePromptFlag: "waterFlag",
      isPlayerNearWorldPosition: worldSceneSyncRuntime.isPlayerNearWorldPosition,
      getEncounterRepairBoxPosition,
      getLeppaTreeSurroundingGroundCells,
      getSquirtleWorldPosition: fieldMoveActorPositionRuntime.getSquirtleWorldPosition
    }));

    const options = createRuntime.mock.calls[0][0];
    expect(options.isSquirtleWaterCharging()).toBe(true);
    expect(options.getFreeBlockBuildCostMarker("cell")).toBe("cost");
    expect(options.getPeriodicChopperAttentionCue("now")).toBe("cue");
    expect(options.isLeafageInvalidTargetVisible(10)).toBe(true);
    expect(options.isFireInvalidTargetVisible(10)).toBe(false);
    expect(options.isRunBreadcrumbVisible(10)).toBe(true);
    expect(options.getCompanionLostHint("now")).toBe("lost");
    expect(options.consumeChopperAttentionCueSoundCycle("now")).toBe(true);

    options.playChopperVoice();
    expect(playSoundEvent).toHaveBeenCalledWith(SOUND_EVENT_IDS.CHOPPER_VOICE);
  });
});
