const HEAT_PROFILES = Object.freeze([
  Object.freeze({ base: 15, peak: 8 }),
  Object.freeze({ base: 46, peak: 14 }),
  Object.freeze({ base: 72, peak: 18 })
]);
const LOW_HEAT_LIMIT = 35;
const HIGH_HEAT_LIMIT = 70;
export const HEAT_LEVELS = Object.freeze({
  LOW: "LOW",
  COMFORTABLE: "COMFORTABLE",
  HIGH: "HIGH"
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createHeatSnapshot(value) {
  const heat = clamp(Math.round(value), 0, 100);
  const low = heat < LOW_HEAT_LIMIT;
  const high = heat >= HIGH_HEAT_LIMIT;
  const attractionMultiplier = low ?
    0.65 + (heat / LOW_HEAT_LIMIT) * 0.35 :
    high ? 1 - ((heat - HIGH_HEAT_LIMIT) / 30) * 0.3 : 1;

  return Object.freeze({
    heat,
    level: low ?
      HEAT_LEVELS.LOW :
      high ? HEAT_LEVELS.HIGH : HEAT_LEVELS.COMFORTABLE,
    attractionMultiplier,
    beverageSalesMultiplier: low ? 0.75 : high ? 1.5 : 1
  });
}

export function createHeatModel({ random = Math.random } = {}) {
  if (typeof random !== "function") {
    throw new Error("HeatModel precisa de uma funcao random.");
  }

  let profile = HEAT_PROFILES[1];
  let snapshot = createHeatSnapshot(profile.base);

  return Object.freeze({
    getSnapshot: () => snapshot,
    startDay() {
      const randomUnit = clamp(Number(random()) || 0, 0, 1);
      const profileIndex = Math.min(
        HEAT_PROFILES.length - 1,
        Math.floor(randomUnit * HEAT_PROFILES.length)
      );

      profile = HEAT_PROFILES[profileIndex];
      snapshot = createHeatSnapshot(profile.base);
      return snapshot;
    },
    update({ elapsedSeconds = 0, durationSeconds = 1 } = {}) {
      const dayProgress = clamp(elapsedSeconds / durationSeconds, 0, 1);
      const heat = profile.base + Math.sin(dayProgress * Math.PI) * profile.peak;

      snapshot = createHeatSnapshot(heat);
      return snapshot;
    }
  });
}

export function createHeatMeterView({ root, translator }) {
  if (!root) {
    throw new Error("HeatMeterView precisa de um elemento root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("HeatMeterView precisa de um translator.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("div");
  const labelElement = documentRef.createElement("span");
  const levelElement = documentRef.createElement("strong");
  const trackElement = documentRef.createElement("span");
  const fillElement = documentRef.createElement("span");

  element.className = "time-counter heat-meter";
  element.setAttribute("role", "status");
  Object.assign(element.style, {
    left: "50%",
    right: "auto",
    transform: "translateX(-50%)",
    gridTemplateColumns: "auto 1fr",
    gap: "0.35rem 0.6rem",
    minWidth: "9rem",
    minHeight: "2.5rem",
    fontSize: "0.75rem"
  });
  labelElement.textContent = translator.t("hud.heat.label");
  levelElement.style.textAlign = "right";
  trackElement.setAttribute("role", "meter");
  Object.assign(trackElement.style, {
    gridColumn: "1 / -1",
    display: "block",
    width: "100%",
    height: "0.75rem",
    background: "#080a0f",
    border: 0
  });
  Object.assign(fillElement.style, {
    display: "block",
    height: "100%",
    transition: "width 200ms steps(4, end)"
  });
  trackElement.append(fillElement);
  element.append(labelElement, levelElement, trackElement);
  root.append(element);

  let currentSnapshot = null;
  const renderSnapshot = ({ heat, level }) => {
    const levelKey = String(level || "").toLowerCase();
    const translatedLevel = translator.t(`hud.heat.levels.${levelKey}`);

    currentSnapshot = { heat, level };
    labelElement.textContent = translator.t("hud.heat.label");
    levelElement.textContent = translatedLevel;
    fillElement.style.width = `${heat}%`;
    fillElement.style.background = level === HEAT_LEVELS.LOW ?
      "#6bbfe8" : level === HEAT_LEVELS.HIGH ? "#e85d4f" : "#f7d154";
    trackElement.setAttribute("aria-valuemin", "0");
    trackElement.setAttribute("aria-valuemax", "100");
    trackElement.setAttribute("aria-valuenow", String(heat));
    element.setAttribute(
      "aria-label",
      translator.t("hud.heat.aria", {
        level: translatedLevel,
        heat: translator.formatNumber(heat)
      })
    );
  };
  translator.subscribe(() => {
    if (currentSnapshot) {
      renderSnapshot(currentSnapshot);
    }
  });

  return Object.freeze({
    render({ heat, level }) {
      renderSnapshot({ heat, level });
    }
  });
}
