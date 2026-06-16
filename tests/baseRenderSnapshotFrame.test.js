import { describe, expect, it, vi } from "vitest";

import {
  createBaseRenderSnapshotFrameRuntime,
  createRenderSnapshotCompletionFrameRuntime
} from "../app/runtime/presentation/baseRenderSnapshotFrame.js";

function createNextFrame() {
  return {
    render: {
      viewProjection: null,
      sceneObjects: [],
      skyTexture: null,
      psxDistanceFog: null
    }
  };
}

function createCompletionNextFrame() {
  return {
    render: {
      genericBillboards: [],
      characters: null
    },
    colliderGizmos: {
      visible: false,
      colliders: []
    },
    tutorial: {
      active: false,
      playerPosition: null,
      deltaTime: 0
    }
  };
}

describe("base render snapshot frame", () => {
  it("syncs construction visuals and writes the base render snapshot", () => {
    const nextFrame = createNextFrame();
    const camera = {
      getViewProjection: vi.fn(() => "view-projection"),
      getPose: vi.fn(() => ({ target: [9, 0, 9] }))
    };
    const controls = {
      completeLeafDenConstructionIfReady: vi.fn()
    };
    const construction = {
      syncActiveRepairBoxHighlight: vi.fn(),
      syncGreenhouseModelInstance: vi.fn(),
      syncCampfireTrainHouseModelInstance: vi.fn(),
      isLeafDenConstructionActive: vi.fn(() => true),
      syncLeafDenConstructionClouds: vi.fn(),
      syncConstructionCloudBurstEffects: vi.fn(),
      syncLeafDenModelInstance: vi.fn(),
      syncPlayerHouseModelInstances: vi.fn()
    };
    const applyInteractionObjectHighlight = vi.fn();
    const getGameplayOpeningShipSceneObjects = vi.fn(() => ["ship"]);
    const getSquirtleAssemblySceneObjects = vi.fn(() => ["assembled"]);
    const resolvePsxDistanceFogSettings = vi.fn(() => ({
      enabled: true,
      density: 0.25
    }));
    const runtime = createBaseRenderSnapshotFrameRuntime({
      camera,
      worldCanvas: { width: 320, height: 180 },
      session: {
        sceneObjects: ["scene"],
        gameplayOpeningShip: { id: "ship" },
        actTwoSquirtle: { id: "squirtle" },
        skyTexture: "sky",
        playerCharacter: {
          getPosition: vi.fn(() => [1, 0, 2])
        }
      },
      controls,
      gameFlowValues: {
        CINEMATIC: "cinematic",
        GAMEPLAY: "gameplay"
      },
      construction,
      applyInteractionObjectHighlight,
      getGameplayOpeningShipSceneObjects,
      getSquirtleAssemblySceneObjects,
      resolvePsxDistanceFogSettings
    });

    runtime.update(nextFrame, {
      now: 1500,
      deltaTime: 0.25,
      cinematicActive: true,
      nearbyInteractable: { id: "npc" },
      nearbyWorkbenchRotationTarget: { id: "workbench" }
    });

    expect(camera.getViewProjection).toHaveBeenCalledWith(320, 180);
    expect(construction.syncActiveRepairBoxHighlight).toHaveBeenCalledTimes(1);
    expect(construction.syncGreenhouseModelInstance).toHaveBeenCalledWith(0.25);
    expect(construction.syncCampfireTrainHouseModelInstance).toHaveBeenCalledWith(1.5, 0.25);
    expect(controls.completeLeafDenConstructionIfReady).toHaveBeenCalledWith({
      playDialogue: false
    });
    expect(construction.syncLeafDenConstructionClouds).toHaveBeenCalledWith(1.5);
    expect(construction.syncConstructionCloudBurstEffects).toHaveBeenCalledWith(1.5);
    expect(construction.syncLeafDenModelInstance).toHaveBeenCalledWith(0.25);
    expect(construction.syncPlayerHouseModelInstances).toHaveBeenCalledWith(0.25, [9, 0, 9]);
    expect(applyInteractionObjectHighlight).toHaveBeenCalledWith(
      expect.any(Object),
      {
        interactTarget: { id: "npc" },
        workbenchRotationTarget: { id: "workbench" }
      }
    );
    expect(getGameplayOpeningShipSceneObjects).toHaveBeenCalledWith(
      ["scene"],
      { id: "ship" }
    );
    expect(getSquirtleAssemblySceneObjects).toHaveBeenCalledWith(
      ["ship"],
      { id: "squirtle" }
    );
    expect(resolvePsxDistanceFogSettings).toHaveBeenCalledWith({
      sceneId: "cinematic"
    });
    expect(nextFrame.render).toEqual({
      viewProjection: "view-projection",
      sceneObjects: ["assembled"],
      skyTexture: "sky",
      psxDistanceFog: {
        enabled: true,
        density: 0.25
      }
    });
  });

  it("falls back to the player position for player-house sync and hides disabled fog", () => {
    const nextFrame = createNextFrame();
    const syncPlayerHouseModelInstances = vi.fn();
    const runtime = createBaseRenderSnapshotFrameRuntime({
      camera: {
        getViewProjection: () => "vp",
        getPose: () => ({})
      },
      worldCanvas: { width: 10, height: 5 },
      session: {
        sceneObjects: [],
        skyTexture: "sky",
        playerCharacter: {
          getPosition: () => [2, 0, 3]
        }
      },
      gameFlowValues: {
        CINEMATIC: "cinematic",
        GAMEPLAY: "gameplay"
      },
      construction: {
        syncPlayerHouseModelInstances
      },
      resolvePsxDistanceFogSettings: vi.fn(() => ({ enabled: false }))
    });

    runtime.update(nextFrame, {
      deltaTime: 0.1,
      cinematicActive: false
    });

    expect(syncPlayerHouseModelInstances).toHaveBeenCalledWith(0.1, [2, 0, 3]);
    expect(nextFrame.render.psxDistanceFog).toBeNull();
  });

  it("completes final render snapshot channels after world and companion presentation", () => {
    const nextFrame = createCompletionNextFrame();
    const natureRevivalBillboard = { id: "revival-billboard" };
    const leafBurstBillboard = { id: "leaf-burst-billboard" };
    const colliderBillboard = { id: "collider-billboard" };
    const playerPosition = [1, 0, 2];
    const treeRevivalLeafBurstFrameRuntime = {
      appendBillboards: vi.fn((frame) => {
        frame.render.genericBillboards.push(leafBurstBillboard);
      })
    };
    const getInteractionDebugColliders = vi.fn(() => [
      { id: "interaction-collider" }
    ]);
    const getNatureRevivalBillboardsForSession = vi.fn(() => [
      natureRevivalBillboard
    ]);
    const getColliderGizmoBillboardsForSession = vi.fn(() => [
      colliderBillboard
    ]);
    const isNpcActive = vi.fn(() => true);
    const session = {
      natureRevivalEffects: [{ id: "revival" }],
      natureRevivalSparkTexture: "spark",
      colliderGizmoTextures: "collider-textures",
      elevatedTerrainColliders: [{ id: "terrain-collider" }],
      playerCharacter: {
        getPosition: vi.fn(() => playerPosition)
      },
      npcActors: [{ id: "npc" }],
      characterTextures: "character-textures"
    };
    const controls = {
      storyState: { flags: {} }
    };
    const runtime = createRenderSnapshotCompletionFrameRuntime({
      session,
      controls,
      rendering: {
        fullUvRect: "uv",
        debugColliders: true,
        isNpcActive
      },
      treeRevivalLeafBurstFrameRuntime,
      getInteractionDebugColliders,
      sources: {
        getNatureRevivalBillboardsForSession,
        getColliderGizmoBillboardsForSession
      }
    });

    runtime.update(nextFrame, { deltaTime: 0.25 });

    expect(getNatureRevivalBillboardsForSession).toHaveBeenCalledWith(
      session.natureRevivalEffects,
      "spark",
      "uv"
    );
    expect(treeRevivalLeafBurstFrameRuntime.appendBillboards).toHaveBeenCalledWith(nextFrame);
    expect(getColliderGizmoBillboardsForSession).toHaveBeenCalledWith({
      colliders: [
        { id: "terrain-collider" },
        { id: "interaction-collider" }
      ],
      textures: "collider-textures"
    });
    expect(nextFrame.render.genericBillboards).toEqual([
      natureRevivalBillboard,
      leafBurstBillboard,
      colliderBillboard
    ]);
    expect(nextFrame.colliderGizmos).toEqual({
      visible: true,
      colliders: [
        { id: "terrain-collider" },
        { id: "interaction-collider" }
      ]
    });
    expect(nextFrame.render.characters).toEqual({
      storyState: controls.storyState,
      playerCharacter: session.playerCharacter,
      npcActors: session.npcActors,
      characterTextures: "character-textures",
      isNpcActive
    });
    expect(nextFrame.tutorial).toEqual({
      active: true,
      playerPosition,
      deltaTime: 0.25
    });
  });
});
