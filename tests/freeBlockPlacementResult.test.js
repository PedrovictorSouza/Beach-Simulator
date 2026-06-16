import { describe, expect, it, vi } from "vitest";

import {
  applyFreeBlockPlacementResult,
  applyTimburrBuildBlockImpact,
  tryPlaceFreeBlockFromBuildInput
} from "../app/runtime/construction/freeBlockPlacementResult.js";

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

  it("places a free block from build input and applies the result", () => {
    const result = {
      placed: true,
      blockType: "wall",
      targetCell: { x: 2, y: 3 },
      block: { id: "wall-1" }
    };
    const controller = {
      placeSelectedBlockAtTarget: vi.fn(() => result)
    };
    const effects = {
      movePlayerAway: vi.fn(),
      handlePlacementResult: vi.fn()
    };
    const buildZone = { id: "foundation" };

    expect(tryPlaceFreeBlockFromBuildInput({
      controller,
      placement: {
        playerPosition: [1, 0, 2],
        playerYaw: 0.5,
        inventory: { wood: 3 },
        getBuildZone: () => buildZone,
        canStack: () => true
      },
      effects,
      now: 789
    })).toEqual({
      handled: true,
      result
    });

    expect(controller.placeSelectedBlockAtTarget).toHaveBeenCalledWith({
      playerPosition: [1, 0, 2],
      buildZone,
      allowStacking: true,
      playerYaw: 0.5,
      inventory: { wood: 3 }
    });
    expect(effects.movePlayerAway).toHaveBeenCalledWith(result.targetCell, [1, 0, 2]);
    expect(effects.handlePlacementResult).toHaveBeenCalledWith(result, 789);
  });

  it("uses unavailable foundation placement without resolving the active build zone", () => {
    const controller = {
      placeSelectedBlockAtTarget: vi.fn()
    };
    const placement = {
      buildZoneUnavailable: true,
      getBuildZone: vi.fn(),
      canStack: vi.fn()
    };
    const effects = {
      movePlayerAway: vi.fn(),
      handlePlacementResult: vi.fn()
    };

    const placementResult = tryPlaceFreeBlockFromBuildInput({
      controller,
      placement,
      effects,
      now: 123
    });

    expect(placementResult).toMatchObject({
      handled: true,
      result: {
        placed: false,
        reason: "blocked-cell",
        blockType: "wall",
        targetCell: null
      }
    });
    expect(controller.placeSelectedBlockAtTarget).not.toHaveBeenCalled();
    expect(placement.getBuildZone).not.toHaveBeenCalled();
    expect(placement.canStack).not.toHaveBeenCalled();
    expect(effects.movePlayerAway).not.toHaveBeenCalled();
    expect(effects.handlePlacementResult).toHaveBeenCalledWith(placementResult.result, 123);
  });

  it("applies Timburr build block impact at the action target cell", () => {
    const action = {
      targetCell: { x: 4, y: 5 }
    };
    const result = {
      placed: true,
      blockType: "wall",
      targetCell: action.targetCell,
      block: { id: "wall-2" }
    };
    const controller = {
      placeSelectedBlockAtTarget: vi.fn(() => result)
    };
    const effects = {
      movePlayerAway: vi.fn(),
      handlePlacementResult: vi.fn()
    };

    expect(applyTimburrBuildBlockImpact({
      action,
      controller,
      placement: {
        playerPosition: [0, 0, 0],
        inventory: { wood: 1 },
        getBuildZone: () => ({ id: "foundation" }),
        canStack: () => false
      },
      effects,
      now: 456
    })).toBe(result);

    expect(controller.placeSelectedBlockAtTarget).toHaveBeenCalledWith({
      targetCell: action.targetCell,
      buildZone: { id: "foundation" },
      allowStacking: false,
      inventory: { wood: 1 }
    });
    expect(effects.movePlayerAway).toHaveBeenCalledWith(result.targetCell, [0, 0, 0]);
    expect(effects.handlePlacementResult).toHaveBeenCalledWith(result, 456);
  });
});
