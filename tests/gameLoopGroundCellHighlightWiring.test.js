import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("game loop ground cell highlight wiring", () => {
  it("passes the highlight visibility flag from the resolver to the snapshot frame", () => {
    const source = readFileSync("app/runtime/gameLoop.js", "utf8");
    const frameStateMatch = source.match(
      /const\s+groundCellHighlightFrameState\s*=\s*resolveGameplayGroundCellHighlightFrameState\(/u
    );

    expect(frameStateMatch).not.toBeNull();
    expect(source).toContain("groundCellHighlightState: groundCellHighlightFrameState");
  });
});
