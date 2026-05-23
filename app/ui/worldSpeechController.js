import {
  curveWorldPosition,
  resolveWorldCurvatureOrigin
} from "../../rendering/worldCurvature.js";
import {
  installFirstMissionCompletionPopStyles,
  renderFirstMissionCompletionPop
} from "./firstMissionCompletionPop.js";
import { renderWorldPromptLetterPop } from "./worldPromptLetterPop.js";

const LARGE_TASK_POP_MESSAGES = new Set([
  "HYDRO BOT IS ONLINE!",
  "HYDRO JET ONLINE!",
  "BIO-GROW ONLINE!",
  "YOU TOOK YOUR FIRST STEPS!",
  "YOU RESTORED THE TALL GRASS!"
]);
const FIELD_MOVE_SWITCH_CARD_MARKER = "data-field-move-switch-card";
const PLAYER_PROMPT_EXIT_MOTION_MS = 260;
const DRY_GRASS_HINT_EXIT_MOTION_MS = 180;
const DRY_GRASS_HINT_STYLE_ID = "dry-grass-hint-world-speech-style";
const DRY_GRASS_HINT_IMAGE_URL = new URL("./images/drop.png", import.meta.url).href;

function installDryGrassHintStyles(documentRef) {
  if (!documentRef?.head || documentRef.getElementById(DRY_GRASS_HINT_STYLE_ID)) {
    return;
  }

  const style = documentRef.createElement("style");
  style.id = DRY_GRASS_HINT_STYLE_ID;
  style.textContent = `
    .dry-grass-hint {
      position: absolute;
      transform: translate(-50%, -100%) scale(var(--overlay-scale, 1));
      transform-origin: 50% 100%;
      will-change: left, top, opacity;
    }

    .dry-grass-hint__bubble {
      width: 148px;
      height: 148px;
      display: grid;
      place-items: center;
      background: #ffe8a3;
      border: 6px solid #1d1720;
      box-shadow:
        0 0 0 4px #fff7d8 inset,
        0 0 0 10px #d7974c inset,
        8px 8px 0 #4a2637,
        12px 12px 0 rgba(17, 12, 18, 0.22);
      border-radius: 0;
      image-rendering: pixelated;
      position: relative;
    }

    .dry-grass-hint__bubble::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: -28px;
      width: 30px;
      height: 30px;
      background: #ffe8a3;
      border-right: 6px solid #1d1720;
      border-bottom: 6px solid #1d1720;
      transform: translateX(-50%);
      box-shadow:
        -4px -4px 0 #fff7d8 inset,
        -10px -10px 0 #d7974c inset,
        8px 8px 0 #4a2637;
    }

    .dry-grass-hint__image {
      width: 100px;
      height: 100px;
      display: block;
      object-fit: contain;
      image-rendering: pixelated;
      z-index: 1;
    }

    .dry-grass-hint[data-motion="enter"] .dry-grass-hint__bubble {
      animation: dry-grass-hint-pop-in 180ms steps(4, end) both;
    }

    .dry-grass-hint[data-motion="exit"] .dry-grass-hint__bubble {
      animation: dry-grass-hint-pop-out 180ms steps(4, end) both;
    }

    @keyframes dry-grass-hint-pop-in {
      0% {
        opacity: 0;
        transform: translateY(8px) scale(0.18);
      }
      68% {
        opacity: 1;
        transform: translateY(-4px) scale(1.1);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes dry-grass-hint-pop-out {
      0% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translateY(8px) scale(0.2);
      }
    }
  `;
  documentRef.head.append(style);
}

