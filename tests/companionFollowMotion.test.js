import { describe, expect, it } from "vitest";
import {
  resolveCompanionFollowDistance,
  resolveCompanionFollowSpeed
} from "../app/runtime/companionFollowMotion.js";
import { ACT_TWO_PLAYER_SPEED } from "../app/session/configurePlayerSpawner.js";

describe("companion follow motion", () => {
  it("keeps the selected field-move companion closest to the player", () => {
    expect(resolveCompanionFollowDistance({
      companionId: "squirtle",
      activeMoveId: "waterGun",
      defaultDistance: 1.18
    })).toBeLessThan(resolveCompanionFollowDistance({
      companionId: "bulbasaur",
      activeMoveId: "waterGun",
      defaultDistance: 1.46
    }));

    expect(resolveCompanionFollowDistance({
      companionId: "bulbasaur",
      activeMoveId: "leafage",
      defaultDistance: 1.46
    })).toBeLessThan(resolveCompanionFollowDistance({
      companionId: "squirtle",
      activeMoveId: "leafage",
      defaultDistance: 1.18
    }));
  });

  it("uses fixed formation slots before active move spacing", () => {
    const firstSlot = resolveCompanionFollowDistance({
      companionId: "squirtle",
      activeMoveId: "waterGun",
      defaultDistance: 1.18,
      formationIndex: 0
    });
    const secondSlot = resolveCompanionFollowDistance({
      companionId: "bulbasaur",
      activeMoveId: "waterGun",
      defaultDistance: 1.46,
      formationIndex: 1
    });

    expect(firstSlot).toBe(1.18);
    expect(secondSlot).toBe(2.36);
  });

  it("uses the act-two player speed for follow speed", () => {
    expect(resolveCompanionFollowSpeed()).toBe(ACT_TWO_PLAYER_SPEED);
  });
});
