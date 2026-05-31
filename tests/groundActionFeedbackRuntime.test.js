import { describe, expect, it, vi } from "vitest";

import { createGroundActionFeedbackRuntime } from "../app/runtime/groundActionFeedbackRuntime.js";

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function createGroundCell(id, overrides = {}) {
  return {
    id,
    offset: [1, 0, 2],
    ...overrides
  };
}

function createRuntime(overrides = {}) {
  return createGroundActionFeedbackRuntime({
    clamp01,
    playInvalidSfx: vi.fn(),
    feedbackDurationMs: 1000,
    fieldToolTargetPulseDurationMs: 500,
    fieldToolTargetPulseMinScale: 0.7,
    fieldToolTargetPulseFlashBrightness: 0.4,
    ...overrides
  });
}

describe("createGroundActionFeedbackRuntime", () => {
  it("expires feedback at the configured duration", () => {
    const runtime = createRuntime();
    const groundCell = createGroundCell("ground-1");

    runtime.triggerFeedback(groundCell, "waterGun", 100);

    expect(runtime.getFeedbackFrame({ session: {}, now: 1099 })).not.toBeNull();
    expect(runtime.getFeedbackFrame({ session: {}, now: 1100 })).toBeNull();
  });

  it("deduplicates marked ground cells while preserving the feedback frame shape", () => {
    const runtime = createRuntime();

    runtime.triggerFeedback([
      createGroundCell("ground-1"),
      createGroundCell("ground-1"),
      createGroundCell("ground-2")
    ], "leafage", 100);

    expect(runtime.getFeedbackFrame({ session: {}, now: 200 })).toMatchObject({
      groundCell: {
        id: "ground-1",
        highlightTargetState: "valid",
        highlightAbilityId: "leafage"
      },
      markedGroundCells: [
        { id: "ground-1" },
        { id: "ground-2" }
      ],
      abilityId: "leafage"
    });
  });

  it("plays invalid feedback SFX", () => {
    const playInvalidSfx = vi.fn();
    const runtime = createRuntime({ playInvalidSfx });

    runtime.triggerInvalid(createGroundCell("ground-invalid"), 100);

    expect(playInvalidSfx).toHaveBeenCalledOnce();
    expect(runtime.getFeedbackFrame({ session: {}, now: 100 })).toMatchObject({
      abilityId: "invalid",
      groundCell: {
        highlightTargetState: "invalid",
        highlightAbilityId: "invalid"
      }
    });
  });

  it("consumes queued session feedback explicitly", () => {
    const runtime = createRuntime();
    const session = {
      groundActionFeedbackQueue: [{
        groundCell: createGroundCell("ground-queued"),
        abilityId: "fire",
        startedAt: 100
      }]
    };

    expect(runtime.getFeedbackFrame({ session, now: 200 })).toMatchObject({
      abilityId: "fire",
      groundCell: { id: "ground-queued" }
    });
    expect(session.groundActionFeedbackQueue).toEqual([]);
  });

  it("expires target pulses and clears their private state", () => {
    const runtime = createRuntime();
    const groundCell = createGroundCell("ground-pulse");

    expect(runtime.isPulseSource("gamepadPrimary")).toBe(true);
    expect(runtime.isPulseSource("keyboardPrimary")).toBe(true);
    expect(runtime.isPulseSource("gamepadBag")).toBe(false);

    runtime.triggerPulse("waterGun", 100);

    expect(runtime.getPulseFrame(groundCell, 350)).toMatchObject({
      groundCell,
      abilityId: "waterGun",
      progress: 0.5,
      scale: 0.85,
      brightness: 1.2
    });
    expect(runtime.getPulseFrame(groundCell, 600)).toBeNull();
    expect(runtime.getPulseFrame(groundCell, 601)).toBeNull();
  });
});
