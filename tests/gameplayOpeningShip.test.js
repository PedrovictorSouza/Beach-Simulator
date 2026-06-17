import { describe, expect, it, vi } from "vitest";
import {
  createGameplayOpeningShipState,
  getGameplayOpeningShipDynamicBarrier,
  getGameplayOpeningShipSceneObjects
} from "../app/session/gameplayOpeningShip.js";
import {
  createGameplayOpeningPresentationFrameRuntime
} from "../app/runtime/opening/createGameplayOpeningRuntime.js";

describe("gameplay opening ship", () => {
  it("exposes a player-blocking barrier only after the ship has landed", () => {
    const ship = createGameplayOpeningShipState();

    expect(getGameplayOpeningShipDynamicBarrier(ship)).toBe(null);

    ship.visible = true;
    ship.phase = "falling";
    ship.position = [5.95, 0.06, 6.45];

    expect(getGameplayOpeningShipDynamicBarrier(ship)).toBe(null);

    ship.phase = "landed";

    expect(getGameplayOpeningShipDynamicBarrier(ship)).toEqual({
      id: "gameplay-opening-ship-collider",
      position: [5.95, 0.06, 6.45],
      radius: expect.any(Number)
    });
  });

  it("keeps the opening ship assembled while it is falling", () => {
    const model = {
      primitives: ["body-a", "body-b", "body-c", "right-panel", "left-panel", "rear-fragment"]
    };
    const ship = createGameplayOpeningShipState({ model });

    ship.visible = true;
    ship.phase = "falling";
    ship.position = [5.95, 0.06, 6.45];

    const sceneObjects = getGameplayOpeningShipSceneObjects([], ship);

    expect(sceneObjects).toHaveLength(1);
    expect(sceneObjects[0].model.primitives).toEqual(model.primitives);
  });

  it("scatters modular destruction parts after the opening ship impact", () => {
    const model = {
      primitives: ["body-a", "body-b", "body-c", "right-panel", "left-panel", "rear-fragment"]
    };
    const ship = createGameplayOpeningShipState({ model });

    ship.visible = true;
    ship.phase = "landed";
    ship.position = [5.95, 0.06, 6.45];
    ship.destructionProgress = 1;

    const sceneObjects = getGameplayOpeningShipSceneObjects([], ship);

    expect(sceneObjects).toHaveLength(4);
    expect(sceneObjects[0].model.primitives).toEqual(["body-a", "body-b", "body-c"]);
    expect(sceneObjects.slice(1).map((sceneObject) => sceneObject.model.primitives)).toEqual([
      ["right-panel"],
      ["left-panel"],
      ["rear-fragment"]
    ]);
    expect(sceneObjects.slice(1).map((sceneObject) => sceneObject.instances[0].active))
      .toEqual([true, true, true]);
    expect(sceneObjects[1].instances[0].offset[0]).toBeGreaterThan(8);
    expect(sceneObjects[2].instances[0].offset[0]).toBeLessThan(4);
  });

  it("coordinates opening presentation updates before exposing frame state", () => {
    const order = [];
    const openingRuntime = {
      updateShipAudio: vi.fn(() => order.push("shipAudio")),
      updateHudReveal: vi.fn(() => order.push("hudReveal")),
      getCameraFrame: vi.fn(() => ({ phase: "player-exit" })),
      isHudHidden: vi.fn(() => false)
    };
    const updateFrameAudio = vi.fn(() => order.push("frameAudio"));
    const isGameplayActive = vi.fn(() => true);
    const isDialogueActive = vi.fn(() => true);
    const runtime = createGameplayOpeningPresentationFrameRuntime({
      openingRuntime,
      updateFrameAudio,
      isGameplayActive,
      isDialogueActive
    });
    const gameplayOpeningCameraFrame = { phase: "ship-landed" };
    const flowState = {
      introActive: false,
      pokedexModalOpen: false
    };

    const frame = runtime.update({
      now: 1234,
      deltaTime: 0.016,
      playerMovedThisFrame: true,
      gameplayOpeningCameraFrame,
      flowState,
      cinematicActive: false,
      tutorialActive: true
    });

    expect(order).toEqual(["shipAudio", "frameAudio", "hudReveal"]);
    expect(openingRuntime.updateShipAudio).toHaveBeenCalledWith(1234);
    expect(updateFrameAudio).toHaveBeenCalledWith({
      deltaTime: 0.016,
      gameplayOpeningCameraFrame,
      now: 1234,
      playerMovedThisFrame: true
    });
    expect(openingRuntime.updateHudReveal).toHaveBeenCalledWith({
      now: 1234,
      gameplayActive: true
    });
    expect(frame).toEqual({
      gameplayOpeningCameraFrame: { phase: "player-exit" },
      gameplayOpeningHudHidden: false,
      currentFlowState: {
        introActive: false,
        pokedexModalOpen: false,
        cinematicActive: false,
        tutorialActive: true,
        dialogueActive: true
      }
    });
  });
});
