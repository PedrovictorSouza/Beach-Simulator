import { describe, expect, it } from "vitest";

import { isOpeningLeppaTreeRequestActive } from "../app/runtime/openingLeppaTreeRequest.js";

describe("isOpeningLeppaTreeRequestActive", () => {
  it("is active only after Squirtle asks for Leppa and before the tree is revived", () => {
    expect(isOpeningLeppaTreeRequestActive()).toBe(false);
    expect(isOpeningLeppaTreeRequestActive({ flags: {} })).toBe(false);
    expect(isOpeningLeppaTreeRequestActive({
      flags: {
        squirtleLeppaRequestAvailable: true
      }
    })).toBe(true);
    expect(isOpeningLeppaTreeRequestActive({
      flags: {
        squirtleLeppaRequestAvailable: true,
        leppaTreeRevived: true
      }
    })).toBe(false);
  });
});
