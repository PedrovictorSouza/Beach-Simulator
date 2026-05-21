const HYDRO_JET_INSTRUCTIONS_IMAGE_URL = new URL("./images/tutorial-hidro-jet.png", import.meta.url).href;
const HYDRO_JET_AVATAR_IMAGE_URL = new URL("./images/hidrojet-avatar.png", import.meta.url).href;

const GAME_SHELL_HTML = `<div class="game-stage" id="game-stage">
  <section class="intro-overlay" id="intro-overlay" hidden aria-label="Intro sequence"></section>
  <section class="intro-room-debug-root" id="intro-room-debug-root" hidden aria-label="Intro room debug tools"></section>
  <section class="pause-overlay" id="pause-overlay" hidden aria-label="Pause screen">
    <div class="pause-overlay__label">PAUSE</div>
  </section>
  <div class="render-frame" id="render-frame">
        <section class="start-overlay" id="start-overlay" aria-label="Start screen"></section>
        <canvas id="viewport" class="layer" width="426" height="240"></canvas>
        <div id="warm-overlay" aria-hidden="true"></div>
        <canvas id="sprite-layer" class="layer" width="426" height="240"></canvas>
        <div class="ui-layer" id="ui-layer">
          <div class="fps-panel" id="fps-panel" aria-live="off">FPS --</div>
          <div class="scene-transition-veil" id="scene-transition-veil" hidden aria-hidden="true"></div>
          <section class="skill-learn-overlay" id="skill-learn-overlay" hidden aria-label="Skill learned"></section>
          <section class="cinematic-overlay" id="cinematic-overlay" hidden aria-label="Act two cinematic"></section>
          <section class="tutorial-overlay" id="tutorial-overlay" hidden aria-label="Act two tutorial"></section>
          <section class="pokedex-overlay" id="pokedex-overlay" hidden aria-label="Instructions entry">
            <article class="pokedex-entry">
              <div class="pokedex-entry__details">
                <section class="pokedex-entry__page" data-pokedex-page-panel="details">
                  <div class="pokedex-entry__eyebrow" data-pokedex-field="details-eyebrow">Press (input) to wash the soil</div>
                  <div class="pokedex-entry__species" data-pokedex-field="species">Hydro Bot, wash the soil and make it green</div>
                  <div class="pokedex-entry__description" data-pokedex-field="description">
                    <div style="display:flex;gap:8px;align-items:flex-start;max-width:720px;">
                      <img class="pokedex-entry__description-image" src="${HYDRO_JET_INSTRUCTIONS_IMAGE_URL}" alt="Hydro Jet tutorial" loading="eager" decoding="async" style="display:block;width:min(100%,384px);height:auto;image-rendering:pixelated;">
                    </div>
                  </div>
                </section>
                <section class="pokedex-entry__page pokedex-entry__page--where" data-pokedex-page-panel="where-to-find" hidden>
                  <div class="pokedex-entry__eyebrow" data-pokedex-field="where-eyebrow">Field Site</div>
                  <div class="pokedex-entry__where-body">
                    <div class="pokedex-entry__where-visual">
                      <span class="pokedex-entry__where-arrow" aria-hidden="true">&#9664;</span>
                      <div class="pokedex-entry__where-marker">
                        <span class="pokedex-entry__where-pin" data-pokedex-field="where-pin">???</span>
                        <div class="pokedex-entry__where-island" data-pokedex-field="where-island">?</div>
                      </div>
                      <span class="pokedex-entry__where-arrow" aria-hidden="true">&#9654;</span>
                    </div>
                    <div class="pokedex-entry__where-count" data-pokedex-field="where-count">1/2</div>
                    <div class="pokedex-entry__where-stats">
                      <div class="pokedex-entry__where-stat">
                        <span data-pokedex-field="where-stat-label-0">Time</span>
                        <strong data-pokedex-field="where-stat-value-0">???</strong>
                      </div>
                      <div class="pokedex-entry__where-stat">
                        <span data-pokedex-field="where-stat-label-1">Weather</span>
                        <strong data-pokedex-field="where-stat-value-1">???</strong>
                      </div>
                    </div>
                  </div>
                </section>
                <section class="pokedex-entry__page pokedex-entry__page--specialties" data-pokedex-page-panel="specialties" hidden>
                  <div class="pokedex-entry__eyebrow" data-pokedex-field="specialties-eyebrow">Functions &amp; Care</div>
                  <div class="pokedex-entry__specialties-grid">
                    <section class="pokedex-entry__info-card">
                      <h3 data-pokedex-field="specialty-title">Function</h3>
                      <div class="pokedex-entry__specialty-badge">
                        <span aria-hidden="true" data-pokedex-field="specialty-icon">&#128167;</span>
                        <strong data-pokedex-field="specialty-label">Hydro recovery</strong>
                      </div>
                    </section>
                    <section class="pokedex-entry__info-card pokedex-entry__info-card--favorites">
                      <h3 data-pokedex-field="favorites-title">Care Notes</h3>
                      <ul class="pokedex-entry__favorites" data-pokedex-field="favorites-list">
                        <li>Clean tanks</li>
                        <li>Clear channels</li>
                        <li>Hydrated soil</li>
                        <li>Light maintenance</li>
                        <li>Group routines</li>
                        <li>Low grit intake</li>
                      </ul>
                    </section>
                    <section class="pokedex-entry__info-card">
                      <h3 data-pokedex-field="habitat-title">Ideal Habitat</h3>
                      <p data-pokedex-field="habitat-copy">Humid</p>
                    </section>
                  </div>
                </section>
                <section class="pokedex-entry__page pokedex-entry__page--requests" data-pokedex-page-panel="requests" hidden>
                  <div class="pokedex-entry__eyebrow">Field Requests</div>
                  <article class="pokedex-entry__request-card">
                    <div class="pokedex-entry__request-status" data-pokedex-field="request-status">No Active Request</div>
                    <div class="pokedex-entry__request-giver" data-pokedex-field="request-giver">Instructions.</div>
                    <h3 data-pokedex-field="request-title">No requests yet</h3>
                    <p data-pokedex-field="request-description">Keep restoring colony zones and checking in with colony bots.</p>
                    <div class="pokedex-entry__request-row">
                      <span>Objective</span>
                      <strong data-pokedex-field="request-objective">No objective tracked.</strong>
                    </div>
                    <div class="pokedex-entry__request-row">
                      <span>Reward</span>
                      <strong data-pokedex-field="request-reward">No reward listed.</strong>
                    </div>
                  </article>
                </section>
              </div>
              <aside class="pokedex-entry__avatar" data-pokedex-art-scene="squirtle" aria-hidden="true">
                <img class="pokedex-entry__avatar-image" src="${HYDRO_JET_AVATAR_IMAGE_URL}" alt="" loading="eager" decoding="async">
              </aside>
              <div class="pokedex-entry__drawer" aria-hidden="true">
                <div class="pokedex-entry__drawer-sheet">
                  <div class="pokedex-entry__drawer-item">
                    <span class="pokedex-entry__drawer-icon" data-pokedex-field="drawer-icon">✿</span>
                    <strong class="pokedex-entry__drawer-label" data-pokedex-field="drawer-label">Grass</strong>
                    <span class="pokedex-entry__drawer-count" data-pokedex-field="drawer-count">x2</span>
                  </div>
                </div>
              </div>
              <button class="pokedex-entry__close" id="pokedex-overlay-close" data-pokedex-action="close" type="button" aria-label="Close Instructions">Close</button>
            </article>
          </section>
          <aside class="nearby-habitats-panel" aria-label="Nearby colony zones">
            <div class="nearby-habitats-panel__header">Nearby Colony Zones</div>
            <div class="nearby-habitats-panel__value" id="nearby-habitats-value"></div>
          </aside>
          <aside class="quest-focus-panel" id="quest-focus-panel" aria-label="Current quest">
            <div class="quest-focus-panel__title" id="quest-focus-title"></div>
            <div class="quest-focus-panel__body" id="quest-focus-body"></div>
          </aside>
          <div class="hud" id="hud-panel">
            <div class="hud-context" id="hud-context" aria-live="polite"></div>
            <div class="hud-checklist" id="hud-checklist" aria-label="Quest checks"></div>
            <div class="hud__signals">
              <button class="hud-alert" id="pokedex-alert" type="button" hidden data-pulse="false">Instructions.</button>
            </div>
            <div class="hud-control">
              <label for="jitter-slider">
                <span>3D Jitter</span>
                <output id="jitter-value" for="jitter-slider">0%</output>
              </label>
              <input id="jitter-slider" type="range" min="0" max="100" step="1" value="0" />
            </div>
          </div>
          <aside class="missions-panel" id="missions-panel" aria-label="Tasks">
            <div class="missions-header">Tasks</div>
            <div class="missions-stack" id="missions-stack"></div>
          </aside>
          <div class="skills-panel" id="skills-panel" aria-label="Tools" hidden>
            <strong>Tools</strong>
            <div class="skills-grid" id="skills-grid"></div>
          </div>
          <div class="inventory" id="inventory-panel" aria-label="Supplies">
            <div class="inventory-grid" id="inventory-grid"></div>
          </div>
          <section class="builder-panel" id="builder-panel" hidden aria-label="Colony handbook"></section>
          <div class="status" id="status">Initializing scene...</div>
        </div>
        </div>
</div>`;

const GAME_STAGE_ID = "game-stage";
const RENDER_FRAME_ID = "render-frame";

function getElement(documentRef, id) {
  return documentRef.getElementById(id);
}

function getOrCreateMain(documentRef) {
  const existingMain = documentRef.querySelector("main");

  if (existingMain) {
    return existingMain;
  }

  const main = documentRef.createElement("main");
  documentRef.body.appendChild(main);
  return main;
}

function mountGameShell(documentRef) {
  const main = getOrCreateMain(documentRef);

  if (!getElement(documentRef, GAME_STAGE_ID)) {
    main.innerHTML = GAME_SHELL_HTML;
  }

  return main;
}

function resolveGameShellNodes(documentRef, main) {
  const appRoot = documentRef.documentElement;

  return {
    appRoot,
    rootStyle: appRoot.style,
    main,
    gameStage: getElement(documentRef, GAME_STAGE_ID),
    renderFrame: getElement(documentRef, RENDER_FRAME_ID)
  };
}

export function createGameShell({ documentRef = document } = {}) {
  const main = mountGameShell(documentRef);
  return resolveGameShellNodes(documentRef, main);
}
