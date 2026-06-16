import { describe, expect, it } from "vitest";

import {
  createPlayerActionTargetContext,
  resolvePrimaryActionAutoTargetQueries,
  resolvePrimaryActionSecondaryTargetQueries,
  resolvePrimaryActionTargetFollowupIntent,
  resolvePrimaryActionTargetIntent
} from "../app/player/playerActionTargetContext.js";

function createSession() {
  return {
    groundDeadInstances: [{ id: "dead" }],
    groundFlowerPatches: [{ id: "flower" }],
    groundGrassPatches: [{ id: "grass" }],
    groundPurifiedInstances: [{ id: "purified" }],
    iceGroundInstances: [{ id: "ice" }],
    leafDen: { id: "leaf-den" },
    leppaTree: { id: "leppa" },
    palmInstances: [{ id: "palm-instance" }],
    palmModel: { id: "palm-model" },
    resourceNodes: [{ id: "wood" }]
  };
}

function createControls() {
  return {
    inventory: { wood: 3 },
    storyState: { flags: {} }
  };
}

describe("createPlayerActionTargetContext", () => {
  it("builds nearby action target options from session and controls", () => {
    const session = createSession();
    const controls = createControls();
    const context = createPlayerActionTargetContext({ session, controls });
    const playerPosition = [1, 0, 2];

    expect(context.getNearbyActionTargetOptions({
      playerPosition,
      allowPlacement: false,
      canPurifyGround: true,
      canUseFire: false,
      canUseLeafage: true
    })).toEqual({
      playerPosition,
      palmModel: session.palmModel,
      palmInstances: session.palmInstances,
      resourceNodes: session.resourceNodes,
      leppaTree: session.leppaTree,
      leafDen: session.leafDen,
      storyState: controls.storyState,
      inventory: controls.inventory,
      groundDeadInstances: session.groundDeadInstances,
      iceGroundInstances: session.iceGroundInstances,
      groundPurifiedInstances: session.groundPurifiedInstances,
      groundGrassPatches: session.groundGrassPatches,
      groundFlowerPatches: session.groundFlowerPatches,
      canPurifyGround: true,
      canUseLeafage: true,
      canUseFire: false,
      allowPlacement: false
    });
  });

  it("can omit optional ice and fire fields for callers that did not pass them before", () => {
    const session = createSession();
    const controls = createControls();
    const context = createPlayerActionTargetContext({ session, controls });

    expect(context.getNearbyActionTargetOptions({
      playerPosition: [1, 0, 2],
      allowPlacement: false,
      canPurifyGround: true,
      canUseLeafage: false,
      includeIceGroundInstances: false
    })).toEqual({
      playerPosition: [1, 0, 2],
      palmModel: session.palmModel,
      palmInstances: session.palmInstances,
      resourceNodes: session.resourceNodes,
      leppaTree: session.leppaTree,
      leafDen: session.leafDen,
      storyState: controls.storyState,
      inventory: controls.inventory,
      groundDeadInstances: session.groundDeadInstances,
      groundPurifiedInstances: session.groundPurifiedInstances,
      groundGrassPatches: session.groundGrassPatches,
      groundFlowerPatches: session.groundFlowerPatches,
      canPurifyGround: true,
      canUseLeafage: false,
      allowPlacement: false
    });
  });

  it("builds positional args for interactable and bag destroy target queries", () => {
    const session = createSession();
    const controls = createControls();
    const context = createPlayerActionTargetContext({ session, controls });
    const playerPosition = [1, 0, 2];

    expect(context.getNearbyInteractableArgs(playerPosition)).toEqual([
      playerPosition,
      session.npcActors,
      session.interactables,
      controls.storyState,
      session.groundGrassPatches,
      session.logChair,
      session.leafDen,
      session.timburrEncounter,
      session.charmanderEncounter,
      session.leppaTree,
      session.bulbasaurEncounter,
      session.groundFlowerPatches
    ]);
    expect(context.getBagDestroyTargetArgs(playerPosition)).toEqual([
      playerPosition,
      session.groundGrassPatches,
      controls.storyState,
      session.groundFlowerPatches,
      { includeRestoredGrass: true }
    ]);
  });
});

