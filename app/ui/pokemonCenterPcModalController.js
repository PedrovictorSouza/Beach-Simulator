import {
  MODAL_COMMANDS,
  getWrappedModalIndex,
  resolveModalCommand,
  resolveModalPointerCommand
} from "./modalCommandController.js";

const EMPTY_MISSION = Object.freeze({
  id: "empty",
  title: "????",
  description: "No colony check records found.",
  status: "locked",
  source: "terminal"
});

const TERMINAL_PIXEL_COLORS = Object.freeze({
  outline: "#381e1f",
  frame: "#c88566",
  panel: "#15101a",
  well: "#2b202c",
  copy: "#fff1cf",
  muted: "#d6b68a",
  completed: "#9bbc0f",
  todo: "#ffe200",
  locked: "#6f5a5a",
  danger: "#ff5a4f"
});
const TERMINAL_PIXEL_FONT = "var(--game-ui-font, monospace)";
const TERMINAL_TITLE_FONT = "'BitPap', var(--game-ui-font, monospace)";
const TERMINAL_PIXEL_TEXT_SHADOW = "2px 0 0 #050307, 0 2px 0 #050307, -2px 0 0 #050307, 0 -2px 0 #050307";
const TERMINAL_OBJECTIVE_COMPLETE_FLASH_MS = 1500;

const STATUS_PALETTES = Object.freeze({
  completed: {
    border: TERMINAL_PIXEL_COLORS.completed,
    background: "#243f22",
    label: TERMINAL_PIXEL_COLORS.copy,
    copy: TERMINAL_PIXEL_COLORS.copy
  },
  todo: {
    border: TERMINAL_PIXEL_COLORS.todo,
    background: "#4a3322",
    label: TERMINAL_PIXEL_COLORS.copy,
    copy: TERMINAL_PIXEL_COLORS.copy
  },
  locked: {
    border: TERMINAL_PIXEL_COLORS.locked,
    background: "#2a1a22",
    label: TERMINAL_PIXEL_COLORS.muted,
    copy: TERMINAL_PIXEL_COLORS.muted
  }
});
const TERMINAL_MISSION_STATUS_TYPES = Object.freeze({
  active: Object.freeze({
    confirmHint: "Read only",
    guidance: "Follow this check in the world.",
    label: "Active",
    palette: STATUS_PALETTES.todo,
    placeholderLabel: "!"
  }),
  available: Object.freeze({
    confirmHint: "Read only",
    guidance: "Follow this check in the world.",
    label: "Available",
    palette: STATUS_PALETTES.todo,
    placeholderLabel: "!"
  }),
  completed: Object.freeze({
    confirmHint: "Read only",
    guidance: "Completed and archived in the terminal.",
    label: "Complete",
    palette: STATUS_PALETTES.completed,
    placeholderLabel: "OK"
  }),
  locked: Object.freeze({
    confirmHint: "Locked",
    guidance: "Recover more terminal data to reveal this check.",
    label: "Locked",
    palette: STATUS_PALETTES.locked,
    placeholderLabel: "?"
  }),
  default: Object.freeze({
    confirmHint: "Read only",
    guidance: "Follow this check in the world.",
    label: "Available",
    palette: STATUS_PALETTES.todo,
    placeholderLabel: "!"
  })
});
const TERMINAL_STATUS_SUMMARY_ITEMS = Object.freeze([
  Object.freeze({ key: "completed", label: "Complete", color: STATUS_PALETTES.completed.border }),
  Object.freeze({ key: "ready", label: "Ready", color: STATUS_PALETTES.todo.border }),
  Object.freeze({ key: "todo", label: "To Do", color: TERMINAL_PIXEL_COLORS.copy }),
  Object.freeze({ key: "locked", label: "Locked", color: STATUS_PALETTES.locked.border })
]);
const TERMINAL_STATUS_LEGEND_ITEMS = Object.freeze([
  Object.freeze({ label: "Green complete", color: STATUS_PALETTES.completed.border }),
  Object.freeze({ label: "Yellow ready/to do", color: STATUS_PALETTES.todo.border }),
  Object.freeze({ label: "Dark locked", color: STATUS_PALETTES.locked.border })
]);
const TERMINAL_MODAL_COMMANDS = MODAL_COMMANDS;
const TERMINAL_MODAL_KEY_COMMANDS = Object.freeze({
  ArrowDown: TERMINAL_MODAL_COMMANDS.NEXT,
  ArrowRight: TERMINAL_MODAL_COMMANDS.NEXT,
  ArrowLeft: TERMINAL_MODAL_COMMANDS.PREVIOUS,
  ArrowUp: TERMINAL_MODAL_COMMANDS.PREVIOUS,
  Enter: TERMINAL_MODAL_COMMANDS.CONFIRM,
  KeyX: TERMINAL_MODAL_COMMANDS.CONFIRM,
  Escape: TERMINAL_MODAL_COMMANDS.CLOSE,
  KeyB: TERMINAL_MODAL_COMMANDS.CLOSE,
  Space: TERMINAL_MODAL_COMMANDS.CLOSE
});
const TERMINAL_MODAL_POINTER_COMMANDS = Object.freeze({
  next: TERMINAL_MODAL_COMMANDS.NEXT,
  previous: TERMINAL_MODAL_COMMANDS.PREVIOUS
});
const CENTER_COMPUTER_MUSIC_URL = new URL("../soundFx/center-computer.mp3", import.meta.url).href;
const CENTER_COMPUTER_MUSIC_VOLUME = 0.64;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeBuilderCallsign(value) {
  return String(value || "").trim().slice(0, 24);
}

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

