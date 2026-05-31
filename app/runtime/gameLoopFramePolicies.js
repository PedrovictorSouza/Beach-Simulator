export function resolveGameLoopBlockers({
  gameplayOpeningMovementLocked = false,
  foundationBuildZoneCameraFocusActive = false,
  placementPreviewActive = false,
  flowState = {}
} = {}) {
  const {
    cinematicActive = false,
    tutorialActive = false,
    tutorialMovementLocked = false,
    pokedexModalOpen = false,
    dialogueActive = false,
    skillLearnActive = false,
    scriptedInteractionActive = false
  } = flowState;

  return {
    movementBlocked: Boolean(
      gameplayOpeningMovementLocked ||
      foundationBuildZoneCameraFocusActive ||
      tutorialMovementLocked ||
      pokedexModalOpen ||
      dialogueActive ||
      skillLearnActive ||
      scriptedInteractionActive ||
      placementPreviewActive
    ),
    shouldClearPendingActions: Boolean(
      gameplayOpeningMovementLocked ||
      foundationBuildZoneCameraFocusActive ||
      tutorialActive ||
      pokedexModalOpen ||
      skillLearnActive ||
      scriptedInteractionActive
    ),
    shouldClearMovementInput: Boolean(
      gameplayOpeningMovementLocked ||
      foundationBuildZoneCameraFocusActive ||
      tutorialMovementLocked ||
      pokedexModalOpen ||
      dialogueActive ||
      skillLearnActive ||
      scriptedInteractionActive
    ),
    canAdvanceRustlingGrass: !(
      cinematicActive ||
      foundationBuildZoneCameraFocusActive ||
      tutorialActive ||
      pokedexModalOpen ||
      dialogueActive ||
      skillLearnActive ||
      scriptedInteractionActive
    )
  };
}

export function resolveCameraInputPermissions({
  hasPlayerCharacter = false,
  gameplayOpeningCameraLocked = false,
  foundationBuildZoneCameraFocusActive = false,
  builderPanelOpen = false,
  placementPreviewActive = false,
  tutorialAllowsCameraLook = false,
  flowState = {}
} = {}) {
  const {
    cinematicActive = false,
    tutorialActive = false,
    pokedexModalOpen = false,
    dialogueActive = false,
    skillLearnActive = false,
    scriptedInteractionActive = false
  } = flowState;
  const sharedCameraBlocker =
    !hasPlayerCharacter ||
    cinematicActive ||
    gameplayOpeningCameraLocked ||
    foundationBuildZoneCameraFocusActive ||
    builderPanelOpen ||
    pokedexModalOpen ||
    skillLearnActive ||
    scriptedInteractionActive ||
    dialogueActive;

  return {
    canRotateCamera: !sharedCameraBlocker && tutorialAllowsCameraLook,
    canCycleCameraZoom:
      !sharedCameraBlocker &&
      !tutorialActive &&
      !placementPreviewActive
  };
}

export function resolvePlayerMovementPermission({
  hasPlayerCharacter = false,
  foundationBuildZoneCameraFocusActive = false,
  flowState = {}
} = {}) {
  const {
    cinematicActive = false,
    tutorialMovementLocked = false,
    pokedexModalOpen = false,
    dialogueActive = false,
    skillLearnActive = false,
    scriptedInteractionActive = false
  } = flowState;

  return Boolean(
    hasPlayerCharacter &&
    !cinematicActive &&
    !foundationBuildZoneCameraFocusActive &&
    !tutorialMovementLocked &&
    !pokedexModalOpen &&
    !skillLearnActive &&
    !scriptedInteractionActive &&
    !dialogueActive
  );
}

export function resolveGameplayActionPermission({
  hasPlayerCharacter = false,
  flowState = {}
} = {}) {
  const {
    cinematicActive = false,
    tutorialActive = false,
    dialogueActive = false,
    skillLearnActive = false,
    scriptedInteractionActive = false
  } = flowState;

  return Boolean(
    hasPlayerCharacter &&
    !cinematicActive &&
    !tutorialActive &&
    !skillLearnActive &&
    !scriptedInteractionActive &&
    !dialogueActive
  );
}

export function resolveNearbyGameplayQueryPermission({
  hasPlayerCharacter = false,
  gameplayOpeningMovementLocked = false,
  flowState = {}
} = {}) {
  const {
    cinematicActive = false,
    tutorialActive = false,
    skillLearnActive = false,
    scriptedInteractionActive = false
  } = flowState;

  return Boolean(
    hasPlayerCharacter &&
    !gameplayOpeningMovementLocked &&
    !cinematicActive &&
    !tutorialActive &&
    !skillLearnActive &&
    !scriptedInteractionActive
  );
}

export function resolveGroundGuidanceVisibility({
  gameplayOpeningMovementLocked = false,
  gameplayOpeningHudHidden = false,
  requireDialogueClosed = false,
  flowState = {}
} = {}) {
  const {
    cinematicActive = false,
    tutorialActive = false,
    pokedexModalOpen = false,
    dialogueActive = false,
    skillLearnActive = false,
    scriptedInteractionActive = false
  } = flowState;

  return !(
    gameplayOpeningMovementLocked ||
    gameplayOpeningHudHidden ||
    cinematicActive ||
    tutorialActive ||
    pokedexModalOpen ||
    skillLearnActive ||
    scriptedInteractionActive ||
    (requireDialogueClosed && dialogueActive)
  );
}

export function resolveWorldSpaceUiVisibility({
  gameplayOpeningCameraLocked = false,
  flowState = {}
} = {}) {
  const {
    cinematicActive = false,
    tutorialActive = false,
    pokedexModalOpen = false,
    dialogueActive = false,
    skillLearnActive = false
  } = flowState;

  return !(
    gameplayOpeningCameraLocked ||
    cinematicActive ||
    tutorialActive ||
    pokedexModalOpen ||
    skillLearnActive ||
    dialogueActive
  );
}
