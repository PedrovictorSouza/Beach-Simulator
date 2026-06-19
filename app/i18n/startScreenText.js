export const DEFAULT_START_LOCALE = "en";

export const START_LANGUAGE_OPTIONS = Object.freeze([
  Object.freeze({
    locale: "en",
    label: "English"
  }),
  Object.freeze({
    locale: "pt-BR",
    label: "Português"
  })
]);

const START_SCREEN_TRANSLATIONS = Object.freeze({
  en: Object.freeze({
    "action.back": "Back",
    "language.title": "Language",
    "slot.continue": "Continue",
    "slot.emptySlot": "Empty Slot {{slotNumber}}",
    "slot.menu": "Save Slots",
    "slot.newGame": "New Game",
    "slot.savedGame": "Saved Game",
    "slot.slot": "Slot {{slotNumber}}",
    "start.prompt": "START"
  }),
  "pt-BR": Object.freeze({
    "action.back": "Voltar",
    "language.title": "Idioma",
    "slot.continue": "Continuar",
    "slot.emptySlot": "Slot vazio {{slotNumber}}",
    "slot.menu": "Slots de jogo",
    "slot.newGame": "Novo jogo",
    "slot.savedGame": "Jogo salvo",
    "slot.slot": "Slot {{slotNumber}}",
    "start.prompt": "INICIAR"
  })
});

export function normalizeStartLocale(locale) {
  return Object.prototype.hasOwnProperty.call(START_SCREEN_TRANSLATIONS, locale) ?
    locale :
    DEFAULT_START_LOCALE;
}

function interpolate(template, params = {}) {
  return String(template).replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = params[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function createStartScreenText({ locale = DEFAULT_START_LOCALE } = {}) {
  const normalizedLocale = normalizeStartLocale(locale);

  return {
    locale: normalizedLocale,
    t(key, params = {}) {
      const template =
        START_SCREEN_TRANSLATIONS[normalizedLocale]?.[key] ??
        START_SCREEN_TRANSLATIONS[DEFAULT_START_LOCALE]?.[key] ??
        key;

      return interpolate(template, params);
    }
  };
}
