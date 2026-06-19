import { describe, expect, it } from "vitest";
import {
  DEFAULT_MANUAL_SAVE_SLOT_ID,
  MANUAL_SAVE_ACTIVE_SLOT_STORAGE_KEY,
  MANUAL_SAVE_STORAGE_KEY,
  buildStartSaveSlots,
  getManualSaveSlotStorageKey,
  normalizeManualSaveSlotId,
  readManualSaveSlot,
  removeManualSaveSlot,
  resolveBootManualSaveSlot,
  writeActiveManualSaveSlotId
} from "../app/bootstrap/manualSaveSlots.js";
import { START_SLOT_ACTION } from "../app/start/startSlotContract.js";

function createStorageWindow(initialEntries = []) {
  const storage = new Map(initialEntries);
  return {
    localStorage: {
      getItem(key) {
        return storage.has(key) ? storage.get(key) : null;
      },
      removeItem(key) {
        storage.delete(key);
      },
      setItem(key, value) {
        storage.set(key, value);
      }
    },
    storage
  };
}

function savePoint(id) {
  return {
    version: 1,
    id
  };
}

describe("manual save slots", () => {
  it("builds start slots from the active continue slot", () => {
    expect(buildStartSaveSlots(savePoint("active"), "slot-2")).toEqual([
      {
        id: "continue",
        action: START_SLOT_ACTION.CONTINUE,
        slotId: "slot-2",
        label: "Continue",
        detail: "Saved Game"
      },
      {
        id: "new-game-slot-1",
        action: START_SLOT_ACTION.NEW_GAME,
        slotId: "slot-1",
        label: "New Game",
        detail: "Empty Slot 1"
      },
      {
        id: "new-game-slot-3",
        action: START_SLOT_ACTION.NEW_GAME,
        slotId: "slot-3",
        label: "New Game",
        detail: "Empty Slot 2"
      }
    ]);
  });

  it("normalizes unknown slots to the default slot", () => {
    expect(normalizeManualSaveSlotId("missing")).toBe(DEFAULT_MANUAL_SAVE_SLOT_ID);
    expect(getManualSaveSlotStorageKey("missing")).toBe(
      getManualSaveSlotStorageKey(DEFAULT_MANUAL_SAVE_SLOT_ID)
    );
  });

  it("resolves the active slot and falls back to the legacy default save", () => {
    const legacySave = savePoint("legacy");
    const windowRef = createStorageWindow([
      [MANUAL_SAVE_ACTIVE_SLOT_STORAGE_KEY, "slot-2"],
      [MANUAL_SAVE_STORAGE_KEY, JSON.stringify(legacySave)]
    ]);

    expect(readManualSaveSlot(windowRef, "slot-2")).toBe(null);
    expect(resolveBootManualSaveSlot(windowRef)).toEqual({
      slotId: DEFAULT_MANUAL_SAVE_SLOT_ID,
      savePoint: legacySave
    });
  });

  it("writes active slot ids and removes default legacy saves together", () => {
    const windowRef = createStorageWindow([
      [MANUAL_SAVE_STORAGE_KEY, JSON.stringify(savePoint("legacy"))],
      [getManualSaveSlotStorageKey(DEFAULT_MANUAL_SAVE_SLOT_ID), JSON.stringify(savePoint("slot"))]
    ]);

    writeActiveManualSaveSlotId(windowRef, "slot-3");
    expect(windowRef.storage.get(MANUAL_SAVE_ACTIVE_SLOT_STORAGE_KEY)).toBe("slot-3");

    removeManualSaveSlot(windowRef, DEFAULT_MANUAL_SAVE_SLOT_ID);
    expect(windowRef.storage.has(MANUAL_SAVE_STORAGE_KEY)).toBe(false);
    expect(windowRef.storage.has(getManualSaveSlotStorageKey(DEFAULT_MANUAL_SAVE_SLOT_ID))).toBe(false);
  });
});
