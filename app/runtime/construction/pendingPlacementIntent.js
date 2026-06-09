export function getActivePendingPlacementIntent(session, storyState = {}, inventory = {}) {
  const intent = session?.pendingPlacementIntent || null;
  if (!intent?.itemId || Number(inventory?.[intent.itemId] || 0) <= 0) {
    return null;
  }

  if (intent.itemId === "strawBed" && storyState?.flags?.strawBedPlacedInBulbasaurHabitat) {
    return null;
  }

  if (
    intent.itemId === "leafDenKit" &&
    intent.blockedReason === "needs-solar-station" &&
    storyState?.flags?.strawBedPlacedInBulbasaurHabitat &&
    session?.strawBed?.position
  ) {
    return {
      ...intent,
      blockedReason: null
    };
  }

  return intent;
}

export function hasPendingWorkbenchPlacementIntent(session) {
  const intent = session?.pendingPlacementIntent || null;
  return Boolean(intent?.source === "workbench" && intent.itemId);
}

export function cancelPendingWorkbenchPlacementIntent(session) {
  if (!hasPendingWorkbenchPlacementIntent(session)) {
    return null;
  }

  const intent = session.pendingPlacementIntent;
  session.pendingPlacementIntent = null;
  return intent;
}
