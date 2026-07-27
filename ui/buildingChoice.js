import { BUILDING_TYPES } from "../buildings/buildingServicesModel.js";

const BUILDING_CATALOG = Object.freeze([
  Object.freeze({
    type: BUILDING_TYPES.BEVERAGE_STORE,
    label: "Beverage Store",
    role: "Beverages",
    description: "Makes $1 every 30 seconds a bather uses it.",
    benefitIndicator: Object.freeze({
      src: "2d-objects/HUD/money-thumb.png",
      alt: "Money"
    }),
    color: Object.freeze([0.92, 0.3, 0.22])
  }),
  Object.freeze({
    type: BUILDING_TYPES.BEACH_HOUSE,
    label: "Beach House",
    role: "Beach shelter",
    description: "Adds a new place for bathers to relax.",
    color: Object.freeze([0.9, 0.7, 0.48])
  }),
  Object.freeze({
    type: BUILDING_TYPES.LIFEGUARD_BUILDING,
    label: "Lifeguard Building",
    role: "Beach safety",
    description: "Improves reviews. Costs $4 at the end of each day.",
    color: Object.freeze([0.95, 0.76, 0.18])
  }),
  Object.freeze({
    type: BUILDING_TYPES.WIFI_SPOT,
    label: "Wi-Fi Spot",
    role: "Visitor connection",
    description: "Makes $1 every 30 seconds a bather uses it.",
    benefitIndicator: Object.freeze({
      src: "2d-objects/HUD/star-HUD.png",
      alt: "Star"
    }),
    color: Object.freeze([0.18, 0.56, 0.92])
  }),
  Object.freeze({
    type: BUILDING_TYPES.TOILET_BUILDING,
    label: "Toilet Building",
    role: "Beach facilities",
    description: "Prevents toilet complaints. Costs $3 at the end of each day.",
    color: Object.freeze([0.2, 0.78, 0.72])
  }),
  Object.freeze({
    type: BUILDING_TYPES.TRASH_CANS,
    label: "Trash Cans",
    role: "Waste control",
    description: "Don't make money, but they improve Guugle Maps Reviews.",
    color: Object.freeze([0.3, 0.68, 0.3])
  }),
  Object.freeze({
    type: BUILDING_TYPES.VOLLEYBALL_COURT,
    label: "Volleyball Court",
    role: "Fun",
    description: "Stops bathers from getting bored.",
    color: Object.freeze([0.96, 0.5, 0.18])
  })
]);

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
        !selectedTypeSet.has(type)
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

export function createBuildingChoiceView({ root }) {
  if (!root) {
    throw new Error("BuildingChoiceView precisa de um elemento root.");
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
  titleElement.textContent = "Choose a building";
  optionsElement.className = "building-choice__options";
  dialogElement.append(titleElement, optionsElement);
  overlayElement.append(dialogElement);
  overlayElement.addEventListener("keydown", (event) => event.stopPropagation());
  root.append(overlayElement);

  const hide = () => {
    overlayElement.classList.remove("building-choice--visible");
    overlayElement.hidden = true;
  };

  return Object.freeze({
    show(options, { costInCents = 0 } = {}) {
      if (!Array.isArray(options) || options.length !== 3) {
        throw new Error("BuildingChoiceView precisa receber tres opcoes.");
      }

      if (resolveChoice) {
        throw new Error("Ja existe uma escolha de construcao aberta.");
      }

      const costLabel = `$${Math.max(0, Number(costInCents) || 0) / 100}`;
      const buttons = options.map((option) => {
        const buttonElement = documentRef.createElement("button");
        const swatchElement = documentRef.createElement("span");
        const labelElement = documentRef.createElement("strong");
        const roleElement = documentRef.createElement("span");
        const costElement = documentRef.createElement("span");
        const descriptionElement = documentRef.createElement("span");
        const color = option.color.map((channel) => Math.round(channel * 255));

        buttonElement.className = "building-choice__option";
        buttonElement.type = "button";
        swatchElement.className = "building-choice__swatch";
        swatchElement.style.backgroundColor = `rgb(${color.join(", ")})`;
        swatchElement.setAttribute("aria-hidden", "true");
        labelElement.className = "building-choice__option-label";
        labelElement.textContent = option.label;
        roleElement.className = "building-choice__option-role";
        roleElement.textContent = option.role;
        costElement.className = "building-choice__option-cost";
        costElement.textContent = costLabel;
        descriptionElement.className = "building-choice__option-description";
        if (option.benefitIndicator) {
          const benefitThumbElement = documentRef.createElement("img");
          const upElement = documentRef.createElement("span");

          benefitThumbElement.className = "building-choice__benefit-thumb";
          benefitThumbElement.src = option.benefitIndicator.src;
          benefitThumbElement.alt = option.benefitIndicator.alt;
          upElement.textContent = "UP";
          descriptionElement.append(benefitThumbElement, upElement);
        } else {
          descriptionElement.textContent = option.description;
        }
        buttonElement.append(
          swatchElement,
          labelElement,
          roleElement,
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
