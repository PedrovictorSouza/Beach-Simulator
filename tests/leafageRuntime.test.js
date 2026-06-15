import { describe, expect, it, vi } from "vitest";

import { createLeafageRuntime } from "../app/runtime/fieldMoveRuntime/leafageRuntime.js";

function createHarness(overrides = {}) {
  const bulbasaur = {
    modelInstance: {
      active: false,
      offset: [0, 0.04, 0],
      yaw: 0
    },
    position: [0, 0.04, 0],
    visible: true,
    ...overrides.bulbasaur
  };
  const groundCell = {
    id: "leafage-ground-a",
    offset: [1, 0, 0],
    ...overrides.groundCell
  };
  const session = {
    bulbasaurEncounter: bulbasaur,
    bulbasaurLeafageAction: null,
    ...overrides.session
  };
  const callbacks = {
    applyImpact: vi.fn(() => true),
    getApproachPosition: vi.fn(() => [0, 0.04, 0]),
    getGroundCellCenterPosition: vi.fn((cell) => [
      cell.offset[0],
      cell.offset[1] + 0.04,
      cell.offset[2]
    ]),
    getModelYawToward: vi.fn(() => 0.5),
    isBusy: vi.fn(() => false),
    isPositionBlocked: vi.fn(() => false),
    onBlocked: vi.fn(),
    syncBulbasaur: vi.fn(),
    tryMoveCompanionToPosition: vi.fn((companion, nextPosition) => {
      companion.position = nextPosition;
      return true;
    }),
    ...overrides.callbacks
  };
  const runtime = createLeafageRuntime({
    session,
    ...callbacks,
    config: {
      arriveDistance: 0.08,
      castDuration: 0.5,
      impactTime: 0.2,
      speed: 4,
      ...overrides.config
    }
  });

  return {
    bulbasaur,
    callbacks,
    groundCell,
    runtime,
    session
  };
}

describe("createLeafageRuntime", () => {
  it("starts a Grow Bot Leafage action with the existing action shape", () => {
    const { bulbasaur, callbacks, groundCell, runtime, session } = createHarness();

    expect(runtime.startAction({
      groundCell,
      playerPosition: [0, 0.04, 1]
    })).toBe("started");

    expect(session.bulbasaurLeafageAction).toMatchObject({
      phase: "approach",
      groundCell,
      targetPosition: [1, 0.04, 0],
      approachPosition: [0, 0.04, 0],
      castElapsed: 0,
      impactApplied: false
    });
    expect(bulbasaur.modelInstance).toMatchObject({
      active: true,
      yaw: 0.5
    });
    expect(callbacks.syncBulbasaur).toHaveBeenCalledTimes(1);
  });

  it("keeps busy and unavailable outcomes explicit", () => {
    const busyHarness = createHarness({
      callbacks: {
        isBusy: vi.fn(() => true)
      }
    });
    expect(busyHarness.runtime.startAction({
      groundCell: busyHarness.groundCell
    })).toBe("busy");

    const unavailableHarness = createHarness({
      bulbasaur: {
        visible: false
      }
    });
    expect(unavailableHarness.runtime.startAction({
      groundCell: unavailableHarness.groundCell
    })).toBe("unavailable");
    expect(unavailableHarness.session.bulbasaurLeafageAction).toBeNull();
  });

  it("transitions from approach to cast, applies impact once, and clears after the cast", () => {
    const { callbacks, groundCell, runtime, session } = createHarness();

    runtime.startAction({ groundCell });
    runtime.updateAction(0.016);

    expect(session.bulbasaurLeafageAction).toMatchObject({
      phase: "cast",
      castElapsed: 0
    });

    runtime.updateAction(0.2);
    expect(callbacks.applyImpact).toHaveBeenCalledTimes(1);
    expect(session.bulbasaurLeafageAction).toMatchObject({
      impactApplied: true
    });

    runtime.updateAction(0.3);
    expect(callbacks.applyImpact).toHaveBeenCalledTimes(1);
    expect(session.bulbasaurLeafageAction).toBeNull();
  });

  it("cancels and reports when the approach path is blocked", () => {
    const { callbacks, groundCell, runtime, session } = createHarness({
      callbacks: {
        getApproachPosition: vi.fn(() => [1, 0.04, 0]),
        tryMoveCompanionToPosition: vi.fn(() => false)
      }
    });

    runtime.startAction({ groundCell });
    runtime.updateAction(0.25);

    expect(session.bulbasaurLeafageAction).toBeNull();
    expect(callbacks.onBlocked).toHaveBeenCalledTimes(1);
    expect(callbacks.syncBulbasaur).toHaveBeenCalledTimes(2);
  });
});
