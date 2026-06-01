export function createRepairBoxMotionRuntime({
  floatHeight,
  bobHeight,
  bobSpeed,
  spinSpeed
}) {
  let elapsed = 0;

  function update(deltaTime) {
    elapsed += deltaTime;
  }

  function getFloatOffset(position) {
    const bob = Math.sin(elapsed * bobSpeed) * bobHeight;

    return [
      position[0],
      position[1] + floatHeight + bob,
      position[2]
    ];
  }

  function getYaw(baseYaw) {
    return baseYaw + elapsed * spinSpeed;
  }

  return {
    getFloatOffset,
    getYaw,
    update
  };
}
