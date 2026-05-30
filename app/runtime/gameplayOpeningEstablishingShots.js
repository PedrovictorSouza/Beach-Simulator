import {
  ACT_TWO_GAMEPLAY_OPENING_CAMERA_POSE,
  ACT_TWO_PLAYER_CAMERA_DIRECTION
} from "../../actTwoSceneConfig.js";

export const GAMEPLAY_OPENING_ESTABLISHING_SHOT_IDS = Object.freeze({
  RUIN: "opening-establishing:ruin",
  NATURE: "opening-establishing:nature",
  CRASH_SITE: "opening-establishing:crash-site"
});

export const DEFAULT_GAMEPLAY_OPENING_ESTABLISHING_SHOTS = Object.freeze([
  Object.freeze({
    id: GAMEPLAY_OPENING_ESTABLISHING_SHOT_IDS.RUIN,
    phase: "establishing-ruin",
    start: 0,
    end: 1.4,
    pose: Object.freeze({
      target: [-6, 0.8, -4],
      direction: ACT_TWO_PLAYER_CAMERA_DIRECTION,
      zoom: 1.18,
      distance: 7.5
    })
  }),

  Object.freeze({
    id: GAMEPLAY_OPENING_ESTABLISHING_SHOT_IDS.NATURE,
    phase: "establishing-nature",
    start: 1.4,
    end: 2.8,
    pose: Object.freeze({
      target: [3, 0.7, -6],
      direction: ACT_TWO_PLAYER_CAMERA_DIRECTION,
      zoom: 1.22,
      distance: 7
    })
  }),

  Object.freeze({
    id: GAMEPLAY_OPENING_ESTABLISHING_SHOT_IDS.CRASH_SITE,
    phase: "establishing-crash-site",
    start: 2.8,
    end: 4,
    pose: ACT_TWO_GAMEPLAY_OPENING_CAMERA_POSE
  })
]);

export function getGameplayOpeningEstablishingShot(
  elapsed,
  shots = DEFAULT_GAMEPLAY_OPENING_ESTABLISHING_SHOTS
) {
  if (!Number.isFinite(elapsed) || !Array.isArray(shots)) {
    return null;
  }

  return shots.find((shot) => (
    shot &&
    elapsed >= shot.start &&
    elapsed < shot.end &&
    shot.pose
  )) || null;
}

export function getGameplayOpeningEstablishingPhase(elapsed, shots) {
  const shot = getGameplayOpeningEstablishingShot(elapsed, shots);
  return shot?.phase || "establishing";
}