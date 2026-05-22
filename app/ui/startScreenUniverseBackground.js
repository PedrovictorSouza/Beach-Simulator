const STAR_COLORS = [
  "#ff3158",
  "#36ff66",
  "#4c84ff",
  "#ffe45c",
  "#ff55f0",
  "#44fff4",
  "#ffffff",
  "#ff9f38"
];

const DEFAULT_STAR_COUNT = 560;
const DEFAULT_SEED = 0x51a7f13d;
const DEFAULT_CANVAS_CLASS_NAME = "start-screen-universe";
const NEBULA_PALETTES = Object.freeze({
  dark: Object.freeze({
    base: "#03050d",
    bandStops: Object.freeze([
      [0, "rgba(34, 14, 62, 0.16)"],
      [0.45, "rgba(20, 74, 126, 0.32)"],
      [0.72, "rgba(92, 64, 32, 0.13)"],
      [1, "rgba(5, 5, 18, 0)"]
    ]),
    nebulaStops: Object.freeze([
      [0, "rgba(65, 18, 99, 0.24)"],
      [0.42, "rgba(8, 68, 110, 0.18)"],
      [0.72, "rgba(34, 11, 56, 0.09)"],
      [1, "rgba(0, 0, 0, 0)"]
    ])
  }),
  lightBlue: Object.freeze({
    base: "#7ab7d9",
    bandStops: Object.freeze([
      [0, "rgba(255, 255, 255, 0.34)"],
      [0.38, "rgba(121, 203, 238, 0.46)"],
      [0.7, "rgba(43, 101, 163, 0.3)"],
      [1, "rgba(32, 78, 139, 0.1)"]
    ]),
    nebulaStops: Object.freeze([
      [0, "rgba(255, 255, 255, 0.42)"],
      [0.36, "rgba(94, 188, 230, 0.3)"],
      [0.7, "rgba(36, 92, 158, 0.2)"],
      [1, "rgba(22, 54, 118, 0.06)"]
    ])
  }),
  purpleBlue: Object.freeze({
    base: "#3f1f86",
    bandStops: Object.freeze([
      [0, "rgba(198, 239, 255, 0.46)"],
      [0.38, "rgba(111, 190, 238, 0.44)"],
      [0.7, "rgba(74, 87, 184, 0.32)"],
      [1, "rgba(54, 24, 108, 0.12)"]
    ]),
    nebulaStops: Object.freeze([
      [0, "rgba(213, 246, 255, 0.42)"],
      [0.36, "rgba(112, 202, 241, 0.3)"],
      [0.7, "rgba(76, 83, 174, 0.22)"],
      [1, "rgba(44, 18, 92, 0.08)"]
    ])
  })
});

function createSeededRandom(seed = DEFAULT_SEED) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createStars(count = DEFAULT_STAR_COUNT) {
  const random = createSeededRandom();

  return Array.from({ length: count }, () => {
    const distance = Math.sqrt(random());
    const angle = random() * Math.PI * 2;
    const z = 0.22 + random() * 0.78;
    const rareFlash = random() > 0.92;

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      z,
      color: STAR_COLORS[Math.floor(random() * STAR_COLORS.length)],
      size: (rareFlash ? 2.5 + random() * 3.4 : 0.7 + random() * 1.8) * z,
      phase: random() * Math.PI * 2,
      speed: 0.45 + random() * 2.4,
      drift: 0.6 + random() * 1.8,
      flare: rareFlash ? 1 : random() * 0.35
    };
  });
}

function getCanvasContext(canvas) {
  try {
    return canvas.getContext?.("2d") || null;
  } catch {
    return null;
  }
}

function getPixelRatio(windowRef) {
  const ratio = Number(windowRef?.devicePixelRatio) || 1;
  return Math.min(Math.max(ratio, 1), 2);
}

function getSurfaceSize(root, windowRef) {
  const rect = root.getBoundingClientRect?.();
  const width = rect?.width || root.clientWidth || windowRef.innerWidth || 1280;
  const height = rect?.height || root.clientHeight || windowRef.innerHeight || 720;

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height))
  };
}

function resizeCanvas({ canvas, context, root, windowRef }) {
  const ratio = getPixelRatio(windowRef);
  const { width, height } = getSurfaceSize(root, windowRef);
  const pixelWidth = Math.round(width * ratio);
  const pixelHeight = Math.round(height * ratio);

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  return { width, height };
}

function resolveNebulaPalette(palette) {
  if (typeof palette === "string") {
    return NEBULA_PALETTES[palette] || NEBULA_PALETTES.dark;
  }

  return palette || NEBULA_PALETTES.dark;
}

function drawColorStops(gradient, stops) {
  for (const [offset, color] of stops) {
    gradient.addColorStop(offset, color);
  }
}

