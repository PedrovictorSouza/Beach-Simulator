import { SETTINGS_SCHEMA, createDefaultSettingsState } from "./settingsState.js";
import {
  assignKeyboardControl,
  createDefaultKeyboardControls,
  formatKeyboardCodeLabel,
  KEYBOARD_CONTROL_ACTIONS,
  normalizeKeyboardControls
} from "../../input/gameInputBindings.js";
import {
  createSettingsBagDto,
  createSettingsBotsDto,
  getSettingsMenuBotContract,
  isSettingsMenuLeafDenValidHome
} from "./settingsMenuDtos.js";

const SETTINGS_MENU_TITLE = "Bag";
const MENU_TABS = Object.freeze(["bag", "pokemons", "controls", "settings"]);
const MENU_TAB_LABELS = Object.freeze({
  bag: "Bag",
  pokemons: "Bots",
  controls: "Controls",
  settings: "Settings"
});
const SELECTED_POKEMON_OVERLAY_URL = new URL("../ui/images/selected.png", import.meta.url).href;
const RESTART_NAVIGATION_ITEM_ID = "__restartGame";
const SETTINGS_MENU_PANEL_ID = "settings-menu-panel";
const SETTINGS_MENU_STATUS_ID = "settings-menu-status";
const SETTINGS_CLOSE_BUTTON_IMAGE_URL = new URL("../ui/images/close-btn-micro.png", import.meta.url).href;
const GAMEPAD_ACTION_ALIASES = Object.freeze({
  a: "confirm",
  accept: "confirm",
  buttonSouth: "confirm",
  confirm: "confirm",
  primary: "confirm",
  b: "cancel",
  back: "cancel",
  buttonEast: "cancel",
  cancel: "cancel",
  close: "cancel",
  down: "down",
  dpadDown: "down",
  left: "left",
  dpadLeft: "left",
  lb: "prevTab",
  l1: "prevTab",
  leftShoulder: "prevTab",
  previousTab: "prevTab",
  prevTab: "prevTab",
  rb: "nextTab",
  r1: "nextTab",
  rightShoulder: "nextTab",
  nextTab: "nextTab",
  right: "right",
  dpadRight: "right",
  up: "up",
  dpadUp: "up"
});

function createElement(documentRef, tagName, className = "", text = "") {
  const element = documentRef.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
}

