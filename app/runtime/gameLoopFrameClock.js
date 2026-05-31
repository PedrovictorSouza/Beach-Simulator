export function createGameLoopFrameClock({
  now,
  maxDeltaTime
}) {
  let previousTime = now;

  function update(nextTime) {
    const rawDeltaTime = Math.max(0, (nextTime - previousTime) / 1000);
    const deltaTime = Math.min(maxDeltaTime, rawDeltaTime);
    previousTime = nextTime;

    return {
      rawDeltaTime,
      deltaTime
    };
  }

  return {
    update
  };
}
