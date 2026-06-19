import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopConstructionBuildRuntimeBundle
} from "../app/runtime/gameLoopConstructionBuild.js";
import { SOUND_EVENT_IDS } from "../app/runtime/soundEventRuntime.js";

describe("createGameLoopConstructionBuildRuntimeBundle", () => {
  it("builds ground feedback and construction build runtimes for the game loop", () => {
    const groundActionFeedbackRuntime = { id: "ground-feedback" };
    const createGroundActionFeedbackRuntime = vi.fn(() => groundActionFeedbackRuntime);
    const constructionBundle = {
      foundationBuildZoneCameraFocusRuntime: { id: "focus" },
      foundationBuildZoneRuntime: { id: "foundation" },
      freeBlockBuildRuntime: { id: "free-block" }
    };
    const createRuntime = vi.fn(() => constructionBundle);
    const audio = {
      playFieldMoveInvalid: vi.fn()
    };
    const hud = {
      pushNotice: vi.fn()
    };
    const playSoundEvent = vi.fn();
    const playInstanceObjectSfx = vi.fn();
    const createFoundationBuildZoneCameraFocusRuntime = vi.fn();
    const getTerrainColliders = vi.fn(() => []);
    const runtimes = {
      companionConstructionBlockerRuntime: { id: "companion-blocker" },
      freeBlockBuildSessionRuntime: { id: "session-build" },
      playerModelRuntime: { id: "player-model" },
      worldObjectPlacementBlockerRuntime: { id: "world-blocker" }
    };

    const bundle = createGameLoopConstructionBuildRuntimeBundle({
      audio,
      clamp01: (value) => value,
      controls: { id: "controls" },
      hud,
      rendering: { id: "rendering" },
      session: { id: "session" },
      runtimes,
      callbacks: {
        createFoundationBuildZoneCameraFocusRuntime,
        getTerrainColliders,
        playInstanceObjectSfx,
        playSoundEvent
      },
      createGroundActionFeedbackRuntime,
      createRuntime
    });

    expect(bundle).toEqual({
      groundActionFeedbackRuntime,
      ...constructionBundle
    });
    expect(createGroundActionFeedbackRuntime).toHaveBeenCalledWith({
      clamp01: expect.any(Function),
      playInvalidSfx: expect.any(Function)
    });
    createGroundActionFeedbackRuntime.mock.calls[0][0].playInvalidSfx();
    expect(audio.playFieldMoveInvalid).toHaveBeenCalledOnce();

    const options = createRuntime.mock.calls[0][0];
    expect(options.runtimes).toEqual({
      ...runtimes,
      groundActionFeedbackRuntime
    });
    expect(options.callbacks.createFoundationBuildZoneCameraFocusRuntime)
      .toBe(createFoundationBuildZoneCameraFocusRuntime);
    expect(options.callbacks.getTerrainColliders).toBe(getTerrainColliders);
    expect(options.callbacks.getActorPosition).toEqual(expect.any(Function));
    expect(options.callbacks.isPositionInsideCollider).toEqual(expect.any(Function));
    expect(options.callbacks.resolvePreviewValidity).toEqual(expect.any(Function));
    expect(options.callbacks.resolveDisplacementPosition).toEqual(expect.any(Function));
    options.callbacks.playPlacedSound();
    options.callbacks.playInvalidSound();
    options.callbacks.playImpactSound();
    options.callbacks.pushNotice("Blocked");

    expect(playInstanceObjectSfx).toHaveBeenCalledOnce();
    expect(playSoundEvent).toHaveBeenCalledWith(SOUND_EVENT_IDS.UI_CANCEL);
    expect(playSoundEvent).toHaveBeenCalledWith(SOUND_EVENT_IDS.GAMEPLAY_IMPACT);
    expect(hud.pushNotice).toHaveBeenCalledWith("Blocked");
    expect(options.config.wallBlockType).toBe("wall");
  });
});
