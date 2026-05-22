import { describe, expect, it, vi } from "vitest";
import { createPlacementCameraAssist } from "../app/runtime/placementCameraAssist.js";

describe("placement camera assist", () => {
  it("applies a wider building view only while placement is active", () => {
    const camera = {
      setZoom: vi.fn(),
      setDistance: vi.fn(),
      setProjectionMode: vi.fn(),
      getProjectionMode: vi.fn(() => "perspective")
    };
    const assist = createPlacementCameraAssist({
      camera,
      getGameplayPreset: () => ({ zoom: 5.35, distance: 8.2 }),
      placementPreset: { zoom: 6.4, distance: 18, projectionMode: "orthographic" }
    });

    expect(assist.update({ placementActive: false })).toEqual({
      changed: false,
      active: false
    });
    expect(assist.update({ placementActive: true })).toEqual({
      changed: true,
      active: true,
      applied: true
    });
    expect(camera.setZoom).toHaveBeenLastCalledWith(6.4);
    expect(camera.setDistance).toHaveBeenLastCalledWith(18);
    expect(camera.setProjectionMode).toHaveBeenLastCalledWith("orthographic");

    camera.setZoom.mockClear();
    camera.setDistance.mockClear();
    camera.setProjectionMode.mockClear();
    expect(assist.update({ placementActive: true })).toEqual({
      changed: false,
      active: true
    });
    expect(camera.setZoom).not.toHaveBeenCalled();
    expect(camera.setDistance).not.toHaveBeenCalled();
    expect(camera.setProjectionMode).not.toHaveBeenCalled();

    expect(assist.update({ placementActive: false })).toEqual({
      changed: true,
      active: false,
      applied: true
    });
    expect(camera.setZoom).toHaveBeenLastCalledWith(5.35);
    expect(camera.setDistance).toHaveBeenLastCalledWith(8.2);
    expect(camera.setProjectionMode).toHaveBeenLastCalledWith("perspective");
  });
});
