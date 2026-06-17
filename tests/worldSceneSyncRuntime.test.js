import { describe, expect, it, vi } from "vitest";

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

  it("updates early scene sync systems for the current frame", () => {
    const session = {
      interactables: [
        {
          id: "workbench",
          position: [0, 0, 0],
          interactDistance: 0
        }
      ],
      pokemonCenterWorkshopAssembledInstance: {
        active: false
      },
      pokemonCenterWorkshopDismantledInstances: [
        { active: true }
      ]
    };
    const camera = {
      resizeCanvases: vi.fn(),
      update: vi.fn()
    };
    const clearInteractionObjectHighlights = vi.fn();
    const runtime = createWorldSceneSyncRuntime({
      session,
      controls: {
        storyState: {
          flags: {
            challengesUnlocked: true
          }
        }
      },
      camera,
      config: {
        workbenchPosition: [4, 0, 5],
        workbenchInteractDistance: 1.75
      },
      sources: {
        clearInteractionObjectHighlights
      }
    });

    runtime.updateEarlySceneFrame(0.25);

    expect(camera.resizeCanvases).toHaveBeenCalledOnce();
    expect(camera.update).toHaveBeenCalledWith(0.25);
    expect(clearInteractionObjectHighlights).toHaveBeenCalledWith(session);
    expect(session.interactables[0]).toMatchObject({
      position: [4, 0, 5],
      interactDistance: 1.75
    });
    expect(session.pokemonCenterWorkshopAssembledInstance.active).toBe(true);
    expect(session.pokemonCenterWorkshopDismantledInstances).toEqual([
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

  it("updates ambient world systems for the current frame", () => {
    const resourceNode = {
      usesModelInstance: true,
      position: [3, 0, 4],
      cooldown: 0,
      spinYawSpeed: 2,
      yaw: 0.25,
      activeWhen: (storyState) => storyState.flags.resourceActive
    };
    const session = {
      playerCharacter: {
        getPosition: vi.fn(() => [1, 0, 2])
      },
      palmInstances: [{ id: "palm" }],
      resourceNodes: [resourceNode],
      woodDrops: [{ id: "wood-drop" }],
      snowstorm: { id: "snowstorm" },
      leppaTree: { id: "leppa-tree" },
      leppaTreeMusicalNoteTextures: ["note"],
      updateCloudAtmosphere: vi.fn()
    };
    const controls = {
      storyState: {
        flags: {
          resourceActive: true
        }
      }
    };
    const hud = {
      updateTransientNotice: vi.fn()
    };
    const gameplay = {
      updatePalmShake: vi.fn(),
      updateResourceNodes: vi.fn(),
      syncLeppaTreeState: vi.fn()
    };
    const updateLandscapeCutEffect = vi.fn();
    const updateSnowstormFog = vi.fn();
    const updateSnowstormParticleField = vi.fn();
    const updateLeppaTreeDance = vi.fn();
    const updateLeppaTreeMusicNotes = vi.fn();
    const runtime = createWorldSceneSyncRuntime({
      session,
      controls,
      hud,
      gameplay,
      ambient: {
        updateLandscapeCutEffect,
        updateSnowstormFog
      },
      sources: {
        updateSnowstormParticleField,
        updateLeppaTreeDance,
        updateLeppaTreeMusicNotes
      }
    });

    runtime.updateAmbientWorldFrame({
      deltaTime: 0.5,
      now: 1200
    });

    expect(hud.updateTransientNotice).toHaveBeenCalledWith(0.5);
    expect(gameplay.updatePalmShake).toHaveBeenCalledWith(0.5, session.palmInstances);
    expect(gameplay.updateResourceNodes).toHaveBeenNthCalledWith(1, 0.5, session.resourceNodes);
    expect(gameplay.updateResourceNodes).toHaveBeenNthCalledWith(2, 0.5, session.woodDrops);
    expect(updateLandscapeCutEffect).toHaveBeenCalledWith(0.5);
    expect(resourceNode).toMatchObject({
      offset: [3, 0, 4],
      active: true,
      yaw: 1.25
    });
    expect(session.updateCloudAtmosphere).toHaveBeenCalledWith(0.5);
    expect(updateSnowstormParticleField).toHaveBeenCalledWith(session.snowstorm, {
      deltaTime: 0.5,
      playerPosition: [1, 0, 2]
    });
    expect(updateSnowstormFog).toHaveBeenCalledWith({
      session,
      deltaTime: 0.5
    });
    expect(gameplay.syncLeppaTreeState).toHaveBeenCalledWith(
      session.leppaTree,
      controls.storyState
    );
    expect(updateLeppaTreeDance).toHaveBeenCalledWith({
      leppaTree: session.leppaTree,
      now: 1200
    });
    expect(updateLeppaTreeMusicNotes).toHaveBeenCalledWith({
      leppaTree: session.leppaTree,
      textures: session.leppaTreeMusicalNoteTextures,
      deltaTime: 0.5
    });
  });
});
