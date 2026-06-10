import { describe, expect, it, vi } from "vitest";

import { createCompanionFrameRuntime } from "../app/runtime/companions/companionFrameRuntime.js";

function createRuntime(overrides = {}) {
  const events = [];
  const record = (name) => vi.fn(() => {
    events.push(name);
  });
  const callbacks = {
    isDialogueActive: vi.fn(() => true),
    isGameplayActive: vi.fn(() => true),
    getRepairBoxInvestigationTarget: vi.fn(() => ({ id: "repair-box" })),
    isWaterGunSfxBurstActive: vi.fn(() => true),
    updateBulbasaurRepairBoxRustle: record("repairBoxRustle"),
    updateBulbasaurEncounter: record("bulbasaurEncounter"),
    updateCharmanderEncounter: record("charmanderEncounter"),
    updateCharmanderFireAction: record("charmanderFireAction"),
    updateTimburrEncounter: record("timburrEncounter"),
    updateTimburrBuildBlockAction: record("timburrBuildBlockAction"),
    syncCompanionRepairModules: record("repairModules"),
    syncBeeFieldRepairBox: record("beeRepairBox"),
    syncBeeFieldBees: record("bees"),
    updateSquirtleReassembly: record("squirtleReassembly"),
    updateSquirtleWaterStamina: record("squirtleWaterStamina"),
    updateCharmanderCarbonEnergy: record("charmanderCarbonEnergy"),
    updateSquirtleWaterGunAction: record("squirtleWaterGunAction"),
    updateBulbasaurLeafageAction: record("bulbasaurLeafageAction"),
    updateSquirtleIdlePatrol: record("squirtleIdlePatrol"),
    updateBulbasaurIdlePatrol: record("bulbasaurIdlePatrol"),
    ...overrides.callbacks
  };
  const updateChopperNpcActor = vi.fn((actor, state) => {
    events.push("chopperActor");
    expect(actor).toBe("chopper-actor");
    expect(state.deltaTime).toBe(overrides.expectedChopperDeltaTime ?? 0.25);
    expect(state.storyState).toEqual({ flags: { ready: true } });
    expect(state.isNpcActive).toBe("is-npc-active");
    expect(state.isDialogueActive()).toBe(true);
    expect(state.guidePosition).toEqual([1, 0, 2]);
    expect(state.investigationTarget).toEqual({ id: "repair-box" });
  });
  const audio = {
    updateFireFlame: vi.fn(() => {
      events.push("fireAudio");
    }),
    updateWaterGun: vi.fn(() => {
      events.push("waterAudio");
    }),
    ...overrides.audio
  };
  const session = {
    chopperNpcActor: "chopper-actor",
    charmanderFireAction: { phase: "spray" },
    squirtleWaterGunAction: { phase: "idle" },
    ...overrides.session
  };
  const controls = {
    storyState: {
      flags: {
        ready: true
      }
    },
    ...overrides.controls
  };
  const rendering = {
    isNpcActive: "is-npc-active",
    ...overrides.rendering
  };

  return {
    runtime: createCompanionFrameRuntime({
      session,
      controls,
      rendering,
      audio,
      guidePosition: [1, 0, 2],
      updateChopperNpcActor,
      callbacks
    }),
    callbacks,
    updateChopperNpcActor,
    audio,
    events
  };
}

describe("companion frame runtime", () => {
  it("runs companion simulation in the frame order", () => {
    const {
      runtime,
      callbacks,
      audio,
      events
    } = createRuntime();

    const result = runtime.update({
      deltaTime: 0.25,
      now: 2000,
      activeMoveId: "waterGun",
      gameplayOpeningMovementLocked: false,
      cinematicActive: false,
      tutorialActive: false,
      pokedexModalOpen: false,
      dialogueActive: false,
      skillLearnActive: false,
      scriptedInteractionActive: false
    });

    expect(audio.updateFireFlame).toHaveBeenCalledWith({
      active: true,
      nowSeconds: 2
    });
    expect(callbacks.isWaterGunSfxBurstActive).toHaveBeenCalledWith(2);
    expect(audio.updateWaterGun).toHaveBeenCalledWith({
      active: true,
      nowSeconds: 2
    });
    expect(callbacks.updateCharmanderEncounter).toHaveBeenCalledWith(0.25, {
      activeMoveId: "waterGun"
    });
    expect(callbacks.updateTimburrBuildBlockAction).toHaveBeenCalledWith(0.25, 2000);
    expect(callbacks.updateSquirtleIdlePatrol).toHaveBeenCalledWith(0.25, {
      active: true,
      activeMoveId: "waterGun"
    });
    expect(callbacks.updateBulbasaurIdlePatrol).toHaveBeenCalledWith(0.25, {
      active: true,
      activeMoveId: "waterGun"
    });
    expect(result).toEqual({
      chopperBulbasaurRepairBoxInvestigationTarget: { id: "repair-box" },
      robotIdlePatrolActive: true
    });
    expect(events).toEqual([
      "chopperActor",
      "repairBoxRustle",
      "bulbasaurEncounter",
      "charmanderEncounter",
      "charmanderFireAction",
      "fireAudio",
      "timburrEncounter",
      "timburrBuildBlockAction",
      "repairModules",
      "beeRepairBox",
      "bees",
      "squirtleReassembly",
      "squirtleWaterStamina",
      "charmanderCarbonEnergy",
      "squirtleWaterGunAction",
      "waterAudio",
      "bulbasaurLeafageAction",
      "squirtleIdlePatrol",
      "bulbasaurIdlePatrol"
    ]);
  });

  it("keeps idle patrol inactive while gameplay flow is blocked", () => {
    const { runtime, callbacks } = createRuntime({
      expectedChopperDeltaTime: 0.1,
      callbacks: {
        isWaterGunSfxBurstActive: vi.fn(() => false)
      },
      session: {
        squirtleWaterGunAction: { phase: "spray" }
      }
    });

    const result = runtime.update({
      deltaTime: 0.1,
      now: 500,
      activeMoveId: "leafage",
      gameplayOpeningMovementLocked: true,
      cinematicActive: false,
      tutorialActive: false,
      pokedexModalOpen: false,
      dialogueActive: false,
      skillLearnActive: false,
      scriptedInteractionActive: false
    });

    expect(callbacks.updateSquirtleIdlePatrol).toHaveBeenCalledWith(0.1, {
      active: false,
      activeMoveId: "leafage"
    });
    expect(callbacks.updateBulbasaurIdlePatrol).toHaveBeenCalledWith(0.1, {
      active: false,
      activeMoveId: "leafage"
    });
    expect(result.robotIdlePatrolActive).toBe(false);
  });
});
