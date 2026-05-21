// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyActTwoTutorialCompletionResult,
  createSceneFlowRuntime
} from "../app/scene/createSceneFlowRuntime.js";
import { GAME_FLOW } from "../gameFlow.js";

describe("applyActTwoTutorialCompletionResult", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("reports confirmed player names after syncing tutorial memory", () => {
    const playerMemory = {};
    const onPlayerNameConfirmed = vi.fn();

    applyActTwoTutorialCompletionResult({
      humanClaim: "human",
      pokedexReaction: "really",
      pokedexChoice: "open",
      foundPokedex: true,
      trainerLookChoice: "ready",
      playerName: "Ada",
      nameConfirmation: "yes",
      worldQuestion: "where"
    }, {
      playerMemory,
      session: {},
      unlockPokedexUi: vi.fn(),
      pushNotice: vi.fn(),
      unlockPlayerSkill: vi.fn(),
      onPlayerNameConfirmed
    });

    expect(playerMemory).toMatchObject({
      humanClaim: "human",
      pokedexReaction: "really",
      pokedexChoice: "open",
      foundPokedex: true,
      trainerLookChoice: "ready",
      playerName: "Ada",
      nameConfirmation: "yes",
      worldQuestion: "where"
    });
    expect(onPlayerNameConfirmed).toHaveBeenCalledWith({
      playerName: "Ada",
      nameConfirmation: "yes"
    });
  });

  it("does not report player name confirmation when no name was confirmed", () => {
    const onPlayerNameConfirmed = vi.fn();

    applyActTwoTutorialCompletionResult({
      playerName: "",
      nameConfirmation: null
    }, {
      playerMemory: {},
      session: {},
      unlockPokedexUi: vi.fn(),
      pushNotice: vi.fn(),
      unlockPlayerSkill: vi.fn(),
      onPlayerNameConfirmed
    });

    expect(onPlayerNameConfirmed).not.toHaveBeenCalled();
  });

  it("starts gameplay opening from the start screen button", async () => {
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback) => {
        callback(performance.now());
        return 1;
      }
    });
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      transitionDuration: "0s",
      transitionDelay: "0s",
      animationName: "none",
      animationDuration: "0s",
      animationDelay: "0s"
    });

    const startOverlay = document.createElement("section");
    const sceneTransitionVeil = document.createElement("section");
    sceneTransitionVeil.hidden = true;
    const uiLayer = document.createElement("div");
    document.body.append(startOverlay, sceneTransitionVeil, uiLayer);

    const session = {};
    const onStartGame = vi.fn();
    const runtime = createSceneFlowRuntime({
      dom: {
        startOverlay,
        sceneTransitionVeil,
        introOverlay: document.createElement("section"),
        introRoomDebugRoot: document.createElement("section"),
        cinematicOverlay: document.createElement("section"),
        tutorialOverlay: document.createElement("section")
      },
      appRoot: document.createElement("div"),
      initialSceneId: GAME_FLOW.START,
      sceneWorkbench: null,
      uiLayer,
      gameplayUiVisibility: {
        hideAll: vi.fn(),
        showSections: vi.fn()
      },
      gameplayDialogue: {
        close: vi.fn()
      },
      camera: {},
      cameraOrbit: {},
      createLazyUiModule: () => ({
        preload: vi.fn(() => Promise.resolve(null)),
        invoke: vi.fn()
      }),
      getGameSession: () => session,
      playerMemory: {},
      pushNotice: vi.fn(),
      unlockPlayerSkill: vi.fn(),
      unlockPokedexUi: vi.fn(),
      setPokedexOverlayOpen: vi.fn(),
      onStartGame
    });

    runtime.startScreen.handleKeydown({
      code: "Enter",
      key: "Enter",
      preventDefault: vi.fn()
    });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(runtime.sceneDirector.is(GAME_FLOW.GAMEPLAY)).toBe(true);
    expect(onStartGame).toHaveBeenCalledWith(expect.objectContaining({
      action: "newGame",
      slotId: "slot-1"
    }));
    expect(session.gameplayOpeningRequested).toBe(true);
    expect(uiLayer.dataset.mode).toBe("game");
  });
});
