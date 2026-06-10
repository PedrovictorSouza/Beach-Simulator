import { describe, expect, it, vi } from "vitest";

import { resolveGameplayTargetFrameState } from "../app/runtime/presentation/gameplayTargetFrameState.js";

function createSession() {
  return {
    playerCharacter: {
      getPosition: vi.fn(() => [1, 0, 2])
    },
    palmModel: "palm-model",
    palmInstances: ["palm"],
    resourceNodes: ["resource"],
    leppaTree: "leppa-tree",
    leafDen: "leaf-den",
    groundDeadInstances: ["dead-ground"],
    iceGroundInstances: ["ice-ground"],
    groundPurifiedInstances: ["purified-ground"],
    groundGrassPatches: ["grass"],
    groundFlowerPatches: ["flower"],
    npcActors: ["npc"],
    interactables: ["interactable"],
    logChair: "log-chair",
    timburrEncounter: "timburr",
    charmanderEncounter: "charmander",
    bulbasaurEncounter: "bulbasaur"
  };
}

describe("gameplay target frame state", () => {
  it("resolves nearby targets, invalid field-move target and highlight state", () => {
    const session = createSession();
    const controls = {
      storyState: { flags: {} },
      inventory: { wood: 1 }
    };
    const invalidGroundCell = { id: "invalid-ground" };
    const nearbyInteractable = { target: { id: "bulbasaur" } };
    const gameplay = {
      findNearbyActionTarget: vi.fn()
        .mockReturnValueOnce({})
        .mockReturnValueOnce({ groundCell: invalidGroundCell }),
      findNearbyInteractable: vi.fn(() => nearbyInteractable)
    };

    const state = resolveGameplayTargetFrameState({
      session,
      controls,
      gameplay,
      flowState: {},
      gameplayOpeningMovementLocked: false,
      waterGunEquipped: false,
      leafageEquipped: true,
      fireEquipped: false
    });

    expect(state.canQueryNearbyGameplayTargets).toBe(true);
    expect(state.nearbyHarvestTarget).toEqual({});
    expect(state.nearbyInvalidMoveTarget).toEqual({ groundCell: invalidGroundCell });
    expect(state.invalidMoveGroundCell).toBe(invalidGroundCell);
    expect(state.highlightedGroundCell).toBe(invalidGroundCell);
    expect(state.highlightedGroundCellTargetState).toBe("invalid");
    expect(state.highlightedGroundCellAbilityId).toBe("leafage");
    expect(state.nearbyInteractable).toBe(nearbyInteractable);
    expect(gameplay.findNearbyActionTarget).toHaveBeenNthCalledWith(1, {
      playerPosition: [1, 0, 2],
      palmModel: "palm-model",
      palmInstances: ["palm"],
      resourceNodes: ["resource"],
      leppaTree: "leppa-tree",
      leafDen: "leaf-den",
      storyState: controls.storyState,
      inventory: controls.inventory,
      groundDeadInstances: ["dead-ground"],
      iceGroundInstances: ["ice-ground"],
      groundPurifiedInstances: ["purified-ground"],
      groundGrassPatches: ["grass"],
      groundFlowerPatches: ["flower"],
      canPurifyGround: false,
      canUseLeafage: true,
      canUseFire: false
    });
    expect(gameplay.findNearbyActionTarget).toHaveBeenNthCalledWith(2, {
      playerPosition: [1, 0, 2],
      palmModel: "palm-model",
      palmInstances: ["palm"],
      resourceNodes: ["resource"],
      leppaTree: "leppa-tree",
      leafDen: "leaf-den",
      storyState: controls.storyState,
      inventory: controls.inventory,
      groundDeadInstances: ["dead-ground"],
      iceGroundInstances: ["ice-ground"],
      groundPurifiedInstances: ["purified-ground"],
      groundGrassPatches: ["grass"],
      groundFlowerPatches: ["flower"],
      canPurifyGround: true,
      canUseLeafage: false,
      canUseFire: false
    });
    expect(gameplay.findNearbyInteractable).toHaveBeenCalledWith(
      [1, 0, 2],
      ["npc"],
      ["interactable"],
      controls.storyState,
      ["grass"],
      "log-chair",
      "leaf-den",
      "timburr",
      "charmander",
      "leppa-tree",
      "bulbasaur",
      ["flower"]
    );
  });

  it("does not query targets while frame state blocks nearby gameplay", () => {
    const session = createSession();
    const gameplay = {
      findNearbyActionTarget: vi.fn(),
      findNearbyInteractable: vi.fn()
    };

    const state = resolveGameplayTargetFrameState({
      session,
      controls: {
        storyState: { flags: {} },
        inventory: {}
      },
      gameplay,
      flowState: {
        cinematicActive: true
      },
      gameplayOpeningMovementLocked: false,
      waterGunEquipped: true,
      leafageEquipped: false,
      fireEquipped: false
    });

    expect(state.canQueryNearbyGameplayTargets).toBe(false);
    expect(state.nearbyHarvestTarget).toBeNull();
    expect(state.nearbyInvalidMoveTarget).toBeNull();
    expect(state.invalidMoveGroundCell).toBeNull();
    expect(state.highlightedGroundCell).toBeNull();
    expect(state.highlightedGroundCellTargetState).toBe("valid");
    expect(state.highlightedGroundCellAbilityId).toBe("waterGun");
    expect(state.nearbyInteractable).toBeNull();
    expect(gameplay.findNearbyActionTarget).not.toHaveBeenCalled();
    expect(gameplay.findNearbyInteractable).not.toHaveBeenCalled();
  });
});
