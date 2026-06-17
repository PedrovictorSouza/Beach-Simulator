import { describe, expect, it, vi } from "vitest";
import { createCompanionFrameRuntimeBundle } from "../app/runtime/companions/companionFrameRuntimeBundle.js";

describe("createCompanionFrameRuntimeBundle", () => {
  it("wires companion encounter and frame callbacks through companion-domain runtimes", () => {
    const companionEncounterRuntime = {
      updateBulbasaur: vi.fn(),
      updateCharmander: vi.fn(),
      updateTimburr: vi.fn()
    };
    const companionFrameRuntime = { update: vi.fn() };
    const createEncounterRuntime = vi.fn(() => companionEncounterRuntime);
    const createFrameRuntime = vi.fn(() => companionFrameRuntime);
    const controls = { storyState: { flags: { ready: true } } };
    const session = {
      bulbasaurEncounter: { id: "bulbasaur" },
      charmanderFireAction: { phase: "idle" },
      groundGrassPatches: [{ id: "grass-a" }]
    };
    const rendering = { isNpcActive: vi.fn() };
    const audio = {};
    const companionRepairBoxModelRuntime = {
      getInvestigationTarget: vi.fn(() => ({ id: "repair-box" })),
      updateRepairBoxRustle: vi.fn()
    };
    const companionModelSyncRuntime = {
      syncRepairModules: vi.fn()
    };
    const beeFieldRuntime = {
      syncBees: vi.fn(),
      syncRepairBox: vi.fn()
    };
    const squirtleReassemblyRuntime = { update: vi.fn() };
    const companionAbilityResourcesRuntime = {
      updateCharmanderCarbonEnergy: vi.fn(),
      updateSquirtleWaterStamina: vi.fn()
    };
    const waterGunRuntime = { updateAction: vi.fn() };
    const leafageRuntime = { updateAction: vi.fn() };
    const fireRuntime = { updateAction: vi.fn() };
    const buildBlockRuntime = { updateAction: vi.fn() };
    const companionGroundPatrolFrameRuntime = {
      updateBulbasaur: vi.fn(),
      updateSquirtle: vi.fn()
    };
    const waterGunSfxBurstRuntime = {
      isActive: vi.fn(() => true)
    };
    const leafDenConstructionPresentationRuntime = {
      isActive: vi.fn(() => false)
    };
    const gameplayDialogue = {
      isActive: vi.fn(() => true)
    };
    const isGameplayActive = vi.fn(() => true);

    const result = createCompanionFrameRuntimeBundle({
      audio,
      controls,
      createEncounterRuntime,
      createFrameRuntime,
      rendering,
      session,
      callbacks: {
        isGameplayActive
      },
      config: {
        bulbasaurModelFaceYawOffset: 1,
        charmanderFollowDistance: 2,
        charmanderFollowSpeed: 3,
        charmanderModelFaceYawOffset: 4,
        guidePosition: [5, 0, 6],
        timburrFollowDistance: 7,
        timburrFollowSpeed: 8,
        timburrModelFaceYawOffset: 9
      },
      runtimes: {
        beeFieldRuntime,
        buildBlockRuntime,
        bulbasaurWorkbenchGuideRuntime: { id: "guide" },
        companionAbilityResourcesRuntime,
        companionFollowMovementRuntime: { id: "follow" },
        companionGroundPatrolFrameRuntime,
        companionIdleMotionRuntime: { id: "idle" },
        companionModelSyncRuntime,
        companionRepairBoxModelRuntime,
        constructionHelperMotionRuntime: { id: "construction-helper" },
        fireRuntime,
        gameplayDialogue,
        leafageRuntime,
        leafDenConstructionPresentationRuntime,
        repairBoxRevealOpeningRuntime: { id: "repair-opening" },
        squirtleReassemblyRuntime,
        waterGunRuntime,
        waterGunSfxBurstRuntime
      }
    });

    expect(result).toEqual({
      companionEncounterRuntime,
      companionFrameRuntime
    });
    expect(createEncounterRuntime).toHaveBeenCalledWith({
      session,
      controls,
      repairBoxRevealOpeningRuntime: { id: "repair-opening" },
      bulbasaurWorkbenchGuideRuntime: { id: "guide" },
      companionModelSyncRuntime,
      companionIdleMotionRuntime: { id: "idle" },
      constructionHelperMotionRuntime: { id: "construction-helper" },
      companionFollowMovementRuntime: { id: "follow" },
      callbacks: {
        isLeafDenConstructionActive: leafDenConstructionPresentationRuntime.isActive
      },
      config: {
        bulbasaurModelFaceYawOffset: 1,
        charmanderFollowDistance: 2,
        charmanderFollowSpeed: 3,
        charmanderModelFaceYawOffset: 4,
        timburrFollowDistance: 7,
        timburrFollowSpeed: 8,
        timburrModelFaceYawOffset: 9
      }
    });
    expect(createFrameRuntime).toHaveBeenCalledWith(expect.objectContaining({
      audio,
      controls,
      guidePosition: [5, 0, 6],
      rendering,
      session
    }));

    const frameCallbacks = createFrameRuntime.mock.calls[0][0].callbacks;
    expect(frameCallbacks.isDialogueActive()).toBe(true);
    expect(frameCallbacks.isGameplayActive()).toBe(true);
    expect(frameCallbacks.getRepairBoxInvestigationTarget()).toEqual({ id: "repair-box" });
    expect(companionRepairBoxModelRuntime.getInvestigationTarget).toHaveBeenCalledWith({
      encounter: session.bulbasaurEncounter,
      flags: controls.storyState.flags,
      groundGrassPatches: session.groundGrassPatches
    });
    expect(frameCallbacks.isWaterGunSfxBurstActive(4)).toBe(true);
    frameCallbacks.updateBulbasaurRepairBoxRustle(0.1);
    frameCallbacks.updateBulbasaurEncounter(0.2);
    frameCallbacks.updateCharmanderEncounter(0.3, { activeMoveId: "fire" });
    frameCallbacks.updateCharmanderFireAction(0.4);
    frameCallbacks.updateTimburrEncounter(0.5, { activeMoveId: "build" });
    frameCallbacks.updateTimburrBuildBlockAction(0.6, 700);
    frameCallbacks.syncCompanionRepairModules();
    frameCallbacks.syncBeeFieldRepairBox();
    frameCallbacks.syncBeeFieldBees(0.7);
    frameCallbacks.updateSquirtleReassembly(0.8);
    frameCallbacks.updateSquirtleWaterStamina(0.9);
    frameCallbacks.updateCharmanderCarbonEnergy(1);
    frameCallbacks.updateSquirtleWaterGunAction(1.1);
    frameCallbacks.updateBulbasaurLeafageAction(1.2);
    frameCallbacks.updateSquirtleIdlePatrol(1.3, { active: true });
    frameCallbacks.updateBulbasaurIdlePatrol(1.4, { active: true });

    expect(companionRepairBoxModelRuntime.updateRepairBoxRustle)
      .toHaveBeenCalledWith(session.bulbasaurEncounter, 0.1);
    expect(companionEncounterRuntime.updateBulbasaur).toHaveBeenCalledWith(0.2);
    expect(companionEncounterRuntime.updateCharmander)
      .toHaveBeenCalledWith(0.3, { activeMoveId: "fire" });
    expect(fireRuntime.updateAction).toHaveBeenCalledWith(0.4);
    expect(companionEncounterRuntime.updateTimburr)
      .toHaveBeenCalledWith(0.5, { activeMoveId: "build" });
    expect(buildBlockRuntime.updateAction).toHaveBeenCalledWith(0.6, 700);
    expect(companionModelSyncRuntime.syncRepairModules).toHaveBeenCalledTimes(1);
    expect(beeFieldRuntime.syncRepairBox).toHaveBeenCalledTimes(1);
    expect(beeFieldRuntime.syncBees).toHaveBeenCalledWith(0.7);
    expect(squirtleReassemblyRuntime.update).toHaveBeenCalledWith(0.8);
    expect(companionAbilityResourcesRuntime.updateSquirtleWaterStamina)
      .toHaveBeenCalledWith(0.9);
    expect(companionAbilityResourcesRuntime.updateCharmanderCarbonEnergy)
      .toHaveBeenCalledWith(1);
    expect(waterGunRuntime.updateAction).toHaveBeenCalledWith(1.1);
    expect(leafageRuntime.updateAction).toHaveBeenCalledWith(1.2);
    expect(companionGroundPatrolFrameRuntime.updateSquirtle)
      .toHaveBeenCalledWith(1.3, { active: true });
    expect(companionGroundPatrolFrameRuntime.updateBulbasaur)
      .toHaveBeenCalledWith(1.4, { active: true });
  });
});
