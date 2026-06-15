import { createGridSystem } from "../../gameplay/gridBuildingSystem.js";
import { createWorldCellPlannerClickRuntime } from "../worldCellPlannerClickRuntime.js";
import {
  createWorldCellPlannerSelection,
  getWorldCellPlannerGroundCells,
  projectWorldCellPlannerGroundCell,
  resolveWorldCellPlannerPick as resolveWorldCellPlannerPickFromCandidates
} from "../worldCellPlannerPicking.js";

const WORLD_CELL_PLANNER_EDITABLE_TARGET_SELECTOR =
  "button, input, textarea, select, [contenteditable='true']";

export function createWorldCellPlannerInteractionRuntime({
  camera,
  getGridConfig = () => ({}),
  hud = {},
  maxDistancePx,
  rendering = {},
  session = {},
  worldCanvas = null
} = {}) {
  const clickRuntime = createWorldCellPlannerClickRuntime();

  function isActive() {
    return Boolean(rendering?.debugWorldCellPlanner);
  }

  function getGridCell(groundCell) {
    const idMatch = /^ground-(\d+)-(\d+)$/.exec(String(groundCell?.id || ""));
    if (idMatch) {
      return {
        x: Number(idMatch[1]),
        y: Number(idMatch[2])
      };
    }

    if (!Array.isArray(groundCell?.offset)) {
      return null;
    }

    const gridSystem = createGridSystem(getGridConfig());
    return gridSystem.worldToCell({
      x: groundCell.offset[0],
      y: groundCell.surfaceY || 0,
      z: groundCell.offset[2]
    });
  }

  function resolvePick({ clientX, clientY } = {}) {
    return resolveWorldCellPlannerPickFromCandidates({
      request: { clientX, clientY },
      groundCells: getWorldCellPlannerGroundCells({
        groundDeadInstances: session.groundDeadInstances,
        groundPurifiedInstances: session.groundPurifiedInstances,
        iceGroundInstances: session.iceGroundInstances
      }),
      projectGroundCell: (groundCell) => projectWorldCellPlannerGroundCell({
        groundCell,
        camera,
        worldCanvas
      }),
      createSelection: (groundCell) => createWorldCellPlannerSelection({
        groundCell,
        getGridCell,
        isColdGroundCell: (cell) => session.iceGroundInstances?.includes(cell)
      }),
      maxDistancePx
    });
  }

  function handlePointerDown(event) {
    if (!isActive() || (event?.button ?? 0) !== 0) {
      return;
    }

    if (event?.target?.closest?.(WORLD_CELL_PLANNER_EDITABLE_TARGET_SELECTOR)) {
      return;
    }

    event?.preventDefault?.();
    event?.stopPropagation?.();
    clickRuntime.queue({
      clientX: event?.clientX,
      clientY: event?.clientY
    });
  }

  function processClick() {
    const request = clickRuntime.consume();
    if (!request) {
      return;
    }

    if (!isActive()) {
      return;
    }

    const pick = resolvePick(request);
    if (!pick) {
      hud?.pushNotice?.("No world cell found there.");
      return;
    }

    session.worldCellPlannerSelectedGroundCell = pick.groundCell;
    rendering?.onWorldCellPlannerPick?.(pick.selection);
    hud?.pushNotice?.(`Cell ${pick.selection.cellId} selected.`);
  }

  function getSelectedGroundCell() {
    if (!isActive() || !session.worldCellPlannerSelectedGroundCell?.offset) {
      return null;
    }

    return {
      ...session.worldCellPlannerSelectedGroundCell,
      highlightTargetState: "powerRadius",
      highlightAbilityId: "debug"
    };
  }

  return {
    getSelectedGroundCell,
    handlePointerDown,
    isActive,
    processClick,
    resolvePick
  };
}
