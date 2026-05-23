import {
  GREENHOUSE_ITEM_ID,
  LEAF_DEN_KIT_ITEM_ID
} from "../../gameplayContent.js";

export const WORKBENCH_PANEL_PRESENTATION = Object.freeze({
  backgroundUrl: new URL("./images/grass.gif", import.meta.url).href
});

export const WORKBENCH_SELECTION_PRESENTATION = Object.freeze({
  frameUrl: new URL("./images/selected.png", import.meta.url).href
});

export const WORKBENCH_REQUIREMENT_PRESENTATION = Object.freeze({
  iconAlt: "Gear",
  iconUrl: new URL("./images/gear.png", import.meta.url).href
});

export const DEFAULT_WORKBENCH_RECIPE_PRESENTATION = Object.freeze({
  recipeId: "default",
  protocol: Object.freeze({
    label: "Colony Plans",
    purpose: "Build support for the current restoration plan."
  }),
  artworkUrl: ""
});

export const WORKBENCH_RECIPE_PRESENTATIONS = Object.freeze([
  Object.freeze({
    recipeId: GREENHOUSE_ITEM_ID,
    protocol: Object.freeze({
      label: "Soil Plans",
      purpose: "Marks the first greenhouse restoration footprint."
    }),
    artworkUrl: new URL("./images/Estufa.gif", import.meta.url).href
  }),
  Object.freeze({
    recipeId: "campfire",
    protocol: Object.freeze({
      label: "Power Plans",
      purpose: "Thermal shelter and starter heat."
    }),
    artworkUrl: new URL("../../Train-house/train-house.gif", import.meta.url).href
  }),
  Object.freeze({
    recipeId: "strawBed",
    protocol: Object.freeze({
      label: "Water Plans",
      purpose: "A solar pump node for local circulation."
    }),
    artworkUrl: new URL("../../Solar-Station/Solar-Station.gif", import.meta.url).href
  }),
  Object.freeze({
    recipeId: LEAF_DEN_KIT_ITEM_ID,
    protocol: Object.freeze({
      label: "Shelter Plans",
      purpose: "Prepares the first human-ready habitat kit."
    }),
    artworkUrl: new URL("../../house/house_2.png", import.meta.url).href
  })
]);

const WORKBENCH_RECIPE_PRESENTATIONS_BY_ID = Object.freeze(
  Object.fromEntries(
    WORKBENCH_RECIPE_PRESENTATIONS.map((presentation) => [
      presentation.recipeId,
      presentation
    ])
  )
);

export function listWorkbenchRecipePresentations() {
  return WORKBENCH_RECIPE_PRESENTATIONS;
}

export function getWorkbenchRecipePresentation(recipeId) {
  return WORKBENCH_RECIPE_PRESENTATIONS_BY_ID[recipeId] || DEFAULT_WORKBENCH_RECIPE_PRESENTATION;
}
