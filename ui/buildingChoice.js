import { BUILDING_TYPES } from "../buildings/buildingServicesModel.js";
import { getBeachObjectDefinition } from "../objects/beachObjectCatalog.js";
import {
  createBuildingPreviewTurntable
} from "./buildingPreviewTurntable.js";

const MONEY_BENEFIT_IMAGE_URL = new URL(
  "../2d-objects/HUD/money-thumb.png",
  import.meta.url
).href;
const RATING_BENEFIT_IMAGE_URL = new URL(
  "../2d-objects/HUD/star-HUD.png",
  import.meta.url
).href;
const BUILDING_BENEFIT_KINDS = Object.freeze({
  MONEY: "money",
  RATING: "rating"
});

function createBenefitIndicator(definition) {
  const earnsMoney = Boolean(definition.service?.revenue);

  return Object.freeze({
    kind: earnsMoney ?
      BUILDING_BENEFIT_KINDS.MONEY :
      BUILDING_BENEFIT_KINDS.RATING,
    src: earnsMoney ?
      MONEY_BENEFIT_IMAGE_URL :
      RATING_BENEFIT_IMAGE_URL
  });
}

const BUILDING_CATALOG = Object.freeze(Object.values(BUILDING_TYPES).map((type) => {
  const definition = getBeachObjectDefinition(type);

  return Object.freeze({
    type,
    ...definition.presentation,
    benefitIndicator: createBenefitIndicator(definition)
  });
}));

function clampRandom(value) {
  return Math.min(0.999999, Math.max(0, Number(value) || 0));
}

export function formatBuildingChoiceCost(costInCents) {
  const amountInDollars = Math.max(
    0,
    Math.round((Number(costInCents) || 0) / 100)
  );

  return `$${amountInDollars}`;
}

export function createBuildingChoiceModel({ random = Math.random } = {}) {
  if (typeof random !== "function") {
    throw new Error("BuildingChoiceModel precisa de uma funcao random.");
  }

  let options = Object.freeze([]);
  let selected = null;

  const getSnapshot = () => Object.freeze({ options, selected });

  return Object.freeze({
    getSnapshot,
    startChoice({
      preferredTypes = [],
      preferredOptionCount = 3,
      excludedTypes = []
    } = {}) {
      const excludedTypeSet = new Set(
        (Array.isArray(excludedTypes) ? excludedTypes : [])
          .filter((type) => BUILDING_CATALOG.some((option) => option.type === type))
      );
      const preferredPool = [];
      const preferredCandidateTypeSet = new Set();

      for (const type of Array.isArray(preferredTypes) ? preferredTypes : []) {
        const option = BUILDING_CATALOG.find((candidate) => candidate.type === type);

        if (
          !option ||
          excludedTypeSet.has(type) ||
          preferredCandidateTypeSet.has(type)
        ) {
          continue;
        }

        preferredCandidateTypeSet.add(type);
        preferredPool.push(option);
      }

      const normalizedPreferredOptionCount = Math.min(
        3,
        Math.max(0, Math.trunc(Number(preferredOptionCount) || 0))
      );
      const selectedPreferredOptionCount = Math.min(
        normalizedPreferredOptionCount,
        preferredPool.length
      );

      for (let index = 0; index < selectedPreferredOptionCount; index += 1) {
        const remaining = preferredPool.length - index;
        const selectedIndex = index + Math.floor(clampRandom(random()) * remaining);

        [preferredPool[index], preferredPool[selectedIndex]] = [
          preferredPool[selectedIndex],
          preferredPool[index]
        ];
      }

      const preferredOptions = preferredPool.slice(0, selectedPreferredOptionCount);
      const preferredTypeSet = new Set(preferredOptions.map(({ type }) => type));
      const pool = BUILDING_CATALOG.filter(({ type }) => (
        !preferredTypeSet.has(type) && !excludedTypeSet.has(type)
      ));
      const randomOptionCount = 3 - preferredOptions.length;
      const availableRandomOptionCount = Math.min(randomOptionCount, pool.length);

      for (let index = 0; index < availableRandomOptionCount; index += 1) {
        const remaining = pool.length - index;
        const selectedIndex = index + Math.floor(clampRandom(random()) * remaining);

        [pool[index], pool[selectedIndex]] = [pool[selectedIndex], pool[index]];
      }

      const selectedOptions = [
        ...preferredOptions,
        ...pool.slice(0, availableRandomOptionCount)
      ];
      const selectedTypeSet = new Set(selectedOptions.map(({ type }) => type));
      const fallbackPool = BUILDING_CATALOG.filter(({ type }) => (
        !selectedTypeSet.has(type) && !excludedTypeSet.has(type)
      ));

      for (
        let index = 0;
        selectedOptions.length < 3 && index < fallbackPool.length;
        index += 1
      ) {
        const remaining = fallbackPool.length - index;
        const selectedIndex = index + Math.floor(clampRandom(random()) * remaining);

        [fallbackPool[index], fallbackPool[selectedIndex]] = [
          fallbackPool[selectedIndex],
          fallbackPool[index]
        ];
        selectedOptions.push(fallbackPool[index]);
      }

      options = Object.freeze(selectedOptions);
      selected = null;
      return getSnapshot();
    },
    select(type) {
      const nextSelection = options.find((option) => option.type === type);

      if (!nextSelection) {
        throw new Error("Construcao escolhida nao pertence a esta run.");
      }

      selected = nextSelection;
      return getSnapshot();
    }
  });
}