function formatSettingValue(value) {
  if (typeof value === "boolean") {
    return value ? "On" : "Off";
  }
  if (typeof value === "number") {
    return `${Math.round(value * 100)}%`;
  }
  return String(value ?? "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeGamepadAction(action) {
  const rawAction = typeof action === "string" ?
    action :
    (action?.action || action?.id || action?.type || "");
  return GAMEPAD_ACTION_ALIASES[String(rawAction)] || null;
}

function renderBagSlot(slot) {
  return `
    <div
      class="inventory-slot settings-menu__bag-slot"
      data-filled="true"
      data-empty="false"
      data-slot-role="${escapeHtml(slot.slotRole)}"
      data-icon-kind="${escapeHtml(slot.iconKind)}"
      style="aspect-ratio:auto; min-height:86px; padding:8px; align-content:center; gap:4px;"
      title="${escapeHtml(slot.title)}"
    >
      <span class="inventory-slot__role">${escapeHtml(slot.slotRoleLabel)}</span>
      <div
        class="inventory-slot__icon"
        style="--slot-color:${escapeHtml(slot.color)}; --slot-ink:${escapeHtml(slot.ink)}"
        aria-hidden="true"
      >
        ${slot.imageUrl ? `
          <img
            class="inventory-slot__image"
            src="${escapeHtml(slot.imageUrl)}"
            alt=""
            loading="eager"
            decoding="async"
          >
        ` : escapeHtml(slot.glyph)}
      </div>
      <span
        class="settings-menu__bag-name"
        style="font-size:10px; line-height:1.1; text-align:center; color:#ffffff;"
      >${escapeHtml(slot.label)}</span>
      <span class="inventory-count">${escapeHtml(slot.count)}</span>
    </div>
  `;
}

function renderPokemonPortrait(pokemon) {
  if (pokemon.imageUrl) {
    return `
      <img
        class="settings-menu__pokemon-image"
        src="${escapeHtml(pokemon.imageUrl)}"
        alt=""
        loading="eager"
        decoding="async"
        style="display:block;width:100%;height:100%;object-fit:cover;image-rendering:pixelated;"
      >
    `;
  }

  return `<span style="font-size:48px;line-height:1;color:${escapeHtml(pokemon.ink)};">${escapeHtml(pokemon.glyph || pokemon.name[0] || "?")}</span>`;
}

function renderPokemonSelectedOverlay(selected) {
  if (!selected) {
    return "";
  }

  return `
    <img
      class="settings-menu__pokemon-selected-overlay"
      src="${escapeHtml(SELECTED_POKEMON_OVERLAY_URL)}"
      alt=""
      loading="eager"
      decoding="async"
      style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;image-rendering:pixelated;pointer-events:none;"
    >
  `;
}

function renderPokemonCard(pokemon, { selected = false } = {}) {
  const borderColor = selected ? "#ffccaa" : pokemon.following ? "#ffffff" : "rgba(255,255,255,.54)";

  return `
    <article
      class="settings-menu__pokemon-card"
      data-pokemon-id="${escapeHtml(pokemon.id)}"
      data-following="${pokemon.following ? "true" : "false"}"
      data-selected="${selected ? "true" : "false"}"
      data-current-home-id="${escapeHtml(pokemon.currentHomeId || "")}"
      tabindex="0"
      style="min-height:172px;border:3px solid ${borderColor};box-shadow:${selected ? "0 0 0 3px rgba(255, 204, 170, .4)" : "none"};background:rgba(8,10,18,.78);display:grid;grid-template-rows:92px auto;overflow:hidden;cursor:pointer;"
    >
      <div
        class="settings-menu__pokemon-portrait"
        style="position:relative;display:grid;place-items:center;background:${escapeHtml(pokemon.color)};color:${escapeHtml(pokemon.ink)};border-bottom:3px solid rgba(255,255,255,.35);overflow:hidden;"
        aria-hidden="true"
      >
        ${renderPokemonPortrait(pokemon)}
        ${renderPokemonSelectedOverlay(selected)}
      </div>
      <div style="display:grid;gap:8px;padding:10px;align-content:start;">
        <strong style="font-size:18px;line-height:1;color:#ffffff;">${escapeHtml(pokemon.name)}</strong>
        ${pokemon.leafDenMoveInAvailable ? `
          <button
            class="settings-menu__pokemon-move-in"
            type="button"
            data-pokemon-move-in="${escapeHtml(pokemon.id)}"
            data-home-id="leafDen"
            aria-label="Assign ${escapeHtml(pokemon.name)} to the House"
            title="Assign to House"
            style="width:28px;height:18px;border:2px solid #9fdcff;background:#0d2c45;cursor:pointer;"
          ></button>
        ` : ""}
        ${pokemon.following ? `
          <button
            class="settings-menu__pokemon-dismiss"
            type="button"
            data-pokemon-dismiss="${escapeHtml(pokemon.id)}"
            aria-label="Ask ${escapeHtml(pokemon.name)} to stop following"
            title="Stop following"
            style="width:28px;height:18px;border:2px solid #ff7777;background:#321012;cursor:pointer;"
          ></button>
        ` : ""}
      </div>
    </article>
  `;
}

export function createSettingsMenuController({
  mount,
  schema = SETTINGS_SCHEMA,
  settingsState = createDefaultSettingsState(schema),
  inventory = null,
  inventoryOrder = [],
  itemDefs = {},
  storyState = null,
  onChange = () => {},
  onClose = () => {},
  onDismissPokemonFollower = null,
  onMovePokemonIn = null,
  onRestartGame = null
} = {}) {
  const documentRef = mount?.ownerDocument || globalThis.document;
  let open = false;
  let activeTabId = "bag";
  let activeGroupId = schema[0]?.id || null;
  let root = null;
  let bagGrid = null;
  let bagEmptyState = null;
  let bagPanel = null;
  let pokemonGrid = null;
  let pokemonEmptyState = null;
  let pokemonAbilityPanel = null;
  let pokemonPanel = null;
  let controlsPanel = null;
  let keyboardControlsGrid = null;
  let selectedPokemonId = null;
  let pendingKeyboardActionId = null;
  let settingsPanel = null;
  let restartButton = null;
  let restartConfirmDialog = null;
  let restartConfirmButton = null;
  let restartCancelButton = null;
  let statusElement = null;
  let restartConfirmOpen = false;
  const tabButtons = new Map();
  const groupPanels = new Map();
  const groupButtons = new Map();
  const activeSettingIds = new Map();

  function syncOpenState() {
    if (root) {
      root.hidden = !open;
      root.style.display = open ? "grid" : "none";
      root.dataset.open = open ? "true" : "false";
    }
  }

  function syncExpandedState() {
    for (const [groupId, panel] of groupPanels.entries()) {
      panel.hidden = groupId !== activeGroupId;
    }
    for (const [groupId, button] of groupButtons.entries()) {
      button.dataset.active = groupId === activeGroupId ? "true" : "false";
      button.setAttribute("aria-expanded", groupId === activeGroupId ? "true" : "false");
    }
  }

  function syncTabState() {
    if (bagPanel) {
      bagPanel.hidden = activeTabId !== "bag";
    }
    if (pokemonPanel) {
      pokemonPanel.hidden = activeTabId !== "pokemons";
    }
    if (controlsPanel) {
      controlsPanel.hidden = activeTabId !== "controls";
    }
    if (settingsPanel) {
      settingsPanel.hidden = activeTabId !== "settings";
    }
    for (const [tabId, button] of tabButtons.entries()) {
      const active = tabId === activeTabId;
      button.dataset.active = active ? "true" : "false";
      button.setAttribute("aria-selected", active ? "true" : "false");
      button.tabIndex = active ? 0 : -1;
      button.style.color = active ? "#ffd35f" : "#ffffff";
    }
    syncNavigationStatus();
  }

  function syncNavigationStatus() {
    if (!statusElement) {
      return;
    }

    statusElement.textContent = `${MENU_TAB_LABELS[activeTabId] || SETTINGS_MENU_TITLE} tab selected.`;
  }

  function syncRestartConfirmationState() {
    if (restartConfirmDialog) {
      restartConfirmDialog.hidden = !restartConfirmOpen;
      restartConfirmDialog.dataset.open = restartConfirmOpen ? "true" : "false";
    }
    if (restartButton) {
      restartButton.setAttribute("aria-expanded", restartConfirmOpen ? "true" : "false");
    }
  }

  function setRestartConfirmationOpen(nextOpen, { focus = false } = {}) {
    restartConfirmOpen = Boolean(nextOpen);
    syncRestartConfirmationState();

    if (!focus) {
      return restartConfirmOpen;
    }

    if (restartConfirmOpen) {
      focusElement(restartConfirmButton);
    } else {
      focusElement(restartButton);
    }

    return restartConfirmOpen;
  }

  function confirmRestartGame() {
    const shouldClose = onRestartGame?.();
    restartConfirmOpen = false;
    syncRestartConfirmationState();

    if (shouldClose !== false) {
      close();
      return true;
    }

    focusElement(restartButton);
    return true;
  }

  function syncBagGrid() {
    if (!bagGrid) {
      return;
    }

    if (inventory) {
      const bagDto = createSettingsBagDto({ inventory, inventoryOrder, itemDefs });
      bagGrid.innerHTML = bagDto.slots.map((slot) => renderBagSlot(slot)).join("");
    } else {
      const sourceGrid = documentRef.getElementById?.("inventory-grid");
      bagGrid.innerHTML = sourceGrid?.innerHTML?.trim() || "";
    }

    const hasFilledSlots = Boolean(bagGrid.querySelector('[data-filled="true"]'));
    if (bagEmptyState) {
      bagEmptyState.hidden = hasFilledSlots;
    }
  }

  function getCapturedPokemon() {
    return createSettingsBotsDto({
      storyState,
      selectedBotId: selectedPokemonId
    }).bots;
  }

  function syncPokemonAbilityPanel(capturedPokemon = getCapturedPokemon()) {
    if (!pokemonAbilityPanel) {
      return;
    }

    const selectedPokemon = capturedPokemon.find((pokemon) => pokemon.id === selectedPokemonId);
    if (!selectedPokemon) {
      pokemonAbilityPanel.hidden = true;
      pokemonAbilityPanel.innerHTML = "";
      return;
    }

    pokemonAbilityPanel.hidden = false;
    pokemonAbilityPanel.innerHTML = `
      <span style="font-size:12px;line-height:1;color:#ffffff;text-transform:none;">Function</span>
      <strong style="font-size:18px;line-height:1;color:#ffffff;">${escapeHtml(selectedPokemon.name)} · ${escapeHtml(selectedPokemon.ability)}</strong>
      <p style="margin:0;color:#ffffff;font-size:14px;line-height:1.25;text-transform:none;">${escapeHtml(selectedPokemon.abilityDescription || "")}</p>
    `;
  }

  function syncPokemonGrid() {
    if (!pokemonGrid) {
      return;
    }

    const capturedPokemon = getCapturedPokemon();
    if (capturedPokemon.length && !capturedPokemon.some((pokemon) => pokemon.id === selectedPokemonId)) {
      selectedPokemonId = capturedPokemon[0].id;
    }

    pokemonGrid.innerHTML = capturedPokemon
      .map((pokemon) => renderPokemonCard(pokemon, {
        selected: pokemon.id === selectedPokemonId
      }))
      .join("");

    if (pokemonEmptyState) {
      pokemonEmptyState.hidden = capturedPokemon.length > 0;
    }
    syncPokemonAbilityPanel(capturedPokemon);
  }

  function focusSelectedPokemon() {
    if (!selectedPokemonId || !pokemonGrid) {
      return false;
    }

    const selectedCard = pokemonGrid.querySelector(`[data-pokemon-id="${selectedPokemonId}"]`);
    focusElement(selectedCard);
    return Boolean(selectedCard);
  }

  function selectPokemon(pokemonId, { focus = false } = {}) {
    const capturedPokemon = getCapturedPokemon();
    if (!capturedPokemon.some((pokemon) => pokemon.id === pokemonId)) {
      return false;
    }

    selectedPokemonId = pokemonId;
    syncPokemonGrid();
    if (focus) {
      focusSelectedPokemon();
    }
    return true;
  }

  function moveSelectedPokemon(direction) {
    const capturedPokemon = getCapturedPokemon();
    if (!capturedPokemon.length) {
      return false;
    }

    const currentIndex = Math.max(0, capturedPokemon.findIndex((pokemon) => pokemon.id === selectedPokemonId));
    const nextIndex = (currentIndex + direction + capturedPokemon.length) % capturedPokemon.length;
    return selectPokemon(capturedPokemon[nextIndex].id, { focus: true });
  }

  function dismissPokemonFollower(pokemonId) {
    const pokemon = getSettingsMenuBotContract(pokemonId);
    const flags = storyState?.flags;
    if (!pokemon || !flags?.[pokemon.followingFlag]) {
      return false;
    }

    flags[pokemon.followingFlag] = false;
    onDismissPokemonFollower?.({
      pokemonId: pokemon.id,
      followingFlag: pokemon.followingFlag
    });
    onChange({
      id: "pokemonFollower",
      value: {
        pokemonId: pokemon.id,
        following: false
      }
    });
    syncPokemonGrid();
    return true;
  }

  function movePokemonIntoHome(pokemonId, homeId) {
    const pokemon = getSettingsMenuBotContract(pokemonId);
    if (!pokemon || homeId !== "leafDen" || !isSettingsMenuLeafDenValidHome(storyState)) {
      return false;
    }

    storyState.flags ||= {};
    storyState.flags.creatureHomeAssignments ||= {};
    storyState.flags.creatureHomeAssignments[pokemon.id] = homeId;
    onMovePokemonIn?.({
      pokemonId: pokemon.id,
      homeId
    });
    onChange({
      id: "pokemonHome",
      value: {
        pokemonId: pokemon.id,
        homeId
      }
    });
    syncPokemonGrid();
    return true;
  }

  function getKeyboardControlsState() {
    settingsState.controls ||= {};
    settingsState.controls.keyboard = normalizeKeyboardControls(settingsState.controls.keyboard);
    return settingsState.controls.keyboard;
  }

  function syncKeyboardControlsGrid() {
    if (!keyboardControlsGrid) {
      return;
    }

    const keyboardControls = getKeyboardControlsState();
    keyboardControlsGrid.innerHTML = KEYBOARD_CONTROL_ACTIONS.map((action) => {
      const waiting = pendingKeyboardActionId === action.id;
      const keyLabel = waiting ? "Press a key" : formatKeyboardCodeLabel(keyboardControls[action.id]);

      return `
        <button
          class="settings-menu__control-binding"
          type="button"
          data-settings-control-binding="${escapeHtml(action.id)}"
          data-capturing="${waiting ? "true" : "false"}"
          aria-label="Change ${escapeHtml(action.label)} control"
          style="display:grid;grid-template-columns:minmax(0,1fr) minmax(90px,auto);align-items:center;gap:10px;min-height:42px;padding:8px 10px;border:2px solid ${waiting ? "#ffccaa" : "rgba(255,255,255,.55)"};background:${waiting ? "rgba(255,204,170,.22)" : "rgba(255,255,255,.08)"};color:#ffffff;font:inherit;text-align:left;cursor:pointer;"
        >
          <span>${escapeHtml(action.label)}</span>
          <strong style="justify-self:end;color:#ffffff;">${escapeHtml(keyLabel)}</strong>
        </button>
      `;
    }).join("");
  }

  function commitKeyboardControl(actionId, keyboardCode) {
    settingsState.controls ||= {};
    settingsState.controls.keyboard = assignKeyboardControl(
      settingsState.controls.keyboard,
      actionId,
      keyboardCode
    );
    pendingKeyboardActionId = null;
    onChange(settingsState, {
      groupId: "controls",
      settingId: `keyboard.${actionId}`,
      value: settingsState.controls.keyboard[actionId]
    });
    syncKeyboardControlsGrid();
    return true;
  }

  function resetKeyboardControls() {
    settingsState.controls ||= {};
    settingsState.controls.keyboard = createDefaultKeyboardControls();
    pendingKeyboardActionId = null;
    onChange(settingsState, {
      groupId: "controls",
      settingId: "keyboard",
      value: { ...settingsState.controls.keyboard }
    });
    syncKeyboardControlsGrid();
    return true;
  }

  function startKeyboardControlCapture(actionId) {
    if (!KEYBOARD_CONTROL_ACTIONS.some((action) => action.id === actionId)) {
      return false;
    }

    pendingKeyboardActionId = actionId;
    syncKeyboardControlsGrid();
    const button = [...(keyboardControlsGrid?.querySelectorAll?.("[data-settings-control-binding]") || [])]
      .find((candidate) => candidate.dataset.settingsControlBinding === actionId);
    focusElement(button);
    return true;
  }

  function focusElement(element) {
    if (!element?.focus) {
      return;
    }

    try {
      element.focus({ preventScroll: true });
    } catch {
      element.focus();
    }
  }

  function focusGroupButton(groupId) {
    focusElement(groupButtons.get(groupId));
  }

  function focusTabButton(tabId) {
    focusElement(tabButtons.get(tabId));
  }

  function getSchemaGroup(groupId) {
    return schema.find((group) => group.id === groupId) || null;
  }

  function getSchemaSetting(groupId, settingId) {
    return getSchemaGroup(groupId)?.settings?.find((setting) => setting.id === settingId) || null;
  }

  function getGroupControls(groupId = activeGroupId) {
    const panel = groupPanels.get(groupId);
    if (!panel) {
      return [];
    }

    return [...panel.querySelectorAll("[data-settings-control]")];
  }

  function parseControlId(controlId = "") {
    const [groupId, settingId] = String(controlId).split(".");
    return { groupId, settingId };
  }

  function focusSettingControl(groupId = activeGroupId, settingId = null) {
    const controls = getGroupControls(groupId);
    if (!controls.length) {
      return false;
    }

    const targetSettingId = settingId || activeSettingIds.get(groupId);
    const control = controls.find((candidate) => {
      return parseControlId(candidate.dataset.settingsControl).settingId === targetSettingId;
    }) || controls[0];
    const parsed = parseControlId(control.dataset.settingsControl);
    activeSettingIds.set(parsed.groupId, parsed.settingId);
    focusElement(control);
    return true;
  }

  function getFocusedSettingControl() {
    const activeElement = documentRef.activeElement;
    if (!activeElement || !root?.contains(activeElement)) {
      return null;
    }

    if (activeElement.matches?.("[data-settings-control]")) {
      return activeElement;
    }

    return null;
  }

  function moveFocusedSetting(direction) {
    const focusedControl = getFocusedSettingControl();
    if (!focusedControl) {
      return false;
    }

    const { groupId } = parseControlId(focusedControl.dataset.settingsControl);
    const controls = getGroupControls(groupId);
    const currentIndex = Math.max(0, controls.indexOf(focusedControl));
    const nextControl = controls[(currentIndex + direction + controls.length) % controls.length];
    if (!nextControl) {
      return false;
    }

    const parsed = parseControlId(nextControl.dataset.settingsControl);
    activeSettingIds.set(parsed.groupId, parsed.settingId);
    focusElement(nextControl);
    return true;
  }

  function getRangeControlForAdjustment() {
    const focusedControl = getFocusedSettingControl();
    if (focusedControl?.type === "range") {
      return focusedControl;
    }

    focusSettingControl(activeGroupId);
    const activeControl = getFocusedSettingControl();
    return activeControl?.type === "range" ? activeControl : null;
  }

  function countStepDecimals(step) {
    const stepText = String(step);
    const dotIndex = stepText.indexOf(".");
    return dotIndex === -1 ? 0 : stepText.length - dotIndex - 1;
  }

  function adjustFocusedRange(direction) {
    const control = getRangeControlForAdjustment();
    if (!control) {
      return false;
    }

    const { groupId, settingId } = parseControlId(control.dataset.settingsControl);
    const setting = getSchemaSetting(groupId, settingId);
    if (!setting || setting.type !== "range") {
      return false;
    }

    const min = Number(setting.min ?? control.min ?? 0);
    const max = Number(setting.max ?? control.max ?? 1);
    const step = Math.max(0.001, Number(setting.step ?? control.step ?? 0.01));
    const currentSourceValue =
      control.value !== "" ?
        control.value :
        (settingsState[groupId]?.[settingId] ?? setting.defaultValue ?? 0);
    const currentValue = Number(currentSourceValue);
    const rawValue = Math.max(min, Math.min(max, currentValue + (step * direction)));
    const precision = countStepDecimals(step);
    const nextValue = Number(rawValue.toFixed(precision));
    const valueElement = control.closest?.(".settings-menu__setting")?.querySelector?.(".settings-menu__setting-value");

    control.value = String(nextValue);
    commitSettingValue(groupId, settingId, nextValue);
    if (valueElement) {
      valueElement.textContent = formatSettingValue(nextValue);
    }
    return true;
  }

  function getControlsNavigationItems() {
    if (!controlsPanel) {
      return [];
    }

    return [
      ...controlsPanel.querySelectorAll("[data-settings-control-binding], [data-settings-controls-reset]")
    ];
  }

  function focusControlsItem(index = 0) {
    const items = getControlsNavigationItems();
    if (!items.length) {
      return false;
    }

    focusElement(items[Math.max(0, Math.min(items.length - 1, index))]);
    return true;
  }

  function focusActiveTabContent() {
    if (activeTabId === "settings") {
      return focusGroupButton(activeGroupId);
    }

    if (activeTabId === "controls") {
      return focusControlsItem();
    }

    if (activeTabId === "pokemons") {
      return focusSelectedPokemon();
    }

    return focusTabButton(activeTabId);
  }

  function moveFocusedControlsItem(direction) {
    const items = getControlsNavigationItems();
    if (!items.length) {
      return false;
    }

    const currentIndex = Math.max(0, items.indexOf(documentRef.activeElement));
    const nextIndex = (currentIndex + direction + items.length) % items.length;
    focusElement(items[nextIndex]);
    return true;
  }

  function setActiveTab(tabId, { focus = false } = {}) {
    if (!MENU_TABS.includes(tabId)) {
      return false;
    }

    activeTabId = tabId;
    if (activeTabId !== "settings" && restartConfirmOpen) {
      setRestartConfirmationOpen(false);
    }
    if (activeTabId === "bag") {
      syncBagGrid();
    } else if (activeTabId === "pokemons") {
      syncPokemonGrid();
    } else if (activeTabId === "controls") {
      syncKeyboardControlsGrid();
    }
    syncTabState();

    if (focus) {
      if (activeTabId === "settings") {
        focusGroupButton(activeGroupId);
      } else if (activeTabId === "controls") {
        focusControlsItem();
      } else {
        focusTabButton(activeTabId);
      }
    }

    return true;
  }

  function moveActiveTab(direction) {
    const currentIndex = Math.max(0, MENU_TABS.indexOf(activeTabId));
    const nextIndex = (currentIndex + direction + MENU_TABS.length) % MENU_TABS.length;
    return setActiveTab(MENU_TABS[nextIndex], { focus: true });
  }

  function getFocusedTabId() {
    const activeElement = documentRef.activeElement;
    if (!activeElement || !root?.contains(activeElement)) {
      return null;
    }

    const tabId = activeElement.dataset?.settingsTab;
    return MENU_TABS.includes(tabId) ? tabId : null;
  }

  function setActiveGroup(groupId, { focus = false } = {}) {
    if (!groupPanels.has(groupId)) {
      return false;
    }
    activeGroupId = groupId;
    syncExpandedState();
    if (focus) {
      focusGroupButton(groupId);
    }
    return true;
  }

  function getNavigationItemIds() {
    const groupIds = schema
      .map((group) => group.id)
      .filter((groupId) => groupPanels.has(groupId));

    return restartButton ? [...groupIds, RESTART_NAVIGATION_ITEM_ID] : groupIds;
  }

  function getCurrentNavigationItemId() {
    if (restartButton && documentRef.activeElement === restartButton) {
      return RESTART_NAVIGATION_ITEM_ID;
    }

    return activeGroupId;
  }

  function focusNavigationItem(itemId) {
    if (itemId === RESTART_NAVIGATION_ITEM_ID) {
      focusElement(restartButton);
      return Boolean(restartButton);
    }

    return setActiveGroup(itemId, { focus: true });
  }

  function moveActiveItem(direction) {
    const itemIds = getNavigationItemIds();
    if (!itemIds.length) {
      return false;
    }

    const currentIndex = Math.max(0, itemIds.indexOf(getCurrentNavigationItemId()));
    const nextIndex = (currentIndex + direction + itemIds.length) % itemIds.length;
    return focusNavigationItem(itemIds[nextIndex]);
  }

  function activateFocusedElement() {
    const activeElement = documentRef.activeElement;
    if (!activeElement || !root?.contains(activeElement) || typeof activeElement.click !== "function") {
      return false;
    }

    const focusedGroupId = activeElement.dataset?.settingsGroupButton;
    if (focusedGroupId && focusedGroupId === activeGroupId && focusSettingControl(focusedGroupId)) {
      return true;
    }

    activeElement.click();
    return true;
  }

  function isHiddenFromMenuNavigation(element) {
    return Boolean(
      element.hidden ||
      element.closest?.("[hidden]") ||
      element.getAttribute?.("aria-hidden") === "true"
    );
  }

  function getFocusableMenuElements() {
    if (!root) {
      return [];
    }

    return [...root.querySelectorAll([
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[href]",
      "[tabindex]:not([tabindex='-1'])"
    ].join(", "))].filter((element) => !isHiddenFromMenuNavigation(element));
  }

  function moveFocusWithinMenu(direction) {
    const focusableElements = getFocusableMenuElements();
    if (!focusableElements.length) {
      return false;
    }

    const currentIndex = Math.max(0, focusableElements.indexOf(documentRef.activeElement));
    const nextIndex = (currentIndex + direction + focusableElements.length) % focusableElements.length;
    focusElement(focusableElements[nextIndex]);
    return true;
  }

  function commitSettingValue(groupId, settingId, value) {
    if (!settingsState[groupId]) {
      settingsState[groupId] = {};
    }
    settingsState[groupId][settingId] = value;
    onChange(settingsState, {
      groupId,
      settingId,
      value
    });
  }

  function renderSettingControl(group, setting, valueElement) {
    const currentValue = settingsState[group.id]?.[setting.id] ?? setting.defaultValue;
    const controlId = `${group.id}.${setting.id}`;

    if (setting.type === "toggle") {
      const button = createElement(
        documentRef,
        "button",
        "settings-menu__setting-control",
        formatSettingValue(currentValue)
      );
      button.type = "button";
      button.dataset.settingsControl = controlId;
      button.addEventListener("click", () => {
        const nextValue = !Boolean(settingsState[group.id]?.[setting.id]);
        commitSettingValue(group.id, setting.id, nextValue);
        button.textContent = formatSettingValue(nextValue);
        valueElement.textContent = formatSettingValue(nextValue);
      });
      return button;
    }

    if (setting.type === "select") {
      const select = documentRef.createElement("select");
      select.className = "settings-menu__setting-control";
      select.dataset.settingsControl = controlId;
      for (const optionValue of setting.options || []) {
        const option = documentRef.createElement("option");
        option.value = optionValue;
        option.textContent = optionValue;
        select.append(option);
      }
      select.value = currentValue;
      select.addEventListener("change", () => {
        commitSettingValue(group.id, setting.id, select.value);
        valueElement.textContent = formatSettingValue(select.value);
      });
      return select;
    }

    const input = documentRef.createElement("input");
    input.className = "settings-menu__setting-control";
    input.type = "range";
    input.min = String(setting.min ?? 0);
    input.max = String(setting.max ?? 1);
    input.step = String(setting.step ?? 0.01);
    input.value = String(currentValue);
    input.dataset.settingsControl = controlId;
    input.addEventListener("input", () => {
      const nextValue = Number(input.value);
      commitSettingValue(group.id, setting.id, nextValue);
      valueElement.textContent = formatSettingValue(nextValue);
    });
    return input;
  }

  function renderSetting(group, setting) {
    const row = createElement(documentRef, "div", "settings-menu__setting");
    row.dataset.settingsSetting = setting.id;

    const label = createElement(documentRef, "span", "settings-menu__setting-label", setting.label);
    const value = createElement(
      documentRef,
      "span",
      "settings-menu__setting-value",
      formatSettingValue(settingsState[group.id]?.[setting.id] ?? setting.defaultValue)
    );
    const control = renderSettingControl(group, setting, value);

    row.append(label, value, control);
    return row;
  }

  function ensureRoot() {
    if (root || !mount || !documentRef?.createElement) {
      return root;
    }

    root = createElement(documentRef, "section", "settings-menu");
    root.dataset.settingsMenu = "true";
    root.id = SETTINGS_MENU_PANEL_ID;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", SETTINGS_MENU_TITLE);
    root.hidden = true;

    Object.assign(root.style, {
      position: "absolute",
      inset: "0",
      zIndex: "2147483647",
      display: "none",
      alignItems: "stretch",
      justifyItems: "start",
      width: "100%",
      height: "100%",
      minHeight: "100%",
      padding: "0",
      boxSizing: "border-box",
      overflow: "hidden",
      pointerEvents: "auto"
    });

    const panel = createElement(documentRef, "article", "settings-menu__panel");
    Object.assign(panel.style, {
      width: "min(760px, 100%)",
      height: "100%",
      maxHeight: "100%",
      overflow: "auto",
      padding: "24px",
      border: "3px solid rgba(255, 241, 232, 0.86)",
      borderRadius: "0 8px 8px 0",
      background: "rgba(13, 16, 28, 0.94)",
      boxSizing: "border-box",
      color: "#ffffff",
      fontFamily: "var(--game-ui-font, monospace)",
      textShadow: "2px 2px 0 #11111b"
    });

    const header = createElement(documentRef, "header", "settings-menu__header");
    const closeButton = createElement(documentRef, "button", "settings-menu__close", "Close");
    closeButton.type = "button";
    closeButton.dataset.settingsAction = "close";
    closeButton.setAttribute("aria-label", "Close");
    Object.assign(closeButton.style, {
      width: "80px",
      height: "80px",
      padding: "0",
      border: "0",
      backgroundColor: "transparent",
      backgroundImage: `url("${SETTINGS_CLOSE_BUTTON_IMAGE_URL}")`,
      backgroundSize: "100% 100%",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      color: "transparent",
      fontSize: "0",
      lineHeight: "0",
      textShadow: "none",
      textIndent: "-9999px",
      overflow: "hidden",
      imageRendering: "pixelated"
    });
    closeButton.addEventListener("click", () => {
      close();
    });
    header.append(closeButton);
    panel.append(header);

    const tabs = createElement(documentRef, "nav", "settings-menu__tabs");
    tabs.setAttribute("aria-label", "Menu tabs");
    tabs.setAttribute("role", "tablist");
    Object.assign(tabs.style, {
      display: "grid",
      gridTemplateColumns: `repeat(${MENU_TABS.length}, minmax(0, 1fr))`,
      gap: "10px",
      margin: "18px 0"
    });
    for (const tabId of MENU_TABS) {
      const tabButton = createElement(documentRef, "button", "settings-menu__tab", MENU_TAB_LABELS[tabId]);
      tabButton.type = "button";
      tabButton.dataset.settingsTab = tabId;
      tabButton.id = `settings-menu-tab-${tabId}`;
      tabButton.setAttribute("role", "tab");
      tabButton.setAttribute("aria-controls", `settings-menu-panel-${tabId}`);
      Object.assign(tabButton.style, {
        padding: "10px 12px",
        border: "0",
        background: "transparent",
        backgroundImage: "none",
        boxShadow: "none",
        color: "#ffffff",
        font: "inherit",
        transform: "none",
        animation: "none",
        transition: "none",
        cursor: "pointer"
      });
      tabButton.addEventListener("click", () => {
        setActiveTab(tabId, { focus: true });
      });
      tabButtons.set(tabId, tabButton);
      tabs.append(tabButton);
    }
    panel.append(tabs);

    bagPanel = createElement(documentRef, "section", "settings-menu__tab-panel settings-menu__tab-panel--bag");
    bagPanel.id = "settings-menu-panel-bag";
    bagPanel.dataset.settingsTabPanel = "bag";
    bagPanel.setAttribute("role", "tabpanel");
    bagPanel.setAttribute("aria-labelledby", "settings-menu-tab-bag");
    bagEmptyState = createElement(documentRef, "p", "settings-menu__bag-empty", "Bag empty");
    bagGrid = createElement(documentRef, "div", "inventory-grid settings-menu__bag-grid");
    bagGrid.dataset.settingsBagGrid = "true";
    Object.assign(bagGrid.style, {
      gridTemplateColumns: "repeat(4, minmax(58px, 1fr))",
      maxWidth: "420px"
    });
    bagPanel.append(bagEmptyState, bagGrid);
    panel.append(bagPanel);

    pokemonPanel = createElement(documentRef, "section", "settings-menu__tab-panel settings-menu__tab-panel--pokemons");
    pokemonPanel.id = "settings-menu-panel-pokemons";
    pokemonPanel.dataset.settingsTabPanel = "pokemons";
    pokemonPanel.setAttribute("role", "tabpanel");
    pokemonPanel.setAttribute("aria-labelledby", "settings-menu-tab-pokemons");
    pokemonEmptyState = createElement(
      documentRef,
      "p",
      "settings-menu__pokemon-empty",
      "No helper bots online yet"
    );
    pokemonGrid = createElement(documentRef, "div", "settings-menu__pokemon-grid");
    pokemonGrid.dataset.settingsPokemonGrid = "true";
    Object.assign(pokemonGrid.style, {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))",
      gap: "12px",
      maxWidth: "640px"
    });
    pokemonGrid.addEventListener("click", (event) => {
      const moveInButton = event.target?.closest?.("[data-pokemon-move-in]");
      if (moveInButton) {
        event.preventDefault();
        movePokemonIntoHome(moveInButton.dataset.pokemonMoveIn, moveInButton.dataset.homeId);
        return;
      }

      const dismissButton = event.target?.closest?.("[data-pokemon-dismiss]");
      if (!dismissButton) {
        const card = event.target?.closest?.("[data-pokemon-id]");
        if (card && pokemonGrid.contains(card)) {
          selectPokemon(card.dataset.pokemonId);
        }
        return;
      }

      event.preventDefault();
      dismissPokemonFollower(dismissButton.dataset.pokemonDismiss);
    });
    pokemonAbilityPanel = createElement(documentRef, "aside", "settings-menu__pokemon-ability");
    pokemonAbilityPanel.dataset.settingsPokemonAbility = "true";
    Object.assign(pokemonAbilityPanel.style, {
      display: "grid",
      gap: "6px",
      marginTop: "14px",
      padding: "12px",
      border: "3px solid rgba(255, 204, 170, .72)",
      background: "rgba(36, 24, 34, .88)",
      color: "#ffffff"
    });
    pokemonPanel.append(pokemonEmptyState, pokemonGrid, pokemonAbilityPanel);
    panel.append(pokemonPanel);

    controlsPanel = createElement(documentRef, "section", "settings-menu__tab-panel settings-menu__tab-panel--controls");
    controlsPanel.id = "settings-menu-panel-controls";
    controlsPanel.dataset.settingsTabPanel = "controls";
    controlsPanel.setAttribute("role", "tabpanel");
    controlsPanel.setAttribute("aria-labelledby", "settings-menu-tab-controls");
    const controlsIntro = createElement(
      documentRef,
      "p",
      "settings-menu__controls-intro",
      "Rewire the pilot console: select an action, press a key, and the old action using that key becomes unassigned."
    );
    Object.assign(controlsIntro.style, {
      margin: "0 0 12px",
      color: "#ffffff",
      fontSize: "13px",
      lineHeight: "1.25"
    });
    keyboardControlsGrid = createElement(documentRef, "div", "settings-menu__controls-grid");
    keyboardControlsGrid.dataset.settingsControlsGrid = "true";
    Object.assign(keyboardControlsGrid.style, {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
      gap: "8px"
    });
    keyboardControlsGrid.addEventListener("click", (event) => {
      const button = event.target?.closest?.("[data-settings-control-binding]");
      if (!button || !keyboardControlsGrid.contains(button)) {
        return;
      }

      startKeyboardControlCapture(button.dataset.settingsControlBinding);
    });
    const controlsActions = createElement(documentRef, "footer", "settings-menu__controls-actions");
    Object.assign(controlsActions.style, {
      marginTop: "14px"
    });
    const resetControlsButton = createElement(
      documentRef,
      "button",
      "settings-menu__controls-reset",
      "Reset Controls"
    );
    resetControlsButton.type = "button";
    resetControlsButton.dataset.settingsControlsReset = "true";
    resetControlsButton.addEventListener("click", () => {
      resetKeyboardControls();
      focusElement(resetControlsButton);
    });
    controlsActions.append(resetControlsButton);
    controlsPanel.append(controlsIntro, keyboardControlsGrid, controlsActions);
    panel.append(controlsPanel);

    settingsPanel = createElement(documentRef, "section", "settings-menu__tab-panel settings-menu__tab-panel--settings");
    settingsPanel.id = "settings-menu-panel-settings";
    settingsPanel.dataset.settingsTabPanel = "settings";
    settingsPanel.setAttribute("role", "tabpanel");
    settingsPanel.setAttribute("aria-labelledby", "settings-menu-tab-settings");
    panel.append(settingsPanel);

    for (const group of schema) {
      const groupSection = createElement(documentRef, "section", "settings-menu__group");
      const groupButton = createElement(documentRef, "button", "settings-menu__group-button", group.label);
      groupButton.type = "button";
      groupButton.dataset.settingsGroupButton = group.id;
      groupButton.setAttribute("aria-controls", `settings-menu-group-${group.id}`);
      groupButton.addEventListener("click", () => {
        setActiveGroup(group.id, { focus: true });
      });

      const groupPanel = createElement(documentRef, "div", "settings-menu__group-panel");
      groupPanel.id = `settings-menu-group-${group.id}`;
      groupPanel.dataset.settingsGroupPanel = group.id;
      for (const setting of group.settings) {
        groupPanel.append(renderSetting(group, setting));
      }

      groupButtons.set(group.id, groupButton);
      groupPanels.set(group.id, groupPanel);
      groupSection.append(groupButton, groupPanel);
      settingsPanel.append(groupSection);
    }

    if (typeof onRestartGame === "function") {
      const actions = createElement(documentRef, "footer", "settings-menu__actions");
      restartButton = createElement(
        documentRef,
        "button",
        "settings-menu__restart",
        "Restart Game"
      );
      restartButton.type = "button";
      restartButton.dataset.settingsAction = "restart-game";
      restartButton.setAttribute("aria-haspopup", "dialog");
      restartButton.setAttribute("aria-expanded", "false");
      restartButton.addEventListener("click", () => {
        setRestartConfirmationOpen(true, { focus: true });
      });

      restartConfirmDialog = createElement(documentRef, "section", "settings-menu__restart-confirm");
      restartConfirmDialog.dataset.settingsRestartConfirm = "true";
      restartConfirmDialog.setAttribute("role", "dialog");
      restartConfirmDialog.setAttribute("aria-label", "Confirm restart game");
      restartConfirmDialog.hidden = true;
      Object.assign(restartConfirmDialog.style, {
        display: "grid",
        gap: "10px",
        marginTop: "12px",
        padding: "12px",
        border: "3px solid #ffccaa",
        background: "rgba(40, 16, 18, 0.92)",
        color: "#ffffff"
      });
      const restartConfirmTitle = createElement(
        documentRef,
        "strong",
        "settings-menu__restart-confirm-title",
        "Restart game?"
      );
      const restartConfirmCopy = createElement(
        documentRef,
        "p",
        "settings-menu__restart-confirm-copy",
        "This clears saved progress and reloads the game."
      );
      Object.assign(restartConfirmCopy.style, {
        margin: "0",
        fontSize: "13px",
        lineHeight: "1.25",
        color: "#ffffff"
      });
      const restartConfirmActions = createElement(documentRef, "div", "settings-menu__restart-confirm-actions");
      Object.assign(restartConfirmActions.style, {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap"
      });
      restartConfirmButton = createElement(
        documentRef,
        "button",
        "settings-menu__restart-confirm-button",
        "Restart"
      );
      restartConfirmButton.type = "button";
      restartConfirmButton.dataset.settingsRestartConfirmAction = "confirm";
      restartConfirmButton.addEventListener("click", () => {
        confirmRestartGame();
      });
      restartCancelButton = createElement(
        documentRef,
        "button",
        "settings-menu__restart-cancel-button",
        "Cancel"
      );
      restartCancelButton.type = "button";
      restartCancelButton.dataset.settingsRestartConfirmAction = "cancel";
      restartCancelButton.addEventListener("click", () => {
        setRestartConfirmationOpen(false, { focus: true });
      });
      restartConfirmActions.append(restartConfirmButton, restartCancelButton);
      restartConfirmDialog.append(restartConfirmTitle, restartConfirmCopy, restartConfirmActions);
      actions.append(restartButton);
      actions.append(restartConfirmDialog);
      settingsPanel.append(actions);
    }

    statusElement = createElement(documentRef, "span", "settings-menu__sr-only");
    statusElement.id = SETTINGS_MENU_STATUS_ID;
    statusElement.setAttribute("aria-live", "polite");
    panel.append(statusElement);

    root.append(panel);
    mount.append(root);
    syncBagGrid();
    syncPokemonGrid();
    syncKeyboardControlsGrid();
    syncTabState();
    syncExpandedState();
    syncOpenState();
    return root;
  }

  function show() {
    ensureRoot();
    setRestartConfirmationOpen(false);
    setActiveTab("bag");
    syncBagGrid();
    syncPokemonGrid();
    open = true;
    syncOpenState();
    focusTabButton(activeTabId);
  }

  function close() {
    if (!open) {
      return false;
    }

    open = false;
    setRestartConfirmationOpen(false);
    syncOpenState();
    onClose();
    return true;
  }

  function handleCancelAction() {
    if (pendingKeyboardActionId) {
      pendingKeyboardActionId = null;
      syncKeyboardControlsGrid();
      return true;
    }

    if (restartConfirmOpen) {
      setRestartConfirmationOpen(false, { focus: true });
      return true;
    }

    return close();
  }

  function moveRestartConfirmFocus() {
    const focusedConfirm = documentRef.activeElement === restartConfirmButton;
    focusElement(focusedConfirm ? restartCancelButton : restartConfirmButton);
    return true;
  }

  function handleDirectionalAction(actionId) {
    const focusedTabId = getFocusedTabId();
    if (focusedTabId) {
      if (actionId === "left") {
        return moveActiveTab(-1);
      }

      if (actionId === "right") {
        return moveActiveTab(1);
      }

      if (actionId === "down") {
        return focusActiveTabContent();
      }

      return true;
    }

    if (activeTabId === "pokemons") {
      if (actionId === "left" || actionId === "up") {
        moveSelectedPokemon(-1);
      } else if (actionId === "right" || actionId === "down") {
        moveSelectedPokemon(1);
      }
      return true;
    }

    if (activeTabId === "controls") {
      if (actionId === "left" || actionId === "up") {
        moveFocusedControlsItem(-1);
      } else if (actionId === "right" || actionId === "down") {
        moveFocusedControlsItem(1);
      }
      return true;
    }

    if (activeTabId !== "settings") {
      return true;
    }

    if (actionId === "left" || actionId === "right") {
      return adjustFocusedRange(actionId === "left" ? -1 : 1);
    }

    if (actionId === "up" || actionId === "down") {
      const direction = actionId === "up" ? -1 : 1;
      if (!moveFocusedSetting(direction)) {
        moveActiveItem(direction);
      }
      return true;
    }

    return false;
  }

  function handleGamepadAction(action) {
    if (!open) {
      return false;
    }

    const actionId = normalizeGamepadAction(action);
    if (!actionId) {
      return false;
    }

    if (actionId === "cancel") {
      return handleCancelAction();
    }

    if (pendingKeyboardActionId) {
      return true;
    }

    if (restartConfirmOpen) {
      if (actionId === "confirm") {
        return activateFocusedElement();
      }

      if (actionId === "left" || actionId === "right" || actionId === "up" || actionId === "down") {
        return moveRestartConfirmFocus();
      }

      return true;
    }

    if (actionId === "prevTab") {
      return moveActiveTab(-1);
    }

    if (actionId === "nextTab") {
      return moveActiveTab(1);
    }

    if (actionId === "confirm") {
      return activateFocusedElement();
    }

    return handleDirectionalAction(actionId);
  }

  function handleKeydown(event) {
    if (!open) {
      return false;
    }

    if (pendingKeyboardActionId) {
      if (event.code === "Escape") {
        pendingKeyboardActionId = null;
        syncKeyboardControlsGrid();
        event.preventDefault?.();
        return true;
      }

      commitKeyboardControl(pendingKeyboardActionId, event.code);
      event.preventDefault?.();
      return true;
    }

    if (event.code === "Tab") {
      moveFocusWithinMenu(event.shiftKey ? -1 : 1);
      event.preventDefault?.();
      return true;
    }

    if (restartConfirmOpen) {
      if (event.code === "KeyB" || event.code === "Escape") {
        setRestartConfirmationOpen(false, { focus: true });
        event.preventDefault?.();
        return true;
      }

      if (event.code === "ArrowLeft" || event.code === "ArrowRight" || event.code === "ArrowUp" || event.code === "ArrowDown") {
        const focusedConfirm = documentRef.activeElement === restartConfirmButton;
        focusElement(focusedConfirm ? restartCancelButton : restartConfirmButton);
        event.preventDefault?.();
        return true;
      }

      if (event.code === "Enter" || event.code === "Space") {
        activateFocusedElement();
        event.preventDefault?.();
        return true;
      }

      event.preventDefault?.();
      return true;
    }

    if (event.code === "KeyX" || event.code === "KeyB" || event.code === "Escape") {
      close();
      event.preventDefault?.();
      return true;
    }

    if (event.code === "PageUp" || event.code === "BracketLeft") {
      moveActiveTab(-1);
      event.preventDefault?.();
      return true;
    }

    if (event.code === "PageDown" || event.code === "BracketRight") {
      moveActiveTab(1);
      event.preventDefault?.();
      return true;
    }

    const focusedTabId = getFocusedTabId();
    if (focusedTabId) {
      if (event.code === "ArrowLeft") {
        moveActiveTab(-1);
        event.preventDefault?.();
        return true;
      }

      if (event.code === "ArrowRight") {
        moveActiveTab(1);
        event.preventDefault?.();
        return true;
      }

      if (event.code === "Home") {
        setActiveTab(MENU_TABS[0], { focus: true });
        event.preventDefault?.();
        return true;
      }

      if (event.code === "End") {
        setActiveTab(MENU_TABS[MENU_TABS.length - 1], { focus: true });
        event.preventDefault?.();
        return true;
      }

      if (event.code === "ArrowDown") {
        focusActiveTabContent();
        event.preventDefault?.();
        return true;
      }
    }

    if (activeTabId === "pokemons") {
      if (event.code === "ArrowLeft" || event.code === "ArrowUp") {
        moveSelectedPokemon(-1);
      } else if (event.code === "ArrowRight" || event.code === "ArrowDown") {
        moveSelectedPokemon(1);
      } else if (event.code === "Enter" || event.code === "Space") {
        activateFocusedElement();
      }
      event.preventDefault?.();
      return true;
    }

    if (activeTabId === "controls") {
      if (event.code === "ArrowUp" || event.code === "ArrowLeft") {
        moveFocusedControlsItem(-1);
      } else if (event.code === "ArrowDown" || event.code === "ArrowRight") {
        moveFocusedControlsItem(1);
      } else if (event.code === "Enter" || event.code === "Space") {
        activateFocusedElement();
      }
      event.preventDefault?.();
      return true;
    }

    if (activeTabId !== "settings") {
      event.preventDefault?.();
      return true;
    }

    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      adjustFocusedRange(event.code === "ArrowLeft" ? -1 : 1);
      event.preventDefault?.();
      return true;
    }

    if (event.code === "ArrowUp" || event.code === "ArrowDown") {
      const direction = event.code === "ArrowUp" ? -1 : 1;
      if (!moveFocusedSetting(direction)) {
        moveActiveItem(direction);
      }
      event.preventDefault?.();
      return true;
    }

    if (event.code === "Enter" || event.code === "Space") {
      activateFocusedElement();
      event.preventDefault?.();
      return true;
    }

    event.preventDefault?.();
    return true;
  }

  ensureRoot();

  return {
    open: show,
    close,
    isOpen: () => open,
    handleGamepadAction,
    handleKeydown,
    setActiveTab,
    setActiveGroup
  };
}
