import { GAME_SHELL_DOM_IDS } from "./gameShellDomIds.js";

const REQUIRED_GAME_SHELL_ELEMENT_ID_KEYS = Object.freeze({
  worldCanvas: "worldCanvas",
  spriteCanvas: "spriteCanvas",
  status: "status",
  mount: "gameStage",
  renderFrame: "renderFrame",
  uiLayer: "uiLayer"
});

const OPTIONAL_GAME_SHELL_ELEMENT_ID_KEYS = Object.freeze({
  fpsPanel: "fpsPanel",
  inputModalityPanel: "inputModalityPanel",
  jitterSlider: "jitterSlider",
  jitterValue: "jitterValue",
  warmOverlay: "warmOverlay",
  hudInstructions: "hudInstructions",
  hudContext: "hudContext",
  hudChecklist: "hudChecklist",
  hudMeta: "hudMeta",
  missionsStack: "missionsStack",
  questFocusTitle: "questFocusTitle",
  questFocusBody: "questFocusBody",
  nearbyHabitatsValue: "nearbyHabitatsValue",
  bagDetailsIcon: "bagDetailsIcon",
  bagDetailsName: "bagDetailsName",
  bagDetailsCount: "bagDetailsCount",
  bagDetailsDescription: "bagDetailsDescription",
  inventoryGrid: "inventoryGrid",
  skillsPanel: "skillsPanel",
  skillsGrid: "skillsGrid",
  builderPanel: "builderPanel",
  hudPanel: "hudPanel",
  questFocusPanel: "questFocusPanel",
  missionsPanel: "missionsPanel",
  inventoryPanel: "inventoryPanel",
  startOverlay: "startOverlay",
  sceneTransitionVeil: "sceneTransitionVeil",
  skillLearnOverlay: "skillLearnOverlay",
  introOverlay: "introOverlay",
  introRoomDebugRoot: "introRoomDebugRoot",
  pauseOverlay: "pauseOverlay",
  cinematicOverlay: "cinematicOverlay",
  tutorialOverlay: "tutorialOverlay",
  pokedexAlertButton: "pokedexAlertButton",
  pokedexOverlay: "pokedexOverlay"
});

function getRequiredGameShellElement(documentRef, idKey) {
  const id = GAME_SHELL_DOM_IDS[idKey];
  const element = documentRef.getElementById(id);

  if (!element) {
    throw new Error(`Missing required game shell element: ${id}`);
  }

  return element;
}

export function resolveGameShellElements(documentRef = document) {
  const appRoot = documentRef.documentElement;
  const requiredElements = Object.fromEntries(
    Object.entries(REQUIRED_GAME_SHELL_ELEMENT_ID_KEYS).map(([domKey, idKey]) => [
      domKey,
      getRequiredGameShellElement(documentRef, idKey)
    ])
  );
  const optionalElements = Object.fromEntries(
    Object.entries(OPTIONAL_GAME_SHELL_ELEMENT_ID_KEYS).map(([domKey, idKey]) => [
      domKey,
      documentRef.getElementById(GAME_SHELL_DOM_IDS[idKey])
    ])
  );

  return {
    ...requiredElements,
    ...optionalElements,
    appRoot,
    rootStyle: appRoot.style
  };
}
