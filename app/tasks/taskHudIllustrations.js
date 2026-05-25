const TASK_HUD_ILLUSTRATION_URLS = Object.freeze({
  "chopper-selfie": new URL("../ui/images/chopper-selfie.png", import.meta.url).href,
  "hydro-jet-tutorial": new URL("../ui/images/unboarding-hidro.png", import.meta.url).href
});

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getTaskHudIllustrationUrl(illustration = null) {
  const imageId = String(illustration?.imageId || "").trim();
  return TASK_HUD_ILLUSTRATION_URLS[imageId] || "";
}

export function renderTaskHudIllustrationHtml(illustration = null, fallbackText = "", {
  className = ""
} = {}) {
  const src = getTaskHudIllustrationUrl(illustration);

  if (!src) {
    return "";
  }

  const alt = String(illustration?.alt || fallbackText || "Task illustration").trim();
  const width = Number(illustration?.width || 100);
  const height = Number(illustration?.height || 100);
  const safeClassName = ["hud-task-illustration", className].filter(Boolean).join(" ");

  return `
    <span class="${escapeHtml(safeClassName)}" data-hud-illustration="${escapeHtml(illustration.imageId)}">
      <img
        class="hud-task-illustration__image"
        src="${escapeHtml(src)}"
        alt="${escapeHtml(alt)}"
        width="${escapeHtml(width)}"
        height="${escapeHtml(height)}"
        loading="eager"
        decoding="async"
        onerror="this.hidden=true;this.nextElementSibling.hidden=false"
      >
      <span class="hud-task-illustration__fallback" hidden>${escapeHtml(fallbackText)}</span>
    </span>
  `;
}
