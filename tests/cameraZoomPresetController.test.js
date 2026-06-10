import { describe, expect, it, vi } from "vitest";
import {
  createCameraZoomPresetController,
  restoreActiveZoomPresetOnMovement
} from "../app/runtime/camera/cameraZoomPresetController.js";

describe("createCameraZoomPresetController", () => {
  it("can reapply the active zoom preset without advancing it", () => {
    const camera = {
      setZoom: vi.fn(),
      setDistance: vi.fn()
    };
    const controller = createCameraZoomPresetController({
      camera,
      presets: [
        { zoom: 3.15, distance: 8 },
        { zoom: 4.2, distance: 6.4 }
      ]
    });

    expect(controller.cycle()).toBe(1);
    expect(camera.setZoom).toHaveBeenLastCalledWith(4.2);
    expect(camera.setDistance).toHaveBeenLastCalledWith(6.4);

    camera.setZoom.mockClear();
    camera.setDistance.mockClear();

    expect(controller.applyCurrent()).toEqual({ zoom: 4.2, distance: 6.4 });
    expect(controller.getIndex()).toBe(1);
    expect(controller.getCurrentPreset()).toEqual({ zoom: 4.2, distance: 6.4 });
    expect(camera.setZoom).toHaveBeenCalledWith(4.2);
    expect(camera.setDistance).toHaveBeenCalledWith(6.4);
  });

  it("restores the active zoom preset when movement resumes during a target transition", () => {
    const playerPosition = [1, 0, 2];
    const camera = {
      isTargetTransitionActive: vi.fn(() => true),
      getPose: vi.fn(() => ({
        target: [9, 0, 9],
        direction: [0, -0.4, -1]
      })),
      setPose: vi.fn(),
      follow: vi.fn()
    };
    const cameraOrbit = {
      getDirection: vi.fn(() => [0.1, -0.5, -0.9])
    };
    const cameraZoomPresetController = {
      getCurrentPreset: vi.fn(() => ({ zoom: 4.2, distance: 6.4 })),
      applyCurrent: vi.fn()
    };

    expect(restoreActiveZoomPresetOnMovement({
      playerPosition,
      camera,
      cameraOrbit,
      cameraZoomPresetController
    })).toBe(true);

    expect(camera.setPose).toHaveBeenCalledWith({
      target: [9, 0, 9],
      direction: [0.1, -0.5, -0.9],
      zoom: 4.2,
      distance: 6.4
    });
    expect(cameraZoomPresetController.applyCurrent).toHaveBeenCalledTimes(1);
    expect(camera.follow).toHaveBeenCalledWith(playerPosition);
  });

  it("does not restore a zoom preset without movement or an active transition", () => {
    const camera = {
      isTargetTransitionActive: vi.fn(() => false),
      setPose: vi.fn(),
      follow: vi.fn()
    };

    expect(restoreActiveZoomPresetOnMovement({
      playerPosition: [1, 0, 2],
      camera
    })).toBe(false);
    expect(restoreActiveZoomPresetOnMovement({
      playerPosition: null,
      camera: {
        isTargetTransitionActive: vi.fn(() => true),
        setPose: vi.fn(),
        follow: vi.fn()
      }
    })).toBe(false);
    expect(camera.setPose).not.toHaveBeenCalled();
    expect(camera.follow).not.toHaveBeenCalled();
  });
});
