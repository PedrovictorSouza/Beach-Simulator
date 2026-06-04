import {
  WORKBENCH_INTERACT_DISTANCE,
  WORKBENCH_POSITION
} from "../../gameplayContent.js";
import {
  INTERACTION_INFO_ICON_SIZE,
  WORKBENCH_INFO_ICON_OFFSET
} from "./gameplayPresentationTuning.js";

const WORKBENCH_INTERACTION_PARTICLE_COUNT = 12;
const WORKBENCH_INTERACTION_PARTICLE_RADIUS = 1.42;
const WORKBENCH_INTERACTION_PARTICLE_BASE_HEIGHT = 0.2;
const WORKBENCH_INTERACTION_PARTICLE_LIFT = 0.32;
const WORKBENCH_INTERACTION_PARTICLE_SIZE = 0.15;

export const POKEMON_CENTER_PC_INFO_ICON_OFFSET = Object.freeze([0.82, 1.22, 0.04]);

export { WORKBENCH_INFO_ICON_OFFSET };

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

export function createInteractionInfoBillboard(texture, basePosition, offset, uvRect) {
  if (!texture || !Array.isArray(basePosition) || !Array.isArray(offset)) {
    return null;
  }

  return {
    texture,
    position: [
      basePosition[0] + offset[0],
      basePosition[1] + offset[1],
      basePosition[2] + offset[2]
    ],
    size: INTERACTION_INFO_ICON_SIZE,
    uvRect
  };
}

export function getWorkbenchInteractionParticleBillboards({
  texture,
  uvRect,
  basePosition = WORKBENCH_POSITION,
  playerPosition = null,
  now = 0,
  interactDistance = WORKBENCH_INTERACT_DISTANCE
} = {}) {
  if (!texture || !Array.isArray(basePosition)) {
    return [];
  }

  const time = now * 0.001;
  const playerDistance = Array.isArray(playerPosition) ?
    Math.hypot(
      playerPosition[0] - basePosition[0],
      playerPosition[2] - basePosition[2]
    ) :
    Infinity;
  const nearBoost = playerDistance <= interactDistance ? 1 : 0;

  return Array.from({ length: WORKBENCH_INTERACTION_PARTICLE_COUNT }, (_, index) => {
    const lane = index / WORKBENCH_INTERACTION_PARTICLE_COUNT;
    const cycle = (time * (0.42 + nearBoost * 0.22) + lane) % 1;
    const angle = lane * Math.PI * 2 + time * (0.52 + nearBoost * 0.32);
    const radius =
      WORKBENCH_INTERACTION_PARTICLE_RADIUS *
      (0.78 + Math.sin(time * 2.1 + index * 0.73) * 0.05);
    const fadeIn = clamp01(cycle / 0.18);
    const fadeOut = clamp01((1 - cycle) / 0.26);
    const pulse = 0.88 + Math.sin(time * 6.4 + index * 1.17) * 0.16;
    const size = WORKBENCH_INTERACTION_PARTICLE_SIZE * pulse * (1 + nearBoost * 0.45);

    return {
      texture,
      position: [
        basePosition[0] + Math.cos(angle) * radius,
        basePosition[1] + WORKBENCH_INTERACTION_PARTICLE_BASE_HEIGHT +
          cycle * WORKBENCH_INTERACTION_PARTICLE_LIFT,
        basePosition[2] + Math.sin(angle) * radius
      ],
      size: [size, size],
      uvRect,
      alpha: (0.48 + nearBoost * 0.28) * fadeIn * fadeOut,
      rotation: angle + time * 0.35
    };
  });
}