function ensureTerminalModalStyle(documentRef) {
  if (!documentRef || documentRef.getElementById("pokemon-center-pc-modal-cf-style")) {
    return;
  }

  const style = documentRef.createElement("style");
  style.id = "pokemon-center-pc-modal-cf-style";
  style.textContent = `
.pokemon-center-pc-modal::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.24);
  pointer-events: none;
  z-index: 2;
}
.pokemon-center-pc-modal__panel::before {
  content: "";
  position: absolute;
  inset: 8px;
  border: 2px solid rgba(255, 241, 207, 0.14);
  pointer-events: none;
}
.pokemon-center-pc-modal__panel::after {
  display: none;
}
.pokemon-center-pc-modal__card::before {
  content: "";
  position: absolute;
  inset: 0;
  box-shadow:
    inset 4px 4px 0 rgba(255, 241, 207, 0.08),
    inset -4px -4px 0 rgba(5, 3, 7, 0.34);
  pointer-events: none;
  z-index: 2;
}
.pokemon-center-pc-modal__card:hover .pokemon-center-pc-modal__card-scan {
  opacity: 0;
}
.pokemon-center-pc-modal__card:hover .pokemon-center-pc-modal__card-image {
  opacity: 1;
  filter: none;
}
.pokemon-center-pc-modal__card[data-pc-just-completed="true"] {
  animation: pokemon-center-pc-objective-complete 1.5s steps(2, end) both;
}
.pokemon-center-pc-modal__card[data-pc-just-completed="true"] .pokemon-center-pc-modal__card-scan {
  animation: pokemon-center-pc-objective-complete-scan 1.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  background: rgba(155, 188, 15, 0.42);
}
@keyframes pokemon-center-pc-objective-complete {
  0%, 100% {
    transform: translateY(0);
  }
  12% {
    transform: translateY(-4px);
  }
  24% {
    transform: translateY(0);
  }
}
@keyframes pokemon-center-pc-objective-complete-scan {
  0% {
    opacity: 0;
    width: 0;
  }
  18% {
    opacity: 1;
    width: 100%;
  }
  100% {
    opacity: 0;
    width: 100%;
  }
}`;
  documentRef.head?.append(style);
}

function createSilentTerminalAudio() {
  return {
    currentTime: 0,
    loop: false,
    pause() {},
    play() {},
    preload: "",
    volume: 0
  };
}

export function resolveTerminalModalCommand(eventOrCode) {
  return resolveModalCommand(eventOrCode, TERMINAL_MODAL_KEY_COMMANDS);
}

export function resolveTerminalModalPointerCommand(actionId) {
  return resolveModalPointerCommand(actionId, TERMINAL_MODAL_POINTER_COMMANDS);
}

export function getTerminalStatusLegendItems() {
  return TERMINAL_STATUS_LEGEND_ITEMS;
}

export function getTerminalMissionStatusType(status) {
  return TERMINAL_MISSION_STATUS_TYPES[status] || TERMINAL_MISSION_STATUS_TYPES.default;
}

function normalizeMissions(missions = []) {
  const normalized = Array.isArray(missions) ? missions.filter(Boolean) : [];
  return normalized.length ? normalized : [EMPTY_MISSION];
}

