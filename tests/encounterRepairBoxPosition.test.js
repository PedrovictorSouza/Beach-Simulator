import { describe, expect, it } from "vitest";

import { getEncounterRepairBoxPosition } from "../app/runtime/encounterRepairBoxPosition.js";

describe("getEncounterRepairBoxPosition", () => {
  it("prefers the explicit repair box position", () => {
    const repairBoxPosition = [1, 0, 2];

    expect(getEncounterRepairBoxPosition({
      repairBoxPosition,
      repairPosition: [3, 0, 4]
    })).toBe(repairBoxPosition);
  });

  it("falls back to the encounter repair position", () => {
    const repairPosition = [3, 0, 4];

    expect(getEncounterRepairBoxPosition({ repairPosition })).toBe(repairPosition);
  });

  it("returns null when the encounter has no repair position", () => {
    expect(getEncounterRepairBoxPosition()).toBeNull();
    expect(getEncounterRepairBoxPosition({})).toBeNull();
  });
});
