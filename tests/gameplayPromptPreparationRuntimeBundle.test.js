import { describe, expect, it, vi } from "vitest";
import { createGameplayPromptPreparationRuntimeBundle } from "../app/runtime/presentation/gameplayPromptPreparationRuntimeBundle.js";

describe("createGameplayPromptPreparationRuntimeBundle", () => {
  it("wires gameplay prompt preparation callbacks with domain runtime state", () => {
    const createdOptions = {};
    const runtime = { update: vi.fn() };
    const createRuntime = vi.fn((options) => {
      Object.assign(createdOptions, options);
      return runtime;
    });
    const controls = { storyState: { flags: {} }, inventory: {} };
    const gameplay = {};
    const session = {
      bulbasaurEncounter: { repairPosition: [7, 0, 8] },
      challengeBoulder: { id: "boulder-a" },
      groundDeadInstances: ["dead"],
      groundFlowerPatches: ["flower"],
      groundGrassPatches: ["grass"],
      groundPurifiedInstances: ["purified"],
      iceGroundInstances: ["ice"],
      playerCharacter: {
        getPosition: () => [1, 0, 2]
      }
    };
    const playerCounterPromptRuntime = {
      get: vi.fn(() => "Wood x2")
    };
    const workbenchRotationRuntime = {
      getGroundCell: vi.fn(() => ({ id: "workbench-ground" })),
      getNearestTarget: vi.fn(() => ({ id: "nearby-workbench" })),
      getSelectedTargetFromSources: vi.fn(() => ({ id: "selected-workbench" }))
    };
    const waterGunRuntime = {
      getPendingGroundCells: vi.fn(() => [{ id: "water-cell" }])
    };
    const foundationBuildZoneRuntime = {
      buildGroundCells: vi.fn(() => [{ id: "foundation-cell" }])
    };
    const solarStationPowerRadiusRuntime = {
      buildPlacedPowerRadiusGroundCells: vi.fn(() => [{ id: "placed-power" }]),
      buildPreviewPowerRadiusGroundCells: vi.fn(() => [{ id: "preview-power" }])
    };
    const groundActionFeedbackRuntime = {
      getFeedbackFrame: vi.fn(() => ({ cells: [] })),
      getPulseFrame: vi.fn(() => ({ scale: 1 }))
    };
    const getFreeRoamRestorationGroundCells = vi.fn(() => [{ id: "free-roam" }]);
    const getBoulderShadedTaskGroundCells = vi.fn(() => [{ id: "boulder-shade" }]);
    const getGrowFirstHabitatTaskGroundCells = vi.fn(() => [{ id: "grow-first" }]);
    const buildSolarStationFieldMarkedGroundCells = vi.fn(() => [{ id: "solar-field" }]);
    const getLeppaTreeSurroundingGroundCells = vi.fn(() => [{ id: "leppa" }]);
    const isOpeningLeppaTreeRequestActive = vi.fn(() => true);
    const getWorldCellPlannerSelectedGroundCell = vi.fn(() => ({ id: "planner-cell" }));
    const getCurrentInputModalityState = vi.fn(() => ({ type: "keyboard" }));

    const result = createGameplayPromptPreparationRuntimeBundle({
      controls,
      createRuntime,
      gameplay,
      input: {
        getCurrentInputModalityState
      },
      runtimes: {
        foundationBuildZoneRuntime,
        groundActionFeedbackRuntime,
        playerCounterPromptRuntime,
        solarStationPowerRadiusRuntime,
        waterGunRuntime,
        workbenchRotationRuntime
      },
      session,
      targetResolvers: {
        buildSolarStationFieldMarkedGroundCells,
        getBoulderShadedTaskGroundCells,
        getFreeRoamRestorationGroundCells,
        getGrowFirstHabitatTaskGroundCells,
        getLeppaTreeSurroundingGroundCells,
        getWorldCellPlannerSelectedGroundCell,
        isOpeningLeppaTreeRequestActive
      }
    });

    expect(result).toBe(runtime);
    expect(createRuntime).toHaveBeenCalledWith(expect.objectContaining({
      controls,
      gameplay,
      session
    }));
    expect(createdOptions.getCurrentInputModalityState()).toEqual({ type: "keyboard" });
    expect(createdOptions.getPlayerCounterPromptText(1200)).toBe("Wood x2");
    expect(createdOptions.getSelectedRotatableWorkbenchPlacement()).toEqual({ id: "selected-workbench" });
    expect(createdOptions.getNearestRotatableWorkbenchPlacement()).toEqual({ id: "nearby-workbench" });
    expect(createdOptions.getPendingSquirtleWaterGunGroundCells()).toEqual([{ id: "water-cell" }]);
    expect(createdOptions.getFreeRoamRestorationGroundCells({ storyState: controls.storyState }))
      .toEqual([{ id: "free-roam" }]);
    expect(getFreeRoamRestorationGroundCells).toHaveBeenCalledWith(expect.objectContaining({
      groundDeadInstances: ["dead"],
      groundFlowerPatches: ["flower"],
      groundGrassPatches: ["grass"],
      groundPurifiedInstances: ["purified"],
      iceGroundInstances: ["ice"]
    }));
    expect(createdOptions.getBoulderShadedTaskGroundCells(controls.storyState))
      .toEqual([{ id: "boulder-shade" }]);
    expect(getBoulderShadedTaskGroundCells).toHaveBeenCalledWith(expect.objectContaining({
      challengeBoulder: { id: "boulder-a" },
      storyState: controls.storyState
    }));
    expect(createdOptions.getGrowFirstHabitatTaskGroundCells({ storyState: controls.storyState }))
      .toEqual([{ id: "grow-first" }]);
    expect(getGrowFirstHabitatTaskGroundCells).toHaveBeenCalledWith(expect.objectContaining({
      referencePosition: [7, 0, 8]
    }));
    expect(createdOptions.buildFoundationBuildZoneGroundCells()).toEqual([{ id: "foundation-cell" }]);
    expect(createdOptions.getWorldCellPlannerSelectedGroundCell()).toEqual({ id: "planner-cell" });
    expect(createdOptions.getWorkbenchRotationGroundCell()).toEqual({ id: "workbench-ground" });
    expect(createdOptions.buildSolarStationPreviewPowerRadiusGroundCells(session, { id: "preview" }))
      .toEqual([{ id: "preview-power" }]);
    expect(solarStationPowerRadiusRuntime.buildPreviewPowerRadiusGroundCells)
      .toHaveBeenCalledWith({ id: "preview" });
    expect(createdOptions.buildPlacedSolarStationPowerRadiusGroundCells())
      .toEqual([{ id: "placed-power" }]);
    expect(createdOptions.getGroundActionFeedbackFrame(1400)).toEqual({ cells: [] });
    expect(groundActionFeedbackRuntime.getFeedbackFrame).toHaveBeenCalledWith({
      session,
      now: 1400
    });
    expect(createdOptions.getFieldToolTargetPulseFrame({ id: "ground-a" }, 1500))
      .toEqual({ scale: 1 });
    expect(groundActionFeedbackRuntime.getPulseFrame)
      .toHaveBeenCalledWith({ id: "ground-a" }, 1500);
    expect(createdOptions.buildSolarStationFieldMarkedGroundCells({ id: "target" }))
      .toEqual([{ id: "solar-field" }]);
    expect(createdOptions.getLeppaTreeSurroundingGroundCells()).toEqual([{ id: "leppa" }]);
    expect(createdOptions.isOpeningLeppaTreeRequestActive(controls.storyState)).toBe(true);
  });
});
