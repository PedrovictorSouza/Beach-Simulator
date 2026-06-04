const GRASS_PLAYER_BEND_RADIUS = 0.92;
const GRASS_PLAYER_BEND_OFFSET = 0.14;
const GRASS_PLAYER_BEND_SWAY = 0.18;

const EMPTY_GRASS_PLAYER_BEND = Object.freeze({
  offsetX: 0,
  offsetZ: 0,
  swayStrength: 0
});

export function getGrassPlayerBend(groundGrassPatch, playerPosition) {
  if (!Array.isArray(groundGrassPatch?.position) || !Array.isArray(playerPosition)) {
    return EMPTY_GRASS_PLAYER_BEND;
  }

  let deltaX = groundGrassPatch.position[0] - playerPosition[0];
  let deltaZ = groundGrassPatch.position[2] - playerPosition[2];
  let distance = Math.hypot(deltaX, deltaZ);

  if (distance >= GRASS_PLAYER_BEND_RADIUS) {
    return EMPTY_GRASS_PLAYER_BEND;
  }

  if (distance < 0.001) {
    deltaX = 1;
    deltaZ = 0;
    distance = 0.001;
  }

  const proximity = 1 - distance / GRASS_PLAYER_BEND_RADIUS;
  const strength = proximity * proximity;
  const directionX = deltaX / distance;
  const directionZ = deltaZ / distance;

  return {
    offsetX: directionX * GRASS_PLAYER_BEND_OFFSET * strength,
    offsetZ: directionZ * GRASS_PLAYER_BEND_OFFSET * strength,
    swayStrength: directionX * GRASS_PLAYER_BEND_SWAY * strength
  };
}
