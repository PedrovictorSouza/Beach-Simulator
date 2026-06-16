import { describe, expect, it } from "vitest";
import {
  applyTrainHouseDance,
  shouldCompleteThermalCabinHomeBeat
} from "../app/runtime/trainHouseDance.js";
import {
  resolveTrainHouseMusicVolume
} from "../app/runtime/gameLoop.js";
import { createTrainHouseMusicRuntime } from "../app/runtime/audio/trainHouseMusicRuntime.js";

describe("Thermal Cabin runtime effects", () => {
  it("raises music volume as the player approaches the Thermal Cabin", () => {
    const trainHousePosition = [4, 0, 4];

    const farVolume = resolveTrainHouseMusicVolume({
      playerPosition: [20.4, 0, 4],
      trainHousePosition
    });
    const edgeVolume = resolveTrainHouseMusicVolume({
      playerPosition: [12.2, 0, 4],
      trainHousePosition
    });
    const midVolume = resolveTrainHouseMusicVolume({
      playerPosition: [8, 0, 4],
      trainHousePosition
    });
    const closeVolume = resolveTrainHouseMusicVolume({
      playerPosition: [4.4, 0, 4],
      trainHousePosition
    });

    expect(farVolume).toBe(0);
    expect(edgeVolume).toBeGreaterThan(0);
    expect(midVolume).toBeGreaterThan(0);
    expect(midVolume).toBeGreaterThan(edgeVolume);
    expect(closeVolume).toBeGreaterThan(midVolume);
  });

  it("updates Thermal Cabin music only after the cabin is active", () => {
    const updates = [];
    const objectActivity = [];
    const runtime = createTrainHouseMusicRuntime({
      audio: {
        updateTrainHouseMusic(update) {
          updates.push(update);
        }
      },
      getPlayerPosition: () => [4.5, 0, 4],
      getStoryState: () => ({ flags: { campfireSpatOut: false } }),
      getTrainHousePosition: () => [4, 0, 4],
      musicRuntime: {
        reportObjectMusicActivity(update) {
          objectActivity.push(update);
        }
      }
    });

    const result = runtime.update(12.5);

    expect(result).toMatchObject({ active: false, volume: 0 });
    expect(updates).toEqual([{ active: false, volume: 0 }]);
    expect(objectActivity).toEqual([{ active: false, nowSeconds: 12.5 }]);
  });

  it("reports active Thermal Cabin object music when the player is near the active cabin", () => {
    const updates = [];
    const objectActivity = [];
    const runtime = createTrainHouseMusicRuntime({
      audio: {
        updateTrainHouseMusic(update) {
          updates.push(update);
        }
      },
      getPlayerPosition: () => [4.5, 0, 4],
      getStoryState: () => ({ flags: { campfireSpatOut: true } }),
      getTrainHousePosition: () => [4, 0, 4],
      musicRuntime: {
        reportObjectMusicActivity(update) {
          objectActivity.push(update);
        }
      }
    });

    const result = runtime.update(3);

    expect(result.active).toBe(true);
    expect(result.volume).toBeGreaterThan(0);
    expect(updates).toEqual([{ active: true, volume: result.volume }]);
    expect(objectActivity).toEqual([{ active: true, nowSeconds: 3 }]);
  });

  it("dances the Thermal Cabin without moving its ground pivot", () => {
    const instance = {
      offset: [0, 0.02, 0],
      scale: 3,
      yaw: 0,
      active: false
    };

    const applied = applyTrainHouseDance(instance, [6, 0, -2], 1.25);

    expect(applied).toBe(true);
    expect(instance.active).toBe(true);
    expect(instance.offset[1]).toBe(0.02);
    expect(instance.offset[0]).not.toBe(6);
    expect(instance.offset[2]).not.toBe(-2);
    expect(instance.scale).not.toBe(3);
    expect(Math.abs(instance.swayStrength)).toBeGreaterThan(0);
  });

  it("completes Thermal Bot's home beat when the player reaches the cabin with Thermal Bot in formation", () => {
    expect(shouldCompleteThermalCabinHomeBeat({
      thermalBotFollowing: true,
      thermalBotPosition: [9, 0, 9],
      playerPosition: [4.5, 0, 4],
      trainHousePosition: [4, 0, 4]
    })).toBe(true);
  });

  it("completes Thermal Bot's home beat when Thermal Bot is registered and the player reaches the cabin", () => {
    expect(shouldCompleteThermalCabinHomeBeat({
      thermalBotRegistered: true,
      thermalBotPosition: [18, 0, 18],
      playerPosition: [4.5, 0, 4],
      trainHousePosition: [4, 0, 4]
    })).toBe(true);
  });

  it("does not complete Thermal Bot's home beat when Thermal Bot is neither following nor registered", () => {
    expect(shouldCompleteThermalCabinHomeBeat({
      thermalBotFollowing: false,
      thermalBotPosition: [4.2, 0, 4],
      playerPosition: [4.5, 0, 4],
      trainHousePosition: [4, 0, 4]
    })).toBe(false);
  });
});
