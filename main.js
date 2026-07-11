import "./styles/app.css";
import { gameManager } from "./gameManager.js";

gameManager.start({
  root: document.querySelector("#app"),
  windowRef: window
});
