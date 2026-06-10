export function prepareWorldSpaceUiFrameContext({
  now,
  session,
  storyState,
  gameplayOpeningCameraLocked,
  flowState,
  activeQuest,
  activeTask,
  activeSystemQuest,
  resolveWorldSpaceUiVisibility,
  shouldShowWorkbenchGreenArrowCue,
  applyWorkbenchGreenArrowCue
}) {
  const tangrowthActor = (session.npcActors || []).find((npcActor) => npcActor.id === "tangrowth");
  const tangrowthPosition =
    tangrowthActor?.character?.getPosition?.() ||
    null;
  const canShowWorldSpaceUi = resolveWorldSpaceUiVisibility({
    gameplayOpeningCameraLocked,
    flowState
  });

  applyWorkbenchGreenArrowCue(session.workbenchGreenArrowModelInstance, {
    active: canShowWorldSpaceUi && shouldShowWorkbenchGreenArrowCue({
      activeQuest,
      activeTask,
      activeSystemQuest,
      storyState
    }),
    now
  });

  return {
    canShowWorldSpaceUi,
    tangrowthPosition
  };
}
