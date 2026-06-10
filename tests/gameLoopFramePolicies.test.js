import { describe, expect, it } from "vitest";

import {
  resolveCameraInputPermissions,
  resolveCameraLookInput,
  resolveGameplayActionPermission,
  resolveGameLoopBlockers,
  resolveGroundGuidanceVisibility,
  resolveNearbyGameplayQueryPermission,
  resolvePlayerMovementPermission,
  resolveWorldSpaceUiVisibility
} from "../app/runtime/gameLoopFramePolicies.js";

describe("game loop frame policies", () => {
  it("resolves blockers without changing the existing input distinctions", () => {
    expect(resolveGameLoopBlockers({
      placementPreviewActive: true
    })).toMatchObject({
      movementBlocked: true,
      shouldClearPendingActions: false,
      shouldClearMovementInput: false,
      canAdvanceRustlingGrass: true
    });

    expect(resolveGameLoopBlockers({
      flowState: {
        tutorialActive: true,
        tutorialMovementLocked: false
      }
    })).toMatchObject({
      movementBlocked: false,
      shouldClearPendingActions: true,
      shouldClearMovementInput: false,
      canAdvanceRustlingGrass: false
    });
  });

  it("keeps camera rotation and zoom permissions separate", () => {
    expect(resolveCameraInputPermissions({
      hasPlayerCharacter: true,
      placementPreviewActive: true,
      tutorialAllowsCameraLook: true,
      flowState: { tutorialActive: true }
    })).toEqual({
      canRotateCamera: true,
      canCycleCameraZoom: false
    });
  });

  it("resolves camera look input from keyboard turn keys and consumed look delta", () => {
    expect(resolveCameraLookInput({
      cameraTurnKeys: new Set(["ArrowRight"]),
      cameraLookDelta: { yaw: 0.25, pitch: -0.1 },
      deltaTime: 0.5,
      turnSpeed: 2
    })).toEqual({
      yaw: 1.25,
      pitch: -0.1,
      hasInput: true
    });

    expect(resolveCameraLookInput({
      cameraTurnKeys: new Set(["ArrowLeft"]),
      cameraLookDelta: { yaw: 0, pitch: 0 },
      deltaTime: 0.25,
      turnSpeed: 4
    })).toEqual({
      yaw: -1,
      pitch: 0,
      hasInput: true
    });
  });

  it("ignores camera look deltas below the existing input epsilon", () => {
    expect(resolveCameraLookInput({
      cameraTurnKeys: new Set(),
      cameraLookDelta: { yaw: 0.00001, pitch: -0.00001 },
      deltaTime: 1,
      turnSpeed: 2
    })).toEqual({
      yaw: 0.00001,
      pitch: -0.00001,
      hasInput: false
    });
  });

  it("allows player movement during an unlocked tutorial", () => {
    expect(resolvePlayerMovementPermission({
      hasPlayerCharacter: true,
      flowState: {
        tutorialActive: true,
        tutorialMovementLocked: false
      }
    })).toBe(true);

    expect(resolvePlayerMovementPermission({
      hasPlayerCharacter: true,
      flowState: {
        tutorialMovementLocked: true
      }
    })).toBe(false);
  });

  it("keeps gameplay action gating equivalent across flow blockers", () => {
    expect(resolveGameplayActionPermission({
      hasPlayerCharacter: true
    })).toBe(true);
    expect(resolveGameplayActionPermission({
      hasPlayerCharacter: true,
      flowState: { dialogueActive: true }
    })).toBe(false);
    expect(resolveGameplayActionPermission({
      hasPlayerCharacter: true,
      flowState: { scriptedInteractionActive: true }
    })).toBe(false);
  });

  it("keeps nearby gameplay queries independent from dialogue and pokedex state", () => {
    expect(resolveNearbyGameplayQueryPermission({
      hasPlayerCharacter: true,
      flowState: {
        dialogueActive: true,
        pokedexModalOpen: true
      }
    })).toBe(true);
  });

  it("applies optional dialogue gating only to passive ground guidance", () => {
    const flowState = { dialogueActive: true };

    expect(resolveGroundGuidanceVisibility({ flowState })).toBe(true);
    expect(resolveGroundGuidanceVisibility({
      flowState,
      requireDialogueClosed: true
    })).toBe(false);
  });

  it("preserves world-space UI blockers", () => {
    expect(resolveWorldSpaceUiVisibility({
      flowState: { scriptedInteractionActive: true }
    })).toBe(true);
    expect(resolveWorldSpaceUiVisibility({
      flowState: { dialogueActive: true }
    })).toBe(false);
  });
});
