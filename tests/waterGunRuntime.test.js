import { describe, expect, it, vi } from "vitest";

import { createWaterGunRuntime } from "../app/runtime/fieldMoveRuntime/waterGunRuntime.js";

function createResources(overrides = {}) {
  const resources = {
    stamina: {
      charging: false,
      current: 3,
      ...overrides.stamina
    },
    beginSquirtleWaterRecharge: vi.fn(() => {
      resources.stamina.current = 0;
      resources.stamina.charging = true;
    }),
    consumeSquirtleWaterStamina: vi.fn(() => {
      if (resources.stamina.charging || resources.stamina.current <= 0) {
        resources.beginSquirtleWaterRecharge();
        return false;
      }

      resources.stamina.current = Math.max(0, resources.stamina.current - 1);
      return true;
    }),
    getSquirtleWaterGunImpactTime: vi.fn(() => 0.2),
    getSquirtleWaterGunSpeedMultiplier: vi.fn(() => 1),
    getSquirtleWaterGunSprayDuration: vi.fn(() => 0.5),
    getSquirtleWaterStaminaState: vi.fn(() => resources.stamina),
    isSquirtleWaterCharging: vi.fn(() => resources.stamina.charging),
    ...overrides.methods
  };

  return resources;
}

function createHarness(overrides = {}) {
  const squirtle = {
    recovered: true,
    modelInstance: {
      active: false,
      offset: [0, 0.04, 0],
      yaw: 0
    },
    position: [0, 0.04, 0],
    ...overrides.squirtle
  };
  const groundCell = {
    id: "ground-a",
    offset: [1, 0, 0],
    ...overrides.groundCell
  };
  const session = {
    actTwoSquirtle: squirtle,
    groundDeadInstances: [groundCell],
    squirtleWaterGunAction: null,
    squirtleWaterGunQueue: [],
    ...overrides.session
  };
  const resources = overrides.resources || createResources();
  const callbacks = {
    applyImpact: vi.fn(() => true),
    getApproachPosition: vi.fn(() => [0, 0.04, 0]),
    getGroundCellCenterPosition: vi.fn((cell) => [
      cell.offset[0],
      cell.offset[1] + 0.04,
      cell.offset[2]
    ]),
    getModelYawToward: vi.fn(() => 1.25),
    getPlayerPosition: vi.fn(() => [9, 0.04, 9]),
    isPositionBlocked: vi.fn(() => false),
    onBlocked: vi.fn(),
    syncSquirtle: vi.fn(),
    tryMoveCompanionToPosition: vi.fn((companion, nextPosition) => {
      companion.position = nextPosition;
      return true;
    }),
    ...overrides.callbacks
  };
  const runtime = createWaterGunRuntime({
    session,
    resources,
    ...callbacks,
    config: {
      arriveDistance: 0.08,
      speed: 4,
      ...overrides.config
    }
  });

  return {
    callbacks,
    groundCell,
    resources,
    runtime,
    session,
    squirtle
  };
}

describe("createWaterGunRuntime", () => {
  it("starts a Water Gun action and queues later distinct targets", () => {
    const { callbacks, groundCell, runtime, session, squirtle } = createHarness();
    const queuedCell = {
      id: "ground-b",
      offset: [2, 0, 0]
    };

    expect(runtime.startAction({
      groundCell,
      playerPosition: [0, 0.04, 1]
    })).toBe("started");
    expect(session.squirtleWaterGunAction).toMatchObject({
      phase: "approach",
      groundCell,
      targetPosition: [1, 0.04, 0],
      approachPosition: [0, 0.04, 0],
      speedMultiplier: 1,
      sprayDuration: 0.5,
      impactTime: 0.2,
      sprayElapsed: 0,
      impactApplied: false
    });
    expect(squirtle.modelInstance).toMatchObject({
      active: true,
      yaw: 1.25
    });
    expect(callbacks.syncSquirtle).toHaveBeenCalledTimes(1);

    expect(runtime.startAction({ groundCell: queuedCell })).toBe("queued");
    expect(runtime.getQueue()).toHaveLength(1);
    expect(runtime.startAction({ groundCell: queuedCell })).toBe("duplicate");
    expect(runtime.isCellPending(queuedCell)).toBe(true);
  });

  it("transitions from approach to spray, applies impact once, and clears after the spray", () => {
    const { callbacks, groundCell, resources, runtime, session } = createHarness();

    runtime.startAction({ groundCell });
    runtime.updateAction(0.016);

    expect(session.squirtleWaterGunAction).toMatchObject({
      phase: "spray",
      sprayElapsed: 0
    });
    expect(resources.consumeSquirtleWaterStamina).toHaveBeenCalledTimes(1);

    runtime.updateAction(0.2);
    expect(callbacks.applyImpact).toHaveBeenCalledTimes(1);
    expect(session.squirtleWaterGunAction).toMatchObject({
      impactApplied: true
    });

    runtime.updateAction(0.3);
    expect(callbacks.applyImpact).toHaveBeenCalledTimes(1);
    expect(session.squirtleWaterGunAction).toBeNull();
  });

  it("starts the next queued dead-ground target when a spray finishes", () => {
    const groundCell = {
      id: "ground-a",
      offset: [1, 0, 0]
    };
    const queuedCell = {
      id: "ground-b",
      offset: [2, 0, 0]
    };
    const skippedCell = {
      id: "ground-c",
      offset: [3, 0, 0]
    };
    const { runtime, session } = createHarness({
      groundCell,
      session: {
        groundDeadInstances: [groundCell, queuedCell]
      }
    });

    runtime.startAction({ groundCell });
    runtime.enqueueAction({ groundCell: skippedCell });
    runtime.enqueueAction({ groundCell: queuedCell });
    runtime.updateAction(0.016);
    runtime.updateAction(0.5);

    expect(session.squirtleWaterGunAction).toMatchObject({
      phase: "approach",
      groundCell: queuedCell
    });
    expect(runtime.getQueue()).toEqual([]);
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

    expect(session.squirtleWaterGunAction).toBeNull();
    expect(callbacks.onBlocked).toHaveBeenCalledTimes(1);
    expect(callbacks.syncSquirtle).toHaveBeenCalledTimes(2);
  });
});
