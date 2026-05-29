export const PLACEMENT_CONTRACTS = Object.freeze([
  {
    id: "greenhouse",
    label: "Greenhouse",
    previewKey: "greenhousePlacementPreview",
    modelInstanceKey: "greenhouseModelInstance",
    cancelNotice: "Greenhouse placement canceled."
  },

  {
    id: "thermalCabin",
    label: "Thermal Cabin",
    previewKey: "campfirePlacementPreview",
    modelInstanceKeys: [
      {
        key: "campfireTrainHouseModelInstance",
        keepActiveWhenFlag: "campfireSpatOut",
        reset: {
          swayStrength: 0
        }
      }
    ],
    cancelNotice: "Thermal Cabin placement canceled."
  },

  {
    id: "solarStation",
    label: "Solar Station",
    previewKey: "strawBedPlacementPreview",
    modelInstanceKeys: [
      {
        key: "strawBedModelInstance",
        keepActiveWhenFlag: "strawBedPlacedInBulbasaurHabitat"
      }
    ],
    cancelNotice: "Solar Station placement canceled."
  },

  {
    id: "houseKit",
    label: "House Kit",
    previewKey: "leafDenKitPlacementPreview",
    modelInstanceKeys: [
      "leafDenPlacementPreviewModelInstance",
      {
        key: "leafDenModelInstance",
        keepActiveWhenFlag: "leafDenKitPlaced"
      }
    ],
    cancelNotice: "House Kit placement canceled."
  }
]);