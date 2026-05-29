const BUILD_BLOCK_DEBUG_STORAGE_KEY = "small-island:debug-build-block";

function formatDebugCell(cell) {
  if (!cell) {
    return "-";
  }

  const layer = Number.isFinite(Number(cell.layer)) ? `:${cell.layer}` : "";
  return `${cell.x},${cell.y}${layer}`;
}

function formatDebugVector(position) {
  if (!Array.isArray(position)) {
    return "-";
  }

  return position.map((value) => Number(value || 0).toFixed(2)).join(",");
}

export function formatBuildBlockDebugLines(debug = null) {
  if (!debug) {
    return ["BuildBlock debug: no target"];
  }

  return [
    `BuildBlock ${debug.valid ? "GREEN" : "RED"} reason=${debug.reason || "none"}`,
    `raw=${formatDebugCell(debug.rawTargetCell)} target=${formatDebugCell(debug.targetCell)} player=${formatDebugCell(debug.playerCell)}`,
    `rawBlock=${debug.rawTargetBlockType || "empty"} targetBlock=${debug.targetBlockType || "empty"} wood=${debug.wood ?? "-"}`,
    `validation=${debug.validationReason || "none"} blocked=${debug.blockedByConstruction ? "yes" : "no"}`,
    `colliders=${Array.isArray(debug.blockingColliderIds) && debug.blockingColliderIds.length ? debug.blockingColliderIds.join(",") : "none"}`,
    `world=${formatDebugVector(debug.targetPosition)}`
  ];
}

export function resolveBuildBlockPreviewValidity({
  validation = null,
  blockingColliderIds = []
} = {}) {
  return {
    valid: validation?.valid !== false,
    reason: validation?.reason || null,
    blockedByConstruction: Array.isArray(blockingColliderIds) && blockingColliderIds.length > 0
  };
}

export function shouldTimburrBuildBlockCastFromBlockedApproach(blockingColliders = []) {
  const colliders = Array.isArray(blockingColliders) ? blockingColliders.filter(Boolean) : [];
  return colliders.length > 0 && colliders.every((collider) => collider.kind !== "freeBlock");
}

function isBuildBlockDebugFlagEnabled(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function getBuildBlockDebugParam(windowRef, key) {
  const location = windowRef?.location;
  const searchParams = new URLSearchParams(location?.search || "");
  const hashParams = new URLSearchParams(String(location?.hash || "").replace(/^#/, ""));
  return searchParams.get(key) || hashParams.get(key);
}

function isBuildBlockDebugEnabled(windowRef) {
  if (globalThis.__SMALL_ISLAND_DEBUG_BUILD_BLOCK__ === true) {
    return true;
  }

  if (
    isBuildBlockDebugFlagEnabled(getBuildBlockDebugParam(windowRef, "debugBuildBlock")) ||
    isBuildBlockDebugFlagEnabled(getBuildBlockDebugParam(windowRef, "buildBlockDebug"))
  ) {
    return true;
  }

  try {
    return isBuildBlockDebugFlagEnabled(
      windowRef?.localStorage?.getItem?.(BUILD_BLOCK_DEBUG_STORAGE_KEY)
    );
  } catch {
    return false;
  }
}

export function createBuildBlockDebugOverlay({ mount, worldCanvas } = {}) {
  const documentRef = mount?.ownerDocument || worldCanvas?.ownerDocument || globalThis.document;
  const windowRef = documentRef?.defaultView || globalThis.window;
  let element = null;

  function ensureElement() {
    if (element || !documentRef?.createElement) {
      return element;
    }

    element = documentRef.createElement("pre");
    element.dataset.buildBlockDebug = "true";
    element.style.position = "fixed";
    element.style.left = "12px";
    element.style.bottom = "12px";
    element.style.zIndex = "999999";
    element.style.maxWidth = "min(560px, calc(100vw - 24px))";
    element.style.margin = "0";
    element.style.padding = "10px 12px";
    element.style.border = "2px solid #ffe66d";
    element.style.background = "rgba(0, 0, 0, 0.86)";
    element.style.color = "#ffe66d";
    element.style.font = "12px/1.35 monospace";
    element.style.whiteSpace = "pre-wrap";
    element.style.pointerEvents = "none";
    element.style.textShadow = "1px 1px 0 #000";

    (mount || documentRef.body)?.appendChild(element);
    return element;
  }

  return {
    update(debug) {
      if (windowRef) {
        windowRef.__smallIslandBuildBlockDebug = debug || null;
      }

      if (!isBuildBlockDebugEnabled(windowRef)) {
        if (element) {
          element.hidden = true;
        }
        return;
      }

      const resolvedElement = ensureElement();
      if (!resolvedElement) {
        return;
      }

      resolvedElement.hidden = false;
      resolvedElement.textContent = formatBuildBlockDebugLines(debug).join("\n");
    }
  };
}