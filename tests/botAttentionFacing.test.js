import { describe, expect, it } from "vitest";
import { resolveBotAttentionFacing } from "../app/runtime/botAttentionFacing.js";

describe("bot attention facing", () => {
  it("faces a nearby player on the ground plane", () => {
    const facing = resolveBotAttentionFacing({
      botPosition: [0, 0.04, 0],
      playerPosition: [1, 0, 0],
      attentionDistance: 4.8
    });

    expect(facing?.distance).toBeCloseTo(1);
    expect(facing?.yaw).toBeCloseTo(Math.PI * 0.5);
  });

  it("keeps idle behavior when the player is too far away", () => {
    expect(resolveBotAttentionFacing({
      botPosition: [0, 0.04, 0],
      playerPosition: [5.2, 0, 0],
      attentionDistance: 4.8
    })).toBeNull();
  });

  it("preserves model-specific face offsets", () => {
    const facing = resolveBotAttentionFacing({
      botPosition: [0, 0.04, 0],
      playerPosition: [0, 0, 1],
      attentionDistance: 4.8,
      modelFaceYawOffset: Math.PI
    });

    expect(facing?.yaw).toBeCloseTo(Math.PI);
  });
});

