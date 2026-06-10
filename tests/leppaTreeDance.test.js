import { describe, expect, it } from "vitest";

import { updateLeppaTreeDance } from "../app/runtime/presentation/leppaTreeDance.js";

describe("Leppa tree dance", () => {
  it("does nothing when the tree has no dead instance", () => {
    expect(() => {
      updateLeppaTreeDance({
        leppaTree: {
          revived: true
        },
        now: 1000
      });
    }).not.toThrow();
  });

  it("resets sway while the Leppa tree is not revived", () => {
    const deadInstance = {
      swayStrength: 5
    };

    updateLeppaTreeDance({
      leppaTree: {
        revived: false,
        deadInstance
      },
      now: 1000
    });

    expect(deadInstance.swayStrength).toBe(0);
  });

  it("applies the existing revived Leppa tree sway tuning", () => {
    const deadInstance = {
      swayStrength: 0
    };

    updateLeppaTreeDance({
      leppaTree: {
        revived: true,
        deadInstance
      },
      now: 1000
    });

    expect(deadInstance.swayStrength).toBeCloseTo(Math.sin(1000 * 0.0056) * 0.28);
  });
});
