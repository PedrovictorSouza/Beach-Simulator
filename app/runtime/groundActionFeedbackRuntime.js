const GAMEPLAY_GROUND_ACTION_FEEDBACK_DURATION_MS = 1000;
const GAMEPLAY_FIELD_TOOL_TARGET_PULSE_DURATION_MS = 500;
const GAMEPLAY_FIELD_TOOL_TARGET_PULSE_MIN_SCALE = 0.7;
const GAMEPLAY_FIELD_TOOL_TARGET_PULSE_FLASH_BRIGHTNESS = 0.4;

export function createGameplayGroundActionFeedbackRuntime({
  clamp01,
  playInvalidSfx = () => {}
}) {
  return createGroundActionFeedbackRuntime({
    clamp01,
    playInvalidSfx,
    feedbackDurationMs: GAMEPLAY_GROUND_ACTION_FEEDBACK_DURATION_MS,
    fieldToolTargetPulseDurationMs: GAMEPLAY_FIELD_TOOL_TARGET_PULSE_DURATION_MS,
    fieldToolTargetPulseMinScale: GAMEPLAY_FIELD_TOOL_TARGET_PULSE_MIN_SCALE,
    fieldToolTargetPulseFlashBrightness:
      GAMEPLAY_FIELD_TOOL_TARGET_PULSE_FLASH_BRIGHTNESS
  });
}

export function createGroundActionFeedbackRuntime({
  clamp01,
  playInvalidSfx,
  feedbackDurationMs,
  fieldToolTargetPulseDurationMs,
  fieldToolTargetPulseMinScale,
  fieldToolTargetPulseFlashBrightness
}) {
  let feedbacks = [];
  let pulseStartedAt = Number.NEGATIVE_INFINITY;
  let pulseAbilityId = null;

  function normalizeFeedbackCells(groundCells, abilityId) {
    const cells = Array.isArray(groundCells) ? groundCells : [groundCells];
    const seenCellIds = new Set();
    const targetState = abilityId === "invalid" ? "invalid" : "valid";

    return cells
      .filter((groundCell) => {
        if (!groundCell || !Array.isArray(groundCell.offset)) {
          return false;
        }

        const cellKey = groundCell.id || groundCell;
        if (seenCellIds.has(cellKey)) {
          return false;
        }

        seenCellIds.add(cellKey);
        return true;
      })
      .map((groundCell) => ({
        ...groundCell,
        highlightTargetState: groundCell.highlightTargetState || targetState,
        highlightAbilityId: groundCell.highlightAbilityId || abilityId
      }));
  }

  function triggerFeedback(groundCells, abilityId, now, options = {}) {
    const markedGroundCells = normalizeFeedbackCells(groundCells, abilityId);
    if (!markedGroundCells.length) {
      return;
    }

    const durationMs = Math.max(
      0,
      Number(options.durationMs || feedbackDurationMs)
    );
    feedbacks.push({
      groundCells: markedGroundCells,
      abilityId,
      startedAt: now,
      expiresAt: now + durationMs,
      durationMs
    });
  }

  function flushQueuedFeedback(session, now) {
    const queuedFeedback = Array.isArray(session?.groundActionFeedbackQueue) ?
      session.groundActionFeedbackQueue.splice(0) :
      [];

    for (const feedback of queuedFeedback) {
      triggerFeedback(
        feedback?.groundCells || feedback?.groundCell,
        feedback?.abilityId || "waterGun",
        Number.isFinite(feedback?.startedAt) ? feedback.startedAt : now
      );
    }
  }

  function triggerInvalid(groundCell, now) {
    if (!groundCell) {
      return;
    }

    triggerFeedback(groundCell, "invalid", now);
    playInvalidSfx();
  }

  function getFeedbackFrame({ session, now }) {
    flushQueuedFeedback(session, now);
    feedbacks = feedbacks.filter((feedback) => {
      return feedback?.expiresAt > now &&
        Array.isArray(feedback.groundCells) &&
        feedback.groundCells.length;
    });

    if (!feedbacks.length) {
      return null;
    }

    const newestFeedback = feedbacks[feedbacks.length - 1];
    const durationMs = Math.max(1, Number(newestFeedback.durationMs || feedbackDurationMs));
    const progress = clamp01((now - newestFeedback.startedAt) / durationMs);
    const pulsePhase = newestFeedback.abilityId === "foundationComplete" ?
      0.5 + Math.sin(progress * Math.PI * 6) * 0.5 :
      Math.sin(progress * Math.PI);
    const markedGroundCells = [];
    const seenCellIds = new Set();

    for (const feedback of feedbacks) {
      for (const groundCell of feedback.groundCells) {
        const cellKey = groundCell.id || groundCell;
        if (seenCellIds.has(cellKey)) {
          continue;
        }

        seenCellIds.add(cellKey);
        markedGroundCells.push(groundCell);
      }
    }

    return {
      groundCell: markedGroundCells[0] || null,
      markedGroundCells,
      abilityId: newestFeedback.abilityId,
      pulsePhase
    };
  }

  function isPulseSource(source) {
    return source === "gamepadPrimary" || source === "keyboardPrimary";
  }

  function triggerPulse(abilityId, now) {
    pulseStartedAt = now;
    pulseAbilityId = abilityId || null;
  }

  function getPulseFrame(groundCell, now) {
    if (!groundCell || !Number.isFinite(pulseStartedAt)) {
      return null;
    }

    const progress = clamp01(
      (now - pulseStartedAt) / fieldToolTargetPulseDurationMs
    );

    if (progress >= 1) {
      pulseStartedAt = Number.NEGATIVE_INFINITY;
      pulseAbilityId = null;
      return null;
    }

    return {
      groundCell,
      abilityId: pulseAbilityId || groundCell.highlightAbilityId,
      progress,
      scale:
        fieldToolTargetPulseMinScale +
        (1 - fieldToolTargetPulseMinScale) * progress,
      brightness: 1 + (1 - progress) * fieldToolTargetPulseFlashBrightness
    };
  }

  return {
    triggerFeedback,
    triggerInvalid,
    getFeedbackFrame,
    isPulseSource,
    triggerPulse,
    getPulseFrame
  };
}
