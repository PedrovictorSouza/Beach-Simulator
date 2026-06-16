export function createWorkbenchRotationRuntime({
  normalizePlacementYaw,
  getRotatedPlacementSize,
  getTargetSize,
  placementRotationStep
}) {
  let selection = null;

  function getSelection() {
    return selection;
  }

  function getSelectionForKind(kind) {
    return selection?.kind === kind ? selection : null;
  }

  function getSelectedTarget(candidates = [], { isTargetValid } = {}) {
    const selectedKind = selection?.kind;
    if (!selectedKind) {
      return null;
    }

    const target = candidates.find((candidate) => candidate.kind === selectedKind) || null;
    if (!target || (typeof isTargetValid === "function" && !isTargetValid(target))) {
      selection = null;
      return null;
    }

    return target;
  }

  function getPreviewYaw(target) {
    const targetSelection = getSelectionForKind(target?.kind);
    return Number(targetSelection?.pendingYaw ?? target?.placement?.yaw ?? 0);
  }

  function getPreviewSize(target) {
    const targetSelection = getSelectionForKind(target?.kind);
    if (Array.isArray(targetSelection?.pendingSize)) {
      return targetSelection.pendingSize;
    }

    return getTargetSize(target);
  }

  function select(target) {
    if (!target?.kind) {
      return false;
    }

    const targetSize = getTargetSize(target);
    selection = {
      kind: target.kind,
      originalYaw: Number(target.placement?.yaw || 0),
      pendingYaw: Number(target.placement?.yaw || 0),
      originalSize: targetSize,
      pendingSize: [...targetSize]
    };
    return true;
  }

  function clear() {
    if (!selection) {
      return false;
    }

    selection = null;
    return true;
  }

  function rotate(target, direction) {
    const steps = Math.trunc(Number(direction || 0));
    if (!target?.placement || !selection || steps === 0) {
      return false;
    }

    selection.pendingYaw = normalizePlacementYaw(
      Number(selection.pendingYaw || target.placement.yaw || 0) +
      steps * placementRotationStep
    );

    if (target.rotateSize !== false) {
      const currentSize = Array.isArray(selection.pendingSize) ?
        selection.pendingSize :
        getTargetSize(target);
      selection.pendingSize = getRotatedPlacementSize(
        currentSize,
        steps * placementRotationStep
      );
    }

    return true;
  }

  function confirm(target, { syncPlacementYaw } = {}) {
    if (!target?.placement || !selection) {
      selection = null;
      return false;
    }

    target.placement.yaw = normalizePlacementYaw(Number(selection.pendingYaw || 0));
    if (target.rotateSize !== false && Array.isArray(selection.pendingSize)) {
      target.placement.size = [...selection.pendingSize];
    }

    syncPlacementYaw?.(target.placement);
    selection = null;
    return true;
  }

  function applySelectionTint(kind, instance, nowSeconds = 0) {
    if (!instance || selection?.kind !== kind) {
      return false;
    }

    const pulse = (Math.sin(nowSeconds * 5.4) + 1) * 0.5;
    instance.tint = [0.35, 1.2, 0.35];
    instance.tintStrength = 0.38 + pulse * 0.24;
    instance.alpha = 1;
    return true;
  }

  function syncSolarStationPlacementYaw({ instance = null, placement = null } = {}) {
    if (!instance || !Array.isArray(placement?.position)) {
      return false;
    }

    const baseYaw =
      instance.solarStationBaseYaw ??
      Number(instance.yaw || 0);
    instance.solarStationBaseYaw = baseYaw;
    instance.yaw = baseYaw + Number(placement.yaw || 0);
    return true;
  }

  function syncSolarStationWorkbenchRotationVisual({
    instance = null,
    placement = null,
    placementPreviewActive = false,
    placed = false,
    nowSeconds = 0
  } = {}) {
    if (
      !instance ||
      placementPreviewActive ||
      !Array.isArray(placement?.position) ||
      !placed
    ) {
      return false;
    }

    const target = {
      kind: "solarStation",
      placement
    };
    const baseYaw =
      instance.solarStationBaseYaw ??
      Number(instance.yaw || 0);
    instance.solarStationBaseYaw = baseYaw;
    instance.yaw = baseYaw + getPreviewYaw(target);

    if (!applySelectionTint("solarStation", instance, nowSeconds) && !instance.solarStationSpawnEffect) {
      instance.alpha = 1;
      instance.tintStrength = 0;
    }
    return true;
  }

  function getGroundCell(target) {
    const placement = target?.placement;
    const position = placement?.position;
    if (!Array.isArray(position)) {
      return null;
    }

    const size = getPreviewSize(target);
    return {
      id: `workbench-rotation-${target.kind}`,
      offset: position,
      surfaceY: position[1] || 0.02,
      tileSpan: Math.max(size[0], size[1]) + 0.36,
      highlightTargetState: "valid",
      highlightAbilityId: "leafage"
    };
  }

  return {
    getSelection,
    getSelectionForKind,
    getSelectedTarget,
    getPreviewYaw,
    getPreviewSize,
    select,
    clear,
    rotate,
    confirm,
    applySelectionTint,
    syncSolarStationPlacementYaw,
    syncSolarStationWorkbenchRotationVisual,
    getGroundCell
  };
}
