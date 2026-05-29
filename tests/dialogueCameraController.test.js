import { describe, expect, it, vi } from "vitest";
import { createDialogueCameraController } from "../app/runtime/dialogueCameraController.js";
import {
  ACT_TWO_PLAYER_CAMERA_DISTANCE,
  ACT_TWO_PLAYER_CAMERA_ZOOM,
  ACT_TWO_PLAYER_CAMERA_ZOOM_PRESETS
} from "../actTwoSceneConfig.js";

describe("createDialogueCameraController", () => {
  it("restores chained scripted focuses to the open gameplay zoom", () => {
    const openGameplayPreset = ACT_TWO_PLAYER_CAMERA_ZOOM_PRESETS.find((preset) => {
      return preset.id === "far";
    });
    const gameplayPose = {
      target: [0, 0, 0],
      direction: [0, 0.5, 1],
      zoom: 4.7,
      distance: 6.2
    };
    let currentPose = gameplayPose;
    const camera = {
      getPose: vi.fn(() => currentPose),
      startPoseTransition: vi.fn((pose) => {
        currentPose = pose;
      })
    };
    const cameraOrbit = {
      sync: vi.fn()
    };
    const dialogueCamera = createDialogueCameraController({ camera, cameraOrbit });

    dialogueCamera.focusWorldPoint({ position: [6, 0, 2] });
    dialogueCamera.focusNpcConversation({
      playerPosition: [1, 0, 1],
      targetId: "tangrowth",
      npcActors: [
        {
          id: "tangrowth",
          character: {
            getPosition: () => [2, 0, 2]
          }
        }
      ],
      interactables: []
    });
    dialogueCamera.restoreGameplayCamera();

    expect(camera.startPoseTransition).toHaveBeenLastCalledWith(
      {
        ...gameplayPose,
        zoom: openGameplayPreset.zoom,
        distance: openGameplayPreset.distance
      },
      expect.objectContaining({ duration: expect.any(Number) })
    );
  });

  it("keeps the close framing out of gameplay zoom presets", () => {
    expect(ACT_TWO_PLAYER_CAMERA_ZOOM_PRESETS.some((preset) => preset.id === "close")).toBe(false);
  });

  it("allows scripted world-point focuses to use wider framing for large objects", () => {
    const camera = {
      getPose: vi.fn(() => ({
        target: [0, 0, 0],
        direction: [0, 0.4, 1],
        zoom: 2,
        distance: 8
      })),
      startPoseTransition: vi.fn()
    };
    const cameraOrbit = {
      sync: vi.fn()
    };
    const dialogueCamera = createDialogueCameraController({ camera, cameraOrbit });

    dialogueCamera.focusWorldPoint({
      position: [6, 0, 2],
      height: 1.75,
      distance: 9.3,
      zoom: 4.45
    });

    expect(camera.startPoseTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        target: [6, 1.75, 2],
        zoom: 4.45,
        distance: 9.3
      }),
      expect.objectContaining({ duration: expect.any(Number) })
    );
  });

  it("starts gameplay on the farthest camera preset", () => {
    expect(ACT_TWO_PLAYER_CAMERA_ZOOM_PRESETS[0]).toMatchObject({
      id: "far",
      zoom: ACT_TWO_PLAYER_CAMERA_ZOOM,
      distance: ACT_TWO_PLAYER_CAMERA_DISTANCE
    });
  });

  it("can frame a conversation from an explicit dynamic target position", () => {
    const camera = {
      getPose: vi.fn(() => ({
        target: [0, 0, 0],
        direction: [0, 0.4, 1],
        zoom: 2,
        distance: 8
      })),
      startPoseTransition: vi.fn()
    };
    const cameraOrbit = {
      sync: vi.fn()
    };
    const dialogueCamera = createDialogueCameraController({ camera, cameraOrbit });

    dialogueCamera.focusNpcConversation({
      playerPosition: [0, 0, 0],
      targetId: "bulbasaurDryGrassMission",
      targetPosition: [2, 0.02, 3],
      npcActors: [],
      interactables: []
    });

    expect(camera.startPoseTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        target: [1, 0.18, 1.5],
        zoom: 4.25
      }),
      expect.objectContaining({ duration: expect.any(Number) })
    );
  });

  it("frames Chopper by his flying visual height instead of the ground anchor", () => {
    const camera = {
      getPose: vi.fn(() => ({
        target: [0, 0, 0],
        direction: [0, 0.4, 1],
        zoom: 2,
        distance: 8
      })),
      startPoseTransition: vi.fn()
    };
    const cameraOrbit = {
      sync: vi.fn()
    };
    const dialogueCamera = createDialogueCameraController({ camera, cameraOrbit });

    dialogueCamera.focusNpcConversation({
      playerPosition: [0, 0, 0],
      targetId: "tangrowth",
      npcActors: [
        {
          id: "tangrowth",
          character: {
            getPosition: () => [1, 0.02, 0]
          }
        }
      ],
      interactables: []
    });

    const [pose] = camera.startPoseTransition.mock.calls[0];

    expect(pose.target[1]).toBeGreaterThan(0.42);
    expect(pose.zoom).toBe(4.25);
    expect(pose.distance).toBeCloseTo(6.2);
  });
});
