import { describe, expect, it } from "vitest";

import { createWorldSceneSyncRuntime } from "../app/runtime/world/worldSceneSyncRuntime.js";

function createRuntime({ flags = {}, playerPosition = [1, 0.04, 2] } = {}) {
  const session = {
    playerCharacter: {
      getPosition: () => playerPosition
    },
    interactables: [
      {
        id: "workbench",
        position: [0, 0, 0],
        interactDistance: 0
      },
      {
        id: "squirtle",
        position: [0, 0, 0]
      }
    ],
    pokemonCenterWorkshopAssembledInstance: {
      active: false
    },
    pokemonCenterWorkshopDismantledInstances: [
      { active: true },
      { active: true }
    ]
  };
  const controls = {
    storyState: {
      flags
    }
  };
  const runtime = createWorldSceneSyncRuntime({
    session,
    controls,
    config: {
      workbenchPosition: [4, 0, 5],
      workbenchInteractDistance: 1.75
    }
  });

  return {
    runtime,
    session
  };
}

describe("createWorldSceneSyncRuntime", () => {
  it("syncs named interactable positions without mutating the source position", () => {
    const { runtime, session } = createRuntime();
    const position = [2, 0.04, 3];

    runtime.syncInteractablePosition("squirtle", position);
    position[0] = 99;

    expect(session.interactables[1].position).toEqual([2, 0.04, 3]);
  });

  it("syncs workbench interactable position and distance", () => {
    const { runtime, session } = createRuntime();

    runtime.syncWorkbenchInteractable();

    expect(session.interactables[0]).toMatchObject({
      position: [4, 0, 5],
      interactDistance: 1.75
    });
  });

  it("toggles Pokemon Center workshop visual instances from challenge state", () => {
    const { runtime, session } = createRuntime({
      flags: {
        challengesUnlocked: true
      }
    });

    runtime.syncPokemonCenterWorkshopVisualState();

    expect(session.pokemonCenterWorkshopAssembledInstance.active).toBe(true);
    expect(session.pokemonCenterWorkshopDismantledInstances).toEqual([
      { active: false },
      { active: false }
    ]);
  });

  it("checks player distance against a world position", () => {
    const { runtime } = createRuntime({
      playerPosition: [1, 0.04, 2]
    });

    expect(runtime.isPlayerNearWorldPosition([2, 0, 2], 1.01)).toBe(true);
    expect(runtime.isPlayerNearWorldPosition([4, 0, 2], 1.01)).toBe(false);
    expect(runtime.isPlayerNearWorldPosition(null, 1.01)).toBe(false);
  });
});
