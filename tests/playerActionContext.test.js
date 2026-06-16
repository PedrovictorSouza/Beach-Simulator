import { describe, expect, it } from "vitest";

import { createPlayerActionContext } from "../app/player/playerActionContext.js";

function createSession() {
  return {
    bulbasaurEncounter: { id: "bulbasaur" },
    charmanderEncounter: { id: "charmander" },
    groundDeadInstances: [{ id: "dead" }],
    groundFlowerPatches: [{ id: "flower" }],
    groundGrassPatches: [{ id: "grass" }],
    groundPurifiedInstances: [{ id: "purified" }],
    iceGroundInstances: [{ id: "ice" }],
    interactables: [{ id: "workbench" }],
    leafDen: { id: "leaf-den" },
    leppaBerryDrops: [{ id: "berry" }],
    leppaTree: { id: "leppa" },
    logChair: { id: "log-chair" },
    npcActors: [{ id: "npc" }],
    palmInstances: [{ id: "palm-instance" }],
    palmModel: { id: "palm-model" },
    resourceNodes: [{ id: "wood" }],
    timburrEncounter: { id: "timburr" },
    woodDrops: [{ id: "wood-drop" }]
  };
}

function createControls() {
  return {
    inventory: { wood: 3 },
    storyState: { flags: {} }
  };
}

describe("createPlayerActionContext", () => {
  it("builds shared destroy action options from session and controls", () => {
    const session = createSession();
    const controls = createControls();
    const context = createPlayerActionContext({ session, controls });
    const playerPosition = [1, 0, 2];

    expect(context.getDestroyOptions(playerPosition)).toEqual({
      playerPosition,
      npcActors: session.npcActors,
      interactables: session.interactables,
      storyState: controls.storyState,
      inventory: controls.inventory,
      woodDrops: session.woodDrops,
      groundGrassPatches: session.groundGrassPatches,
      groundFlowerPatches: session.groundFlowerPatches,
      groundPurifiedInstances: session.groundPurifiedInstances,
      logChair: session.logChair,
      leafDen: session.leafDen,
      leppaTree: session.leppaTree,
      leppaBerryDrops: session.leppaBerryDrops,
      timburrEncounter: session.timburrEncounter,
      charmanderEncounter: session.charmanderEncounter,
      bulbasaurEncounter: session.bulbasaurEncounter
    });
  });

  it("adds the NPC interaction callback only for interact options", () => {
    const session = createSession();
    const controls = createControls();
    const context = createPlayerActionContext({ session, controls });
    const onNpcInteractionStart = () => {};

    expect(context.getInteractOptions([1, 0, 2], { onNpcInteractionStart })).toEqual({
      ...context.getDestroyOptions([1, 0, 2]),
      onNpcInteractionStart
    });
  });

  it("builds harvest action options while preserving equipped-state gates", () => {
    const session = createSession();
    const controls = createControls();
    const context = createPlayerActionContext({ session, controls });
    const forcedHarvestTarget = { groundCell: { id: "cell-1" } };

    expect(context.getHarvestOptions({
      playerPosition: [1, 0, 2],
      waterGunEquipped: true,
      leafageEquipped: true,
      fireEquipped: true,
      options: {
        allowFire: false,
        allowLeafage: false,
        allowPlacement: false,
        forcedHarvestTarget,
        useWaterGun: true
      }
    })).toEqual({
      playerPosition: [1, 0, 2],
      palmModel: session.palmModel,
      palmInstances: session.palmInstances,
      resourceNodes: session.resourceNodes,
      leppaTree: session.leppaTree,
      inventory: controls.inventory,
      canPurifyGround: true,
      groundDeadInstances: session.groundDeadInstances,
      iceGroundInstances: session.iceGroundInstances,
      groundFlowerPatches: session.groundFlowerPatches,
      groundGrassPatches: session.groundGrassPatches,
      groundPurifiedInstances: session.groundPurifiedInstances,
      storyState: controls.storyState,
      leafDen: session.leafDen,
      woodDrops: session.woodDrops,
      leppaBerryDrops: session.leppaBerryDrops,
      canUseLeafage: false,
      canUseFire: false,
      useWaterGun: true,
      useFire: false,
      forcedHarvestTarget,
      allowPlacement: false
    });
  });
});
