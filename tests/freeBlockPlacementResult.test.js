import { describe, expect, it, vi } from "vitest";

import { applyFreeBlockPlacementResult } from "../app/runtime/construction/freeBlockPlacementResult.js";

function createActions() {
  return {
    triggerFeedback: vi.fn(),
    markFirstFreeBlockPlaced: vi.fn(),
    onFoundationWallBuilt: vi.fn(),
    syncFoundationCompletionEffects: vi.fn(),
    syncFreeBlockBuildSnapshot: vi.fn(),
    playPlacedSound: vi.fn(),
    playInvalidSound: vi.fn(),
    pushNotice: vi.fn()
  };
}

describe("free block placement result", () => {
  it("applies placed wall results without changing feedback order", () => {
    const actions = createActions();
    const targetCell = { x: 2, y: 3 };
    const block = { id: "wall-1" };
    const feedbackGroundCell = { id: "feedback-cell" };

    expect(applyFreeBlockPlacementResult({
      result: {
        placed: true,
        blockType: "wall",
        targetCell,
        block
      },
      feedbackGroundCell,
      now: 123,
      actions
    })).toEqual({
      handled: true,
      placed: true,
      feedbackAbilityId: "build",
      foundationWallBuilt: true,
      notice: "Wall placed."
    });

    expect(actions.triggerFeedback).toHaveBeenCalledWith(feedbackGroundCell, "build", 123);
    expect(actions.markFirstFreeBlockPlaced).toHaveBeenCalledTimes(1);
    expect(actions.onFoundationWallBuilt).toHaveBeenCalledWith({ targetCell, block });
    expect(actions.syncFoundationCompletionEffects).toHaveBeenCalledWith(123);
    expect(actions.syncFreeBlockBuildSnapshot).toHaveBeenCalledTimes(1);
    expect(actions.playPlacedSound).toHaveBeenCalledTimes(1);
    expect(actions.pushNotice).toHaveBeenCalledWith("Wall placed.");
    expect(actions.playInvalidSound).not.toHaveBeenCalled();
  });

  it("applies invalid placement results without running build callbacks", () => {
    const actions = createActions();
    const feedbackGroundCell = { id: "feedback-cell" };

    expect(applyFreeBlockPlacementResult({
      result: {
        placed: false,
        reason: "missing-material",
        blockType: "wall",
        targetCell: { x: 1, y: 1 }
      },
      feedbackGroundCell,
      now: 456,
      actions
    })).toEqual({
      handled: true,
      placed: false,
      feedbackAbilityId: "invalid",
      foundationWallBuilt: false,
      notice: "Need Wood"
    });

    expect(actions.triggerFeedback).toHaveBeenCalledWith(feedbackGroundCell, "invalid", 456);
    expect(actions.playInvalidSound).toHaveBeenCalledTimes(1);
    expect(actions.pushNotice).toHaveBeenCalledWith("Need Wood");
    expect(actions.markFirstFreeBlockPlaced).not.toHaveBeenCalled();
    expect(actions.onFoundationWallBuilt).not.toHaveBeenCalled();
    expect(actions.syncFoundationCompletionEffects).not.toHaveBeenCalled();
    expect(actions.syncFreeBlockBuildSnapshot).not.toHaveBeenCalled();
    expect(actions.playPlacedSound).not.toHaveBeenCalled();
  });
});
