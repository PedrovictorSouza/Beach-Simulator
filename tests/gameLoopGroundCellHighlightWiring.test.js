import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("game loop ground cell highlight wiring", () => {
  it("passes the highlight visibility flag from the resolver to the snapshot frame", () => {
    const gameLoopSource = readFileSync("app/runtime/gameLoop.js", "utf8");
    const renderSnapshotSource = readFileSync(
      "app/runtime/presentation/renderSnapshotRuntimeBundle.js",
      "utf8"
    );
    const frameStateMatch = gameLoopSource.match(
      /groundCellHighlightFrameState\s*\}\s*=\s*gameplayPromptPreparationFrame/u
    );

    expect(frameStateMatch).not.toBeNull();
    expect(gameLoopSource).toContain("groundCellHighlightFrameState,");
    expect(renderSnapshotSource)
      .toContain("groundCellHighlightState: groundCellHighlightFrameState");
  });
});
