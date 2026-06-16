import { describe, expect, it } from "vitest";

import { createCompanionFacingRuntime } from "../app/runtime/companions/companionFacingRuntime.js";

describe("companion facing runtime", () => {
  it("resolves model yaw toward a target using the supplied companion offsets", () => {
    const runtime = createCompanionFacingRuntime({
      offsets: {
        squirtle: 0.25
      }
    });

    expect(runtime.getSquirtleModelYawToward([0, 0, 0], [0, 0, 1])).toBeCloseTo(0.25);
    expect(runtime.getSquirtleModelYawToward([0, 0, 0], [1, 0, 0])).toBeCloseTo(
      Math.PI * 0.5 + 0.25
    );
  });

  it("resolves generic robot model yaw with the supplied call-site offset", () => {
    const runtime = createCompanionFacingRuntime();

    expect(runtime.getRobotModelYawToward([0, 0, 0], [1, 0, 0], 0.75)).toBeCloseTo(
      Math.PI * 0.5 + 0.75
    );
  });

  it("reads logical facing yaw from the session model instances", () => {
    const runtime = createCompanionFacingRuntime({
      session: {
        actTwoSquirtle: { modelInstance: { yaw: 1.5 } },
        charmanderEncounter: { modelInstance: { yaw: 2.5 } },
        bulbasaurEncounter: { modelInstance: { yaw: 3.5 } }
      },
      offsets: {
        squirtle: 0.25,
        charmander: 0.5,
        bulbasaur: 0.75
      }
    });

    expect(runtime.getSquirtleLogicalFacingYaw()).toBeCloseTo(1.25);
    expect(runtime.getCharmanderLogicalFacingYaw()).toBeCloseTo(2);
    expect(runtime.getBulbasaurLogicalFacingYaw()).toBeCloseTo(2.75);
  });

  it("falls back to zero model yaw for missing encounters", () => {
    const runtime = createCompanionFacingRuntime({
      offsets: {
        squirtle: 0.25,
        charmander: 0.5,
        bulbasaur: 0.75
      }
    });

    expect(runtime.getSquirtleLogicalFacingYaw()).toBeCloseTo(-0.25);
    expect(runtime.getCharmanderLogicalFacingYaw()).toBeCloseTo(-0.5);
    expect(runtime.getBulbasaurLogicalFacingYaw()).toBeCloseTo(-0.75);
  });
});
