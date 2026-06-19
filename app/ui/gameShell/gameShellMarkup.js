import { GAME_SHELL_DOM_IDS } from "./gameShellDomIds.js";
import { POKEDEX_SHELL_HTML } from "./pokedexShellMarkup.js";

const IDS = GAME_SHELL_DOM_IDS;

export const GAME_SHELL_HTML = `<div class="game-stage" id="${IDS.gameStage}">
  <section class="intro-overlay" id="${IDS.introOverlay}" hidden aria-label="Intro sequence"></section>
  <section class="intro-room-debug-root" id="${IDS.introRoomDebugRoot}" hidden aria-label="Intro room debug tools"></section>
  <section class="pause-overlay" id="${IDS.pauseOverlay}" hidden aria-label="Pause screen">
    <div class="pause-overlay__label">PAUSE</div>
  </section>
  <div class="render-frame" id="${IDS.renderFrame}">
        <section class="start-overlay" id="${IDS.startOverlay}" aria-label="Start screen"></section>
        <canvas id="${IDS.worldCanvas}" class="layer" width="426" height="240"></canvas>
        <div id="${IDS.warmOverlay}" aria-hidden="true"></div>
        <canvas id="${IDS.spriteCanvas}" class="layer" width="426" height="240"></canvas>
        <div class="ui-layer" id="${IDS.uiLayer}">
          <div class="fps-panel" id="${IDS.fpsPanel}" aria-live="off">FPS --</div>
          <div class="input-modality-panel" id="${IDS.inputModalityPanel}" aria-live="polite">INPUT KEYBOARD</div>
          <div class="scene-transition-veil" id="${IDS.sceneTransitionVeil}" hidden aria-hidden="true"></div>
          <section class="skill-learn-overlay" id="${IDS.skillLearnOverlay}" hidden aria-label="Skill learned"></section>
          <section class="cinematic-overlay" id="${IDS.cinematicOverlay}" hidden aria-label="Act two cinematic"></section>
          <section class="tutorial-overlay" id="${IDS.tutorialOverlay}" hidden aria-label="Act two tutorial"></section>
          ${POKEDEX_SHELL_HTML}
          <aside class="nearby-habitats-panel" aria-label="Nearby colony zones">
            <div class="nearby-habitats-panel__header">Nearby Colony Zones</div>
            <div class="nearby-habitats-panel__value" id="${IDS.nearbyHabitatsValue}"></div>
          </aside>
          <aside class="quest-focus-panel" id="${IDS.questFocusPanel}" aria-label="Current quest">
            <div class="quest-focus-panel__title" id="${IDS.questFocusTitle}"></div>
            <div class="quest-focus-panel__body" id="${IDS.questFocusBody}"></div>
          </aside>
          <div class="hud" id="${IDS.hudPanel}">
            <div class="hud-context" id="${IDS.hudContext}" aria-live="polite"></div>
            <div class="hud-checklist" id="${IDS.hudChecklist}" aria-label="Quest checks"></div>
            <div class="hud__signals">
              <button class="hud-alert" id="${IDS.pokedexAlertButton}" type="button" hidden data-pulse="false">Instructions.</button>
            </div>
            <div class="hud-control">
              <label for="${IDS.jitterSlider}">
                <span>3D Jitter</span>
                <output id="${IDS.jitterValue}" for="${IDS.jitterSlider}">0%</output>
              </label>
              <input id="${IDS.jitterSlider}" type="range" min="0" max="100" step="1" value="0" />
            </div>
          </div>
          <aside class="missions-panel" id="${IDS.missionsPanel}" aria-label="Tasks">
            <div class="missions-header">Tasks</div>
            <div class="missions-stack" id="${IDS.missionsStack}"></div>
          </aside>
          <div class="skills-panel" id="${IDS.skillsPanel}" aria-label="Tools" hidden>
            <strong>Tools</strong>
            <div class="skills-grid" id="${IDS.skillsGrid}"></div>
          </div>
          <div class="inventory" id="${IDS.inventoryPanel}" aria-label="Supplies">
            <div class="inventory-grid" id="${IDS.inventoryGrid}"></div>
          </div>
          <section class="builder-panel" id="${IDS.builderPanel}" hidden aria-label="Colony handbook"></section>
          <div class="status" id="${IDS.status}">Initializing scene...</div>
        </div>
        </div>
</div>`;
