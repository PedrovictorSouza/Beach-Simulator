// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";

import { createRepairBoxRevealFlashRuntime } from "../app/runtime/repairBoxRevealFlashRuntime.js";

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function createRuntime(overrides = {}) {
  return createRepairBoxRevealFlashRuntime({
    mount: document.createElement("div"),
    worldCanvas: { width: 320, height: 180 },
    camera: {
      project: vi.fn(() => ({
        x: 80,
        y: 45,
        depth: 0.5
      }))
    },
    clamp01,
    peakOpacity: 1,
    repairBoxFloatHeight: 0.74,
    getRepairBoxPosition: () => [2, 1, 4],
    ...overrides
  });
}

describe("createRepairBoxRevealFlashRuntime", () => {
  it("uses the existing pulse and projected origin calculations", () => {
    const mount = document.createElement("div");
    const camera = {
      project: vi.fn(() => ({
        x: 80,
        y: 45,
        depth: 0.5
      }))
    };
    const runtime = createRuntime({ mount, camera });

    runtime.update({
      opening: {
        active: true,
        elapsed: 0.5,
        flashStart: 0,
        flashDuration: 1
      },
      encounter: { id: "grow-bot" }
    });

    const element = mount.querySelector("[data-repair-box-reveal-flash]");

    expect(camera.project).toHaveBeenCalledWith([2, 1.74, 4], 320, 180);
    expect(element.hidden).toBe(false);
    expect(element.style.opacity).toBe("1");
    expect(element.style.background).toContain("circle at 25.00% 25.00%");
  });

  it("hides and reuses the overlay outside the flash window", () => {
    const mount = document.createElement("div");
    const runtime = createRuntime({ mount });

    runtime.setOpacity(0.5, {});
    const element = mount.querySelector("[data-repair-box-reveal-flash]");

    runtime.update({
      opening: {
        active: true,
        elapsed: 2,
        flashStart: 0,
        flashDuration: 1
      },
      encounter: {}
    });

    expect(mount.children).toHaveLength(1);
    expect(element.hidden).toBe(true);
    expect(element.style.opacity).toBe("0");
  });

  it("falls back safely without a DOM mount or camera projection", () => {
    const mount = document.createElement("div");
    const runtime = createRuntime({
      mount,
      camera: {}
    });

    expect(() => {
      runtime.setOpacity(0.5, {});
    }).not.toThrow();
    expect(
      mount.querySelector("[data-repair-box-reveal-flash]").style.background
    ).toContain("circle at 50% 55%");

    expect(() => {
      createRuntime({ mount: null }).setOpacity(0.5, {});
    }).not.toThrow();
  });
});
