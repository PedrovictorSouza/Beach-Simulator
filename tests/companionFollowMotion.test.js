import { describe, expect, it } from "vitest";
import {
  resolveCompanionFollowFormationIds,
  resolveCompanionFollowFormationIndex,
  resolveCompanionFollowDistance,
  resolveCompanionFollowSpeed
} from "../app/runtime/companions/companionFollowMotion.js";
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

  it("puts the active field-move companion first in the follow formation", () => {
    const following = new Set(["squirtle", "bulbasaur", "charmander"]);

    expect(resolveCompanionFollowFormationIds({
      activeMoveId: "leafage",
      isFollowing: (companionId) => following.has(companionId)
    })).toEqual(["bulbasaur", "squirtle", "charmander"]);
  });

  it("filters companions that are not currently following", () => {
    const following = new Set(["squirtle", "charmander"]);

    expect(resolveCompanionFollowFormationIds({
      activeMoveId: "leafage",
      isFollowing: (companionId) => following.has(companionId)
    })).toEqual(["squirtle", "charmander"]);
  });

  it("returns null when a companion is outside the follow formation", () => {
    const following = new Set(["squirtle"]);

    expect(resolveCompanionFollowFormationIndex({
      companionId: "bulbasaur",
      activeMoveId: "leafage",
      isFollowing: (candidateId) => following.has(candidateId)
    })).toBeNull();
  });
});
