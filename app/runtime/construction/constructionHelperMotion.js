export function moveConstructionHelperToLeafDen({
  encounter = null,
  leafDenPosition = null,
  offset = [0, 0, 0],
  modelFaceYawOffset = 0,
  nowSeconds = 0,
  getYawToward = () => 0
} = {}) {
  if (!encounter || !Array.isArray(leafDenPosition)) {
    return false;
  }

  const anchor = leafDenPosition;
  const squash = Math.sin(nowSeconds * 9 + offset[0] * 3 + offset[2]) * 0.045;
  encounter.visible = true;
  encounter.position = [
    anchor[0] + offset[0] + Math.sin(nowSeconds * 5.5 + offset[2]) * 0.08,
    0.04,
    anchor[2] + offset[2] + Math.cos(nowSeconds * 4.8 + offset[0]) * 0.06
  ];

  if (encounter.modelInstance) {
    encounter.modelInstance.yaw = getYawToward(
      encounter.position,
      anchor,
      modelFaceYawOffset
    );
    encounter.modelInstance.scale = Math.max(0.1, Number(encounter.modelInstance.scale || 1) + squash);
  }

  return true;
}

export function createConstructionHelperMotionRuntime({
  getLeafDenPosition = () => null,
  getNowSeconds = () => 0,
  getYawToward = () => 0
} = {}) {
  function moveToLeafDen(encounter, {
    offset = [0, 0, 0],
    modelFaceYawOffset = 0,
    nowSeconds = getNowSeconds()
  } = {}) {
    return moveConstructionHelperToLeafDen({
      encounter,
      leafDenPosition: getLeafDenPosition(),
      offset,
      modelFaceYawOffset,
      nowSeconds,
      getYawToward
    });
  }

  return {
    moveToLeafDen
  };
}
