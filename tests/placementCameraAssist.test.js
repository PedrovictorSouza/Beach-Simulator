import { describe, expect, it, vi } from "vitest";
import { createPlacementCameraAssist } from "../app/runtime/placementCameraAssist.js";

describe("placement camera assist", () => {
  it("applies a wider building view only while placement is active", () => {
    const camera = {
      setZoom: vi.fn(),
      setDistance: vi.fn()
    };
    const assist = createPlacementCameraAssist({
      camera,
      getGameplayPreset: () => ({ zoom: 5.35, distance: 8.2 }),
      placementPreset: { zoom: 6.05, distance: 10.1 }
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
    expect(camera.setZoom).toHaveBeenLastCalledWith(6.05);
    expect(camera.setDistance).toHaveBeenLastCalledWith(10.1);

    camera.setZoom.mockClear();
    camera.setDistance.mockClear();
    expect(assist.update({ placementActive: true })).toEqual({
      changed: false,
      active: true
    });
    expect(camera.setZoom).not.toHaveBeenCalled();
    expect(camera.setDistance).not.toHaveBeenCalled();

    expect(assist.update({ placementActive: false })).toEqual({
      changed: true,
      active: false,
      applied: true
    });
    expect(camera.setZoom).toHaveBeenLastCalledWith(5.35);
    expect(camera.setDistance).toHaveBeenLastCalledWith(8.2);
  });
});
