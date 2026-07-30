const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

export const GAME_PALETTES = Object.freeze({
  GAME_BOY: "game-boy",
  MEGA_DRIVE: "mega-drive"
});

const FILTER_ID_BY_PALETTE = Object.freeze({
  [GAME_PALETTES.GAME_BOY]: "game-boy-palette-filter",
  [GAME_PALETTES.MEGA_DRIVE]: "mega-drive-palette-filter"
});

// Fifteen buckets place each transition halfway between the Mega Drive's
// eight 3-bit channel levels: 00, 22, 44, 66, 88, AA, CC and EE.
const MEGA_DRIVE_CHANNEL_TABLE = [
  0,
  2 / 15, 2 / 15,
  4 / 15, 4 / 15,
  6 / 15, 6 / 15,
  8 / 15, 8 / 15,
  10 / 15, 10 / 15,
  12 / 15, 12 / 15,
  14 / 15, 14 / 15
].join(" ");

// Original DMG-inspired palette, ordered from darkest to lightest.
const GAME_BOY_CHANNEL_TABLES = Object.freeze({
  R: [0x0f, 0x30, 0x8b, 0x9b].map((value) => value / 255).join(" "),
  G: [0x38, 0x62, 0xac, 0xbc].map((value) => value / 255).join(" "),
  B: [0x0f, 0x30, 0x0f, 0x0f].map((value) => value / 255).join(" ")
});

function createSvgElement(documentRef, tagName, attributes = {}) {
  const element = documentRef.createElementNS(SVG_NAMESPACE, tagName);

  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }

  return element;
}

function createFilterShell(documentRef, palette) {
  const svg = createSvgElement(documentRef, "svg", {
    width: "0",
    height: "0",
    "aria-hidden": "true"
  });
  const definitions = createSvgElement(documentRef, "defs");
  const filter = createSvgElement(documentRef, "filter", {
    id: FILTER_ID_BY_PALETTE[palette],
    "color-interpolation-filters": "sRGB"
  });

  definitions.append(filter);
  svg.append(definitions);

  return { svg, filter };
}

function appendComponentTransfer(documentRef, filter, channelTables) {
  const componentTransfer = createSvgElement(documentRef, "feComponentTransfer");

  for (const channel of ["R", "G", "B"]) {
    componentTransfer.append(createSvgElement(documentRef, `feFunc${channel}`, {
      type: "discrete",
      tableValues: channelTables[channel]
    }));
  }

  componentTransfer.append(createSvgElement(documentRef, "feFuncA", {
    type: "identity"
  }));
  filter.append(componentTransfer);
}

function createMegaDriveFilter(documentRef) {
  const shell = createFilterShell(documentRef, GAME_PALETTES.MEGA_DRIVE);

  appendComponentTransfer(documentRef, shell.filter, {
    R: MEGA_DRIVE_CHANNEL_TABLE,
    G: MEGA_DRIVE_CHANNEL_TABLE,
    B: MEGA_DRIVE_CHANNEL_TABLE
  });

  return shell.svg;
}

function createGameBoyFilter(documentRef) {
  const shell = createFilterShell(documentRef, GAME_PALETTES.GAME_BOY);
  const luminance = createSvgElement(documentRef, "feColorMatrix", {
    type: "matrix",
    values: [
      "0.2126 0.7152 0.0722 0 0",
      "0.2126 0.7152 0.0722 0 0",
      "0.2126 0.7152 0.0722 0 0",
      "0 0 0 1 0"
    ].join(" ")
  });

  shell.filter.append(luminance);
  appendComponentTransfer(
    documentRef,
    shell.filter,
    GAME_BOY_CHANNEL_TABLES
  );

  return shell.svg;
}

const FILTER_FACTORY_BY_PALETTE = Object.freeze({
  [GAME_PALETTES.GAME_BOY]: createGameBoyFilter,
  [GAME_PALETTES.MEGA_DRIVE]: createMegaDriveFilter
});

export function isGamePalette(value) {
  return Object.hasOwn(FILTER_FACTORY_BY_PALETTE, value);
}

/**
 * Quantizes the fully composed game stage, including WebGL and HTML UI.
 *
 * @param {{ root: HTMLElement, palette: string }} options
 * @returns {() => void} Removes the palette filter and restores the old style.
 */
export function applyGamePalette({
  root,
  palette = GAME_PALETTES.MEGA_DRIVE
}) {
  if (!root) {
    throw new Error("A paleta precisa do elemento raiz do jogo.");
  }
  if (!isGamePalette(palette)) {
    throw new Error(`Paleta desconhecida: ${palette}.`);
  }

  const documentRef = root.ownerDocument;
  const paletteSvg = FILTER_FACTORY_BY_PALETTE[palette](documentRef);
  const previousFilter = root.style.filter;
  const previousPalette = root.dataset.gamePalette;

  documentRef.body.append(paletteSvg);
  root.style.filter = `url("#${FILTER_ID_BY_PALETTE[palette]}")`;
  root.dataset.gamePalette = palette;

  return () => {
    root.style.filter = previousFilter;
    if (previousPalette === undefined) {
      delete root.dataset.gamePalette;
    } else {
      root.dataset.gamePalette = previousPalette;
    }
    paletteSvg.remove();
  };
}
