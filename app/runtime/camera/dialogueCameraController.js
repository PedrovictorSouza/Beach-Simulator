import { ACT_TWO_PLAYER_CAMERA_ZOOM_PRESETS } from "../../../actTwoSceneConfig.js";

const DIALOGUE_CAMERA_TRANSITION_DURATION = 0.45;
const DIALOGUE_CAMERA_MIN_TARGET_HEIGHT = 0.18;
const DIALOGUE_CAMERA_SUBJECT_SCREEN_RAISE = 0.14;
const DIALOGUE_CAMERA_BASE_DISTANCE = 6.2;
const DIALOGUE_CAMERA_ZOOM = 4.25;
const DIALOGUE_CAMERA_PLAYER_FOCUS_HEIGHT = 0.82;
const DIALOGUE_CAMERA_DEFAULT_NPC_FOCUS_HEIGHT = 0.82;
const DIALOGUE_CAMERA_NPC_FOCUS_HEIGHT_BY_ID = Object.freeze({
  tangrowth: 1.45
});
const DIALOGUE_CAMERA_POINT_FOCUS_HEIGHT = 0.9;
const DIALOGUE_CAMERA_POINT_FOCUS_DISTANCE = 6.2;
const DIALOGUE_CAMERA_POINT_FOCUS_ZOOM = 4.45;
const DEG_TO_RAD = Math.PI / 180;

function normalize2([x, z]) {
  const length = Math.hypot(x, z) || 1;
  return [x / length, z / length];
}

