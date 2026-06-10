import { describe, expect, it, vi } from "vitest";

import {
  resolveFrameHudPromptCopy,
  resolveHudPromptCopy
} from "../app/runtime/presentation/hudPromptCopy.js";

describe("HUD prompt copy", () => {
  it("hides prompt copy while blocking modes are active", () => {
    const buildNearbyPrompt = vi.fn(() => "nearby prompt");

    expect(resolveHudPromptCopy({
      blockedByMode: {
        cinematicActive: true
      },
      placementPrompts: {
        solarStationPlacementPrompt: "place solar"
      },
      buildNearbyPrompt
    })).toBe("");
    expect(buildNearbyPrompt).not.toHaveBeenCalled();
  });

  it("uses the existing prompt priority before falling back to nearby prompts", () => {
    expect(resolveHudPromptCopy({
      placementPrompts: {
        solarStationPlacementPrompt: "",
        greenhousePlacementPrompt: "greenhouse prompt",
        campfirePlacementPrompt: "campfire prompt",
        leafDenKitPlacementPrompt: "house prompt"
      },
      pendingPlacementPrompt: "pending placement",
      workbenchRotationPrompt: "rotate",
      destroyableObjectPrompt: {
        promptCopy: "destroy"
      },
      buildNearbyPrompt: () => "nearby prompt"
    })).toBe("greenhouse prompt");

    expect(resolveHudPromptCopy({
      placementPrompts: {},
      pendingPlacementPrompt: "pending placement",
      workbenchRotationPrompt: "rotate",
      destroyableObjectPrompt: {
        promptCopy: "destroy"
      },
      buildNearbyPrompt: () => "nearby prompt"
    })).toBe("pending placement");

    expect(resolveHudPromptCopy({
      placementPrompts: {},
      workbenchRotationPrompt: "rotate",
      destroyableObjectPrompt: {
        promptCopy: "destroy"
      },
      buildNearbyPrompt: () => "nearby prompt"
    })).toBe("rotate");

    expect(resolveHudPromptCopy({
      placementPrompts: {},
      destroyableObjectPrompt: {
        promptCopy: "destroy"
      },
      buildNearbyPrompt: () => "nearby prompt"
    })).toBe("destroy");
  });

  it("passes the same context to the nearby prompt builder", () => {
    const buildNearbyPrompt = vi.fn(() => "nearby prompt");
    const harvestTarget = { id: "wood" };
    const interactTarget = { id: "workbench" };
    const quest = { id: "quest" };
    const storyState = { flags: { introComplete: true } };
    const getItemLabel = vi.fn();

    expect(resolveHudPromptCopy({
      placementPrompts: {},
      nearbyHarvestTarget: harvestTarget,
      nearbyInteractable: interactTarget,
      activeQuest: quest,
      transientNoticeRoute: {
        hudMessage: "notice"
      },
      activeMoveId: "waterGun",
      pendingWaterGunGroundCells: [{ id: "a" }, { id: "b" }],
      storyState,
      getItemLabel,
      buildNearbyPrompt
    })).toBe("nearby prompt");

    expect(buildNearbyPrompt).toHaveBeenCalledWith({
      harvestTarget,
      interactTarget,
      quest,
      transientMessage: "notice",
      getItemLabel,
      storyState,
      activeMoveId: "waterGun",
      pendingWaterGunCount: 2
    });
  });

  it("emits the same debug payload shape when a debug callback is supplied", () => {
    const debug = vi.fn();

    resolveHudPromptCopy({
      placementPrompts: {
        solarStationPlacementPrompt: "place solar"
      },
      pendingPlacementPrompt: "pending",
      workbenchRotationPrompt: "rotate",
      destroyableObjectPrompt: {
        promptCopy: "destroy"
      },
      blockedByMode: {
        tutorialActive: false
      },
      buildNearbyPrompt: () => "nearby",
      debug
    });

    expect(debug).toHaveBeenCalledWith("gameLoop.promptCopy.resolved", {
      promptCopy: "place solar",
      destroyableObjectPrompt: "destroy",
      sources: {
        solarStationPlacementPrompt: "place solar",
        pendingPlacementPrompt: "pending",
        workbenchRotationPrompt: "rotate"
      },
      blockedByMode: {
        tutorialActive: false
      }
    });
  });

  it("builds the frame-level blocked mode payload before resolving copy", () => {
    const buildNearbyPrompt = vi.fn(() => "nearby prompt");
    const debug = vi.fn();
    const storyState = { flags: { introComplete: true } };
    const getItemLabel = vi.fn();

    expect(resolveFrameHudPromptCopy({
      gameplayOpeningMovementLocked: false,
      cinematicActive: false,
      tutorialActive: false,
      skillLearnActive: false,
      scriptedInteractionActive: false,
      placementPrompts: {},
      pendingPlacementPrompt: "",
      workbenchRotationPrompt: "",
      destroyableObjectPrompt: null,
      nearbyHarvestTarget: { id: "wood" },
      nearbyInteractable: { id: "bench" },
      activeQuest: { id: "quest" },
      transientNoticeRoute: { hudMessage: "notice" },
      activeMoveId: "waterGun",
      pendingWaterGunGroundCells: [{ id: "a" }],
      storyState,
      getItemLabel,
      buildNearbyPrompt,
      debug
    })).toBe("nearby prompt");

    expect(buildNearbyPrompt).toHaveBeenCalledWith({
      harvestTarget: { id: "wood" },
      interactTarget: { id: "bench" },
      quest: { id: "quest" },
      transientMessage: "notice",
      getItemLabel,
      storyState,
      activeMoveId: "waterGun",
      pendingWaterGunCount: 1
    });
    expect(debug).toHaveBeenCalledWith("gameLoop.promptCopy.resolved", expect.objectContaining({
      blockedByMode: {
        gameplayOpeningMovementLocked: false,
        cinematicActive: false,
        tutorialActive: false,
        skillLearnActive: false,
        scriptedInteractionActive: false
      },
      promptCopy: "nearby prompt"
    }));
  });

  it("hides frame-level prompt copy when movement is blocked by opening", () => {
    const buildNearbyPrompt = vi.fn(() => "nearby prompt");

    expect(resolveFrameHudPromptCopy({
      gameplayOpeningMovementLocked: true,
      cinematicActive: false,
      tutorialActive: false,
      skillLearnActive: false,
      scriptedInteractionActive: false,
      placementPrompts: {
        solarStationPlacementPrompt: "place solar"
      },
      buildNearbyPrompt
    })).toBe("");
    expect(buildNearbyPrompt).not.toHaveBeenCalled();
  });
});