function getMissionPalette(status) {
  return getTerminalMissionStatusType(status).palette;
}

function getMissionStatusLabel(mission) {
  if (mission?.status === "locked") {
    return getTerminalMissionStatusType("locked").label;
  }

  if (mission?.status === "completed") {
    return getTerminalMissionStatusType("completed").label;
  }

  if (mission?.actionId) {
    return mission.actionLabel ? "Reward Ready" : "Ready";
  }

  const statusType = getTerminalMissionStatusType(mission?.status);
  return statusType === TERMINAL_MISSION_STATUS_TYPES.default && mission?.status ?
    mission.status :
    statusType.label;
}

function getMissionGuidance(mission) {
  if (mission?.status === "locked") {
    return getTerminalMissionStatusType("locked").guidance;
  }

  if (mission?.actionId && mission?.actionLabel) {
    return `Press X / Enter to ${mission.actionLabel}.`;
  }

  if (mission?.status === "completed") {
    return getTerminalMissionStatusType("completed").guidance;
  }

  if (mission?.progress) {
    return `Progress: ${mission.progress}.`;
  }

  return getTerminalMissionStatusType(mission?.status).guidance;
}

function getMissionStats(missions = []) {
  return missions.reduce((stats, mission) => {
    if (mission?.status === "completed") {
      stats.completed += 1;
    } else if (mission?.status === "locked") {
      stats.locked += 1;
    } else if (mission?.actionId) {
      stats.ready += 1;
    } else {
      stats.todo += 1;
    }

    return stats;
  }, {
    completed: 0,
    ready: 0,
    todo: 0,
    locked: 0
  });
}

function renderTerminalStatusSummary(stats) {
  return TERMINAL_STATUS_SUMMARY_ITEMS
    .map((item) => `<span style="color:${item.color};">${escapeHtml(item.label)} ${stats[item.key] || 0}</span>`)
    .join("");
}

function renderTerminalStatusLegend() {
  return TERMINAL_STATUS_LEGEND_ITEMS
    .map((item) => `<span style="color:${item.color};">${escapeHtml(item.label)}</span>`)
    .join("");
}

function renderTerminalModalHeader({ builderCallsign, stats, selectedMissionIndex, totalMissions }) {
  const callsign = normalizeBuilderCallsign(builderCallsign);
  return `
    <header style="position:relative;z-index:1;display:grid;grid-template-columns:minmax(0, 1fr) auto;gap:18px;align-items:center;margin-bottom:18px;padding-bottom:14px;border-bottom:4px solid ${TERMINAL_PIXEL_COLORS.outline};">
      <div style="display:grid;grid-template-columns:56px minmax(0,1fr);gap:16px;align-items:center;min-width:0;">
        <div style="width:56px;height:56px;display:grid;place-items:center;border:4px solid ${TERMINAL_PIXEL_COLORS.outline};background:${TERMINAL_PIXEL_COLORS.frame};box-shadow:inset 4px 4px 0 rgba(255,241,207,0.18), inset -4px -4px 0 rgba(56,30,31,0.34);color:${TERMINAL_PIXEL_COLORS.outline};font-family:${TERMINAL_TITLE_FONT};font-size:22px;line-height:1;">CT</div>
        <div style="display:grid;gap:7px;min-width:0;">
        <strong style="font-family:${TERMINAL_TITLE_FONT};font-size:42px;font-weight:400;line-height:1;color:${TERMINAL_PIXEL_COLORS.copy};letter-spacing:0;text-transform:none;text-shadow:${TERMINAL_PIXEL_TEXT_SHADOW};">Colony Terminal</strong>
        ${callsign ? `
          <span style="font-family:${TERMINAL_PIXEL_FONT};font-size:14px;line-height:1;color:${TERMINAL_PIXEL_COLORS.muted};letter-spacing:0;text-transform:none;">Builder ${escapeHtml(callsign)}</span>
        ` : ""}
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-family:${TERMINAL_PIXEL_FONT};font-size:12px;line-height:1;color:${TERMINAL_PIXEL_COLORS.copy};letter-spacing:0;text-transform:none;">
          ${renderTerminalStatusSummary(stats)}
        </div>
        </div>
      </div>
      <div style="display:grid;gap:5px;text-align:right;border:4px solid ${TERMINAL_PIXEL_COLORS.outline};background:${TERMINAL_PIXEL_COLORS.well};padding:10px 12px;box-shadow:inset 3px 3px 0 rgba(255,241,207,0.08);">
        <span style="font-family:${TERMINAL_PIXEL_FONT};font-size:10px;letter-spacing:0;text-transform:none;color:${TERMINAL_PIXEL_COLORS.muted};">Selected</span>
        <strong style="font-family:${TERMINAL_TITLE_FONT};font-size:28px;line-height:1;color:${TERMINAL_PIXEL_COLORS.todo};text-shadow:${TERMINAL_PIXEL_TEXT_SHADOW};">${selectedMissionIndex + 1}/${totalMissions}</strong>
      </div>
    </header>
  `;
}