function drawNebula(context, width, height, time, pointer, palette) {
  context.globalCompositeOperation = "source-over";
  context.fillStyle = palette.base;
  context.fillRect(0, 0, width, height);

  const centerX = width * (0.5 + pointer.x * 0.035);
  const centerY = height * (0.5 + pointer.y * 0.03);
  const band = context.createLinearGradient(0, height * 0.2, width, height * 0.86);
  drawColorStops(band, palette.bandStops);
  context.fillStyle = band;
  context.fillRect(0, 0, width, height);

  const pulse = Math.sin(time * 0.00022) * 0.04;
  const nebulaRadius = Math.max(width, height) * (0.66 + pulse);
  const nebula = context.createRadialGradient(
    centerX,
    centerY,
    nebulaRadius * 0.08,
    centerX,
    centerY,
    nebulaRadius
  );
  drawColorStops(nebula, palette.nebulaStops);
  context.fillStyle = nebula;
  context.fillRect(0, 0, width, height);
}

function drawStar(context, x, y, size, alpha, color, flare) {
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, size, 0, Math.PI * 2);
  context.fill();

  if (flare <= 0.2 || size < 1.5) {
    return;
  }

  const ray = size * (3.6 + flare * 3);
  context.strokeStyle = color;
  context.lineWidth = Math.max(0.45, size * 0.28);
  context.globalAlpha = alpha * 0.55;
  context.beginPath();
  context.moveTo(x - ray, y);
  context.lineTo(x + ray, y);
  context.moveTo(x, y - ray);
  context.lineTo(x, y + ray);
  context.stroke();
}

function drawStars(context, width, height, stars, time, pointer) {
  context.globalCompositeOperation = "lighter";
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const radius = Math.max(width, height) * 0.62;

  for (const star of stars) {
    const twinkleWave = Math.sin(time * 0.001 * star.speed + star.phase) * 0.5 + 0.5;
    const flash = Math.pow(twinkleWave, 8) * star.flare;
    const alpha = Math.min(0.95, 0.16 + twinkleWave * 0.34 + flash * 0.7);
    const drift = Math.sin(time * 0.00008 * star.drift + star.phase) * 12;
    const parallaxX = pointer.x * (1 - star.z) * 52;
    const parallaxY = pointer.y * (1 - star.z) * 38;
    const x = centerX + star.x * radius * star.z + drift + parallaxX;
    const y = centerY + star.y * radius * star.z + parallaxY;
    const size = star.size * (0.85 + twinkleWave * 0.95 + flash);

    if (x < -24 || x > width + 24 || y < -24 || y > height + 24) {
      continue;
    }

    drawStar(context, x, y, size, alpha, star.color, star.flare);
  }

  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
}

function createMotionPreference(windowRef) {
  try {
    return windowRef.matchMedia?.("(prefers-reduced-motion: reduce)") || null;
  } catch {
    return null;
  }
}

export function createStartScreenUniverseBackground({
  root,
  windowRef = root?.ownerDocument?.defaultView || window,
  className = DEFAULT_CANVAS_CLASS_NAME,
  palette = "dark",
  starCount = DEFAULT_STAR_COUNT
} = {}) {
  if (!(root instanceof HTMLElement)) {
    return {
      destroy() {}
    };
  }

  const documentRef = root.ownerDocument || document;
  const canvas = documentRef.createElement("canvas");
  canvas.className = className;
  canvas.setAttribute("aria-hidden", "true");
  root.prepend(canvas);

  const context = getCanvasContext(canvas);
  if (!context) {
    return {
      destroy() {
        canvas.remove();
      }
    };
  }

  const stars = createStars(starCount);
  const nebulaPalette = resolveNebulaPalette(palette);
  const pointer = { x: 0, y: 0 };
  const motionPreference = createMotionPreference(windowRef);
  let frameId = 0;
  let timerId = 0;
  let destroyed = false;

  function render(time = 0) {
    const { width, height } = resizeCanvas({ canvas, context, root, windowRef });
    drawNebula(context, width, height, time, pointer, nebulaPalette);
    drawStars(context, width, height, stars, time, pointer);
  }

  function queueFrame() {
    if (
      destroyed ||
      motionPreference?.matches ||
      typeof windowRef.requestAnimationFrame !== "function"
    ) {
      return;
    }

    frameId = windowRef.requestAnimationFrame((time) => {
      if (destroyed) {
        return;
      }

      render(time);
      if (!destroyed) {
        timerId = windowRef.setTimeout?.(queueFrame, 16) || 0;
      }
    });
  }

  function handlePointerMove(event) {
    const width = windowRef.innerWidth || 1;
    const height = windowRef.innerHeight || 1;
    pointer.x = ((event.clientX || 0) / width) * 2 - 1;
    pointer.y = -(((event.clientY || 0) / height) * 2 - 1);
  }

  function handleResize() {
    render(windowRef.performance?.now?.() || 0);
  }

  windowRef.addEventListener?.("pointermove", handlePointerMove, { passive: true });
  windowRef.addEventListener?.("resize", handleResize);
  render(0);
  queueFrame();

  return {
    destroy() {
      destroyed = true;
      if (frameId && typeof windowRef.cancelAnimationFrame === "function") {
        windowRef.cancelAnimationFrame(frameId);
      }
      if (timerId && typeof windowRef.clearTimeout === "function") {
        windowRef.clearTimeout(timerId);
      }
      windowRef.removeEventListener?.("pointermove", handlePointerMove);
      windowRef.removeEventListener?.("resize", handleResize);
      canvas.remove();
    }
  };
}
