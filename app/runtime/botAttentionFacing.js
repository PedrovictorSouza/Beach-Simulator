const DEFAULT_ATTENTION_DISTANCE = 4.8;
const MIN_FACE_DISTANCE = 0.08;

function isWorldPosition(position) {
  return (
    Array.isArray(position) &&
    position.length >= 3 &&
    Number.isFinite(position[0]) &&
    Number.isFinite(position[2])
  );
}

function getYawToward(fromPosition, toPosition) {
  return Math.atan2(
    toPosition[0] - fromPosition[0],
    toPosition[2] - fromPosition[2]
  );
}

export function resolveBotAttentionFacing({
  botPosition,
  playerPosition,
  attentionDistance = DEFAULT_ATTENTION_DISTANCE,
  modelFaceYawOffset = 0
} = {}) {
  if (!isWorldPosition(botPosition) || !isWorldPosition(playerPosition)) {
    return null;
  }

  const maxDistance = Number(attentionDistance);
  if (!(maxDistance > 0)) {
    return null;
  }

  const distance = Math.hypot(
    playerPosition[0] - botPosition[0],
    playerPosition[2] - botPosition[2]
  );

  if (distance > maxDistance || distance < MIN_FACE_DISTANCE) {
    return null;
  }

  return {
    distance,
    yaw: getYawToward(botPosition, playerPosition) + modelFaceYawOffset
  };
}

