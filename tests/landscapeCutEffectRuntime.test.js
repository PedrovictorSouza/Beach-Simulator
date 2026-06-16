import { describe, expect, it } from "vitest";

import { createLandscapeCutEffectRuntime } from "../app/runtime/landscapeCutEffectRuntime.js";

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const lerp = (from, to, amount) => from + (to - from) * amount;
const easeOutCubic = (value) => 1 - Math.pow(1 - clamp01(value), 3);

function createRuntime() {
  return createLandscapeCutEffectRuntime({
    clamp01,
    easeOutCubic,
    lerp,
    getNowMs: () => 123.45,
    config: {
      duration: 1,
      lerpPortion: 0.25,
      lift: 2,
      popScale: 1.4
    }
  });
}

function getEffects(runtime) {
  const effects = [];
  runtime.forEachEffect((effect, pose) => {
    effects.push({ effect, pose });
  });
  return effects;
}

describe("createLandscapeCutEffectRuntime", () => {
  it("queues a cloned patch with the existing identifier shape", () => {
    const runtime = createRuntime();
    const patch = {
      id: "grass-a",
      position: [1, 2, 3],
      size: [4, 5]
    };

    runtime.queue(patch);
    patch.position[0] = 9;
    patch.size[0] = 9;

    expect(getEffects(runtime)).toEqual([
      {
        effect: {
          id: "landscape-cut-grass-a-123.5",
          patch: {
            id: "grass-a",
            position: [1, 2, 3],
            size: [4, 5]
          },
          elapsed: 0,
          duration: 1
        },
        pose: {
          alpha: 1,
          scale: 1,
          yOffset: 0
        }
      }
    ]);
  });

  it("uses the existing fallback patch size", () => {
    const runtime = createRuntime();

    runtime.queue({
      cellId: "ground-a",
      position: [1, 2, 3]
    });

    expect(getEffects(runtime)[0].effect.patch.size).toEqual([1.18, 0.96]);
  });

  it("updates the two pose phases and removes expired effects", () => {
    const runtime = createRuntime();

    runtime.queue({
      id: "grass-a",
      position: [1, 2, 3]
    });
    runtime.update(0.125);

    const firstPhasePose = getEffects(runtime)[0].pose;
    expect(firstPhasePose.alpha).toBe(1);
    expect(firstPhasePose.scale).toBeCloseTo(0.755);
    expect(firstPhasePose.yOffset).toBeCloseTo(0.7875);

    runtime.update(0.375);

    const secondPhasePose = getEffects(runtime)[0].pose;
    expect(secondPhasePose.alpha).toBeCloseTo(0.296296);
    expect(secondPhasePose.scale).toBeCloseTo(1.198519);
    expect(secondPhasePose.yOffset).toBeCloseTo(1.674074);

    runtime.update(0.5);

    expect(getEffects(runtime)).toEqual([]);
  });

  it("ignores invalid patches and keeps runtime instances independent", () => {
    const first = createRuntime();
    const second = createRuntime();

    first.queue(null);
    first.queue({ id: "missing-position" });
    first.queue({ id: "grass-a", position: [1, 2, 3] });

    expect(getEffects(first)).toHaveLength(1);
    expect(getEffects(second)).toEqual([]);
  });

  it("appends model renderables for active leafage landscape cut effects", () => {
    const runtime = createRuntime();
    const session = {
      leafageGardenModel: "garden-model",
      leafageGardenInstances: [],
      leafageGardenModelScale: 2,
      leafageGardenModelFaceYawOffset: 0.25
    };
    const nextFrame = {
      render: {
        grassBillboards: []
      }
    };

    runtime.queue({
      id: "garden-a",
      state: "alive",
      leafageObjectId: "garden1",
      position: [1, 2, 3],
      size: [4, 5]
    });

    runtime.appendRenderables({
      nextFrame,
      session,
      getTallGrassYaw: () => 0.5,
      getTallGrassInstanceScale: (_model, _patch, scale) => scale * 3
    });

    expect(session.leafageGardenInstances).toEqual([
      {
        id: "landscape-cut-garden-a-123.5-garden",
        offset: [1, 2, 3],
        scale: 6,
        alpha: 1,
        yaw: 0.75,
        swayStrength: 0
      }
    ]);
    expect(nextFrame.render.grassBillboards).toEqual([]);
  });

  it("falls back to grass billboards when no matching model instances exist", () => {
    const runtime = createRuntime();
    const session = {
      deadGrassTexture: "dead-texture",
      greenGrassTexture: "green-texture"
    };
    const nextFrame = {
      render: {
        grassBillboards: []
      }
    };

    runtime.queue({
      id: "dead-grass-a",
      state: "dead",
      position: [1, 2, 3],
      size: [4, 5]
    });

    runtime.appendRenderables({
      nextFrame,
      session,
      getTallGrassYaw: () => 0.5,
      getTallGrassInstanceScale: (_model, _patch, scale) => scale * 3
    });

    expect(nextFrame.render.grassBillboards).toEqual([
      {
        texture: "dead-texture",
        position: [1, 2, 3],
        size: [4, 5],
        alpha: 1
      }
    ]);
  });
});
