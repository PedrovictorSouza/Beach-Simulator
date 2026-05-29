export function getActivePlacementPreviews(session, contracts) {
  return contracts
    .map((contract) => ({
      contract,
      preview: session[contract.previewKey] || null
    }))
    .filter(({ preview }) => preview?.active);
}

export function hasActivePlacementPreview(session, contracts) {
  return getActivePlacementPreviews(session, contracts).length > 0;
}

function normalizeModelInstanceEntries(contract) {
  if (Array.isArray(contract.modelInstanceKeys)) {
    return contract.modelInstanceKeys;
  }

  if (contract.modelInstanceKey) {
    return [contract.modelInstanceKey];
  }

  return [];
}

function resetModelInstanceForCanceledPreview({
  session,
  storyState,
  entry
}) {
  const normalizedEntry =
    typeof entry === "string" ? { key: entry } : entry;

  const instance = session[normalizedEntry.key];

  if (!instance) {
    return;
  }

  const keepActiveWhenFlag = normalizedEntry.keepActiveWhenFlag;

  if (keepActiveWhenFlag && storyState?.flags?.[keepActiveWhenFlag]) {
    return;
  }

  instance.active = false;
  instance.alpha = 1;
  instance.tintStrength = 0;

  if (normalizedEntry.reset) {
    Object.assign(instance, normalizedEntry.reset);
  }
}

export function cancelPlacementPreview({
  session,
  storyState,
  contract,
  playSoundEvent,
  hud,
  cancelPendingWorkbenchPlacementIntent,
  cancelSoundEventId
}) {
  const preview = session[contract.previewKey];

  if (!preview?.active) {
    return false;
  }

  session[contract.previewKey] = null;
  cancelPendingWorkbenchPlacementIntent?.(session);

  for (const entry of normalizeModelInstanceEntries(contract)) {
    resetModelInstanceForCanceledPreview({
      session,
      storyState,
      entry
    });
  }

  playSoundEvent?.(cancelSoundEventId);
  hud?.pushNotice?.(contract.cancelNotice || `${contract.label} placement canceled.`);

  return true;
}

export function cancelActivePlacementPreviews({
  session,
  storyState,
  contracts,
  playSoundEvent,
  hud,
  cancelPendingWorkbenchPlacementIntent,
  cancelSoundEventId
}) {
  let canceled = false;

  for (const contract of contracts) {
    canceled =
      cancelPlacementPreview({
        session,
        storyState,
        contract,
        playSoundEvent,
        hud,
        cancelPendingWorkbenchPlacementIntent,
        cancelSoundEventId
      }) || canceled;
  }

  return canceled;
}