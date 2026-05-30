export function createSnowstormFogRuntime({
  mount,
  getSnowstormFogIntensity,
  maxOpacity,
  opacityEase,
  clamp01
}) {
  let element = null;
  let opacity = 0;

  function getOverlayElement() {
    if (
      element ||
      typeof HTMLElement === "undefined" ||
      !(mount instanceof HTMLElement) ||
      typeof document === "undefined"
    ) {
      return element;
    }

    element = document.createElement("div");
    element.dataset.snowstormFog = "true";
    element.hidden = true;
    element.style.cssText = [
      "position:absolute",
      "left:50%",
      "top:50%",
      "width:var(--game-stage-width)",
      "height:var(--game-stage-height)",
      "transform:translate(-50%, -50%) scale(var(--render-frame-scale))",
      "transform-origin:center center",
      "z-index:2",
      "opacity:0",
      "pointer-events:none",
      "image-rendering:pixelated",
      "will-change:opacity,background-position",
      "background-blend-mode:normal,screen,screen",
      `background:${[
        "radial-gradient(circle at 50% 52%, rgba(236,244,246,0.2) 0%, rgba(208,222,226,0.28) 30%, rgba(170,188,196,0.58) 72%, rgba(138,154,164,0.76) 100%)",
        "repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0 2px, rgba(255,255,255,0) 2px 9px)",
        "repeating-linear-gradient(90deg, rgba(218,236,242,0.1) 0 3px, rgba(218,236,242,0) 3px 12px)"
      ].join(",")}`
    ].join(";");
    mount.append(element);
    return element;
  }

  function setOpacity(nextOpacity, elapsed = 0) {
    const normalizedOpacity = clamp01(nextOpacity);

    if (normalizedOpacity <= 0.01) {
      if (element) {
        element.hidden = true;
        element.style.opacity = "0";
      }
      return;
    }

    const overlayElement = getOverlayElement();
    if (!overlayElement) {
      return;
    }

    overlayElement.hidden = false;
    overlayElement.style.opacity = normalizedOpacity.toFixed(3);
    overlayElement.style.backgroundPosition = [
      "center center",
      `0 ${Math.round(elapsed * 8)}px`,
      `${Math.round(elapsed * -5)}px 0`
    ].join(",");
  }

  function update({ session, deltaTime }) {
    const playerPosition = session.playerCharacter?.getPosition?.() || null;
    const fogIntensity = session.snowstorm?.fogIntensity ??
      getSnowstormFogIntensity(session.snowstorm, playerPosition);
    const targetOpacity = fogIntensity * maxOpacity;
    const easedAmount = 1 - Math.exp(-opacityEase * Math.max(deltaTime, 0));

    opacity += (targetOpacity - opacity) * easedAmount;
    setOpacity(opacity, session.snowstorm?.elapsed || 0);
  }

  return {
    update
  };
}
