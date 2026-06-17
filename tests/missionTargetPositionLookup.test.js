import { describe, expect, it } from "vitest";

import {
  createGameplayMissionTargetPositionProvider,
  getMissionTargetPositionsById
} from "../app/runtime/missions/missionTargetPositionLookup.js";

const workbenchPosition = [10, 0, 20];
const ruinedPokemonCenterPosition = [-4, 0, 7];

function getTarget(targetId, session = {}, options = {}) {
  return getMissionTargetPositionsById({
    targetId,
    session,
    workbenchPosition,
    ruinedPokemonCenterPosition,
    getFreeBlockBuildZoneCenterPosition: () => [2, 0, 3],
    ...options
  });
}

describe("mission target position lookup", () => {
  it("resolves NPC targets from character position, position, then offset", () => {
    expect(getTarget("tangrowth", {
      npcActors: [{
        id: "tangrowth",
        character: { getPosition: () => [1, 0, 2] },
        position: [3, 0, 4],
        offset: [5, 0, 6]
      }]
    })).toEqual([[1, 0, 2]]);

    expect(getTarget("tangrowth", {
      npcActors: [{ id: "tangrowth", offset: [5, 0, 6] }]
    })).toEqual([[5, 0, 6]]);
  });

  it("resolves companion aliases with the existing fallback order", () => {
    expect(getTarget("hydro", {
      actTwoSquirtle: {
        repairModuleInstance: {
          baseOffset: [1, 0, 2],
          offset: [3, 0, 4]
        }
      }
    })).toEqual([[1, 0, 2]]);

    expect(getTarget("grow-bot", {
      bulbasaurEncounter: {
        repairPosition: [5, 0, 6],
        repairModuleInstance: { baseOffset: [7, 0, 8] }
      }
    })).toEqual([[5, 0, 6]]);

    expect(getTarget("thermal", {
      charmanderEncounter: { position: [9, 0, 10] }
    })).toEqual([[9, 0, 10]]);

    expect(getTarget("builder-bot", {
      timburrEncounter: {
        repairModuleInstance: { baseOffset: [11, 0, 12] }
      }
    })).toEqual([[11, 0, 12]]);
  });

  it("sorts dry grass targets by player distance and skips alive patches", () => {
    expect(getTarget("water-dry-tall-grass", {
      playerCharacter: { getPosition: () => [0, 0, 0] },
      groundGrassPatches: [
        { position: [8, 0, 0], state: "dead" },
        { position: [1, 0, 0], state: "alive" },
        { position: [2, 0, 0], state: "dead" },
        { position: "invalid", state: "dead" }
      ]
    })).toEqual([
      [2, 0, 0],
      [8, 0, 0]
    ]);
  });

  it("resolves static and session-backed world targets", () => {
    expect(getTarget("workbench")).toEqual([workbenchPosition]);
    expect(getTarget("revive-leppa-tree", {
      leppaTree: { position: [3, 0, 5] }
    })).toEqual([[3, 0, 5]]);
    expect(getTarget("new-challenges-in-pc", {
      pokemonCenterPc: { position: [6, 0, 7] }
    })).toEqual([[6, 0, 7]]);
    expect(getTarget("ruined-pokemon-center", {})).toEqual([ruinedPokemonCenterPosition]);
    expect(getTarget("foundation-wall")).toEqual([[2, 0, 3]]);
  });

  it("returns an empty list for missing or unknown targets", () => {
    expect(getTarget(null)).toEqual([]);
    expect(getTarget("unknown")).toEqual([]);
    expect(getTarget("tangrowth", { npcActors: [] })).toEqual([]);
  });

  it("creates a gameplay provider that resolves static positions lazily", () => {
    const freeBlockBuildZoneCalls = [];
    const getMissionTargetPositions = createGameplayMissionTargetPositionProvider({
      session: {},
      workbenchPosition,
      ruinedPokemonCenterPosition,
      getFreeBlockBuildZoneCenterPosition: () => {
        freeBlockBuildZoneCalls.push("called");
        return [2, 0, 3];
      }
    });

    expect(freeBlockBuildZoneCalls).toEqual([]);
    expect(getMissionTargetPositions("workbench")).toEqual([workbenchPosition]);
    expect(freeBlockBuildZoneCalls).toEqual([]);
    expect(getMissionTargetPositions("foundation-wall")).toEqual([[2, 0, 3]]);
    expect(freeBlockBuildZoneCalls).toEqual(["called"]);
  });
});
