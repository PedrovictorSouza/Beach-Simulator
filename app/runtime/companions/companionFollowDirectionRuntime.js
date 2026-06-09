export function createCompanionFollowDirectionRuntime() {
  let direction = null;

  function update(deltaX, deltaZ) {
    const distance = Math.hypot(deltaX, deltaZ);
    if (distance <= 0.0005) {
      return false;
    }

    direction = [deltaX / distance, deltaZ / distance];
    return true;
  }

  function get(playerYaw) {
    if (direction) {
      return direction;
    }

    const safePlayerYaw = Number(playerYaw);
    if (Number.isFinite(safePlayerYaw)) {
      return [Math.cos(safePlayerYaw), Math.sin(safePlayerYaw)];
    }

    return [0, -1];
  }

  return {
    get,
    update
  };
}
