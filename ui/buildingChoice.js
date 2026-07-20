import { BUILDING_TYPES } from "../buildings/buildingServicesModel.js";

const BUILDING_CATALOG = Object.freeze([
  Object.freeze({
    type: BUILDING_TYPES.BEVERAGE_STORE,
    label: "Beverage Store",
    role: "Beverages",
    color: Object.freeze([0.92, 0.3, 0.22])
  }),
  Object.freeze({
    type: BUILDING_TYPES.LIFEGUARD_BUILDING,
    label: "Lifeguard Building",
    role: "Beach safety",
    color: Object.freeze([0.95, 0.76, 0.18])
  }),
  Object.freeze({
    type: BUILDING_TYPES.WIFI_SPOT,
    label: "Wi-Fi Spot",
    role: "Visitor connection",
    color: Object.freeze([0.18, 0.56, 0.92])
  }),
  Object.freeze({
    type: BUILDING_TYPES.TOILET_BUILDING,
    label: "Toilet Building",
    role: "Beach facilities",
    color: Object.freeze([0.2, 0.78, 0.72])
  }),
  Object.freeze({
    type: BUILDING_TYPES.TRASH_CANS,
    label: "Trash Cans",
    role: "Waste control",
    color: Object.freeze([0.3, 0.68, 0.3])
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
    startChoice() {
      const pool = [...BUILDING_CATALOG];

      for (let index = 0; index < 3; index += 1) {
        const remaining = pool.length - index;
        const selectedIndex = index + Math.floor(clampRandom(random()) * remaining);

        [pool[index], pool[selectedIndex]] = [pool[selectedIndex], pool[index]];
      }

      options = Object.freeze(pool.slice(0, 3));
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
  const messageElement = documentRef.createElement("p");
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
  messageElement.className = "building-choice__message";
  messageElement.textContent = "Select your first building for this run.";
  optionsElement.className = "building-choice__options";
  dialogElement.append(titleElement, messageElement, optionsElement);
  overlayElement.append(dialogElement);
  overlayElement.addEventListener("keydown", (event) => event.stopPropagation());
  root.append(overlayElement);

  const hide = () => {
    overlayElement.classList.remove("building-choice--visible");
    overlayElement.hidden = true;
  };

  return Object.freeze({
    show(options) {
      if (!Array.isArray(options) || options.length !== 3) {
        throw new Error("BuildingChoiceView precisa receber tres opcoes.");
      }

      if (resolveChoice) {
        throw new Error("Ja existe uma escolha de construcao aberta.");
      }

      const buttons = options.map((option) => {
        const buttonElement = documentRef.createElement("button");
        const swatchElement = documentRef.createElement("span");
        const labelElement = documentRef.createElement("strong");
        const roleElement = documentRef.createElement("span");
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
        buttonElement.append(swatchElement, labelElement, roleElement);
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
