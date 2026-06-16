import { describe, expect, it } from "vitest";
import {
  isCompanionFollowFormationMember,
  resolveCompanionFollowFormationIds,
  resolveCompanionFollowFormationIndex,
  resolveCompanionFollowFormationIndexFromState,
  resolveCompanionFollowDistance,
  resolveCompanionFollowSpeed
} from "../app/runtime/companions/companionFollowMotion.js";
import { PLAYER_SPEED } from "../app/session/configurePlayerSpawner.js";

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

  it("keeps default spacing for Fire and Build Block without a formation slot", () => {
    expect(resolveCompanionFollowDistance({
      companionId: "charmander",
      activeMoveId: "fire",
      defaultDistance: 1.28
    })).toBe(1.28);

    expect(resolveCompanionFollowDistance({
      companionId: "timburr",
      activeMoveId: "buildBlock",
      defaultDistance: 1.62
    })).toBe(1.62);
  });

  it("uses the act-two player speed for follow speed", () => {
    expect(resolveCompanionFollowSpeed()).toBe(PLAYER_SPEED);
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

  it("accepts assembled recovered Hydro Bot only when Water Gun is idle", () => {
    const flags = { squirtleFollowing: true };
    const companions = {
      squirtle: { recovered: true, assemblyState: "assembled" }
    };

    expect(isCompanionFollowFormationMember({
      companionId: "squirtle",
      flags,
      companions,
      actions: {},
      blockers: { squirtleWaterGunQueueActive: false }
    })).toBe(true);

    expect(isCompanionFollowFormationMember({
      companionId: "squirtle",
      flags,
      companions,
      actions: { squirtleWaterGun: {} },
      blockers: { squirtleWaterGunQueueActive: false }
    })).toBe(false);

    expect(isCompanionFollowFormationMember({
      companionId: "squirtle",
      flags,
      companions,
      actions: {},
      blockers: { squirtleWaterGunQueueActive: true }
    })).toBe(false);
  });

  it("keeps Grow Bot out of formation while reveal or Workbench guide blockers are active", () => {
    const flags = { bulbasaurFollowing: true };
    const companions = {
      bulbasaur: { visible: true, position: [0, 0.04, 0], revealBoxOpening: { active: false } }
    };

    expect(isCompanionFollowFormationMember({
      companionId: "bulbasaur",
      flags,
      companions,
      actions: {},
      blockers: { bulbasaurWorkbenchGuideActive: false }
    })).toBe(true);

    expect(isCompanionFollowFormationMember({
      companionId: "bulbasaur",
      flags,
      companions: {
        bulbasaur: { visible: true, position: [0, 0.04, 0], revealBoxOpening: { active: true } }
      },
      actions: {},
      blockers: { bulbasaurWorkbenchGuideActive: false }
    })).toBe(false);

    expect(isCompanionFollowFormationMember({
      companionId: "bulbasaur",
      flags,
      companions,
      actions: {},
      blockers: { bulbasaurWorkbenchGuideActive: true }
    })).toBe(false);
  });

  it("keeps revealed Thermal and Builder bots out of formation during actions or Leaf Den construction", () => {
    const flags = {
      charmanderFollowing: true,
      charmanderRevealed: true,
      timburrFollowing: true,
      timburrRevealed: true,
      leafDenConstructionStarted: false
    };
    const companions = {
      charmander: { visible: true },
      timburr: { visible: true }
    };

    expect(isCompanionFollowFormationMember({
      companionId: "charmander",
      flags,
      companions
    })).toBe(true);
    expect(isCompanionFollowFormationMember({
      companionId: "timburr",
      flags,
      companions
    })).toBe(true);

    expect(isCompanionFollowFormationMember({
      companionId: "charmander",
      flags,
      companions,
      actions: { charmanderFire: {} }
    })).toBe(false);
    expect(isCompanionFollowFormationMember({
      companionId: "timburr",
      flags: { ...flags, leafDenConstructionStarted: true },
      companions
    })).toBe(false);
  });

  it("resolves formation index directly from companion state", () => {
    const flags = {
      squirtleFollowing: true,
      bulbasaurFollowing: true,
      charmanderFollowing: true,
      charmanderRevealed: true,
      leafDenConstructionStarted: false
    };
    const companions = {
      squirtle: { recovered: true, assemblyState: "assembled" },
      bulbasaur: {
        visible: true,
        position: [0, 0.04, 0],
        revealBoxOpening: { active: false }
      },
      charmander: { visible: true }
    };

    expect(resolveCompanionFollowFormationIndexFromState({
      companionId: "bulbasaur",
      activeMoveId: "leafage",
      flags,
      companions,
      actions: {},
      blockers: {
        squirtleWaterGunQueueActive: false,
        bulbasaurWorkbenchGuideActive: false
      }
    })).toBe(0);

    expect(resolveCompanionFollowFormationIndexFromState({
      companionId: "squirtle",
      activeMoveId: "leafage",
      flags,
      companions,
      actions: {},
      blockers: {
        squirtleWaterGunQueueActive: true,
        bulbasaurWorkbenchGuideActive: false
      }
    })).toBeNull();
  });
});
