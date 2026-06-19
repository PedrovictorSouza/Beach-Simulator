export function getRuntimeNowMs() {
  return typeof performance !== "undefined" && typeof performance.now === "function" ?
    performance.now() :
    Date.now();
}

export function getRuntimeNowSeconds() {
  return getRuntimeNowMs() * 0.001;
}
