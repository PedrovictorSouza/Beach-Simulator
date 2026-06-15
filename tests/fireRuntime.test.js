import { describe, expect, it, vi } from "vitest";

import { createFireRuntime } from "../app/runtime/fieldMoveRuntime/fireRuntime.js";

function createHarness(overrides = {}) {
  const charmander = {
    modelInstance: {
      active: false,
      offset: [0, 0.04, 0],
      yaw: 0
    },
    position: [0, 0.04, 0],
    visible: true,
    ...overrides.charmander
  };
  const groundCell = {
    id: "fire-ground-a",
    offset: [1, 0, 0],
    ...overrides.groundCell
  };
  const session = {
    charmanderEncounter: charmander,
    charmanderFireAction: null,
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
    getModelYawToward: vi.fn(() => 0.75),
    hasFireCarbon: vi.fn(() => true),
    isBusy: vi.fn(() => false),
    isPositionBlocked: vi.fn(() => false),
    onBlocked: vi.fn(),
    onBusy: vi.fn(),
    syncCharmander: vi.fn(),
    tryMoveCompanionToPosition: vi.fn((companion, nextPosition) => {
      companion.position = nextPosition;
      return true;
    }),
    ...overrides.callbacks
  };
  const runtime = createFireRuntime({
    session,
    ...callbacks,
    config: {
      arriveDistance: 0.08,
      impactTime: 0.2,
      speed: 4,
      sprayDuration: 0.5,
      ...overrides.config
    }
  });

  return {
    callbacks,
    charmander,
    groundCell,
    runtime,
    session
  };
}

describe("createFireRuntime", () => {
  it("starts a Thermal Bot Fire action with the existing action shape", () => {
    const { callbacks, charmander, groundCell, runtime, session } = createHarness();

    expect(runtime.startAction({
      groundCell,
      playerPosition: [0, 0.04, 1]
    })).toBe("started");

    expect(session.charmanderFireAction).toMatchObject({
      phase: "approach",
      groundCell,
      targetPosition: [1, 0.04, 0],
      approachPosition: [0, 0.04, 0],
      sprayElapsed: 0,
      impactApplied: false
    });
    expect(charmander.modelInstance).toMatchObject({
      active: true,
      yaw: 0.75
    });
    expect(callbacks.syncCharmander).toHaveBeenCalledTimes(1);
  });

  it("keeps busy and no-carbon outcomes explicit", () => {
    const busyHarness = createHarness({
      callbacks: {
        isBusy: vi.fn(() => true)
      }
    });
    expect(busyHarness.runtime.startAction({
      groundCell: busyHarness.groundCell
    })).toBe("busy");
    expect(busyHarness.callbacks.onBusy).toHaveBeenCalledTimes(1);

    const noCarbonHarness = createHarness({
      callbacks: {
        hasFireCarbon: vi.fn(() => false)
      }
    });
    expect(noCarbonHarness.runtime.startAction({
      groundCell: noCarbonHarness.groundCell
    })).toBe("no-carbon");
    expect(noCarbonHarness.session.charmanderFireAction).toBeNull();
  });

  it("transitions from approach to spray, applies impact once, and clears after the spray", () => {
    const { callbacks, groundCell, runtime, session } = createHarness();

    runtime.startAction({ groundCell });
    runtime.updateAction(0.016);

    expect(session.charmanderFireAction).toMatchObject({
      phase: "spray",
      sprayElapsed: 0
    });

    runtime.updateAction(0.2);
    expect(callbacks.applyImpact).toHaveBeenCalledTimes(1);
    expect(session.charmanderFireAction).toMatchObject({
      impactApplied: true
    });

    runtime.updateAction(0.3);
    expect(callbacks.applyImpact).toHaveBeenCalledTimes(1);
    expect(session.charmanderFireAction).toBeNull();
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

    expect(session.charmanderFireAction).toBeNull();
    expect(callbacks.onBlocked).toHaveBeenCalledTimes(1);
    expect(callbacks.syncCharmander).toHaveBeenCalledTimes(2);
  });
});
