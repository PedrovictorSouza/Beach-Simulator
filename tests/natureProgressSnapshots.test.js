import { describe, expect, it } from "vitest";

import {
  getGardenProgressSnapshot,
  getTreeRevivalSnapshot
} from "../app/runtime/fieldMoveRuntime/natureProgressSnapshots.js";

describe("nature progress snapshots", () => {
  it("creates a stable garden progress signature from current terrain state", () => {
    const session = {
      groundDeadInstances: [{ id: "dead-b" }, { id: "dead-a" }, {}],
      iceGroundInstances: [{ id: "ice-a" }],
      groundPurifiedInstances: [{ id: "purified-a" }],
      groundGrassPatches: [
        { cellId: "grass-b", state: "alive" },
        { cellId: "grass-a", state: "cut" },
        {}
      ],
      groundFlowerPatches: [
        { cellId: "flower-b", state: "alive" },
        { cellId: "flower-a", state: "seed" }
      ]
    };
    const storyState = {
      flags: {
        wateredTreeCount: 2
      }
    };

    expect(getGardenProgressSnapshot({ session, storyState })).toBe(
      "dead-a|dead-b;ice-a;purified-a;grass-a|grass-b;grass-b;flower-b;2"
    );
  });

  it("defaults missing terrain collections without sharing mutable state", () => {
    const first = getTreeRevivalSnapshot({
      session: {
        palmInstances: [
          { id: "palm-a", alive: true },
          { id: "palm-b", alive: false }
        ]
      },
      storyState: {}
    });
    const second = getTreeRevivalSnapshot({
      session: {},
      storyState: { flags: { leppaTreeRevived: true } }
    });

    expect(first.palmAliveById.get("palm-a")).toBe(true);
    expect(first.palmAliveById.get("palm-b")).toBe(false);
    expect(first.leppaTreeRevived).toBe(false);
    expect(second.palmAliveById.size).toBe(0);
    expect(second.leppaTreeRevived).toBe(true);

    first.palmAliveById.set("palm-c", true);
    expect(second.palmAliveById.has("palm-c")).toBe(false);
  });

  it("treats a revived Leppa tree in session as revived even without a story flag", () => {
    const snapshot = getTreeRevivalSnapshot({
      session: {
        leppaTree: { revived: true }
      },
      storyState: { flags: { leppaTreeRevived: false } }
    });

    expect(snapshot.leppaTreeRevived).toBe(true);
  });
});
