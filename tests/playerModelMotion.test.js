import { describe, expect, it, vi } from "vitest";

import {
  advancePlayerJumpFlipRoll,
  advancePlayerWalkCycle,
  getPlayerModelYawFromMovement,
  getPlayerWalkArmBackOffset,
  getPlayerWalkBodyLift,
  getPlayerWalkFootRoll,
  getPlayerWalkLegArcOffset
} from "../app/runtime/playerModelMotion.js";

describe("player model motion", () => {
  it("resolves model yaw from movement delta and face offset", () => {
    expect(getPlayerModelYawFromMovement({
      deltaX: 1,
      deltaZ: 0,
      modelFaceYawOffset: 0.25
    })).toBeCloseTo(0.25);
    expect(getPlayerModelYawFromMovement({
      deltaX: 0,
      deltaZ: 1,
      modelFaceYawOffset: 0.25
    })).toBeCloseTo(Math.PI * 0.5 + 0.25);
  });

  it("computes leg arc offsets and foot roll from phase", () => {
    expect(getPlayerWalkLegArcOffset({
      yaw: 0,
      phase: Math.PI * 0.5,
      blend: 0.5,
      footKickStride: 0.28,
      footKickLift: 0.2
    })).toEqual([0.14, 0.1, 0]);

    const sideOffset = getPlayerWalkLegArcOffset({
      yaw: Math.PI * 0.5,
      phase: Math.PI * 0.5,
      blend: 0.5,
      footKickStride: 0.28,
      footKickLift: 0.2
    });

    expect(sideOffset[0]).toBeCloseTo(0);
    expect(sideOffset[1]).toBeCloseTo(0.1);
    expect(sideOffset[2]).toBeCloseTo(0.14);
    expect(getPlayerWalkFootRoll({
      phase: Math.PI * 0.5,
      blend: 0.5,
      footPendulumRoll: 0.42
    })).toBeCloseTo(-0.21);
  });

  it("computes body lift and arm offset from walk blend", () => {
    expect(getPlayerWalkBodyLift({
      phase: 0,
      blend: 0.5,
      bodyBob: 0.075
    })).toBeCloseTo(0.0375);

    const armOffset = getPlayerWalkArmBackOffset({
      yaw: 0,
      blend: 0.5,
      armBackOffset: 0.17,
      armLift: 0.045
    });

    expect(armOffset[0]).toBeCloseTo(-0.085);
    expect(armOffset[1]).toBeCloseTo(0.0225);
    expect(armOffset[2]).toBeCloseTo(0);
  });

  it("advances walk speed and phase with the supplied moveValueToward", () => {
    const moveValueToward = vi.fn((current, target, maxStep) => {
      if (Math.abs(target - current) <= maxStep) {
        return target;
      }
      return current + Math.sign(target - current) * maxStep;
    });

    expect(advancePlayerWalkCycle({
      currentSpeed: 0,
      currentPhase: 1,
      deltaTime: 0.25,
      isWalking: true,
      cycleSpeed: 25,
      acceleration: 88,
      deceleration: 38,
      moveValueToward
    })).toEqual({
      speed: 22,
      phase: 6.5,
      blend: 0.88
    });
    expect(moveValueToward).toHaveBeenCalledWith(0, 25, 22);
  });

  it("keeps walk phase moving while decelerating above the idle threshold", () => {
    expect(advancePlayerWalkCycle({
      currentSpeed: 1,
      currentPhase: 2,
      deltaTime: 0.01,
      isWalking: false,
      cycleSpeed: 25,
      acceleration: 88,
      deceleration: 38,
      moveValueToward: () => 0.62
    })).toEqual({
      speed: 0.62,
      phase: 2.0062,
      blend: 0.0248
    });

    expect(advancePlayerWalkCycle({
      currentSpeed: 0.001,
      currentPhase: 2,
      deltaTime: 0.01,
      isWalking: false,
      cycleSpeed: 25,
      acceleration: 88,
      deceleration: 38,
      moveValueToward: () => 0.001
    })).toEqual({
      speed: 0.001,
      phase: 2,
      blend: 0.00004
    });
  });

  it("advances jump flip elapsed and returns roll", () => {
    expect(advancePlayerJumpFlipRoll({
      elapsed: 0.1,
      deltaTime: 0.1,
      duration: 0.5,
      rotation: Math.PI * 2
    })).toEqual({
      elapsed: 0.2,
      roll: -(Math.PI * 2) * 0.4
    });

    expect(advancePlayerJumpFlipRoll({
      elapsed: Number.NaN,
      deltaTime: 0.1,
      duration: 0.5,
      rotation: Math.PI * 2
    })).toEqual({
      elapsed: 0.5,
      roll: 0
    });
  });
});
