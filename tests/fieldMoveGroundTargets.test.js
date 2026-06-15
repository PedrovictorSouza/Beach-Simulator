import { describe, expect, it } from "vitest";

import {
  findAlreadyResolvedFieldMoveGroundCell,
  getBoulderShadedTaskGroundCells,
  getFreeRoamRestorationGroundCells,
  getGrowFirstHabitatTaskGroundCells,
  isDryGrassHydroMissionActive
} from "../app/runtime/fieldMoveRuntime/fieldMoveGroundTargets.js";

function groundCell(id, offset, extra = {}) {
  return {
    id,
    offset,
    tileSpan: 1,
    ...extra
  };
}

describe("field move ground targets", () => {
  it("resolves free-roam restoration cells by equipped field move", () => {
    const deadCell = groundCell("dry", [0.5, 0, 0]);
    const purifiedWithPatch = groundCell("purified-with-patch", [1, 0, 0]);
    const purifiedWithoutPatch = groundCell("purified-empty", [1.1, 0, 0]);
    const iceCell = groundCell("ice", [0.25, 0, 0]);

    expect(getFreeRoamRestorationGroundCells({
      playerPosition: [0, 0, 0],
      waterGunEquipped: true,
      groundDeadInstances: [deadCell],
      groundPurifiedInstances: [purifiedWithPatch],
      iceGroundInstances: [iceCell]
    })).toEqual([
      expect.objectContaining({
        id: "dry",
        highlightAbilityId: "waterGun",
        highlightTargetState: "valid"
      })
    ]);

    expect(getFreeRoamRestorationGroundCells({
      playerPosition: [0, 0, 0],
      leafageEquipped: true,
      groundPurifiedInstances: [purifiedWithoutPatch, purifiedWithPatch],
      groundGrassPatches: [
        { cellId: "purified-with-patch" }
      ]
    })).toEqual([
      expect.objectContaining({
        id: "purified-with-patch",
        highlightAbilityId: "leafage"
      })
    ]);

    expect(getFreeRoamRestorationGroundCells({
      playerPosition: [0, 0, 0],
      fireEquipped: true,
      groundDeadInstances: [deadCell],
      iceGroundInstances: [iceCell]
    })).toEqual([
      expect.objectContaining({
        id: "ice",
        highlightAbilityId: "fire"
      })
    ]);
  });

  it("marks remaining Grow First Habitat cells nearest the reference position", () => {
    const cells = [
      groundCell("far", [6, 0, 0]),
      groundCell("near-empty", [0.5, 0, 0]),
      groundCell("already-grown", [0.25, 0, 0])
    ];

    expect(getGrowFirstHabitatTaskGroundCells({
      activeTask: { id: "grow-first-habitat" },
      storyState: {
        flags: {
          leafageTallGrassCount: 3
        }
      },
      referencePosition: [0, 0, 0],
      groundPurifiedInstances: cells,
      groundGrassPatches: [
        { cellId: "already-grown" }
      ]
    })).toEqual([
      expect.objectContaining({
        id: "near-empty",
        highlightAbilityId: "leafage",
        highlightTargetState: "leafage"
      })
    ]);
  });

  it("marks Boulder-Shaded Tall Grass water and leafage cells inside the challenge radius", () => {
    const storyState = {
      flags: {
        boulderChallengeAvailable: true,
        trackedTaskIds: ["boulder-shaded-tall-grass"]
      }
    };

    expect(getBoulderShadedTaskGroundCells({
      storyState,
      boulderPosition: [0, 0, 0],
      groundDeadInstances: [
        groundCell("dry-near", [1, 0, 0]),
        groundCell("dry-far", [99, 0, 0])
      ],
      groundPurifiedInstances: [
        groundCell("leafage-near", [1.5, 0, 0]),
        groundCell("leafage-grown", [1.6, 0, 0])
      ],
      groundGrassPatches: [
        { cellId: "leafage-grown" }
      ]
    })).toEqual([
      expect.objectContaining({
        id: "dry-near",
        highlightAbilityId: "waterGun"
      }),
      expect.objectContaining({
        id: "leafage-near",
        highlightAbilityId: "leafage"
      })
    ]);
  });

  it("finds already resolved field move cells using the active ability policy", () => {
    const patchedPurified = groundCell("patched", [0.04, 0, 0]);
    const unpatchedPurified = groundCell("unpatched", [0.02, 0, 0]);
    const deadCell = groundCell("dead", [0.03, 0, 0]);

    expect(findAlreadyResolvedFieldMoveGroundCell([0, 0, 0], {
      waterGunEquipped: true,
      groundPurifiedInstances: [patchedPurified]
    })).toBe(patchedPurified);

    expect(findAlreadyResolvedFieldMoveGroundCell([0, 0, 0], {
      leafageEquipped: true,
      groundPurifiedInstances: [unpatchedPurified, patchedPurified],
      groundGrassPatches: [
        { cellId: "patched" }
      ]
    })).toBe(patchedPurified);

    expect(findAlreadyResolvedFieldMoveGroundCell([0, 0, 0], {
      fireEquipped: true,
      groundDeadInstances: [deadCell]
    })).toBe(deadCell);
  });

  it("keeps the dry grass Hydro mission policy explicit", () => {
    expect(isDryGrassHydroMissionActive(
      { id: "water-dry-grass" },
      { flags: {} },
      { waterGun: true }
    )).toBe(true);

    expect(isDryGrassHydroMissionActive(
      null,
      {
        flags: {
          bulbasaurDryGrassMissionAccepted: true,
          restoredGrassCount: 9
        }
      },
      { waterGun: true }
    )).toBe(true);

    expect(isDryGrassHydroMissionActive(
      null,
      {
        flags: {
          bulbasaurDryGrassMissionAccepted: true,
          restoredGrassCount: 10
        }
      },
      { waterGun: true }
    )).toBe(false);
  });
});
