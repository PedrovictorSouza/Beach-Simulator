import { BUILDING_TYPES } from "../buildings/buildingServicesModel.js";
import { getBeachObjectDefinition } from "../objects/beachObjectCatalog.js";

const BUILDING_CATALOG = Object.freeze(Object.values(BUILDING_TYPES).map((type) => {
  const definition = getBeachObjectDefinition(type);

  return Object.freeze({
    type,
    ...definition.presentation
  });
}));

function clampRandom(value) {
  return Math.min(0.999999, Math.max(0, Number(value) || 0));
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

export function createBuildingChoiceView({ root, translator }) {
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
  const optionsElement = documentRef.createElement("div");
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
  optionsElement.className = "building-choice__options";
  dialogElement.append(titleElement, optionsElement);
  overlayElement.append(dialogElement);
  overlayElement.addEventListener("keydown", (event) => event.stopPropagation());
  root.append(overlayElement);
  translator.subscribe(() => {
    titleElement.textContent = translator.t("dialogs.chooseBuilding");
  });

  const hide = () => {
    overlayElement.classList.remove("building-choice--visible");
    overlayElement.hidden = true;
  };

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

      const costLabel = translator.formatCurrency(
        Math.max(0, Number(costInCents) || 0) / 100
      );
      const buttons = options.map((option) => {
        const buttonElement = documentRef.createElement("button");
        const swatchElement = documentRef.createElement("span");
        const labelElement = documentRef.createElement("strong");
        const costElement = documentRef.createElement("span");
        const descriptionElement = documentRef.createElement("span");
        const color = option.color.map((channel) => Math.round(channel * 255));

        buttonElement.className = "building-choice__option";
        buttonElement.type = "button";
        swatchElement.className = "building-choice__swatch";
        swatchElement.style.backgroundColor = `rgb(${color.join(", ")})`;
        swatchElement.setAttribute("aria-hidden", "true");
        labelElement.className = "building-choice__option-label";
        labelElement.textContent = translator.t(
          `buildings.${option.type}.label`
        );
        costElement.className = "building-choice__option-cost";
        costElement.textContent = costLabel;
        descriptionElement.className = "building-choice__option-description";
        if (option.benefitIndicator) {
          const benefitThumbElement = documentRef.createElement("img");
          const upElement = documentRef.createElement("span");

          benefitThumbElement.className = "building-choice__benefit-thumb";
          benefitThumbElement.src = option.benefitIndicator.src;
          benefitThumbElement.alt = "";
          benefitThumbElement.setAttribute("aria-hidden", "true");
          upElement.textContent = translator.t("common.up");
          descriptionElement.append(benefitThumbElement, upElement);
        } else {
          descriptionElement.textContent = translator.t(
            `buildings.${option.type}.description`
          );
        }
        buttonElement.append(
          swatchElement,
          labelElement,
          costElement,
          descriptionElement
        );
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
