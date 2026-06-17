import { describe, expect, it, vi } from "vitest";

import {
  createGameplayRepairBoxRevealRuntimeBundle,
  createRepairBoxRevealOpeningRuntime
} from "../app/runtime/companions/repairBoxRevealOpeningRuntime.js";

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function createRuntime(overrides = {}) {
  return createRepairBoxRevealOpeningRuntime({
    getRepairBoxPosition: () => [3, 0.5, 4],
    fallHeight: 2,
    defaultDuration: 1,
    defaultVisibleProgress: 0.5,
    defaultFallEndProgress: 0.8,
    clamp01,
    flashRuntime: {
      update: vi.fn(),
      setOpacity: vi.fn()
    },
    playRevealSfx: vi.fn(),
    ...overrides
  });
}

describe("createRepairBoxRevealOpeningRuntime", () => {
  it("wires gameplay repair-box reveal defaults", () => {
    const playRevealSfx = vi.fn();
    const { repairBoxRevealOpeningRuntime, repairBoxRevealFlashRuntime } =
      createGameplayRepairBoxRevealRuntimeBundle({
        mount: null,
        worldCanvas: null,
        camera: null,
        clamp01,
        getRepairBoxPosition: () => [3, 0.5, 4],
        playRevealSfx
      });
    const encounter = {
      repairPosition: [1, 0.2, 2],
      revealBoxOpening: {
        active: true
      }
    };

    expect(repairBoxRevealFlashRuntime).toBeTruthy();
    expect(
      repairBoxRevealOpeningRuntime.update(4.35 * 0.72, encounter)
    ).toBe(true);

    expect(playRevealSfx).toHaveBeenCalledTimes(1);
    expect(encounter.revealBoxOpening.botVisible).toBe(true);
    expect(encounter.position).toEqual([3, 0.5 + 1.82, 4]);
  });

  it("reveals a falling bot, hides the box and completes with existing side effects", () => {
    const flashRuntime = {
      update: vi.fn(),
      setOpacity: vi.fn()
    };
    const playRevealSfx = vi.fn();
    const onComplete = vi.fn();
    const syncModelInstance = vi.fn();
    const runtime = createRuntime({
      flashRuntime,
      playRevealSfx
    });
    const encounter = {
      repairPosition: [1, 0.2, 2],
      repairModuleInstance: {
        active: true
      },
      revealBoxOpening: {
        active: true,
        hideBoxWhenVisible: true,
        onComplete
      }
    };

    expect(runtime.update(0.5, encounter, { syncModelInstance })).toBe(true);

    expect(playRevealSfx).toHaveBeenCalledTimes(1);
    expect(flashRuntime.update).toHaveBeenCalledWith({
      opening: encounter.revealBoxOpening,
      encounter
    });
    expect(encounter.revealBoxOpening.botVisible).toBe(true);
    expect(encounter.revealBoxOpening.bulbasaurVisible).toBe(true);
    expect(encounter.repairModuleInstance.active).toBe(false);
    expect(encounter.position).toEqual([3, 2.5, 4]);
    expect(syncModelInstance).toHaveBeenCalledTimes(1);

    expect(runtime.update(0.5, encounter, { syncModelInstance })).toBe(true);

    expect(playRevealSfx).toHaveBeenCalledTimes(1);
    expect(encounter.position).toEqual([1, 0.2, 2]);
    expect(encounter.revealBoxOpening).toBeNull();
    expect(flashRuntime.setOpacity).toHaveBeenCalledWith(0);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(syncModelInstance).toHaveBeenCalledTimes(2);
  });

  it("deactivates invalid openings and clears flash opacity", () => {
    const flashRuntime = {
      update: vi.fn(),
      setOpacity: vi.fn()
    };
    const runtime = createRuntime({ flashRuntime });
    const encounter = {
      revealBoxOpening: {
        active: true
      }
    };

    expect(runtime.update(0.5, encounter)).toBe(false);

    expect(encounter.revealBoxOpening.active).toBe(false);
    expect(flashRuntime.setOpacity).toHaveBeenCalledWith(0);
    expect(flashRuntime.update).not.toHaveBeenCalled();
  });
});
