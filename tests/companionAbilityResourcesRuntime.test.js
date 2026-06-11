import { describe, expect, it, vi } from "vitest";

import {
  createCompanionAbilityResourcesRuntime
} from "../app/runtime/fieldMoveRuntime/companionAbilityResourcesRuntime.js";

const CONFIG = Object.freeze({
  squirtleWaterGunUseCountFlag: "squirtleWaterGunUseCount",
  squirtleWaterGunBaseLevel: 2,
  squirtleWaterGunUsesPerLevel: 3,
  squirtleWaterGunEvolutionMaxUses: 12,
  squirtleWaterGunMaxSpeedMultiplier: 1.6,
  squirtleWaterGunSprayDuration: 0.8,
  squirtleWaterGunMinSprayDuration: 0.4,
  squirtleWaterGunImpactTime: 0.32,
  squirtleWaterGunMinImpactTime: 0.16,
  squirtleWaterStaminaMax: 3,
  squirtleWaterStaminaCost: 1,
  squirtleWaterStaminaRechargeDuration: 4,
  squirtleWaterStaminaVisualDecreaseDuration: 0.5,
  squirtleWaterStaminaVisualIncreaseDuration: 0.25,
  charmanderFireCarbonUsesFlag: "charmanderFireCarbonUses",
  charmanderFireUsesPerCarbon: 4,
  charmanderCarbonVisualDecreaseDuration: 0.5,
  charmanderCarbonVisualIncreaseDuration: 0.25,
  carbonItemId: "carbon"
});

function createRuntime(overrides = {}) {
  const session = {
    ...overrides.session
  };
  const controls = {
    inventory: {
      ...overrides.inventory
    },
    storyState: {
      flags: {
        ...overrides.flags
      }
    }
  };
  const onSquirtleRechargeComplete = vi.fn();
  const moveValueToward = vi.fn((current, target, maxStep) => {
    if (current < target) {
      return Math.min(target, current + maxStep);
    }
    return Math.max(target, current - maxStep);
  });
  const runtime = createCompanionAbilityResourcesRuntime({
    session,
    controls,
    clamp01: (value) => Math.max(0, Math.min(1, value)),
    moveValueToward,
    onSquirtleRechargeComplete,
    config: CONFIG
  });

  return {
    controls,
    moveValueToward,
    onSquirtleRechargeComplete,
    runtime,
    session
  };
}

describe("createCompanionAbilityResourcesRuntime", () => {
  it("derives Hydro Bot level, stamina max and speed from recorded Water Gun uses", () => {
    const { controls, runtime, session } = createRuntime({
      flags: {
        squirtleWaterGunUseCount: 6
      }
    });

    expect(runtime.getSquirtleWaterGunUseCount()).toBe(6);
    expect(runtime.getSquirtleWaterGunLevel()).toBe(4);
    expect(runtime.getSquirtleWaterStaminaState()).toMatchObject({
      current: 5,
      visualCurrent: 5,
      max: 5,
      charging: false,
      chargeElapsed: 0
    });
    expect(runtime.getSquirtleWaterGunSpeedMultiplier()).toBeCloseTo(1.3);
    expect(runtime.getSquirtleWaterGunSprayDuration()).toBeCloseTo(0.8 / 1.3);
    expect(runtime.getSquirtleWaterGunImpactTime()).toBeCloseTo(0.32 / 1.3);

    runtime.recordSquirtleWaterGunUse();

    expect(controls.storyState.flags.squirtleWaterGunUseCount).toBe(7);
    expect(session.squirtleWaterStamina.max).toBe(5);
  });

  it("preserves existing stamina and grants only the max increase when level grows", () => {
    const { runtime, session } = createRuntime({
      flags: {
        squirtleWaterGunUseCount: 6
      },
      session: {
        squirtleWaterStamina: {
          current: 2,
          visualCurrent: 1,
          max: 3,
          charging: false,
          chargeElapsed: 0
        }
      }
    });

    expect(runtime.getSquirtleWaterStaminaState()).toMatchObject({
      current: 4,
      visualCurrent: 3,
      max: 5
    });
    expect(session.squirtleWaterStamina.current).toBe(4);
  });

  it("consumes stamina, starts recharge at empty, and notifies when recharge completes", () => {
    const {
      moveValueToward,
      onSquirtleRechargeComplete,
      runtime,
      session
    } = createRuntime();

    expect(runtime.consumeSquirtleWaterStamina()).toBe(true);
    expect(runtime.consumeSquirtleWaterStamina()).toBe(true);
    expect(runtime.consumeSquirtleWaterStamina()).toBe(true);
    expect(runtime.getSquirtleWaterStaminaState().current).toBe(0);
    expect(runtime.consumeSquirtleWaterStamina()).toBe(false);
    expect(runtime.isSquirtleWaterCharging()).toBe(true);

    runtime.updateSquirtleWaterStamina(2);
    expect(session.squirtleWaterStamina.current).toBeCloseTo(1.5);
    expect(moveValueToward).toHaveBeenLastCalledWith(
      3,
      1.5,
      12
    );

    runtime.updateSquirtleWaterStamina(2);
    expect(session.squirtleWaterStamina).toMatchObject({
      current: 3,
      charging: false,
      chargeElapsed: 0
    });
    expect(onSquirtleRechargeComplete).toHaveBeenCalledTimes(1);
  });

  it("uses instant Water Gun actions to begin recharge immediately when empty", () => {
    const { runtime } = createRuntime({
      session: {
        squirtleWaterStamina: {
          current: 1,
          visualCurrent: 1,
          max: 3,
          charging: false,
          chargeElapsed: 0
        }
      }
    });

    expect(runtime.consumeSquirtleWaterStaminaForInstantAction()).toBe(true);
    expect(runtime.getSquirtleWaterStaminaState()).toMatchObject({
      current: 0,
      charging: true,
      chargeElapsed: 0
    });
  });

  it("derives and eases Thermal Bot Carbon energy from inventory and use count", () => {
    const { moveValueToward, runtime, session } = createRuntime({
      inventory: {
        carbon: 2
      },
      flags: {
        charmanderFireCarbonUses: 3
      },
      session: {
        charmanderCarbonEnergy: {
          current: 1,
          visualCurrent: 1
        }
      }
    });

    expect(runtime.getCharmanderCarbonUseCount()).toBe(3);
    expect(runtime.getCharmanderCarbonEnergyState()).toMatchObject({
      current: 1,
      visualCurrent: 1
    });

    session.charmanderCarbonEnergy.visualCurrent = 0.25;
    runtime.updateCharmanderCarbonEnergy(0.125);

    expect(moveValueToward).toHaveBeenCalledWith(0.25, 1, 0.5);
    expect(session.charmanderCarbonEnergy.visualCurrent).toBe(0.75);
  });

  it("clamps Thermal Bot Carbon use count to one less than the uses per Carbon", () => {
    const { runtime } = createRuntime({
      flags: {
        charmanderFireCarbonUses: 20
      }
    });

    expect(runtime.getCharmanderCarbonUseCount()).toBe(3);
    expect(runtime.getCharmanderCarbonEnergyState()).toMatchObject({
      current: 0,
      visualCurrent: 0
    });
  });
});