export function createWorldSpeechController({ mount } = {}) {
  if (!(mount instanceof HTMLElement)) {
    throw new Error("World speech controller requires a valid mount element.");
  }
  const documentRef = mount.ownerDocument || document;
  const windowRef = mount.ownerDocument?.defaultView || globalThis;
  installDryGrassHintStyles(documentRef);
  installFirstMissionCompletionPopStyles(documentRef);

  const layer = documentRef.createElement("div");
  layer.dataset.worldSpeechLayer = "true";
  layer.hidden = true;
  Object.assign(layer.style, {
    position: "absolute",
    inset: "0",
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: "1"
  });

  function createSpeechElement(variant) {
    const speechElement = documentRef.createElement("div");
    speechElement.className = "act-two-tutorial__speech";
    speechElement.dataset.worldSpeechVariant = variant;
    speechElement.hidden = true;

    const bubbleElement = documentRef.createElement("div");
    bubbleElement.className = "act-two-tutorial__speech-bubble";

    speechElement.append(bubbleElement);
    return {
      speech: speechElement,
      bubble: bubbleElement
    };
  }

  function createDryGrassHintElement() {
    const hintElement = documentRef.createElement("div");
    hintElement.className = "dry-grass-hint";
    hintElement.dataset.worldSpeechVariant = "dry-grass-hint";
    hintElement.hidden = true;

    const bubbleElement = documentRef.createElement("div");
    bubbleElement.className = "dry-grass-hint__bubble";

    const imageElement = documentRef.createElement("img");
    imageElement.className = "dry-grass-hint__image";
    imageElement.dataset.dryGrassHintImagePlaceholder = "true";
    imageElement.src = DRY_GRASS_HINT_IMAGE_URL;
    imageElement.alt = "";
    imageElement.loading = "eager";
    imageElement.decoding = "async";
    imageElement.setAttribute("aria-hidden", "true");

    bubbleElement.append(imageElement);
    hintElement.append(bubbleElement);

    return {
      speech: hintElement,
      bubble: bubbleElement,
      placeholder: imageElement
    };
  }

  const npcSpeech = createSpeechElement("npc");
  const playerPrompt = createSpeechElement("player-prompt");
  const taskPop = createSpeechElement("task-pop");
  const dryGrassHint = createDryGrassHintElement();

  const speech = npcSpeech.speech;
  const bubble = npcSpeech.bubble;
  layer.append(speech);
  layer.append(playerPrompt.speech);
  layer.append(taskPop.speech);
  layer.append(dryGrassHint.speech);
  mount.append(layer);
  let playerPromptExitTimeout = null;
  let dryGrassHintExitTimeout = null;

  const state = {
    active: false,
    anchorHeight: 2.35,
    worldPosition: [0, 0, 0],
    promptActive: false,
    promptAnchorHeight: 1.95,
    promptWorldPosition: [0, 0, 0],
    taskPopActive: false,
    taskPopAnchorHeight: 2.68,
    taskPopWorldPosition: [0, 0, 0],
    dryGrassHintActive: false,
    dryGrassHintAnchorHeight: 2.9,
    dryGrassHintWorldPosition: [0, 0, 0],
    dryGrassHintTargetId: null
  };

  function isLayerActive() {
    return state.active ||
      !playerPrompt.speech.hidden ||
      state.taskPopActive ||
      !dryGrassHint.speech.hidden;
  }

  function clearPlayerPromptExitTimeout() {
    if (playerPromptExitTimeout === null) {
      return;
    }

    windowRef.clearTimeout?.(playerPromptExitTimeout);
    playerPromptExitTimeout = null;
  }

  function finishPromptHide() {
    clearPlayerPromptExitTimeout();
    playerPrompt.speech.hidden = true;
    playerPrompt.speech.dataset.worldPromptKind = "text";
    delete playerPrompt.speech.dataset.promptMotion;
    playerPrompt.speech.style.transform = "";
    playerPrompt.speech.style.transformOrigin = "";
    playerPrompt.bubble.textContent = "";
    layer.hidden = !isLayerActive();
  }

  function clearDryGrassHintExitTimeout() {
    if (dryGrassHintExitTimeout === null) {
      return;
    }

    windowRef.clearTimeout?.(dryGrassHintExitTimeout);
    dryGrassHintExitTimeout = null;
  }

  function finishDryGrassHintHide() {
    clearDryGrassHintExitTimeout();
    dryGrassHint.speech.hidden = true;
    delete dryGrassHint.speech.dataset.motion;
    state.dryGrassHintTargetId = null;
    layer.hidden = !isLayerActive();
  }

  function show({ text, worldPosition, anchorHeight = 2.35 } = {}) {
    state.active = true;
    state.anchorHeight = anchorHeight;
    state.worldPosition = worldPosition ? [...worldPosition] : [0, 0, 0];
    bubble.textContent = text || "";
    speech.hidden = false;
    layer.hidden = false;
  }

  function hide() {
    state.active = false;
    speech.hidden = true;
    layer.hidden = !isLayerActive();
  }

  function showPrompt({ text, worldPosition, anchorHeight = 1.95, promptKind = "text" } = {}) {
    const promptText = text || "";
    const isFieldMoveSwitchCard = String(promptText).includes(FIELD_MOVE_SWITCH_CARD_MARKER);
    const resolvedPromptKind = isFieldMoveSwitchCard ? "field-move-switch" : promptKind || "text";

    clearPlayerPromptExitTimeout();
    state.promptActive = true;
    state.promptAnchorHeight = anchorHeight;
    state.promptWorldPosition = worldPosition ? [...worldPosition] : [0, 0, 0];
    playerPrompt.speech.dataset.worldPromptKind = resolvedPromptKind;
    playerPrompt.speech.dataset.promptMotion = isFieldMoveSwitchCard ? "none" : "enter";
    playerPrompt.speech.style.transform = isFieldMoveSwitchCard ?
      "translate(104px, -58%) scale(calc(var(--overlay-scale) * 0.625))" :
      "";
    playerPrompt.speech.style.transformOrigin = isFieldMoveSwitchCard ? "center center" : "";

    if (isFieldMoveSwitchCard) {
      playerPrompt.bubble.innerHTML = promptText;
    } else if (resolvedPromptKind === "counter") {
      renderWorldPromptLetterPop({
        documentRef,
        container: playerPrompt.bubble,
        text: promptText
      });
    } else {
      playerPrompt.bubble.textContent = promptText;
    }
    playerPrompt.speech.hidden = false;
    layer.hidden = false;

    if (!isFieldMoveSwitchCard) {
      void playerPrompt.bubble.offsetWidth;
      playerPrompt.speech.dataset.promptMotion = "enter";
    }
  }

  function hidePrompt() {
    const promptKind = playerPrompt.speech.dataset.worldPromptKind || "text";

    state.promptActive = false;
    if (promptKind !== "text" || playerPrompt.speech.hidden) {
      finishPromptHide();
      return;
    }

    playerPrompt.speech.dataset.promptMotion = "exit";
    layer.hidden = false;
    playerPromptExitTimeout = windowRef.setTimeout?.(
      finishPromptHide,
      PLAYER_PROMPT_EXIT_MOTION_MS
    ) ?? null;

    if (playerPromptExitTimeout === null) {
      finishPromptHide();
    }
  }

  function showTaskPop({ text, worldPosition, anchorHeight = 2.68 } = {}) {
    const message = text || "";
    state.taskPopActive = true;
    state.taskPopAnchorHeight = anchorHeight;
    state.taskPopWorldPosition = worldPosition ? [...worldPosition] : [0, 0, 0];
    const renderedFirstMissionPop = renderFirstMissionCompletionPop({
      documentRef,
      container: taskPop.bubble,
      text: message
    });
    if (renderedFirstMissionPop) {
      taskPop.speech.dataset.taskPopKind = "first-mission";
    } else {
      delete taskPop.speech.dataset.taskPopKind;
      taskPop.bubble.textContent = message;
    }
    taskPop.speech.dataset.taskPopSize =
      LARGE_TASK_POP_MESSAGES.has(message.toUpperCase()) ? "large" : "default";
    taskPop.speech.hidden = false;
    layer.hidden = false;

    taskPop.bubble.style.animation = "none";
    void taskPop.bubble.offsetWidth;
    taskPop.bubble.style.animation = "";
  }

  function hideTaskPop() {
    state.taskPopActive = false;
    taskPop.speech.hidden = true;
    layer.hidden = !isLayerActive();
  }

  function showDryGrassHint({
    worldPosition,
    anchorHeight = 2.9,
    targetId = null
  } = {}) {
    clearDryGrassHintExitTimeout();
    state.dryGrassHintActive = true;
    state.dryGrassHintAnchorHeight = anchorHeight;
    state.dryGrassHintWorldPosition = worldPosition ? [...worldPosition] : [0, 0, 0];
    state.dryGrassHintTargetId = targetId;
    dryGrassHint.speech.hidden = false;
    dryGrassHint.speech.dataset.motion = "enter";
    layer.hidden = false;

    void dryGrassHint.bubble.offsetWidth;
    dryGrassHint.speech.dataset.motion = "enter";
  }

  function hideDryGrassHint() {
    state.dryGrassHintActive = false;
    if (dryGrassHint.speech.hidden) {
      finishDryGrassHintHide();
      return;
    }

    dryGrassHint.speech.dataset.motion = "exit";
    layer.hidden = false;
    dryGrassHintExitTimeout = windowRef.setTimeout?.(
      finishDryGrassHintHide,
      DRY_GRASS_HINT_EXIT_MOTION_MS
    ) ?? null;

    if (dryGrassHintExitTimeout === null) {
      finishDryGrassHintHide();
    }
  }

  function setWorldPosition(worldPosition) {
    if (!worldPosition) {
      return;
    }

    state.worldPosition = [...worldPosition];
  }

  function setPromptWorldPosition(worldPosition) {
    if (!worldPosition) {
      return;
    }

    state.promptWorldPosition = [...worldPosition];
  }

  function setTaskPopWorldPosition(worldPosition) {
    if (!worldPosition) {
      return;
    }

    state.taskPopWorldPosition = [...worldPosition];
  }

  function setDryGrassHintWorldPosition(worldPosition) {
    if (!worldPosition) {
      return;
    }

    state.dryGrassHintWorldPosition = [...worldPosition];
  }

  function updateSpeechElement({
    camera,
    viewportWidth,
    viewportHeight,
    worldPosition,
    anchorHeight,
    speechElement
  }) {
    const cameraTarget = camera.getPose?.()?.target || [0, 0, 0];
    const curvatureOrigin = resolveWorldCurvatureOrigin(cameraTarget);
    const curvedWorldPosition = curveWorldPosition(worldPosition, curvatureOrigin);
    const projected = camera.project(
      [
        curvedWorldPosition[0],
        curvedWorldPosition[1] + anchorHeight,
        curvedWorldPosition[2]
      ],
      viewportWidth,
      viewportHeight
    );

    speechElement.style.left = `${projected.x}px`;
    speechElement.style.top = `${projected.y}px`;
    speechElement.style.opacity = projected.depth > 1 ? "0" : "1";
  }

  function update(camera, viewportWidth, viewportHeight) {
    if (!state.active) {
      return;
    }

    updateSpeechElement({
      camera,
      viewportWidth,
      viewportHeight,
      worldPosition: state.worldPosition,
      anchorHeight: state.anchorHeight,
      speechElement: speech
    });
  }

  function updatePrompt(camera, viewportWidth, viewportHeight) {
    if (!state.promptActive) {
      return;
    }

    updateSpeechElement({
      camera,
      viewportWidth,
      viewportHeight,
      worldPosition: state.promptWorldPosition,
      anchorHeight: state.promptAnchorHeight,
      speechElement: playerPrompt.speech
    });
  }

  function updateTaskPop(camera, viewportWidth, viewportHeight) {
    if (!state.taskPopActive) {
      return;
    }

    updateSpeechElement({
      camera,
      viewportWidth,
      viewportHeight,
      worldPosition: state.taskPopWorldPosition,
      anchorHeight: state.taskPopAnchorHeight,
      speechElement: taskPop.speech
    });
  }

  function updateDryGrassHint(camera, viewportWidth, viewportHeight) {
    if (!state.dryGrassHintActive) {
      return;
    }

    updateSpeechElement({
      camera,
      viewportWidth,
      viewportHeight,
      worldPosition: state.dryGrassHintWorldPosition,
      anchorHeight: state.dryGrassHintAnchorHeight,
      speechElement: dryGrassHint.speech
    });
  }

  return {
    hide,
    hideDryGrassHint,
    hideTaskPop,
    hidePrompt,
    isVisible() {
      return state.active;
    },
    isPromptVisible() {
      return state.promptActive;
    },
    isTaskPopVisible() {
      return state.taskPopActive;
    },
    isDryGrassHintVisible() {
      return state.dryGrassHintActive;
    },
    setDryGrassHintWorldPosition,
    setPromptWorldPosition,
    setTaskPopWorldPosition,
    setWorldPosition,
    show,
    showDryGrassHint,
    showTaskPop,
    showPrompt,
    updateDryGrassHint,
    updateTaskPop,
    updatePrompt,
    update
  };
}
