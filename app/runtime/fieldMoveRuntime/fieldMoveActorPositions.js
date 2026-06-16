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

export function createFieldMoveActorPositionRuntime({
  getSquirtle = () => null,
  getCharmander = () => null,
  getBulbasaur = () => null,
  getSquirtleYaw = () => 0,
  getCharmanderYaw = () => 0,
  getBulbasaurYaw = () => 0
} = {}) {
  function resolveSquirtleMouthPosition() {
    return getSquirtleMouthPosition({
      squirtle: getSquirtle(),
      yaw: getSquirtleYaw()
    });
  }

  function resolveCharmanderMouthPosition() {
    return getCharmanderMouthPosition({
      charmander: getCharmander(),
      yaw: getCharmanderYaw()
    });
  }

  function resolveBulbasaurGrowEmitterPosition() {
    return getBulbasaurGrowEmitterPosition({
      bulbasaur: getBulbasaur(),
      yaw: getBulbasaurYaw()
    });
  }

  function resolveSquirtleWorldPosition() {
    return getSquirtleWorldPosition({
      squirtle: getSquirtle()
    });
  }

  function resolveCharmanderWorldPosition() {
    return getCharmanderWorldPosition({
      charmander: getCharmander()
    });
  }

  return {
    getBulbasaurGrowEmitterPosition: resolveBulbasaurGrowEmitterPosition,
    getCharmanderMouthPosition: resolveCharmanderMouthPosition,
    getCharmanderWorldPosition: resolveCharmanderWorldPosition,
    getSquirtleMouthPosition: resolveSquirtleMouthPosition,
    getSquirtleWorldPosition: resolveSquirtleWorldPosition
  };
}
