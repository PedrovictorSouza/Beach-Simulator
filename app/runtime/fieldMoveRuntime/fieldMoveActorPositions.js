function getActorPosition(actor, fallbackPosition = null) {
  return actor?.position || actor?.modelInstance?.offset || fallbackPosition;
}

function getOffsetPosition(position, yaw, forwardOffset, heightOffset) {
  return [
    position[0] + Math.sin(yaw) * forwardOffset,
    (position[1] || 0) + heightOffset,
    position[2] + Math.cos(yaw) * forwardOffset
  ];
}

export function getSquirtleMouthPosition({
  squirtle = null,
  yaw = 0
} = {}) {
  return getOffsetPosition(
    getActorPosition(squirtle, [0, 0, 0]),
    yaw,
    0.34,
    0.66
  );
}

export function getCharmanderMouthPosition({
  charmander = null,
  yaw = 0
} = {}) {
  return getOffsetPosition(
    getActorPosition(charmander, [0, 0, 0]),
    yaw,
    0.28,
    0.58
  );
}

export function getBulbasaurGrowEmitterPosition({
  bulbasaur = null,
  yaw = 0
} = {}) {
  return getOffsetPosition(
    getActorPosition(bulbasaur, [0, 0, 0]),
    yaw,
    0.3,
    0.72
  );
}

export function getSquirtleWorldPosition({
  squirtle = null
} = {}) {
  return getActorPosition(squirtle, null);
}

export function getCharmanderWorldPosition({
  charmander = null
} = {}) {
  return getActorPosition(charmander, null);
}
