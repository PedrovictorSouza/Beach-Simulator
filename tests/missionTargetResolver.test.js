import { describe, expect, it } from "vitest";

import {
  resolveMissionTargetAliasId,
  resolveMissionTargetIdsFromMissionCopy
} from "../app/runtime/gameLoop.js";

describe("mission target resolver", () => {
  it("maps Chopper and legacy Shopper text to the Chopper actor target", () => {
    expect(resolveMissionTargetAliasId("chopper")).toBe("tangrowth");
    expect(resolveMissionTargetAliasId("shopper")).toBe("tangrowth");
    expect(resolveMissionTargetIdsFromMissionCopy("Talk to Shopper")).toEqual(["tangrowth"]);
    expect(resolveMissionTargetIdsFromMissionCopy("Talk to Chopper")).toEqual(["tangrowth"]);
  });

  it("maps bot talk targets to their companion target ids", () => {
    expect(resolveMissionTargetAliasId("hydro-bot")).toBe("squirtle");
    expect(resolveMissionTargetAliasId("grow-bot")).toBe("leaf-helper");
    expect(resolveMissionTargetAliasId("thermal-bot")).toBe("charmander");
    expect(resolveMissionTargetAliasId("builder-bot")).toBe("timburr");
    expect(resolveMissionTargetIdsFromMissionCopy("Talk to Grow Bot after placing the Solar Station.")).toEqual([
      "leaf-helper"
    ]);
  });

  it("maps the Grow Bot Workbench guide copy to both mission targets", () => {
    expect(
      resolveMissionTargetIdsFromMissionCopy(
        "Follow Grow Bot to the nearby area and interact with the Workbench."
      )
    ).toEqual(["leaf-helper", "workbench"]);
  });

  it("keeps unrelated mission copy unmarked", () => {
    expect(resolveMissionTargetIdsFromMissionCopy("Use Hydro Jet on dry tiles.")).toEqual([]);
  });
});
