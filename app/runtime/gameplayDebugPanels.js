const FPS_PANEL_UPDATE_INTERVAL = 0.25;

export function createFpsPanelController(fpsPanelElement) {
  let elapsed = 0;
  let frames = 0;

  function classifyFps(fps) {
    if (fps < 30) {
      return "low";
    }

    if (fps < 50) {
      return "mid";
    }

    return "good";
  }

  return {
    update(rawDeltaTime) {
      if (!fpsPanelElement || !(rawDeltaTime > 0)) {
        return;
      }

      elapsed += rawDeltaTime;
      frames += 1;

      if (elapsed < FPS_PANEL_UPDATE_INTERVAL) {
        return;
      }

      const fps = Math.round(frames / elapsed);
      fpsPanelElement.textContent = `FPS ${fps}`;
      fpsPanelElement.dataset.fpsQuality = classifyFps(fps);

      elapsed = 0;
      frames = 0;
    }
  };
}

export function createInputModalityPanelController(inputModalityPanelElement) {
  let lastLabel = "";

  function getInputModalityLabel(inputModalityState = null) {
    if (inputModalityState?.device === "gamepad") {
      return `INPUT ${String(inputModalityState.gamepadLayout || "gamepad").toUpperCase()}`;
    }

    return "INPUT KEYBOARD";
  }

  return {
    update(inputModalityState = null) {
      if (!inputModalityPanelElement) {
        return;
      }

      const label = getInputModalityLabel(inputModalityState);

      if (label === lastLabel) {
        return;
      }

      inputModalityPanelElement.textContent = label;
      inputModalityPanelElement.dataset.inputDevice =
        inputModalityState?.device === "gamepad" ? "gamepad" : "keyboard";

      lastLabel = label;
    }
  };
}