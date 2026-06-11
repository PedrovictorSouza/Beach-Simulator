const DEFAULT_CONFIG = Object.freeze({
  flowerGroupId: "water-gun-flower-field-0",
  lockedAlpha: 0.5,
  activeTint: [0.38, 1.72, 0.42],
  activeTintStrength: 0.68,
  beeCount: 10,
  beeScale: 0.15,
  patrolRadiusX: 5.8,
  patrolRadiusZ: 4.3,
  baseHeight: 1.04,
  bobHeight: 0.22,
  modelFaceYawOffset: Math.PI
});

const NOOP = () => {};

export function createBeeFieldRuntime({
  session = {},
  controls = {},
  repairBoxRuntime = null,
  syncInteractablePosition = NOOP,
  config = {}
} = {}) {
  const settings = {
    ...DEFAULT_CONFIG,
    ...config
  };

  function isRestored() {
    return (controls.storyState?.flags?.restoredFlowerBedHabitatIds || [])
      .includes(settings.flowerGroupId);
  }

  function isOpened() {
    return Boolean(controls.storyState?.flags?.beeFieldRepairBoxOpened);
  }

  function syncRepairBox() {
    const beeFieldRepairBox = session.beeFieldRepairBox;

    if (!beeFieldRepairBox) {
      return;
    }

    const basePosition = beeFieldRepairBox.baseOffset || beeFieldRepairBox.offset;
    const unlocked = isRestored();
    const opened = isOpened();

    repairBoxRuntime?.syncRepairBoxInstance?.(
      beeFieldRepairBox,
      basePosition,
      true,
      { openingProgress: opened ? 1 : 0 }
    );
    syncInteractablePosition("beeFieldRepairBox", basePosition);
    beeFieldRepairBox.alpha = unlocked ? 1 : settings.lockedAlpha;
    beeFieldRepairBox.tint = unlocked && !opened ? settings.activeTint : null;
    beeFieldRepairBox.tintStrength = unlocked && !opened ? settings.activeTintStrength : 0;
  }

  function getCenterPosition() {
    const repairBox = session.beeFieldRepairBox;

    if (Array.isArray(repairBox?.baseOffset)) {
      return repairBox.baseOffset;
    }

    if (Array.isArray(repairBox?.offset)) {
      return repairBox.offset;
    }

    const patches = (session.groundFlowerPatches || [])
      .filter((patch) => {
        return patch.habitatGroupId === settings.flowerGroupId &&
          Array.isArray(patch.position);
      });

    if (patches.length === 0) {
      return null;
    }

    const total = patches.reduce((sum, patch) => {
      sum[0] += patch.position[0];
      sum[1] += patch.position[1] || 0;
      sum[2] += patch.position[2];
      return sum;
    }, [0, 0, 0]);

    return [
      total[0] / patches.length,
      total[1] / patches.length,
      total[2] / patches.length
    ];
  }

  function createBeeInstance(index) {
    return {
      id: `bee-field-bee-${index}`,
      offset: [0, 0, 0],
      scale: settings.beeScale,
      yaw: settings.modelFaceYawOffset,
      pitch: 0,
      roll: 0,
      active: true,
      patrolAngle: (index / settings.beeCount) * Math.PI * 2,
      patrolRadiusScale: 0.62 + (index % 5) * 0.09,
      angularSpeed: 0.42 + (index % 4) * 0.055,
      bobPhase: index * 1.71,
      bobSpeed: 1.7 + (index % 3) * 0.18
    };
  }

  function syncBees(deltaTime) {
    if (!Array.isArray(session.beeInstances)) {
      return;
    }

    const center = getCenterPosition();

    if (!isOpened() || !session.beeModel || !center) {
      session.beeInstances.length = 0;
      return;
    }

    session.beePatrolState ||= { elapsed: 0 };
    session.beePatrolState.elapsed += Math.max(0, Number(deltaTime) || 0);

    while (session.beeInstances.length < settings.beeCount) {
      session.beeInstances.push(createBeeInstance(session.beeInstances.length));
    }

    if (session.beeInstances.length > settings.beeCount) {
      session.beeInstances.length = settings.beeCount;
    }

    const elapsed = session.beePatrolState.elapsed;

    session.beeInstances.forEach((bee, index) => {
      const angle = bee.patrolAngle + elapsed * bee.angularSpeed;
      const radiusScale = bee.patrolRadiusScale || 1;
      const wobble = Math.sin(elapsed * 1.3 + bee.bobPhase) * 0.28;
      const x = center[0] + Math.cos(angle) * settings.patrolRadiusX * radiusScale +
        Math.sin(angle * 2 + bee.bobPhase) * 0.26;
      const z = center[2] + Math.sin(angle) * settings.patrolRadiusZ * radiusScale +
        Math.cos(angle * 2 + bee.bobPhase) * 0.18;
      const y = (center[1] || 0) + settings.baseHeight +
        Math.sin(elapsed * bee.bobSpeed + bee.bobPhase) * settings.bobHeight;

      bee.active = true;
      bee.offset[0] = x;
      bee.offset[1] = y;
      bee.offset[2] = z;
      bee.scale = settings.beeScale * (0.9 + (index % 3) * 0.06);
      bee.yaw = angle + Math.PI * 0.5 + settings.modelFaceYawOffset;
      bee.pitch = Math.sin(elapsed * 1.8 + bee.bobPhase) * 0.04;
      bee.roll = wobble * 0.08;
    });
  }

  return {
    getCenterPosition,
    isOpened,
    isRestored,
    syncBees,
    syncRepairBox
  };
}
