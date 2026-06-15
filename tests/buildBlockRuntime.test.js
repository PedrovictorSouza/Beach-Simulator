import { describe, expect, it, vi } from "vitest";

import { createBuildBlockRuntime } from "../app/runtime/fieldMoveRuntime/buildBlockRuntime.js";

function createHarness(overrides = {}) {
  const timburr = {
    modelFaceYawOffset: 0.25,
    modelInstance: {
      yaw: 0
    },
    position: [0, 0.04, 0],
    visible: true,
    ...overrides.timburr
  };
  const target = {
    targetCell: { x: 1, z: 2 },
    targetPosition: [1, 0.04, 2],
    valid: true,
    reason: null,
    ...overrides.target
  };
  const session = {
    lastTimburrBuildBlockInvalidReason: null,
    timburrBuildBlockAction: null,
    timburrEncounter: timburr,
    ...overrides.session
  };
  const controls = {
    playerSkills: {
      buildBlock: true
    },
    storyState: {
      flags: {
        timburrRevealed: true
      }
    },
    ...overrides.controls
  };
  const callbacks = {
    applyImpact: vi.fn(() => true),
    getApproachBlockers: vi.fn(() => []),
    getApproachPosition: vi.fn(() => [0, 0.04, 0]),
    getModelYawToward: vi.fn(() => 1.5),
    onBlocked: vi.fn(),
    resolveTarget: vi.fn(() => target),
    shouldCastFromBlockedApproach: vi.fn(() => false),
    tryMoveCompanionToPosition: vi.fn((companion, nextPosition) => {
      companion.position = nextPosition;
      return true;
    }),
    ...overrides.callbacks
  };
  const runtime = createBuildBlockRuntime({
    session,
    controls,
    ...callbacks,
    config: {
      arriveDistance: 0.08,
      castDuration: 0.5,
      impactTime: 0.2,
      speed: 4,
      modelFaceYawOffset: 0.25,
      ...overrides.config
    }
  });

  return {
    callbacks,
    controls,
    runtime,
    session,
    target,
    timburr
  };
}

describe("createBuildBlockRuntime", () => {
  it("starts a Builder Bot Build Block action with the existing action shape", () => {
    const { callbacks, runtime, session, target } = createHarness();

    expect(runtime.startAction({
      playerPosition: [0, 0.04, 1]
    })).toBe("started");

    expect(session.lastTimburrBuildBlockInvalidReason).toBeNull();
    expect(session.timburrBuildBlockAction).toMatchObject({
      phase: "approach",
      targetCell: target.targetCell,
      targetPosition: target.targetPosition,
      approachPosition: [0, 0.04, 0],
      castElapsed: 0,
      impactApplied: false,
      castFromBlockedApproach: false
    });
    expect(callbacks.resolveTarget).toHaveBeenCalledWith([0, 0.04, 1]);
  });

  it("returns locked, unavailable and target validation failures without starting", () => {
    const lockedHarness = createHarness({
      controls: {
        playerSkills: { buildBlock: false },
        storyState: { flags: { timburrRevealed: true } }
      }
    });
    expect(lockedHarness.runtime.startAction()).toBe("locked");

    const unavailableHarness = createHarness({
      timburr: {
        visible: false
      }
    });
    expect(unavailableHarness.runtime.startAction()).toBe("unavailable");

    const missingMaterialHarness = createHarness({
      target: {
        valid: false,
        reason: "missing-material"
      }
    });
    expect(missingMaterialHarness.runtime.startAction()).toBe("missing-material");
    expect(missingMaterialHarness.session.lastTimburrBuildBlockInvalidReason).toBe("missing-material");

    const invalidHarness = createHarness({
      target: {
        valid: false,
        reason: "blocked"
      }
    });
    expect(invalidHarness.runtime.startAction()).toBe("invalid");
    expect(invalidHarness.session.lastTimburrBuildBlockInvalidReason).toBe("blocked");
  });

  it("transitions from approach to cast, applies impact once, and clears after the cast", () => {
    const { callbacks, runtime, session } = createHarness();

    runtime.startAction();
    runtime.updateAction(0.016, 1000);

    expect(session.timburrBuildBlockAction).toMatchObject({
      phase: "cast",
      castElapsed: 0
    });

    runtime.updateAction(0.2, 1200);
    expect(callbacks.applyImpact).toHaveBeenCalledTimes(1);
    expect(callbacks.applyImpact).toHaveBeenCalledWith(
      expect.objectContaining({ impactApplied: true }),
      1200
    );

    runtime.updateAction(0.3, 1500);
    expect(callbacks.applyImpact).toHaveBeenCalledTimes(1);
    expect(session.timburrBuildBlockAction).toBeNull();
  });

  it("updates yaw while approaching and cancels blocked paths that cannot cast from the blocker", () => {
    const { callbacks, runtime, session, timburr } = createHarness({
      callbacks: {
        getApproachPosition: vi.fn(() => [1, 0.04, 0]),
        tryMoveCompanionToPosition: vi.fn((companion, nextPosition) => {
          companion.position = nextPosition;
          return true;
        })
      }
    });

    runtime.startAction();
    runtime.updateAction(0.1, 1000);

    expect(timburr.modelInstance.yaw).toBe(1.5);
    expect(callbacks.getModelYawToward).toHaveBeenCalledWith(
      [0, 0.04, 0],
      expect.any(Array),
      0.25
    );

    const blockedHarness = createHarness({
      callbacks: {
        getApproachPosition: vi.fn(() => [1, 0.04, 0]),
        getApproachBlockers: vi.fn(() => [{ id: "wall" }]),
        tryMoveCompanionToPosition: vi.fn(() => false)
      }
    });
    blockedHarness.runtime.startAction();
    blockedHarness.runtime.updateAction(0.25, 1000);

    expect(blockedHarness.session.timburrBuildBlockAction).toBeNull();
    expect(blockedHarness.callbacks.onBlocked).toHaveBeenCalledTimes(1);
  });

  it("casts from a blocked approach when the blocker policy allows it", () => {
    const { callbacks, runtime, session } = createHarness({
      callbacks: {
        getApproachBlockers: vi.fn(() => [{ id: "target-block" }]),
        shouldCastFromBlockedApproach: vi.fn(() => true)
      }
    });

    expect(runtime.startAction()).toBe("started");

    expect(callbacks.shouldCastFromBlockedApproach).toHaveBeenCalledWith([
      { id: "target-block" }
    ]);
    expect(session.timburrBuildBlockAction).toMatchObject({
      phase: "cast",
      castFromBlockedApproach: true
    });
  });
});