describe("primary action target intent", () => {
  it("classifies placement targets without changing placement blocker semantics", () => {
    expect(resolvePrimaryActionTargetIntent({
      target: { greenhousePlacement: {} },
      harvestRequestSource: "keyboardPrimary",
      gamepadPrimaryMoveRequested: false,
      buildBlockEquipped: false
    })).toEqual(expect.objectContaining({
      placementTarget: true,
      placementBlocked: false,
      isPlacement: true,
      placementCanYieldToRotation: false
    }));

    expect(resolvePrimaryActionTargetIntent({
      target: { greenhousePlacement: {} },
      harvestRequestSource: "gamepadPrimary",
      gamepadPrimaryMoveRequested: true,
      buildBlockEquipped: false
    })).toEqual(expect.objectContaining({
      placementTarget: true,
      placementBlocked: true,
      isPlacement: false
    }));
  });

  it("classifies selected field move intent from request source and equipped skills", () => {
    expect(resolvePrimaryActionTargetIntent({
      target: { leafageGroundCell: { id: "leafage-cell" } },
      harvestRequestSource: "gamepadBag",
      leafageEquipped: true,
      leafagePrimaryMoveRequested: true
    })).toEqual(expect.objectContaining({
      canUseFieldMove: true,
      wantsFieldMove: true,
      isMove: true
    }));

    expect(resolvePrimaryActionTargetIntent({
      target: { palm: { id: "palm" } },
      harvestRequestSource: "keyboardPrimary",
      waterGunEquipped: true
    })).toEqual(expect.objectContaining({
      isWaterGunTreeTarget: true,
      isMove: true
    }));
  });

  it("preserves bag harvest classification for palm and resource targets", () => {
    expect(resolvePrimaryActionTargetIntent({
      target: { resourceNode: { id: "wood" } },
      harvestRequestSource: "gamepadBag"
    })).toEqual(expect.objectContaining({
      isBagHarvest: true
    }));
  });
});

describe("primary action auto target queries", () => {
  it("requests a Water Gun target when Leafage misses a leafage ground cell", () => {
    expect(resolvePrimaryActionAutoTargetQueries({
      target: {},
      leafageEquipped: true,
      leafagePrimaryMoveRequested: true,
      waterGunSkillLearned: true,
      targetIntent: {
        wantsFieldMove: true,
        placementTarget: false
      }
    })).toEqual({
      shouldFindLeafageAutoWaterGunTarget: true,
      shouldFindLeafageAutoGrowTarget: false
    });
  });

  it("requests a Leafage target when Water Gun finds no usable target", () => {
    expect(resolvePrimaryActionAutoTargetQueries({
      target: {},
      waterGunEquipped: true,
      leafageSkillLearned: true,
      targetIntent: {
        wantsFieldMove: true,
        placementTarget: false
      }
    })).toEqual({
      shouldFindLeafageAutoWaterGunTarget: false,
      shouldFindLeafageAutoGrowTarget: true
    });
  });
});

describe("primary action secondary target queries", () => {
  it("classifies invalid field move and already-resolved fallback checks", () => {
    expect(resolvePrimaryActionTargetFollowupIntent({
      target: {},
      targetIntent: {
        wantsFieldMove: true,
        placementTarget: false,
        isMove: false
      },
      leafageEquipped: true,
      leafagePrimaryMoveRequested: true
    })).toEqual(expect.objectContaining({
      invalidLeafageUse: true,
      invalidFireUse: false,
      shouldFindAlreadyResolvedGroundCell: true
    }));

    expect(resolvePrimaryActionTargetFollowupIntent({
      target: {},
      targetIntent: {
        wantsFieldMove: true,
        placementTarget: false,
        isMove: false
      },
      fireEquipped: true
    })).toEqual(expect.objectContaining({
      invalidFireUse: true
    }));
  });

  it("decides whether primary action should query interact, rotation and bag destroy targets", () => {
    expect(resolvePrimaryActionSecondaryTargetQueries({
      harvestRequestSource: "gamepadBag",
      dialogueActive: false,
      targetIntent: {
        wantsFieldMove: false,
        isPlacement: false,
        isMove: false,
        placementCanYieldToRotation: true
      },
      followupIntent: {
        hasLeafageAutoWaterGunGroundCell: false,
        hasLeafageAutoGrowGroundCell: false,
        invalidLeafageUse: false,
        invalidFireUse: false
      },
      repeatedFieldMove: false,
      primaryInteractTargetIsWorkbench: false,
      primaryActionConfirmsRotation: false
    })).toEqual({
      shouldFindBagDestroyTarget: true,
      shouldFindInteractTarget: true,
      shouldFindRotationTarget: true
    });
  });
});