function renderTerminalModalBody({ selectedMissionIndex, visibleMissionCards }) {
  return `
    <div style="position:relative;z-index:1;display:grid;gap:12px;align-items:stretch;">
      <div
        class="pokemon-center-pc-modal__cards"
        role="listbox"
        aria-label="Colony checks"
        aria-activedescendant="pokemon-center-pc-card-${selectedMissionIndex}"
        style="display:grid;grid-template-columns:minmax(0, 1fr);gap:10px;align-items:stretch;min-width:0;max-height:min(58vh, 620px);overflow:auto;padding:2px 8px 2px 2px;scrollbar-color:${TERMINAL_PIXEL_COLORS.frame} ${TERMINAL_PIXEL_COLORS.well};"
      >${visibleMissionCards}</div>
    </div>
  `;
}

function renderTerminalModalFooter({ actionHint, actionReady, dotsHtml }) {
  return `
    <footer style="position:relative;z-index:1;display:grid;grid-template-columns:minmax(0, 1fr) auto;gap:12px;align-items:center;margin-top:16px;padding-top:12px;border-top:4px solid ${TERMINAL_PIXEL_COLORS.outline};">
      <div style="display:grid;gap:7px;min-width:0;">
        <div class="pokemon-center-pc-modal__dots" aria-label="Colony check timeline" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;max-height:44px;overflow:auto;padding:2px 2px 5px 2px;">${dotsHtml}</div>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-family:${TERMINAL_PIXEL_FONT};font-size:11px;line-height:1;color:${TERMINAL_PIXEL_COLORS.copy};letter-spacing:0;text-transform:none;">
          ${renderTerminalStatusLegend()}
        </div>
      </div>
      <p style="margin:0;display:flex;gap:10px;align-items:center;justify-content:flex-end;flex-wrap:wrap;color:${TERMINAL_PIXEL_COLORS.copy};font-family:${TERMINAL_PIXEL_FONT};font-size:12px;line-height:1;letter-spacing:0;text-transform:none;">
        <span style="color:${TERMINAL_PIXEL_COLORS.muted};">Up/Down Browse</span>
        <span style="color:${actionReady ? TERMINAL_PIXEL_COLORS.todo : TERMINAL_PIXEL_COLORS.completed};">${escapeHtml(actionHint)}</span>
        <span style="color:${TERMINAL_PIXEL_COLORS.danger};">B / Esc Close</span>
      </p>
    </footer>
  `;
}

function getMissionImageSrc(mission) {
  return mission?.imageSrc || mission?.imageUrl || mission?.thumbnailUrl || mission?.artUrl || "";
}

function getMissionConfirmHint(mission) {
  if (mission?.actionLabel) {
    return `X / Enter ${mission.actionLabel}`;
  }

  if (mission?.status === "locked") {
    return getTerminalMissionStatusType("locked").confirmHint;
  }

  return getTerminalMissionStatusType(mission?.status).confirmHint;
}

function getMissionPlaceholderLabel(mission) {
  if (mission?.status === "completed" || mission?.status === "locked") {
    return getTerminalMissionStatusType(mission.status).placeholderLabel;
  }

  if (mission?.actionId) {
    return "GO";
  }

  return getTerminalMissionStatusType(mission?.status).placeholderLabel;
}

export function createTerminalMissionCardViewModel(mission = EMPTY_MISSION, index = 0, selectedMissionIndex = 0) {
  const selected = index === selectedMissionIndex;

  return {
    cardMode: selected ? "detail" : "summary",
    detailRows: [
      mission?.progress,
      mission?.actionLabel ? `X / Enter ${mission.actionLabel}` : ""
    ].filter(Boolean),
    guidance: getMissionGuidance(mission),
    imageAlt: mission?.imageAlt || mission?.title || "",
    imageSrc: getMissionImageSrc(mission),
    missionSource: mission?.source || "terminal",
    palette: getMissionPalette(mission?.status),
    placeholderLabel: getMissionPlaceholderLabel(mission),
    selected,
    statusLabel: getMissionStatusLabel(mission)
  };
}

