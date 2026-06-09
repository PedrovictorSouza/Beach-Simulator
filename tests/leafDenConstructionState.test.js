import { describe, expect, it } from "vitest";

import {
  getLeafDenConstructionProgress,
  isLeafDenBusyCompanionTarget,
  isLeafDenConstructionActive
} from "../app/runtime/construction/leafDenConstructionState.js";

describe("Leaf Den construction state", () => {
  it("is active only while construction has started, is not built and has a position", () => {
    expect(isLeafDenConstructionActive({
      storyState: {
        flags: {
          leafDenConstructionStarted: true,
          leafDenBuilt: false
        }
      },
      leafDen: {
        position: [2, 0.1, 3]
      }
    })).toBe(true);

    expect(isLeafDenConstructionActive({
      storyState: {
        flags: {
          leafDenConstructionStarted: true,
          leafDenBuilt: true
        }
      },
      leafDen: {
        position: [2, 0.1, 3]
      }
    })).toBe(false);

    expect(isLeafDenConstructionActive({
      storyState: {
        flags: {
          leafDenConstructionStarted: true,
          leafDenBuilt: false
        }
      },
      leafDen: null
    })).toBe(false);
  });

  it("calculates clamped construction progress from story flags", () => {
    const storyState = {
      flags: {
        leafDenConstructionStartedAt: 1000,
        leafDenConstructionCompletesAt: 3000
      }
    };

    expect(getLeafDenConstructionProgress({ storyState, nowMs: 500 })).toBe(0);
    expect(getLeafDenConstructionProgress({ storyState, nowMs: 2000 })).toBe(0.5);
    expect(getLeafDenConstructionProgress({ storyState, nowMs: 4000 })).toBe(1);
  });

  it("returns zero progress for invalid construction timestamps", () => {
    expect(getLeafDenConstructionProgress({
      storyState: {
        flags: {
          leafDenConstructionStartedAt: 1000,
          leafDenConstructionCompletesAt: 1000
        }
      },
      nowMs: 2000
    })).toBe(0);
  });

  it("treats only Charmander and Timburr as busy construction companions", () => {
    expect(isLeafDenBusyCompanionTarget({
      active: true,
      target: {
        kind: "pokemonCompanion",
        id: "charmander"
      }
    })).toBe(true);
    expect(isLeafDenBusyCompanionTarget({
      active: true,
      target: {
        kind: "pokemonCompanion",
        id: "timburr"
      }
    })).toBe(true);
    expect(isLeafDenBusyCompanionTarget({
      active: true,
      target: {
        kind: "pokemonCompanion",
        id: "squirtle"
      }
    })).toBe(false);
    expect(isLeafDenBusyCompanionTarget({
      active: false,
      target: {
        kind: "pokemonCompanion",
        id: "charmander"
      }
    })).toBe(false);
  });
});
