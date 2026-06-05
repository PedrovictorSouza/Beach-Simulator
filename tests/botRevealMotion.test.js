import { describe, expect, it } from "vitest";

import {
  getBotRevealLandingPosition,
  getBotRevealOriginPosition,
  isRevealBoxBotVisible,
  revealBotAtRepairPosition,
  setRevealBoxBotVisible,
  updateBotRevealFall
} from "../app/runtime/botRevealMotion.js";

describe("bot reveal motion", () => {
  it("resolves landing position from repair position without sharing arrays", () => {
    const encounter = {
      repairPosition: [1, 0.2, 3]
    };

    const landingPosition = getBotRevealLandingPosition(encounter);

    expect(landingPosition).toEqual([1, 0.2, 3]);
    expect(landingPosition).not.toBe(encounter.repairPosition);
    expect(getBotRevealLandingPosition({})).toBeNull();
  });

  it("resolves fall origin from repair box position before landing position", () => {
    const encounter = {
      repairPosition: [1, 0.2, 3]
    };

    expect(getBotRevealOriginPosition({
      encounter,
      getRepairBoxPosition: () => [4, 0.5, 6],
      fallHeight: 2
    })).toEqual([4, 2.5, 6]);

    expect(getBotRevealOriginPosition({
      encounter,
      getRepairBoxPosition: () => null,
      fallHeight: 2
    })).toEqual([1, 2.2, 3]);
  });

  it("reveals a bot immediately or from a falling origin", () => {
    const instantEncounter = {
      repairPosition: [1, 0.2, 3]
    };

    expect(revealBotAtRepairPosition({ encounter: instantEncounter })).toBe(true);
    expect(instantEncounter).toEqual({
      repairPosition: [1, 0.2, 3],
      visible: true,
      jumpTimer: 0,
      originPosition: null,
      landingPosition: null,
      position: [1, 0.2, 3]
    });

    const fallingEncounter = {
      repairPosition: [1, 0.2, 3]
    };

    expect(revealBotAtRepairPosition({
      encounter: fallingEncounter,
      falling: true,
      getRepairBoxPosition: () => [4, 0.5, 6],
      fallHeight: 2
    })).toBe(true);
    expect(fallingEncounter).toEqual({
      repairPosition: [1, 0.2, 3],
      visible: true,
      jumpTimer: 0,
      originPosition: [4, 2.5, 6],
      landingPosition: [1, 0.2, 3],
      position: [4, 2.5, 6]
    });

    expect(revealBotAtRepairPosition({ encounter: {} })).toBe(false);
  });

  it("keeps reveal box visibility compatible with old flag names", () => {
    expect(isRevealBoxBotVisible(null)).toBe(false);
    expect(isRevealBoxBotVisible({ botVisible: true })).toBe(true);
    expect(isRevealBoxBotVisible({ bulbasaurVisible: true })).toBe(true);

    const opening = {};
    setRevealBoxBotVisible(opening);

    expect(opening).toEqual({
      botVisible: true,
      bulbasaurVisible: true
    });
  });

  it("updates falling position and clears fall state when settled", () => {
    const opening = {
      botVisible: true,
      visibleProgress: 0.2,
      fallEndProgress: 0.7
    };
    const encounter = {
      originPosition: [0, 2, 0],
      landingPosition: [2, 0, 0]
    };
    const clamp01 = (value) => Math.min(1, Math.max(0, value));

    updateBotRevealFall({
      opening,
      encounter,
      progress: 0.45,
      clamp01
    });

    expect(encounter.position[0]).toBeCloseTo(0.5);
    expect(encounter.position[1]).toBeCloseTo(1.66);
    expect(encounter.position[2]).toBeCloseTo(0);

    updateBotRevealFall({
      opening,
      encounter,
      progress: 0.7,
      clamp01
    });

    expect(encounter.position).toEqual([2, 0, 0]);
    expect(encounter.originPosition).toBeNull();
    expect(encounter.landingPosition).toBeNull();
  });

  it("does not move when the bot is hidden or fall positions are missing", () => {
    const hiddenEncounter = {
      originPosition: [0, 2, 0],
      landingPosition: [2, 0, 0]
    };

    updateBotRevealFall({
      opening: {},
      encounter: hiddenEncounter,
      progress: 1
    });

    expect(hiddenEncounter.position).toBeUndefined();

    const visibleEncounter = {};
    updateBotRevealFall({
      opening: { botVisible: true },
      encounter: visibleEncounter,
      progress: 1
    });

    expect(visibleEncounter.position).toBeUndefined();
  });
});
