import { describe, expect, it } from "vitest";

import { createPlayerActionTargetContext } from "../app/player/playerActionTargetContext.js";

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
});
