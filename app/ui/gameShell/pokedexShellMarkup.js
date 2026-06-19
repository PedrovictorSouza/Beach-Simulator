import { GAME_SHELL_DOM_IDS } from "./gameShellDomIds.js";

const HYDRO_JET_INSTRUCTIONS_IMAGE_URL = new URL("../images/unboarding-hidro.png", import.meta.url).href;
const HYDRO_JET_AVATAR_IMAGE_URL = new URL("../images/hidro-avatar.png", import.meta.url).href;
const POKEDEX_CLOSE_BUTTON_IMAGE_URL = new URL("../images/close-btn-micro.png", import.meta.url).href;
const IDS = GAME_SHELL_DOM_IDS;

export const POKEDEX_SHELL_HTML = `<section class="pokedex-overlay" id="${IDS.pokedexOverlay}" hidden aria-label="Instructions entry">
            <article class="pokedex-entry">
              <aside class="pokedex-entry__avatar" data-pokedex-art-scene="squirtle" aria-hidden="true">
                <img class="pokedex-entry__avatar-image" src="${HYDRO_JET_AVATAR_IMAGE_URL}" alt="" loading="eager" decoding="async">
                <div class="pokedex-entry__species" data-pokedex-field="species">Hydro Bot, wash the soil and make it green</div>
              </aside>
              <div class="pokedex-entry__details">
                <section class="pokedex-entry__page" data-pokedex-page-panel="details">
                  <div class="pokedex-entry__eyebrow" data-pokedex-field="details-eyebrow"></div>
                  <div class="pokedex-entry__description">
                    <div data-pokedex-field="description">
                      <div style="display:flex;gap:8px;align-items:flex-start;justify-content:center;margin-top:10vh;">
                        <img class="pokedex-entry__description-image" src="${HYDRO_JET_INSTRUCTIONS_IMAGE_URL}" alt="Hydro Jet tutorial" loading="eager" decoding="async" style="display:block;width:min(100%,384px);height:auto;image-rendering:pixelated;margin-right:7vw;">
                      </div>
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
              <div class="pokedex-entry__drawer" aria-hidden="true">
                <div class="pokedex-entry__drawer-sheet">
                  <div class="pokedex-entry__drawer-item">
                    <span class="pokedex-entry__drawer-icon" data-pokedex-field="drawer-icon">✿</span>
                    <strong class="pokedex-entry__drawer-label" data-pokedex-field="drawer-label">Grass</strong>
                    <span class="pokedex-entry__drawer-count" data-pokedex-field="drawer-count">x2</span>
                  </div>
                </div>
              </div>
              <button class="pokedex-entry__close" id="${IDS.pokedexOverlayClose}" data-pokedex-action="close" type="button" aria-label="Close Instructions">
                <img class="pokedex-entry__close-image" src="${POKEDEX_CLOSE_BUTTON_IMAGE_URL}" alt="" loading="eager" decoding="async">
              </button>
            </article>
          </section>`;
