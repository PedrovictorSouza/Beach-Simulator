import {
  GREENHOUSE_ITEM_ID,
  LEPPA_TREE_POSITION,
  WORKBENCH_POSITION
} from "../../gameplayContent.js";
import { GRID_PLACEABLE_IDS } from "./gridBuildingSystem.js";

export const WORLD_OBJECT_IDS = Object.freeze({
  WORKBENCH: "workbench",
  ORGANIC_BUS: "organic-bus",
  GREENHOUSE: GRID_PLACEABLE_IDS.GREENHOUSE
});

export const WORLD_OBJECT_KIND = Object.freeze({
  STATION: "station",
  ECOLOGY_SITE: "ecology-site"
});

export const WORLD_OBJECT_PLACEMENT_MODE = Object.freeze({
  AUTHORED: "authored",
  CRAFTED_PLACEABLE: "crafted-placeable"
});

export const WORLD_OBJECT_ACTIVATION_TYPE = Object.freeze({
  OPEN_CONTAINER: "open-container",
  RESTORE_SITE: "restore-site",
  PLACE_FROM_INVENTORY: "place-from-inventory"
});

export const WORLD_OBJECT_TAG = Object.freeze({
  FABRICATION: "fabrication",
  FOOTPRINT: "footprint",
  HABITAT: "habitat",
  INTERACTABLE: "interactable",
  PROGRESSION: "progression",
  RESTORATION: "restoration"
});

const REQUIRED_WORLD_OBJECT_IDS = Object.freeze([
  WORLD_OBJECT_IDS.WORKBENCH,
  WORLD_OBJECT_IDS.ORGANIC_BUS,
  WORLD_OBJECT_IDS.GREENHOUSE
]);

function freezeRecord(record) {
  return record ? Object.freeze({ ...record }) : null;
}

function freezeStringArray(values = []) {
  return Object.freeze([...values]);
}

function freezePosition(position) {
  return Array.isArray(position) ? Object.freeze([...position]) : null;
}

function freezeWorldObject(entry) {
  return Object.freeze({
    ...entry,
    tags: freezeStringArray(entry.tags),
    lifecycle: freezeStringArray(entry.lifecycle),
    emits: freezeStringArray(entry.emits),
    position: freezePosition(entry.position),
    footprint: freezeRecord(entry.footprint),
    activation: freezeRecord(entry.activation),
    runtimeRefs: freezeRecord(entry.runtimeRefs)
  });
}

