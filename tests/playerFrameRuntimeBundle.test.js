import { describe, expect, it, vi } from "vitest";
import {
  createGameplayPlayerFrameRuntimeBundle,
  createPlayerFrameRuntimeBundle
} from "../app/player/playerFrameRuntimeBundle.js";
import { COLONY_FEEDBACK_IDS } from "../app/gameplay/colonyFeedbackContracts.js";
import { SANDBOTS_BOT_NAMES, SANDBOTS_ITEM_NAMES } from "../app/story/sandbotsLexicon.js";
import {
  CARBON_ITEM_ID,
  GEAR_ITEM_ID,
  LEAVES_ITEM_ID,
  LEPPA_BERRY_ITEM_ID
} from "../gameplayContent.js";

describe("createPlayerFrameRuntimeBundle", () => {
  it("provides gameplay player frame defaults from the player domain", () => {
    const expectedBundle = {
      playerModelRuntime: {},
      playerMovementFrameRuntime: {},
      playerResourceCollectionFrameRuntime: {}
    };
    const createRuntimeBundle = vi.fn(() => expectedBundle);
    const options = {
      audio: {},
      callbacks: {},
      controls: {},
      gameplay: {},
      hud: {},
      math: {},
      policies: {},
      runtimes: {},
      session: {}
    };

    const result = createGameplayPlayerFrameRuntimeBundle({
      ...options,
      soundEventIds: {
        GAMEPLAY_JUMP: "gameplay.jump"
      },
      createRuntimeBundle
    });

    expect(result).toBe(expectedBundle);
    expect(createRuntimeBundle).toHaveBeenCalledWith({
      ...options,
      config: {
        botNames: SANDBOTS_BOT_NAMES,
        colonyFeedbackIds: {
          habitatCheckComplete: COLONY_FEEDBACK_IDS.HABITAT_CHECK_COMPLETE
        },
        itemIds: {
          wood: "wood",
          leaves: LEAVES_ITEM_ID,
          gear: GEAR_ITEM_ID,
          carbon: CARBON_ITEM_ID,
          leppaBerry: LEPPA_BERRY_ITEM_ID
        },
        labels: {
          leaves: "Leaves",
          gear: "Gear",
          carbon: "Carbon",
          leppaBerry: SANDBOTS_ITEM_NAMES.pulseBerry
        },
        movementQuestId: "learn-to-move",
        soundEventIds: {
          gameplayJump: "gameplay.jump"
        }
      }
    });
  });

  it("wires player model, movement and resource collection runtimes", () => {
    const playerModelRuntime = { sync: vi.fn(), startJumpFlip: vi.fn() };
    const playerMovementFrameRuntime = { update: vi.fn() };
    const playerResourceCollectionFrameRuntime = { update: vi.fn() };
    const createModelRuntime = vi.fn((options) => {
      options.playJumpSound();
      return playerModelRuntime;
    });
    const createMovementRuntime = vi.fn(() => playerMovementFrameRuntime);
    const createResourceCollectionRuntime = vi.fn(() => playerResourceCollectionFrameRuntime);
    const playSoundEvent = vi.fn();
    const restoreActiveZoomPresetOnMovement = vi.fn();
    const recordQuestEvent = vi.fn();
    const pushNotice = vi.fn();
    const triggerSupplyCounterPrompt = vi.fn();
    const triggerWoodCollectPop = vi.fn();
    const playWoodGrab = vi.fn();
    const syncInventoryUi = vi.fn();
    const queueSupplyPickupFlyItems = vi.fn();
    const pushSupplyResourceCollectFeedback = vi.fn();
    const triggerGearPickupParticles = vi.fn();
    const getColonyFeedbackNotice = vi.fn(() => "Habitat checked.");
    const controls = {
      inventory: { wood: 1 },
      isRunActive: vi.fn(() => false),
      storyState: { flags: {} }
    };
    const gameplay = {
      getActiveSystemQuest: vi.fn(() => ({ id: "learn-to-move" })),
      recordQuestEvent
    };
    const session = { playerCharacter: { id: "player" } };
    const camera = { id: "camera" };
    const cameraOrbit = { id: "cameraOrbit" };
    const cameraZoomPresetController = { id: "cameraZoomPresetController" };

    const result = createPlayerFrameRuntimeBundle({
      audio: { playWoodGrab },
      camera,
      cameraOrbit,
      cameraZoomPresetController,
      controls,
      createModelRuntime,
      createMovementRuntime,
      createResourceCollectionRuntime,
      gameplay,
      hud: { pushNotice, syncInventoryUi },
      policies: {
        resolvePlayerMovementPermission: vi.fn()
      },
      runtimes: {
        companionFollowDirectionRuntime: { id: "followDirection" },
        gearPickupParticleRuntime: { trigger: triggerGearPickupParticles },
        movementQuestRuntime: { id: "movementQuest" },
        runBreadcrumbPromptRuntime: { id: "runBreadcrumbPrompt" },
        woodCollectPopRuntime: { trigger: triggerWoodCollectPop }
      },
      callbacks: {
        getColonyFeedbackNotice,
        playSoundEvent,
        pushSupplyResourceCollectFeedback,
        queueSupplyPickupFlyItems,
        restoreActiveZoomPresetOnMovement,
        triggerSupplyCounterPrompt
      },
      config: {
        botNames: { grow: "Grow Bot" },
        colonyFeedbackIds: { habitatCheckComplete: "habitat-check-complete" },
        itemIds: {
          carbon: "carbon",
          gear: "gear",
          leaves: "leaves",
          leppaBerry: "pulseBerry",
          wood: "wood"
        },
        labels: {
          carbon: "Carbon",
          gear: "Gear",
          leaves: "Leaves",
          leppaBerry: "Pulse Berry"
        },
        movementQuestId: "learn-to-move",
        soundEventIds: {
          gameplayJump: "jump"
        }
      },
      math: {
        moveValueToward: vi.fn(),
        rotateAngleToward: vi.fn()
      },
      session
    });

    expect(result).toEqual({
      playerModelRuntime,
      playerMovementFrameRuntime,
      playerResourceCollectionFrameRuntime
    });
    expect(playSoundEvent).toHaveBeenCalledWith("jump");

    const movementOptions = createMovementRuntime.mock.calls[0][0];
    expect(movementOptions.session).toBe(session);
    expect(movementOptions.model).toBe(playerModelRuntime);
    expect(movementOptions.followDirection).toEqual({ id: "followDirection" });
    expect(movementOptions.movementQuest).toEqual({ id: "movementQuest" });
    expect(movementOptions.runBreadcrumbPrompt).toEqual({ id: "runBreadcrumbPrompt" });
    expect(movementOptions.callbacks.isMovementQuestActive()).toBe(true);
    expect(movementOptions.callbacks.isRunActive()).toBe(false);

    movementOptions.callbacks.reportMovement();
    expect(recordQuestEvent).toHaveBeenCalledWith({
      type: "MOVE",
      targetId: "player"
    });

    movementOptions.callbacks.onPlayerMoved({
      movedDistance: 0.001,
      nextPlayerPosition: [1, 0, 2],
      gameplayOpeningCameraLocked: false,
      foundationBuildZoneCameraFocusActive: false,
      tutorialActive: false
    });
    expect(restoreActiveZoomPresetOnMovement).toHaveBeenCalledWith({
      playerPosition: [1, 0, 2],
      camera,
      cameraOrbit,
      cameraZoomPresetController
    });

    const resourceOptions = createResourceCollectionRuntime.mock.calls[0][0];
    expect(resourceOptions.itemIds).toEqual({
      carbon: "carbon",
      gear: "gear",
      leaves: "leaves",
      leppaBerry: "pulseBerry",
      wood: "wood"
    });
    resourceOptions.feedback.triggerWoodCollectPop([{ id: "wood-a" }]);
    resourceOptions.feedback.playWoodGrab({ active: true });
    resourceOptions.feedback.syncInventoryUi(controls.inventory);
    resourceOptions.feedback.queueSupplyPickupFlyItems("wood", [[0, 0, 0]]);
    resourceOptions.feedback.pushNotice("+1 Wood");
    resourceOptions.feedback.triggerSupplyCounterPrompt("wood", controls.inventory, 1200);
    resourceOptions.feedback.pushSupplyResourceCollectFeedback({ itemId: "gear" });
    resourceOptions.feedback.triggerGearPickupParticles([[1, 0, 1]]);
    expect(resourceOptions.feedback.getHabitatCheckCompleteNotice()).toBe("Habitat checked.");

    expect(triggerWoodCollectPop).toHaveBeenCalledWith([{ id: "wood-a" }]);
    expect(playWoodGrab).toHaveBeenCalledWith({ active: true });
    expect(syncInventoryUi).toHaveBeenCalledWith(controls.inventory);
    expect(queueSupplyPickupFlyItems).toHaveBeenCalledWith("wood", [[0, 0, 0]]);
    expect(pushNotice).toHaveBeenCalledWith("+1 Wood");
    expect(triggerSupplyCounterPrompt).toHaveBeenCalledWith("wood", controls.inventory, 1200);
    expect(pushSupplyResourceCollectFeedback).toHaveBeenCalledWith({ itemId: "gear" });
    expect(triggerGearPickupParticles).toHaveBeenCalledWith([[1, 0, 1]]);
    expect(getColonyFeedbackNotice).toHaveBeenCalledWith("habitat-check-complete", {
      growBotName: "Grow Bot"
    });
  });
});
