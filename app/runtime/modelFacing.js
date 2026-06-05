export function getYawToward(fromPosition, toPosition) {
  return Math.atan2(
    toPosition[0] - fromPosition[0],
    toPosition[2] - fromPosition[2]
  );
}

export function getModelYawToward(fromPosition, toPosition, modelFaceYawOffset = 0) {
  return getYawToward(fromPosition, toPosition) + modelFaceYawOffset;
}

export function getLogicalFacingYaw(modelYaw, modelFaceYawOffset = 0) {
  return (modelYaw || 0) - modelFaceYawOffset;
}
