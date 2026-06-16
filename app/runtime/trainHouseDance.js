import {
  TRAIN_HOUSE_DANCE_FORWARD_SWAY,
  TRAIN_HOUSE_DANCE_SCALE_PULSE,
  TRAIN_HOUSE_DANCE_SIDE_SWAY,
  TRAIN_HOUSE_DANCE_TOP_SWAY,
  TRAIN_HOUSE_DANCE_YAW_SWAY
} from "./gameplayPresentationTuning.js";

const THERMAL_CABIN_HOME_BEAT_DISTANCE = 1.9;

export function applyTrainHouseDance(instance, placementPosition, nowSeconds = 0, placementYaw = 0) {
  if (!instance || !Array.isArray(placementPosition)) {
    return false;
  }

  const baseScale = instance.trainHouseBaseScale ?? Number(instance.scale || 1);
  const baseYaw = instance.trainHouseBaseYaw ?? Number(instance.yaw || 0);
  const groundY = instance.trainHouseGroundY ?? Number(instance.offset?.[1] ?? placementPosition[1] ?? 0.02);
  instance.trainHouseBaseScale = baseScale;
  instance.trainHouseBaseYaw = baseYaw;
  instance.trainHouseGroundY = groundY;

  const beat = Number.isFinite(nowSeconds) ? nowSeconds : 0;
  instance.offset = [
    placementPosition[0] + Math.sin(beat * 3.4) * TRAIN_HOUSE_DANCE_SIDE_SWAY,
    groundY,
    placementPosition[2] + Math.sin(beat * 4.8 + 1.1) * TRAIN_HOUSE_DANCE_FORWARD_SWAY
  ];
  instance.scale = baseScale * (1 + Math.sin(beat * 5.2) * TRAIN_HOUSE_DANCE_SCALE_PULSE);
  instance.yaw =
    baseYaw +
    Number(placementYaw || 0) +
    Math.sin(beat * 3.1 + 0.4) * TRAIN_HOUSE_DANCE_YAW_SWAY;
  instance.swayStrength = Math.sin(beat * 4.4 + 0.6) * TRAIN_HOUSE_DANCE_TOP_SWAY;
  instance.active = true;
  return true;
}

export function shouldCompleteThermalCabinHomeBeat({
  thermalBotFollowing = false,
  thermalBotRegistered = false,
  thermalBotPosition,
  playerPosition,
  trainHousePosition,
  alreadyComplete = false,
  activationDistance = THERMAL_CABIN_HOME_BEAT_DISTANCE
} = {}) {
  if (
    alreadyComplete ||
    (!thermalBotFollowing && !thermalBotRegistered) ||
    !Array.isArray(trainHousePosition)
  ) {
    return false;
  }

  const isNearTrainHouse = (position) => {
    if (!Array.isArray(position)) {
      return false;
    }

    const distance = Math.hypot(
      Number(position[0]) - Number(trainHousePosition[0]),
      Number(position[2]) - Number(trainHousePosition[2])
    );
    return Number.isFinite(distance) && distance <= activationDistance;
  };

  if (thermalBotFollowing && isNearTrainHouse(thermalBotPosition)) {
    return true;
  }

  return isNearTrainHouse(playerPosition);
}
