import { describe, expect, it } from "vitest";

import {
  getNearbyRepairBoxPrompt,
  getRepairBoxPromptPosition
} from "../app/runtime/repairBoxPromptTargets.js";

describe("repair box prompt targets", () => {
  it("resolves prompt position from encounter position, base offset, then offset", () => {
    const encounter = {
      repairModuleInstance: {
        baseOffset: [4, 5, 6],
        offset: [7, 8, 9]
      }
    };

    expect(getRepairBoxPromptPosition({
      encounter,
      getEncounterRepairBoxPosition: () => [1, 2, 3]
    })).toEqual([1, 2, 3]);
    expect(getRepairBoxPromptPosition({
      encounter,
      getEncounterRepairBoxPosition: () => null
    })).toEqual([4, 5, 6]);
    expect(getRepairBoxPromptPosition({
      encounter: {
        repairModuleInstance: {
          offset: [7, 8, 9]
        }
      },
      getEncounterRepairBoxPosition: () => null
    })).toEqual([7, 8, 9]);
  });

  it("selects the nearest active prompt within range", () => {
    const prompt = getNearbyRepairBoxPrompt({
      playerPosition: [0, 0, 0],
      promptDistance: 3,
      repairBoxTargets: [
        {
          name: "Hydro",
          encounter: {
            repairModuleInstance: {
              active: true,
              offset: [2.5, 0, 0]
            }
          }
        },
        {
          name: "Grow",
          encounter: {
            repairModuleInstance: {
              active: true,
              offset: [1, 0, 0]
            }
          }
        }
      ],
      getEncounterRepairBoxPosition: () => null
    });

    expect(prompt).toEqual({
      text: "Grow",
      worldPosition: [1, 0, 0]
    });
  });

  it("skips inactive, out-of-range and invalid prompt targets", () => {
    expect(getNearbyRepairBoxPrompt({
      playerPosition: [0, 0, 0],
      promptDistance: 1,
      repairBoxTargets: [
        {
          name: "Inactive",
          encounter: {
            repairModuleInstance: {
              active: false,
              offset: [0, 0, 0]
            }
          }
        },
        {
          name: "Far",
          encounter: {
            repairModuleInstance: {
              active: true,
              offset: [2, 0, 0]
            }
          }
        },
        {
          name: "Invalid",
          encounter: {
            repairModuleInstance: {
              active: true
            }
          }
        }
      ],
      getEncounterRepairBoxPosition: () => null
    })).toBeNull();
    expect(getNearbyRepairBoxPrompt({
      playerPosition: null,
      repairBoxTargets: []
    })).toBeNull();
  });
});
