const DEFAULT_CONFIG = Object.freeze({
  modelPitchOffset: 0,
  openPitch: 0,
  openRoll: 0,
  openLift: 0,
  openBackstep: 0,
  revealBoxDuration: 1,
  revealBoxOpenStartProgress: 0,
  revealBoxShakeEndProgress: 0,
  revealBoxSpinAcceleration: 0,
  repairBoxRustleLift: 0,
  repairBoxRustleRoll: 0,
  repairBoxRustlePitch: 0,
  repairBoxRustleYaw: 0,
  investigationOffset: [0, 0, 0],
  activeTint: [0.38, 1.72, 0.42],
  activeTintStrength: 0.68,
  inactiveAlpha: 0.5
});

const REVEAL_BOX_TINT = Object.freeze([1.45, 1.72, 0.84]);

function defaultClamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function defaultEaseOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function defaultGetRepairBoxPosition(encounter) {
  return encounter?.repairBoxPosition || encounter?.repairPosition || null;
}

export function createCompanionRepairBoxModelRuntime({
  motion = null,
  getRepairBoxPosition = defaultGetRepairBoxPosition,
  clamp01 = defaultClamp01,
  easeOutCubic = defaultEaseOutCubic,
  isRevealBoxBotVisible = () => false,
  config = {}
} = {}) {
  const settings = {
    ...DEFAULT_CONFIG,
    ...config
  };

  function getOpeningProgress(encounter) {
    const revealBoxOpening = encounter?.revealBoxOpening;

    if (!revealBoxOpening?.active) {
      return 0;
    }

    const rawProgress = clamp01(
      Number(revealBoxOpening.elapsed || 0) / Number(revealBoxOpening.duration || 1)
    );
    const openStart = clamp01(
      Number(revealBoxOpening.openStartProgress ?? settings.revealBoxOpenStartProgress)
    );

    if (rawProgress <= openStart) {
      return 0;
    }

    return clamp01((rawProgress - openStart) / Math.max(0.001, 1 - openStart));
  }

  function syncRepairBoxInstance(instance, basePosition, active, { openingProgress = 0 } = {}) {
    if (!instance || !Array.isArray(basePosition)) {
      return;
    }

    const opened = easeOutCubic(openingProgress);

    instance.baseOffset = [...basePosition];
    instance.offset = motion?.getFloatOffset?.(basePosition) || [...basePosition];
    instance.repairBoxBaseYaw ??= Number(instance.yaw || 0);
    instance.repairBoxBaseScale ??= Number(instance.scale || 1);
    instance.scale = instance.repairBoxBaseScale;
    instance.yaw = motion?.getYaw?.(instance.repairBoxBaseYaw) ?? instance.repairBoxBaseYaw;
    instance.pitch = settings.modelPitchOffset;
    instance.roll = 0;

    if (opened > 0) {
      instance.repairBoxOpenYaw ??= instance.yaw;
      instance.yaw = instance.repairBoxOpenYaw;
      instance.pitch = settings.modelPitchOffset - settings.openPitch * opened;
      instance.roll = settings.openRoll * opened;
      instance.offset = [
        instance.offset[0],
        instance.offset[1] + settings.openLift * opened,
        instance.offset[2] + settings.openBackstep * opened
      ];
      instance.scale = instance.repairBoxBaseScale * (1 - 0.08 * opened);
    } else {
      instance.repairBoxOpenYaw = null;
    }

    instance.active = Boolean(active);
  }

  function applyRevealBoxCinematic(encounter) {
    const instance = encounter?.repairModuleInstance;
    const opening = encounter?.revealBoxOpening;

    if (!instance || !opening?.active) {
      return;
    }

    const duration = Math.max(0.001, Number(opening.duration || settings.revealBoxDuration));
    const elapsed = Math.max(0, Number(opening.elapsed || 0));
    const progress = clamp01(elapsed / duration);
    const shakeEnd = clamp01(
      Number(opening.shakeEndProgress ?? settings.revealBoxShakeEndProgress)
    );
    const openStart = clamp01(
      Number(opening.openStartProgress ?? settings.revealBoxOpenStartProgress)
    );
    const chargeProgress = clamp01(progress / Math.max(0.001, shakeEnd));
    const charge = chargeProgress * chargeProgress;
    const isDramaticPause = progress >= shakeEnd && progress < openStart;
    const shakeEnvelope = isDramaticPause ? 0 : Math.sin(chargeProgress * Math.PI * 0.5);
    const shake = shakeEnvelope * (0.018 + charge * 0.12);
    const light = clamp01(progress / Math.max(0.001, openStart));

    if (progress < openStart) {
      instance.yaw += elapsed * settings.revealBoxSpinAcceleration * charge;
      instance.pitch += Math.sin(elapsed * (24 + charge * 38)) * shake;
      instance.roll += Math.cos(elapsed * (28 + charge * 42)) * shake;
      instance.offset = [
        instance.offset[0] + Math.sin(elapsed * (31 + charge * 28)) * shake,
        instance.offset[1] + Math.abs(Math.sin(elapsed * (18 + charge * 30))) * shake * 1.8,
        instance.offset[2] + Math.cos(elapsed * (29 + charge * 26)) * shake
      ];
    }

    instance.tint = [...REVEAL_BOX_TINT];
    instance.tintStrength = Math.max(Number(instance.tintStrength || 0), 0.32 + light * 0.58);
    instance.alpha = 1;
    instance.scale *= 1 + Math.sin(progress * Math.PI) * 0.045;
  }

  function applyRepairBoxRustle(encounter) {
    const instance = encounter?.repairModuleInstance;
    const rustle = encounter?.repairBoxRustle;

    if (!instance || !rustle?.active) {
      return;
    }

    const duration = Math.max(0.001, Number(rustle.duration || 1));
    const elapsed = Math.max(0, Number(rustle.elapsed || 0));
    const progress = clamp01(elapsed / duration);
    const envelope = Math.sin(progress * Math.PI);
    const bounce = Math.abs(Math.sin(elapsed * 32));
    const twist = Math.sin(elapsed * 46);
    const counterTwist = Math.sin(elapsed * 39 + Math.PI * 0.35);

    instance.offset = [
      instance.offset[0] + twist * envelope * 0.055,
      instance.offset[1] + bounce * envelope * settings.repairBoxRustleLift,
      instance.offset[2] + counterTwist * envelope * 0.045
    ];
    instance.roll += twist * envelope * settings.repairBoxRustleRoll;
    instance.pitch += counterTwist * envelope * settings.repairBoxRustlePitch;
    instance.yaw += Math.sin(elapsed * 52) * envelope * settings.repairBoxRustleYaw;
  }

  function syncDismantledEncounterModule(encounter) {
    if (!encounter?.repairModuleInstance) {
      return;
    }

    const openingProgress = getOpeningProgress(encounter);
    const revealBoxOpening = encounter.revealBoxOpening;
    const hideBoxAfterReveal = Boolean(
      revealBoxOpening?.hideBoxWhenVisible &&
      isRevealBoxBotVisible(revealBoxOpening)
    );

    syncRepairBoxInstance(
      encounter.repairModuleInstance,
      getRepairBoxPosition(encounter),
      !hideBoxAfterReveal && (openingProgress > 0 || !encounter.visible),
      { openingProgress }
    );
    applyRevealBoxCinematic(encounter);
    applyRepairBoxRustle(encounter);
  }

  function syncActiveHighlight({
    repairModuleInstances = [],
    revealEncounters = []
  } = {}) {
    const revealOpeningInstances = new Set(
      revealEncounters
        .filter((encounter) => encounter?.revealBoxOpening?.active)
        .map((encounter) => encounter?.repairModuleInstance)
        .filter(Boolean)
    );
    let highlighted = false;

    for (const repairModuleInstance of repairModuleInstances) {
      if (!repairModuleInstance) {
        continue;
      }

      if (revealOpeningInstances.has(repairModuleInstance)) {
        highlighted = true;
        continue;
      }

      if (!highlighted && repairModuleInstance.active) {
        repairModuleInstance.tint = settings.activeTint;
        repairModuleInstance.tintStrength = settings.activeTintStrength;
        repairModuleInstance.alpha = 1;
        highlighted = true;
        continue;
      }

      repairModuleInstance.tint = null;
      repairModuleInstance.tintStrength = 0;
      repairModuleInstance.alpha = repairModuleInstance.active ? settings.inactiveAlpha : 1;
    }
  }

  function isRustlingInvestigationActive({
    encounter = null,
    flags = {},
    groundGrassPatches = []
  } = {}) {
    const rustlingGrassCellId = flags.rustlingGrassCellId;

    if (
      !rustlingGrassCellId ||
      !flags.chopperBulbasaurRepairBoxIntroComplete ||
      flags.bulbasaurRevealed ||
      !encounter?.repairModuleInstance?.active
    ) {
      return false;
    }

    return (groundGrassPatches || []).some((groundGrassPatch) => {
      return groundGrassPatch?.cellId === rustlingGrassCellId &&
        groundGrassPatch.state === "alive";
    });
  }

  function getInvestigationTarget({
    encounter = null,
    flags = {},
    groundGrassPatches = []
  } = {}) {
    if (!isRustlingInvestigationActive({ encounter, flags, groundGrassPatches })) {
      return null;
    }

    const repairBoxPosition = getRepairBoxPosition(encounter);

    if (!Array.isArray(repairBoxPosition)) {
      return null;
    }

    return {
      position: [
        repairBoxPosition[0] + settings.investigationOffset[0],
        repairBoxPosition[1] + settings.investigationOffset[1],
        repairBoxPosition[2] + settings.investigationOffset[2]
      ],
      lookAtPosition: [...repairBoxPosition]
    };
  }

  function updateRepairBoxRustle(encounter, deltaTime) {
    const rustle = encounter?.repairBoxRustle;

    if (!rustle?.active) {
      return;
    }

    const duration = Math.max(0.001, Number(rustle.duration || 1));
    rustle.elapsed = Math.min(duration, Number(rustle.elapsed || 0) + deltaTime);

    if (rustle.elapsed >= duration) {
      rustle.active = false;
    }
  }

  return {
    applyRepairBoxRustle,
    applyRevealBoxCinematic,
    getInvestigationTarget,
    getOpeningProgress,
    isRustlingInvestigationActive,
    syncActiveHighlight,
    syncDismantledEncounterModule,
    syncRepairBoxInstance,
    updateRepairBoxRustle
  };
}