export function getWrappedTerminalMissionIndex(index = 0, totalMissions = 0) {
  return getWrappedModalIndex(index, totalMissions);
}

export function getInitialTerminalMissionIndex(missions = []) {
  const actionableIndex = missions.findIndex((mission) => mission?.actionId);
  if (actionableIndex >= 0) {
    return actionableIndex;
  }

  const readableIndex = missions.findIndex((mission) => mission?.status !== "locked");
  return readableIndex >= 0 ? readableIndex : 0;
}

export function getVisibleTerminalMissionIndexes({
  selectedMissionIndex = 0,
  totalMissions = 0,
  visibleCount = totalMissions
} = {}) {
  const count = Math.min(visibleCount, totalMissions);
  if (count <= 0) {
    return [];
  }

  return Array.from({ length: count }, (_, index) => index);
}

export function createTerminalModalMusicController({
  musicSrc = CENTER_COMPUTER_MUSIC_URL,
  musicVolume = CENTER_COMPUTER_MUSIC_VOLUME,
  audioFactory = (src) => {
    if (typeof Audio !== "function") {
      return null;
    }

    return new Audio(src);
  }
} = {}) {
  let musicAudio = null;

  function getAudio() {
    if (musicAudio) {
      return musicAudio;
    }

    musicAudio = musicSrc ? audioFactory(musicSrc) || createSilentTerminalAudio() : createSilentTerminalAudio();
    musicAudio.preload = "auto";
    musicAudio.loop = true;
    musicAudio.volume = musicVolume;
    return musicAudio;
  }

  return {
    play() {
      const audio = getAudio();

      audio.loop = true;
      audio.volume = musicVolume;
      try {
        audio.currentTime = 0;
      } catch {
        // Some browser audio objects disallow seeking before metadata is ready.
      }

      const playResult = audio.play?.();
      if (playResult?.catch) {
        playResult.catch(() => {});
      }
    },
    stop() {
      const audio = getAudio();

      audio.pause?.();
      try {
        audio.currentTime = 0;
      } catch {
        // Some browser audio objects disallow seeking before metadata is ready.
      }
    }
  };
}

