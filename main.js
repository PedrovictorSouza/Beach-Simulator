import { createApplicationRuntime } from "./app/bootstrap/createApplicationRuntime.js";
import { installAiWorkflowPromptTool } from "./app/ui/aiWorkflowPromptTool.js";

const app = createApplicationRuntime();

installAiWorkflowPromptTool();

app.start();