export const WORLD_OBJECTS = Object.freeze([
  freezeWorldObject({
    id: WORLD_OBJECT_IDS.WORKBENCH,
    label: "Workbench",
    kind: WORLD_OBJECT_KIND.STATION,
    placementMode: WORLD_OBJECT_PLACEMENT_MODE.AUTHORED,
    position: WORKBENCH_POSITION,
    tags: [
      WORLD_OBJECT_TAG.INTERACTABLE,
      WORLD_OBJECT_TAG.FABRICATION,
      WORLD_OBJECT_TAG.PROGRESSION
    ],
    lifecycle: ["available"],
    activation: {
      type: WORLD_OBJECT_ACTIVATION_TYPE.OPEN_CONTAINER,
      containerId: "workbench"
    },
    runtimeRefs: {
      interactableId: "workbench",
      landmarkId: "workbench",
      modelInstanceKey: "workbenchModelInstance"
    },
    emits: ["workbenchDiyRecipesReceived"]
  }),
  freezeWorldObject({
    id: WORLD_OBJECT_IDS.ORGANIC_BUS,
    label: "Organic Bus",
    kind: WORLD_OBJECT_KIND.ECOLOGY_SITE,
    placementMode: WORLD_OBJECT_PLACEMENT_MODE.AUTHORED,
    position: LEPPA_TREE_POSITION,
    footprint: { width: 5, height: 5 },
    tags: [
      WORLD_OBJECT_TAG.INTERACTABLE,
      WORLD_OBJECT_TAG.RESTORATION,
      WORLD_OBJECT_TAG.HABITAT,
      WORLD_OBJECT_TAG.FOOTPRINT,
      WORLD_OBJECT_TAG.PROGRESSION
    ],
    lifecycle: ["dormant", "restored", "rewarded"],
    activation: {
      type: WORLD_OBJECT_ACTIVATION_TYPE.RESTORE_SITE,
      requiredCapability: "water-restoration"
    },
    runtimeRefs: {
      legacyId: "leppa-tree",
      landmarkId: "pulse-tree",
      sessionKey: "leppaTree"
    },
    emits: [
      "leppaTreeRevived",
      "leppaBerryDropped",
      "leppaBerryCollected",
      "organicBusGreenhouseRecipesReceived"
    ]
  }),
  freezeWorldObject({
    id: WORLD_OBJECT_IDS.GREENHOUSE,
    label: "Greenhouse",
    kind: WORLD_OBJECT_KIND.ECOLOGY_SITE,
    placementMode: WORLD_OBJECT_PLACEMENT_MODE.CRAFTED_PLACEABLE,
    stationId: WORLD_OBJECT_IDS.WORKBENCH,
    sourceItemId: GREENHOUSE_ITEM_ID,
    recipeId: GREENHOUSE_ITEM_ID,
    gridPlaceableId: GRID_PLACEABLE_IDS.GREENHOUSE,
    prefabKey: "greenhouseModel",
    footprint: { width: 5, height: 3 },
    tags: [
      WORLD_OBJECT_TAG.RESTORATION,
      WORLD_OBJECT_TAG.HABITAT,
      WORLD_OBJECT_TAG.FOOTPRINT,
      WORLD_OBJECT_TAG.PROGRESSION
    ],
    lifecycle: ["prepared", "placed"],
    activation: {
      type: WORLD_OBJECT_ACTIVATION_TYPE.PLACE_FROM_INVENTORY,
      sourceItemId: GREENHOUSE_ITEM_ID
    },
    runtimeRefs: {
      legacySessionKey: "greenhouse",
      sessionCollectionKey: "greenhouses"
    },
    emits: [
      "greenhouseCrafted",
      "greenhousePlaced"
    ]
  })
]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasValidPosition(position) {
  return Array.isArray(position) &&
    position.length === 3 &&
    position.every((value) => Number.isFinite(Number(value)));
}

function hasValidFootprint(footprint) {
  return !footprint || (
    Number.isInteger(footprint.width) &&
    Number.isInteger(footprint.height) &&
    footprint.width > 0 &&
    footprint.height > 0
  );
}

export function listWorldObjects() {
  return WORLD_OBJECTS;
}

export function getWorldObjectById(objectId) {
  return WORLD_OBJECTS.find((object) => object.id === objectId) || null;
}

export function validateWorldObjectCatalog({
  objects = WORLD_OBJECTS,
  requiredIds = REQUIRED_WORLD_OBJECT_IDS
} = {}) {
  const errors = [];
  const ids = new Set();
  const kinds = new Set(Object.values(WORLD_OBJECT_KIND));
  const placementModes = new Set(Object.values(WORLD_OBJECT_PLACEMENT_MODE));
  const activationTypes = new Set(Object.values(WORLD_OBJECT_ACTIVATION_TYPE));

  objects.forEach((object, index) => {
    if (!object?.id) {
      errors.push({ type: "missing-world-object-id", index });
      return;
    }

    if (ids.has(object.id)) {
      errors.push({ type: "duplicate-world-object-id", objectId: object.id, index });
    }
    ids.add(object.id);

    if (!isNonEmptyString(object.label)) {
      errors.push({ type: "missing-world-object-label", objectId: object.id, index });
    }

    if (!kinds.has(object.kind)) {
      errors.push({ type: "unknown-world-object-kind", objectId: object.id, kind: object.kind, index });
    }

    if (!placementModes.has(object.placementMode)) {
      errors.push({
        type: "unknown-world-object-placement-mode",
        objectId: object.id,
        placementMode: object.placementMode,
        index
      });
    }

    if (
      object.placementMode === WORLD_OBJECT_PLACEMENT_MODE.AUTHORED &&
      !hasValidPosition(object.position)
    ) {
      errors.push({ type: "missing-authored-world-object-position", objectId: object.id, index });
    }

    if (
      object.placementMode === WORLD_OBJECT_PLACEMENT_MODE.CRAFTED_PLACEABLE &&
      !isNonEmptyString(object.sourceItemId)
    ) {
      errors.push({ type: "missing-placeable-source-item", objectId: object.id, index });
    }

    if (
      object.placementMode === WORLD_OBJECT_PLACEMENT_MODE.CRAFTED_PLACEABLE &&
      !isNonEmptyString(object.gridPlaceableId)
    ) {
      errors.push({ type: "missing-grid-placeable-id", objectId: object.id, index });
    }

    if (!hasValidFootprint(object.footprint)) {
      errors.push({ type: "malformed-world-object-footprint", objectId: object.id, index });
    }

    if (!object.activation || !activationTypes.has(object.activation.type)) {
      errors.push({
        type: "unknown-world-object-activation",
        objectId: object.id,
        activationType: object.activation?.type,
        index
      });
    }

    (object.emits || []).forEach((eventId) => {
      if (!isNonEmptyString(eventId)) {
        errors.push({ type: "malformed-world-object-event", objectId: object.id, eventId, index });
      }
    });
  });

  requiredIds.forEach((objectId) => {
    if (!ids.has(objectId)) {
      errors.push({ type: "missing-required-world-object", objectId });
    }
  });

  return errors;
}
