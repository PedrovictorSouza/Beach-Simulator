import { describe, expect, it, vi } from "vitest";

import { resolveHudPromptCopy } from "../app/runtime/presentation/hudPromptCopy.js";

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
});