export function createPokemonCenterPcModalController({
  mount,
  clearGameFlowInput = () => {},
  musicSrc = CENTER_COMPUTER_MUSIC_URL,
  musicVolume = CENTER_COMPUTER_MUSIC_VOLUME,
  audioFactory = (src) => {
    if (typeof Audio !== "function") {
      return null;
    }

    return new Audio(src);
  }
} = {}) {
  const documentRef = mount?.ownerDocument || globalThis.document;
  let root = null;
  let open = false;
  let missions = [EMPTY_MISSION];
  let selectedMissionIndex = 0;
  let onConfirm = null;
  let builderCallsign = "";
  let renderDirty = true;
  let missionCompletionFlashIds = new Set();
  let missionCompletionFlashTimer = null;
  const musicController = createTerminalModalMusicController({
    audioFactory,
    musicSrc,
    musicVolume
  });

  function ensureRoot() {
    if (root || !mount || !documentRef?.createElement) {
      return root;
    }

    root = createElement(documentRef, "section", "pokemon-center-pc-modal");
    root.hidden = true;
    root.setAttribute("aria-label", "Colony Terminal colony checks");
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    ensureTerminalModalStyle(documentRef);
    Object.assign(root.style, {
      position: "absolute",
      inset: "0",
      zIndex: "19",
      display: "none",
      placeItems: "center",
      pointerEvents: "auto",
      background: "rgba(21, 16, 26, 0.78)",
      imageRendering: "pixelated"
    });
    mount.append(root);
    return root;
  }

  function selectMissionIndex(index) {
    const previousIndex = selectedMissionIndex;
    selectedMissionIndex = getWrappedTerminalMissionIndex(index, missions.length);

    if (selectedMissionIndex !== previousIndex) {
      renderDirty = true;
    }
  }

  function moveSelection(direction) {
    selectMissionIndex(selectedMissionIndex + direction);
    renderIfDirty();
  }

  function selectInitialMission() {
    selectedMissionIndex = getInitialTerminalMissionIndex(missions);
  }

  function getVisibleMissionIndexes() {
    return getVisibleTerminalMissionIndexes({
      selectedMissionIndex,
      totalMissions: missions.length
    });
  }

  function close() {
    if (!root) {
      return false;
    }

    root.hidden = true;
    root.style.display = "none";
    root.replaceChildren();
    open = false;
    onConfirm = null;
    musicController.stop();
    clearGameFlowInput();
    return true;
  }

  function confirmSelectedMission() {
    const mission = missions[selectedMissionIndex];
    if (!open || !mission?.actionId || typeof onConfirm !== "function") {
      return false;
    }

    const handled = onConfirm(mission.actionId, mission) !== false;
    if (handled) {
      close();
    }
    return handled;
  }

  const commandHandlers = Object.freeze({
    [TERMINAL_MODAL_COMMANDS.NEXT]: () => moveSelection(1),
    [TERMINAL_MODAL_COMMANDS.PREVIOUS]: () => moveSelection(-1),
    [TERMINAL_MODAL_COMMANDS.CONFIRM]: () => confirmSelectedMission(),
    [TERMINAL_MODAL_COMMANDS.CLOSE]: () => close()
  });

  function handleCommand(command) {
    const handler = commandHandlers[command];
    if (!handler) {
      return false;
    }

    handler();
    return true;
  }

  function renderDots() {
    return missions.map((mission, index) => {
      const selected = index === selectedMissionIndex;
      const palette = getMissionPalette(mission.status);
      const fillColor = selected ?
        TERMINAL_PIXEL_COLORS.todo :
        mission.status === "locked" ?
          TERMINAL_PIXEL_COLORS.well :
          palette.border;
      return `
        <button
          class="pokemon-center-pc-modal__dot"
          type="button"
          data-pc-mission-index="${index}"
          data-selected="${selected ? "true" : "false"}"
          aria-label="Colony check ${index + 1}: ${escapeHtml(mission.title)}"
          style="
            width:${selected ? "18px" : "12px"};height:12px;border:2px solid ${selected ? TERMINAL_PIXEL_COLORS.outline : palette.border};
            background:${fillColor};
            padding:0;cursor:pointer;
            opacity:${mission.status === "locked" ? "0.7" : "1"};
          "
        ></button>
      `;
    }).join("");
  }

  function renderMissionCard(mission, index) {
    const {
      cardMode,
      detailRows,
      guidance,
      imageAlt,
      imageSrc,
      missionSource,
      palette,
      placeholderLabel,
      selected,
      statusLabel
    } = createTerminalMissionCardViewModel(mission, index, selectedMissionIndex);
    const illustrationHtml = imageSrc ?
      `<img
        class="pokemon-center-pc-modal__card-image"
        src="${escapeHtml(imageSrc)}"
        alt="${escapeHtml(imageAlt)}"
        decoding="async"
        style="width:100%;height:100%;display:block;object-fit:cover;image-rendering:pixelated;opacity:1;filter:none;transition:opacity 0.1s steps(2, end);"
      >` :
      `<span
        class="pokemon-center-pc-modal__card-image-placeholder"
        aria-hidden="true"
        style="display:grid;place-items:center;width:100%;height:100%;color:${palette.label};font-family:${TERMINAL_TITLE_FONT};font-size:${selected ? "34px" : "22px"};line-height:1;letter-spacing:0;text-shadow:${TERMINAL_PIXEL_TEXT_SHADOW};"
      >${escapeHtml(placeholderLabel)}</span>`;

    return `
      <button
        class="pokemon-center-pc-modal__card"
        id="pokemon-center-pc-card-${index}"
        type="button"
        data-pc-mission-index="${index}"
        data-pc-mission-id="${escapeHtml(mission.id)}"
        data-pc-mission-status="${escapeHtml(mission.status || "available")}"
        data-pc-just-completed="${missionCompletionFlashIds.has(mission.taskId || mission.id) ? "true" : "false"}"
        data-selected="${selected ? "true" : "false"}"
        data-pc-card-mode="${cardMode}"
        role="option"
        aria-selected="${selected ? "true" : "false"}"
        aria-label="Colony check ${index + 1}, ${escapeHtml(statusLabel)}: ${escapeHtml(mission.title)}"
        style="
          position:relative;
          min-height:${selected ? "320px" : "228px"};
          border:4px solid ${palette.border};
          box-shadow:${selected ? `0 0 0 4px ${TERMINAL_PIXEL_COLORS.outline}` : "none"};
          background:${palette.background};
          color:${TERMINAL_PIXEL_COLORS.copy};
          padding:${selected ? "14px" : "10px 12px"};
          display:grid;
          grid-template-columns:minmax(0, 1fr) ${selected ? "minmax(124px, 154px)" : "72px"};
          gap:${selected ? "16px" : "12px"};
          align-content:stretch;
          text-align:left;
          font:inherit;
          cursor:pointer;
          opacity:${selected ? "1" : mission.status === "locked" ? "0.72" : "0.92"};
          overflow:hidden;
        "
        >
        <span class="pokemon-center-pc-modal__card-scan" aria-hidden="true" style="position:absolute;top:0;left:0;bottom:0;width:0;background:transparent;pointer-events:none;z-index:4;opacity:0;"></span>
        <span aria-hidden="true" style="position:absolute;top:0;left:0;right:0;height:4px;background:${palette.border};box-shadow:none;z-index:3;opacity:1;"></span>
        <div style="position:relative;z-index:5;display:grid;grid-template-rows:auto auto minmax(0, 1fr) auto;align-content:start;gap:${selected ? "9px" : "6px"};min-width:0;overflow:hidden;">
          <div style="display:flex;justify-content:flex-end;align-items:start;min-width:0;">
            <span style="flex:0 0 auto;border:2px solid ${palette.border};background:${TERMINAL_PIXEL_COLORS.well};padding:${selected ? "5px 7px" : "4px 6px"};font-family:${TERMINAL_PIXEL_FONT};font-size:${selected ? "12px" : "11px"};line-height:1;letter-spacing:0;text-transform:none;color:${palette.label};">${escapeHtml(statusLabel)}</span>
          </div>
          <h2 style="margin:0;color:${TERMINAL_PIXEL_COLORS.copy};font-family:${TERMINAL_TITLE_FONT};font-size:${selected ? "34px" : "24px"};font-weight:400;line-height:1;letter-spacing:0;text-transform:none;overflow-wrap:anywhere;text-shadow:${TERMINAL_PIXEL_TEXT_SHADOW};">${escapeHtml(mission.title)}</h2>
          <p style="margin:0;color:${palette.copy};font-size:${selected ? "22.5px" : "18px"};line-height:1.12;text-transform:none;overflow-wrap:anywhere;">${escapeHtml(mission.description)}</p>
          ${selected ? `
            <p style="margin:0;border:2px solid ${palette.border};background:${TERMINAL_PIXEL_COLORS.well};padding:8px;color:${palette.label};font-family:${TERMINAL_PIXEL_FONT};font-size:12px;line-height:1.32;text-transform:none;overflow-wrap:anywhere;">${escapeHtml(guidance)}</p>
          ` : ""}
          ${detailRows.length ? `
            <div style="display:grid;gap:5px;color:${palette.label};font-family:${TERMINAL_PIXEL_FONT};font-size:${selected ? "12px" : "10px"};line-height:1.18;overflow-wrap:anywhere;">
              ${detailRows.map((detail) => `<span>${escapeHtml(detail)}</span>`).join("")}
            </div>
          ` : ""}
        </div>
        <div
          class="pokemon-center-pc-modal__card-image-frame"
          data-pc-mission-image-slot="true"
          style="
            position:relative;
            z-index:5;
            min-height:${selected ? "156px" : "66px"};
            min-width:${selected ? "132px" : "66px"};
            border:4px solid ${palette.border};
            background:${TERMINAL_PIXEL_COLORS.well};
            overflow:hidden;
            align-self:stretch;
          "
        >
          ${illustrationHtml}
        </div>
      </button>
    `;
  }

  function render() {
    const currentRoot = ensureRoot();
    if (!currentRoot) {
      return;
    }

    const mission = missions[selectedMissionIndex] || EMPTY_MISSION;
    const stats = getMissionStats(missions);
    const actionHint = getMissionConfirmHint(mission);
    const dotsHtml = renderDots();
    const visibleMissionIndexes = getVisibleMissionIndexes();
    const visibleMissionCards = visibleMissionIndexes
      .map((missionIndex) => renderMissionCard(missions[missionIndex] || EMPTY_MISSION, missionIndex))
      .join("");

    currentRoot.replaceChildren();

    const panel = createElement(documentRef, "article", "pokemon-center-pc-modal__panel");
    Object.assign(panel.style, {
      width: "96%",
      maxWidth: "1180px",
      minHeight: "360px",
      maxHeight: "calc(100vh - 56px)",
      overflow: "auto",
      position: "relative",
      border: `4px solid ${TERMINAL_PIXEL_COLORS.frame}`,
      boxShadow: `0 0 0 4px ${TERMINAL_PIXEL_COLORS.outline}, 0 18px 0 rgba(0, 0, 0, 0.28)`,
      background: TERMINAL_PIXEL_COLORS.panel,
      color: TERMINAL_PIXEL_COLORS.copy,
      padding: "24px 28px 26px",
      fontFamily: TERMINAL_PIXEL_FONT,
      letterSpacing: "0",
      textTransform: "none"
    });

    panel.innerHTML = `
      ${renderTerminalModalHeader({
        builderCallsign,
        stats,
        selectedMissionIndex,
        totalMissions: missions.length
      })}
      ${renderTerminalModalBody({
        selectedMissionIndex,
        visibleMissionCards
      })}
      ${renderTerminalModalFooter({
        actionHint,
        actionReady: Boolean(mission.actionLabel),
        dotsHtml
      })}
    `;

    panel.addEventListener("click", (event) => {
      const actionControl = event.target?.closest?.("[data-pc-action]");
      if (actionControl && panel.contains(actionControl)) {
        const command = resolveTerminalModalPointerCommand(actionControl.dataset.pcAction);
        handleCommand(command);
        event.preventDefault();
        return;
      }

      const missionControl = event.target?.closest?.("[data-pc-mission-index]");
      if (missionControl && panel.contains(missionControl)) {
        selectMissionIndex(Number(missionControl.dataset.pcMissionIndex || 0));
        renderIfDirty();
        event.preventDefault();
      }
    });

    currentRoot.append(panel);
    renderDirty = false;
  }

  function renderIfDirty() {
    if (!renderDirty) {
      return;
    }

    render();
  }

  function clearMissionCompletionFlashLater() {
    const windowRef = root?.ownerDocument?.defaultView || globalThis.window;
    if (missionCompletionFlashTimer) {
      windowRef?.clearTimeout?.(missionCompletionFlashTimer);
    }

    missionCompletionFlashTimer = windowRef?.setTimeout?.(() => {
      missionCompletionFlashIds = new Set();
      renderDirty = true;
      renderIfDirty();
    }, TERMINAL_OBJECTIVE_COMPLETE_FLASH_MS) || null;
  }

  return {
    open({ builderCallsign: nextBuilderCallsign = "", missions: nextMissions = [], onConfirm: nextOnConfirm = null } = {}) {
      missions = normalizeMissions(nextMissions);
      onConfirm = nextOnConfirm;
      builderCallsign = normalizeBuilderCallsign(nextBuilderCallsign);
      renderDirty = true;
      selectInitialMission();
      open = true;
      renderIfDirty();
      if (root) {
        root.hidden = false;
        root.style.display = "grid";
      }
      musicController.play();
      clearGameFlowInput();
      return true;
    },
    close,
    handleKeydown(event) {
      if (!open) {
        return false;
      }

      const command = resolveTerminalModalCommand(event);
      handleCommand(command);
      event.preventDefault?.();
      return true;
    },
    updateMissions(nextMissions = [], { completedObjectives = [] } = {}) {
      const selectedMissionId = missions[selectedMissionIndex]?.id || null;
      missions = normalizeMissions(nextMissions);

      if (selectedMissionId) {
        const nextSelectedIndex = missions.findIndex((mission) => mission.id === selectedMissionId);
        selectedMissionIndex = nextSelectedIndex >= 0 ? nextSelectedIndex : getInitialTerminalMissionIndex(missions);
      } else {
        selectInitialMission();
      }

      const nextFlashIds = new Set(
        (completedObjectives || [])
          .map((objective) => objective?.taskId)
          .filter(Boolean)
      );
      if (nextFlashIds.size) {
        missionCompletionFlashIds = nextFlashIds;
        clearMissionCompletionFlashLater();
      }

      renderDirty = true;
      renderIfDirty();
      return true;
    },
    isOpen() {
      return open;
    }
  };
}
