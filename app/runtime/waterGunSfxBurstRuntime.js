export function createWaterGunSfxBurstRuntime() {
  let untilSeconds = 0;

  function trigger(nowSeconds, durationSeconds) {
    untilSeconds = Math.max(untilSeconds, nowSeconds + durationSeconds);
  }

  function isActive(nowSeconds) {
    return nowSeconds < untilSeconds;
  }

  return {
    isActive,
    trigger
  };
}