export function createBuildingChoiceView({
  root,
  translator,
  previewTurntable = null
}) {
  if (!root) {
    throw new Error("BuildingChoiceView precisa de um elemento root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("BuildingChoiceView precisa de um translator.");
  }

  const documentRef = root.ownerDocument;
  const overlayElement = documentRef.createElement("div");
  const dialogElement = documentRef.createElement("section");
  const titleElement = documentRef.createElement("h2");
  const closeButtonElement = documentRef.createElement("button");
  const optionsElement = documentRef.createElement("div");
  const buildingPreviewTurntable = previewTurntable ||
    createBuildingPreviewTurntable({
      documentRef,
      windowRef: documentRef.defaultView
    });
  let previewHandles = [];
  let resolveChoice = null;

  overlayElement.className = "building-choice";
  overlayElement.hidden = true;
  dialogElement.className = "building-choice__dialog";
  dialogElement.setAttribute("role", "dialog");
  dialogElement.setAttribute("aria-modal", "true");
  dialogElement.setAttribute("aria-labelledby", "building-choice-title");
  titleElement.id = "building-choice-title";
  titleElement.className = "building-choice__title";
  titleElement.textContent = translator.t("dialogs.chooseBuilding");
  closeButtonElement.className = "building-choice__close";
  closeButtonElement.type = "button";
  closeButtonElement.textContent = "X";
  closeButtonElement.setAttribute("aria-label", "Close");
  optionsElement.className = "building-choice__options";
  dialogElement.append(titleElement, closeButtonElement, optionsElement);
  overlayElement.append(dialogElement);
  overlayElement.addEventListener("keydown", (event) => event.stopPropagation());
  root.append(overlayElement);
  translator.subscribe(() => {
    titleElement.textContent = translator.t("dialogs.chooseBuilding");
  });

  const releasePreviews = () => {
    for (const handle of previewHandles) {
      handle.release();
    }
    previewHandles = [];
  };
  const hide = () => {
    releasePreviews();
    overlayElement.classList.remove("building-choice--visible");
    overlayElement.hidden = true;
  };
  closeButtonElement.addEventListener("click", () => {
    const resolve = resolveChoice;

    resolveChoice = null;
    hide();
    resolve?.(null);
  });

  return Object.freeze({
    show(options, { costInCents = 0 } = {}) {
      if (!Array.isArray(options) || options.length !== 3) {
        throw new Error(
          "BuildingChoiceView precisa receber exatamente tres opcoes."
        );
      }

      if (resolveChoice) {
        throw new Error("Ja existe uma escolha de construcao aberta.");
      }

      const costLabel = formatBuildingChoiceCost(costInCents);
      releasePreviews();
      const buttons = options.map((option) => {
        const buttonElement = documentRef.createElement("button");
        const previewElement = documentRef.createElement("span");
        const previewCanvasElement = documentRef.createElement("canvas");
        const labelElement = documentRef.createElement("strong");
        const costElement = documentRef.createElement("span");
        const descriptionElement = documentRef.createElement("span");
        const benefitIndicator = option.benefitIndicator ||
          createBenefitIndicator(getBeachObjectDefinition(option.type));

        buttonElement.className = "building-choice__option";
        buttonElement.type = "button";
        previewElement.className = "building-choice__preview";
        previewElement.setAttribute("aria-hidden", "true");
        previewCanvasElement.className = "building-choice__preview-canvas";
        previewCanvasElement.setAttribute("aria-hidden", "true");
        previewElement.append(previewCanvasElement);
        labelElement.className = "building-choice__option-label";
        labelElement.textContent = translator.t(
          `buildings.${option.type}.label`
        );
        costElement.className = "building-choice__option-cost";
        costElement.textContent = costLabel;
        descriptionElement.className = "building-choice__option-description";
        descriptionElement.dataset.benefitKind =
          benefitIndicator.kind;
        const benefitThumbElement = documentRef.createElement("img");
        const upElement = documentRef.createElement("span");

        benefitThumbElement.className = "building-choice__benefit-thumb";
        benefitThumbElement.src = benefitIndicator.src;
        benefitThumbElement.alt = "";
        benefitThumbElement.setAttribute("aria-hidden", "true");
        upElement.className = "building-choice__benefit-label";
        upElement.textContent = translator.t("common.up");
        descriptionElement.append(benefitThumbElement, upElement);
        buttonElement.append(
          previewElement,
          labelElement,
          costElement,
          descriptionElement
        );
        try {
          previewHandles.push(buildingPreviewTurntable.attach({
            canvas: previewCanvasElement,
            interactionElement: buttonElement,
            type: option.type
          }));
        } catch (error) {
          previewCanvasElement.dataset.previewState = "error";
          console.warn(
            `Nao foi possivel preparar a miniatura de ${option.type}.`,
            error
          );
        }
        buttonElement.addEventListener("click", () => {
          const resolve = resolveChoice;

          resolveChoice = null;
          hide();
          resolve?.(option.type);
        });

        return buttonElement;
      });

      optionsElement.dataset.optionCount = String(buttons.length);
      optionsElement.replaceChildren(...buttons);
      overlayElement.hidden = false;
      void overlayElement.offsetWidth;
      overlayElement.classList.add("building-choice--visible");
      buttons[0].focus();

      return new Promise((resolve) => {
        resolveChoice = resolve;
      });
    }
  });
}
