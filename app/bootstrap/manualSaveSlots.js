import { isManualSavePointDto } from "../save/manualSavePointDto.ts";
import { START_SLOT_ACTION } from "../start/startSlotContract.js";

export const MANUAL_SAVE_STORAGE_KEY = "small-island.manual-save.v1";
const MANUAL_SAVE_SLOT_STORAGE_PREFIX = "small-island.manual-save-slot.v1.";
export const MANUAL_SAVE_ACTIVE_SLOT_STORAGE_KEY = "small-island.manual-save.active-slot.v1";
export const DEFAULT_MANUAL_SAVE_SLOT_ID = "slot-1";
export const MANUAL_SAVE_SLOT_IDS = Object.freeze([
  DEFAULT_MANUAL_SAVE_SLOT_ID,
  "slot-2",
  "slot-3"
]);

function readLocalStorageItem(windowRef, key) {
  try {
    return windowRef.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function removeLocalStorageItem(windowRef, key) {
  try {
    windowRef.localStorage?.removeItem(key);
  } catch {
    // The game can still run without localStorage write access.
  }
}

function readManualSavePointFromKey(windowRef, key) {
  try {
    const raw = readLocalStorageItem(windowRef, key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return isManualSavePointDto(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function readManualSavePoint(windowRef) {
  return readManualSavePointFromKey(windowRef, MANUAL_SAVE_STORAGE_KEY);
}

export function normalizeManualSaveSlotId(slotId) {
  return MANUAL_SAVE_SLOT_IDS.includes(slotId) ? slotId : DEFAULT_MANUAL_SAVE_SLOT_ID;
}

export function getManualSaveSlotStorageKey(slotId) {
  return `${MANUAL_SAVE_SLOT_STORAGE_PREFIX}${normalizeManualSaveSlotId(slotId)}`;
}

function readActiveManualSaveSlotId(windowRef) {
  return normalizeManualSaveSlotId(readLocalStorageItem(windowRef, MANUAL_SAVE_ACTIVE_SLOT_STORAGE_KEY));
}

export function writeActiveManualSaveSlotId(windowRef, slotId) {
  try {
    windowRef.localStorage?.setItem(
      MANUAL_SAVE_ACTIVE_SLOT_STORAGE_KEY,
      normalizeManualSaveSlotId(slotId)
    );
  } catch {
    // The game can still run without localStorage write access.
  }
}

export function readManualSaveSlot(windowRef, slotId) {
  const normalizedSlotId = normalizeManualSaveSlotId(slotId);
  const slotSavePoint = readManualSavePointFromKey(
    windowRef,
    getManualSaveSlotStorageKey(normalizedSlotId)
  );

  if (slotSavePoint) {
    return slotSavePoint;
  }

  return normalizedSlotId === DEFAULT_MANUAL_SAVE_SLOT_ID ?
    readManualSavePoint(windowRef) :
    null;
}

export function removeManualSaveSlot(windowRef, slotId) {
  const normalizedSlotId = normalizeManualSaveSlotId(slotId);
  removeLocalStorageItem(windowRef, getManualSaveSlotStorageKey(normalizedSlotId));
  if (normalizedSlotId === DEFAULT_MANUAL_SAVE_SLOT_ID) {
    removeLocalStorageItem(windowRef, MANUAL_SAVE_STORAGE_KEY);
  }
}

export function resolveBootManualSaveSlot(windowRef) {
  const activeSlotId = readActiveManualSaveSlotId(windowRef);
  const activeSlotSavePoint = readManualSaveSlot(windowRef, activeSlotId);
  if (activeSlotSavePoint) {
    return {
      slotId: activeSlotId,
      savePoint: activeSlotSavePoint
    };
  }

  const defaultSlotSavePoint = activeSlotId === DEFAULT_MANUAL_SAVE_SLOT_ID ?
    activeSlotSavePoint :
    readManualSaveSlot(windowRef, DEFAULT_MANUAL_SAVE_SLOT_ID);

  return {
    slotId: defaultSlotSavePoint ? DEFAULT_MANUAL_SAVE_SLOT_ID : activeSlotId,
    savePoint: defaultSlotSavePoint
  };
}

export function buildStartSaveSlots(savePoint, slotId) {
  if (!savePoint) {
    return [];
  }

  const continueSlotId = normalizeManualSaveSlotId(slotId);
  const newGameSlotIds = MANUAL_SAVE_SLOT_IDS
    .filter((candidateSlotId) => candidateSlotId !== continueSlotId)
    .slice(0, 2);

  return [
    {
      id: "continue",
      action: START_SLOT_ACTION.CONTINUE,
      slotId: continueSlotId,
      label: "Continue",
      detail: "Saved Game"
    },
    ...newGameSlotIds.map((newGameSlotId, index) => ({
      id: `new-game-${newGameSlotId}`,
      action: START_SLOT_ACTION.NEW_GAME,
      slotId: newGameSlotId,
      label: "New Game",
      detail: `Empty Slot ${index + 1}`
    }))
  ];
}