function dot3(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function getNpcPosition(npcActors, interactables, targetId) {
  const npcActor = npcActors.find((actor) => actor.id === targetId);
  const interactable = interactables.find((item) => item.id === targetId);
  return npcActor?.character?.getPosition?.() || interactable?.position || null;
}

function getNpcFocusHeight(npcActors, interactables, targetId) {
  const npcActor = npcActors.find((actor) => actor.id === targetId);
  const interactable = interactables.find((item) => item.id === targetId);
  const configuredHeight = Number(npcActor?.dialogueFocusHeight ?? interactable?.dialogueFocusHeight);

  if (Number.isFinite(configuredHeight)) {
    return configuredHeight;
  }

  return DIALOGUE_CAMERA_NPC_FOCUS_HEIGHT_BY_ID[targetId] ??
    DIALOGUE_CAMERA_DEFAULT_NPC_FOCUS_HEIGHT;
}

function toFocusPoint(position, focusHeight) {
  return [
    position[0],
    (Number(position[1]) || 0) + focusHeight,
    position[2]
  ];
}

function getOpenGameplayPreset() {
  return ACT_TWO_PLAYER_CAMERA_ZOOM_PRESETS.find((preset) => preset.id === "far") ||
    ACT_TWO_PLAYER_CAMERA_ZOOM_PRESETS[0] ||
    {};
}

function buildGameplayRestorePose(restorePose) {
  const openGameplayPreset = getOpenGameplayPreset();

  return {
    ...restorePose,
    zoom: typeof openGameplayPreset.zoom === "number" ? openGameplayPreset.zoom : restorePose.zoom,
    distance: typeof openGameplayPreset.distance === "number" ?
      openGameplayPreset.distance :
      restorePose.distance
  };
}

function getCameraFovFromZoom(zoom) {
  return Math.max(34, Math.min(64, zoom * 9.5)) * DEG_TO_RAD;
}

function resolveDialogueTargetHeight(distance, zoom, subjectFocusHeight) {
  const verticalHalfSpan = distance * Math.tan(getCameraFovFromZoom(zoom) * 0.5);
  const subjectRaiseWorldOffset = verticalHalfSpan * DIALOGUE_CAMERA_SUBJECT_SCREEN_RAISE * 2;

  return Math.max(
    DIALOGUE_CAMERA_MIN_TARGET_HEIGHT,
    subjectFocusHeight - subjectRaiseWorldOffset
  );
}

function buildDialogueCameraPose({ camera, playerPosition, npcPosition, npcFocusHeight }) {
  const characterGap = Math.hypot(
    npcPosition[0] - playerPosition[0],
    npcPosition[2] - playerPosition[2]
  );
  const distance = Math.max(DIALOGUE_CAMERA_BASE_DISTANCE, characterGap * 2.7);
  const playerFocusPoint = toFocusPoint(playerPosition, DIALOGUE_CAMERA_PLAYER_FOCUS_HEIGHT);
  const npcFocusPoint = toFocusPoint(npcPosition, npcFocusHeight);
  const subjectFocusHeight = (playerFocusPoint[1] + npcFocusPoint[1]) * 0.5;
  const midpoint = [
    (playerPosition[0] + npcPosition[0]) * 0.5,
    resolveDialogueTargetHeight(distance, DIALOGUE_CAMERA_ZOOM, subjectFocusHeight),
    (playerPosition[2] + npcPosition[2]) * 0.5
  ];
  const toNpc = normalize2([
    npcPosition[0] - playerPosition[0],
    npcPosition[2] - playerPosition[2]
  ]);
  const side = [toNpc[1], -toNpc[0]];
  const currentDirection = camera.getPose().direction;
  const rightSideDirection = [side[0], 0.34, side[1]];
  const leftSideDirection = [-side[0], 0.34, -side[1]];
  const direction =
    dot3(currentDirection, rightSideDirection) >= dot3(currentDirection, leftSideDirection) ?
      rightSideDirection :
      leftSideDirection;

  return {
    target: midpoint,
    direction,
    zoom: DIALOGUE_CAMERA_ZOOM,
    distance
  };
}

export function createDialogueCameraController({ camera, cameraOrbit }) {
  let restorePose = null;

  function captureRestorePose() {
    if (!restorePose) {
      restorePose = camera.getPose();
    }
  }

  function focusNpcConversation({
    playerPosition,
    npcActors = [],
    interactables = [],
    targetId,
    targetPosition = null
  }) {
    const npcPosition = targetPosition || getNpcPosition(npcActors, interactables, targetId);
    const npcFocusHeight = getNpcFocusHeight(npcActors, interactables, targetId);

    if (!npcPosition) {
      return;
    }

    captureRestorePose();
    const dialoguePose = buildDialogueCameraPose({
      camera,
      playerPosition,
      npcPosition,
      npcFocusHeight
    });

    camera.startPoseTransition(dialoguePose, {
      duration: DIALOGUE_CAMERA_TRANSITION_DURATION
    });
    cameraOrbit.sync(dialoguePose.direction);
  }

  function focusWorldPoint({
    position,
    height = DIALOGUE_CAMERA_POINT_FOCUS_HEIGHT,
    distance = DIALOGUE_CAMERA_POINT_FOCUS_DISTANCE,
    zoom = DIALOGUE_CAMERA_POINT_FOCUS_ZOOM
  } = {}) {
    if (!position) {
      return;
    }

    captureRestorePose();
    const currentPose = camera.getPose();
    const pointPose = {
      target: [position[0], height, position[2]],
      direction: currentPose.direction,
      zoom,
      distance
    };

    camera.startPoseTransition(pointPose, {
      duration: DIALOGUE_CAMERA_TRANSITION_DURATION
    });
    cameraOrbit.sync(pointPose.direction);
  }

  function restoreGameplayCamera() {
    if (!restorePose) {
      return;
    }
    const gameplayRestorePose = buildGameplayRestorePose(restorePose);

    camera.startPoseTransition(gameplayRestorePose, {
      duration: DIALOGUE_CAMERA_TRANSITION_DURATION
    });
    cameraOrbit.sync(gameplayRestorePose.direction);
    restorePose = null;
  }

  return {
    focusWorldPoint,
    focusNpcConversation,
    restoreGameplayCamera
  };
}
