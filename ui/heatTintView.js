const COLD_COLOR = Object.freeze([64, 142, 220]);
const NEUTRAL_COLOR = Object.freeze([255, 255, 255]);
const HOT_COLOR = Object.freeze([255, 204, 72]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function mixColors(first, second, amount) {
  return first.map((channel, index) => Math.round(
    channel + (second[index] - channel) * amount
  ));
}

export function createHeatTintView({ root }) {
  if (!root) {
    throw new Error("HeatTintView precisa de um elemento root.");
  }

  const element = root.ownerDocument.createElement("div");
  element.className = "heat-tint";
  element.setAttribute("aria-hidden", "true");
  root.append(element);

  return Object.freeze({
    render({ heat = 50 } = {}) {
      const normalizedHeat = clamp(Number(heat) || 0, 0, 100);
      const color = normalizedHeat <= 50 ?
        mixColors(COLD_COLOR, NEUTRAL_COLOR, normalizedHeat / 50) :
        mixColors(NEUTRAL_COLOR, HOT_COLOR, (normalizedHeat - 50) / 50);

      element.style.backgroundColor = `rgb(${color.join(", ")})`;
      element.dataset.heat = String(Math.round(normalizedHeat));
    }
  });
}
