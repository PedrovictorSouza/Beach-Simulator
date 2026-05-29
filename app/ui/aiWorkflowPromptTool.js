const AI_WORKFLOW_TOOL_STYLE_ID = "ai-workflow-prompt-tool-style";

const WORKFLOW_SECTIONS = Object.freeze([
  Object.freeze({
    title: "1. Definição da tarefa",
    fields: Object.freeze([
      Object.freeze({
        id: "task",
        label: "O que a IA deve fazer?",
        placeholder: "Ex: Implementar cadastro de plantas com nome, tipo, luz e rega."
      }),
      Object.freeze({
        id: "outOfScope",
        label: "O que está fora do escopo?",
        placeholder: "Ex: Não alterar layout global, não trocar banco de dados, não adicionar autenticação."
      })
    ])
  }),
  Object.freeze({
    title: "2. Contexto obrigatório",
    fields: Object.freeze([
      Object.freeze({
        id: "requiredFiles",
        label: "Arquivos que a IA deve ler antes de implementar:",
        placeholder: "Ex: README.md, docs/architecture.md, app/plants/page.tsx, lib/db.ts"
      }),
      Object.freeze({
        id: "projectRules",
        label: "Regras do projeto:",
        placeholder: "Ex: Usar TypeScript, manter arquitetura atual, evitar novas dependências."
      })
    ])
  }),
  Object.freeze({
    title: "3. Plano antes da implementação",
    body: "Antes de alterar arquivos, a IA deve explicar o plano de ação, listar arquivos que pretende modificar e apontar riscos.",
    checks: Object.freeze([
      Object.freeze({ id: "planBeforeCode", label: "A IA deve propor um plano antes de codar" }),
      Object.freeze({ id: "listFilesBeforeCode", label: "A IA deve listar os arquivos que pretende alterar" }),
      Object.freeze({ id: "confirmLargeChanges", label: "A IA deve aguardar confirmação antes de mudanças grandes" })
    ])
  }),
  Object.freeze({
    title: "4. Checkpoint no Git",
    fields: Object.freeze([
      Object.freeze({
        id: "gitState",
        label: "Estado atual do Git antes da tarefa:",
        placeholder: "Ex: git status limpo / commit criado antes da mudança / branch nova criada"
      })
    ]),
    command: "git status\ngit add .\ngit commit -m \"checkpoint before ai changes\""
  }),
  Object.freeze({
    title: "5. Implementação",
    fields: Object.freeze([
      Object.freeze({
        id: "implementationInstructions",
        label: "Instruções de implementação:",
        placeholder: "Ex: Implementar em passos pequenos, não alterar comportamento fora da tarefa, evitar abstrações prematuras."
      })
    ]),
    checks: Object.freeze([
      Object.freeze({ id: "smallScope", label: "Manter escopo pequeno" }),
      Object.freeze({ id: "justifyDependencies", label: "Não adicionar dependências sem justificar" }),
      Object.freeze({ id: "documentArchitectureChanges", label: "Não alterar arquitetura sem documentar" })
    ])
  }),
  Object.freeze({
    title: "6. Validação",
    fields: Object.freeze([
      Object.freeze({
        id: "validationCommands",
        label: "Comandos que a IA deve rodar depois:",
        placeholder: "Ex: pnpm lint, pnpm test, pnpm build"
      })
    ]),
    checks: Object.freeze([
      Object.freeze({ id: "runLint", label: "Rodar lint" }),
      Object.freeze({ id: "runTests", label: "Rodar testes" }),
      Object.freeze({ id: "runBuild", label: "Rodar build" }),
      Object.freeze({ id: "fixFoundErrors", label: "Corrigir erros encontrados" })
    ])
  }),
  Object.freeze({
    title: "7. Refatoração explícita",
    body: "Depois da implementação, a IA deve revisar o próprio código procurando duplicação, código morto, nomes ruins, funções grandes e abstrações desnecessárias.",
    fields: Object.freeze([
      Object.freeze({
        id: "refactorInstructions",
        label: "Instruções de refatoração:",
        placeholder: "Ex: Revise os arquivos alterados e refatore sem mudar comportamento."
      })
    ]),
    checks: Object.freeze([
      Object.freeze({ id: "removeDeadCode", label: "Remover código morto" }),
      Object.freeze({ id: "reduceDuplication", label: "Reduzir duplicação" }),
      Object.freeze({ id: "improveNames", label: "Melhorar nomes" }),
      Object.freeze({ id: "noBehaviorChangeWithoutTest", label: "Não mudar comportamento sem teste" })
    ])
  }),
  Object.freeze({
    title: "8. Auditoria básica",
    body: "A IA deve procurar problemas como:",
    checks: Object.freeze([
      Object.freeze({ id: "secretLeaks", label: "Secrets vazando" }),
      Object.freeze({ id: "envGitignore", label: ".env fora do .gitignore" }),
      Object.freeze({ id: "clientApiKey", label: "API key exposta no client" }),
      Object.freeze({ id: "routeValidation", label: "Rota sem validação" }),
      Object.freeze({ id: "sqlInjection", label: "SQL injection ou query insegura" }),
      Object.freeze({ id: "sensitiveLogs", label: "Logs com dados sensíveis" })
    ])
  }),
  Object.freeze({
    title: "9. Documentação",
    fields: Object.freeze([
      Object.freeze({
        id: "docsToUpdate",
        label: "Documentos que devem ser atualizados:",
        placeholder: "Ex: README.md, docs/architecture.md, docs/database.md, docs/decisions/0003-auth-strategy.md"
      })
    ]),
    checks: Object.freeze([
      Object.freeze({ id: "updateReadme", label: "Atualizar README se mudar comando de uso" }),
      Object.freeze({ id: "updateArchitectureDocs", label: "Atualizar docs/architecture.md se mudar estrutura" }),
      Object.freeze({ id: "createAdr", label: "Criar ADR em docs/decisions se houver decisão técnica" })
    ])
  }),
  Object.freeze({
    title: "10. Revisão final",
    body: "A IA deve entregar:",
    checks: Object.freeze([
      Object.freeze({ id: "finalSummary", label: "Resumo do que foi alterado" }),
      Object.freeze({ id: "modifiedFiles", label: "Lista de arquivos modificados" }),
      Object.freeze({ id: "commandsRun", label: "Comandos executados" }),
      Object.freeze({ id: "fixedErrors", label: "Erros encontrados e corrigidos" }),
      Object.freeze({ id: "remainingRisks", label: "Riscos restantes" })
    ])
  })
]);

function getFields() {
  return WORKFLOW_SECTIONS.flatMap((section) => section.fields || []);
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

function injectStyles(documentRef) {
  if (documentRef.getElementById(AI_WORKFLOW_TOOL_STYLE_ID)) {
    return;
  }

  const style = documentRef.createElement("style");
  style.id = AI_WORKFLOW_TOOL_STYLE_ID;
  style.textContent = `
.ai-workflow-tool {
  position: fixed;
  inset: 0;
  z-index: 10000;
  pointer-events: none;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #16211e;
}

.ai-workflow-tool * {
  box-sizing: border-box;
}

.ai-workflow-tool__toggle {
  position: fixed;
  right: 18px;
  bottom: 18px;
  width: 136px;
  min-height: 42px;
  border: 2px solid #1f403a;
  border-radius: 8px;
  background: #f4f0df;
  color: #1f302c;
  box-shadow: 0 8px 0 rgba(18, 28, 25, 0.22);
  cursor: pointer;
  font: 700 14px/1.1 inherit;
  letter-spacing: 0;
  pointer-events: auto;
}

.ai-workflow-tool__toggle:hover,
.ai-workflow-tool__toggle:focus-visible {
  background: #f8d56b;
  outline: 3px solid rgba(35, 118, 102, 0.28);
  outline-offset: 2px;
}

.ai-workflow-tool__backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(12, 18, 17, 0.72);
  pointer-events: auto;
}

.ai-workflow-tool__backdrop[hidden] {
  display: none;
}

.ai-workflow-tool__panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(980px, 96vw);
  max-height: min(92vh, 860px);
  overflow: hidden;
  border: 2px solid #19352f;
  border-radius: 8px;
  background: #faf8ef;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.38);
}

.ai-workflow-tool__header,
.ai-workflow-tool__footer {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #e8ead8;
  border-color: #c9c8ad;
}

.ai-workflow-tool__header {
  border-bottom: 1px solid #c9c8ad;
}

.ai-workflow-tool__footer {
  border-top: 1px solid #c9c8ad;
}

.ai-workflow-tool__title {
  margin: 0;
  font-size: 22px;
  line-height: 1.1;
  letter-spacing: 0;
}

.ai-workflow-tool__actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ai-workflow-tool__button {
  min-height: 34px;
  border: 1px solid #244a42;
  border-radius: 7px;
  background: #ffffff;
  color: #18322d;
  cursor: pointer;
  font: 700 13px/1 inherit;
  letter-spacing: 0;
  padding: 8px 12px;
}

.ai-workflow-tool__button:hover,
.ai-workflow-tool__button:focus-visible {
  background: #d8efe6;
  outline: 2px solid rgba(35, 118, 102, 0.24);
  outline-offset: 2px;
}

.ai-workflow-tool__button--primary {
  background: #1f6f60;
  color: #ffffff;
}

.ai-workflow-tool__button--primary:hover,
.ai-workflow-tool__button--primary:focus-visible {
  background: #175649;
}

.ai-workflow-tool__body {
  overflow: auto;
  padding: 16px;
}

.ai-workflow-tool__list {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ai-workflow-tool__section {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid #d7d0b8;
  border-radius: 8px;
  background: #ffffff;
}

.ai-workflow-tool__section h2 {
  margin: 0;
  font-size: 18px;
  line-height: 1.15;
  letter-spacing: 0;
}

.ai-workflow-tool__section p,
.ai-workflow-tool__field-label {
  margin: 0;
  font-size: 14px;
  line-height: 1.35;
}

.ai-workflow-tool__field {
  display: grid;
  gap: 6px;
}

.ai-workflow-tool__field-label {
  font-weight: 700;
}

.ai-workflow-tool__textarea {
  width: 100%;
  min-height: 74px;
  resize: vertical;
  border: 1px solid #bdb793;
  border-radius: 7px;
  background: #fffef8;
  color: #17211e;
  font: 500 14px/1.4 inherit;
  letter-spacing: 0;
  padding: 10px;
}

.ai-workflow-tool__textarea:focus {
  outline: 3px solid rgba(31, 111, 96, 0.22);
  border-color: #1f6f60;
}

.ai-workflow-tool__checklist {
  display: grid;
  gap: 8px;
}

.ai-workflow-tool__check {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 9px;
  align-items: start;
  font-size: 14px;
  line-height: 1.25;
}

.ai-workflow-tool__check input {
  width: 16px;
  height: 16px;
  margin: 1px 0 0;
  accent-color: #1f6f60;
}

.ai-workflow-tool__command {
  overflow: auto;
  margin: 0;
  padding: 10px;
  border: 1px solid #cec6a7;
  border-radius: 7px;
  background: #1d2724;
  color: #f4f0df;
  font: 700 13px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  white-space: pre-wrap;
}

.ai-workflow-tool__output-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 7px;
  flex: 1 1 auto;
  min-width: 0;
}

.ai-workflow-tool__output-label {
  font-size: 13px;
  font-weight: 800;
}

.ai-workflow-tool__output {
  min-height: 92px;
  max-height: 150px;
  resize: vertical;
}

.ai-workflow-tool__status {
  min-width: 110px;
  font-size: 13px;
  font-weight: 800;
  color: #1f6f60;
  text-align: right;
}

@media (max-width: 720px) {
  .ai-workflow-tool__backdrop {
    padding: 10px;
  }

  .ai-workflow-tool__panel {
    width: 100%;
    max-height: 94vh;
  }

  .ai-workflow-tool__header,
  .ai-workflow-tool__footer {
    align-items: stretch;
    flex-direction: column;
  }

  .ai-workflow-tool__actions {
    justify-content: stretch;
  }

  .ai-workflow-tool__button {
    flex: 1 1 0;
  }

  .ai-workflow-tool__toggle {
    right: 12px;
    bottom: 12px;
    width: 124px;
  }

  .ai-workflow-tool__status {
    min-width: 0;
    text-align: left;
  }
}
`;
  documentRef.head.append(style);
}

function formatValue(value) {
  const trimmed = String(value || "").trim();
  return trimmed || "(não informado)";
}

function formatCheck(checked, label) {
  return `${checked ? "[x]" : "[ ]"} ${label}`;
}

function buildPrompt(fieldElements, checkElements) {
  const lines = ["# Workflow de Trabalho com IA", ""];

  WORKFLOW_SECTIONS.forEach((section, sectionIndex) => {
    if (sectionIndex > 0) {
      lines.push("");
    }

    lines.push(`## ${section.title}`);

    if (section.body) {
      lines.push("", section.body);
    }

    (section.fields || []).forEach((field) => {
      const value = fieldElements.get(field.id)?.value || "";
      lines.push("", `**${field.label}**`, formatValue(value));
    });

    if (section.command) {
      lines.push("", "**Comando sugerido:**", "```bash", section.command, "```");
    }

    if (section.checks?.length) {
      lines.push("", "**Checklist:**");
      section.checks.forEach((check) => {
        lines.push(formatCheck(Boolean(checkElements.get(check.id)?.checked), check.label));
      });
    }
  });

  return lines.join("\n");
}

function createField(documentRef, field, fieldElements, onChange) {
  const wrapper = createElement(documentRef, "label", "ai-workflow-tool__field");
  const label = createElement(documentRef, "span", "ai-workflow-tool__field-label", field.label);
  const textarea = createElement(documentRef, "textarea", "ai-workflow-tool__textarea");
  textarea.placeholder = field.placeholder || "";
  textarea.rows = 3;
  textarea.dataset.workflowField = field.id;
  fieldElements.set(field.id, textarea);
  textarea.addEventListener("input", onChange);
  wrapper.append(label, textarea);
  return wrapper;
}

function createCheck(documentRef, check, checkElements, onChange) {
  const label = createElement(documentRef, "label", "ai-workflow-tool__check");
  const input = documentRef.createElement("input");
  const copy = createElement(documentRef, "span", "", check.label);
  input.type = "checkbox";
  input.dataset.workflowCheck = check.id;
  input.addEventListener("change", onChange);
  checkElements.set(check.id, input);
  label.append(input, copy);
  return label;
}

function createSection(documentRef, section, fieldElements, checkElements, onChange) {
  const item = createElement(documentRef, "li", "ai-workflow-tool__section");
  item.append(createElement(documentRef, "h2", "", section.title));

  if (section.body) {
    item.append(createElement(documentRef, "p", "", section.body));
  }

  (section.fields || []).forEach((field) => {
    item.append(createField(documentRef, field, fieldElements, onChange));
  });

  if (section.command) {
    const command = createElement(documentRef, "pre", "ai-workflow-tool__command");
    command.textContent = section.command;
    item.append(command);
  }

  if (section.checks?.length) {
    const checks = createElement(documentRef, "div", "ai-workflow-tool__checklist");
    section.checks.forEach((check) => {
      checks.append(createCheck(documentRef, check, checkElements, onChange));
    });
    item.append(checks);
  }

  return item;
}

export function installAiWorkflowPromptTool({
  documentRef = document,
  windowRef = window
} = {}) {
  if (!documentRef?.body || documentRef.getElementById("ai-workflow-prompt-tool")) {
    return null;
  }

  injectStyles(documentRef);

  const fieldElements = new Map();
  const checkElements = new Map();
  const root = createElement(documentRef, "div", "ai-workflow-tool");
  root.id = "ai-workflow-prompt-tool";

  const toggle = createElement(documentRef, "button", "ai-workflow-tool__toggle", "Workflow IA");
  toggle.type = "button";
  toggle.setAttribute("aria-haspopup", "dialog");
  toggle.setAttribute("aria-controls", "ai-workflow-prompt-modal");

  const backdrop = createElement(documentRef, "div", "ai-workflow-tool__backdrop");
  backdrop.id = "ai-workflow-prompt-modal";
  backdrop.hidden = true;
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");
  backdrop.setAttribute("aria-labelledby", "ai-workflow-prompt-title");

  const panel = createElement(documentRef, "section", "ai-workflow-tool__panel");
  const header = createElement(documentRef, "header", "ai-workflow-tool__header");
  const title = createElement(documentRef, "h1", "ai-workflow-tool__title", "Workflow de Trabalho com IA");
  title.id = "ai-workflow-prompt-title";
  const headerActions = createElement(documentRef, "div", "ai-workflow-tool__actions");
  const copyTopButton = createElement(documentRef, "button", "ai-workflow-tool__button ai-workflow-tool__button--primary", "Copiar texto");
  const closeButton = createElement(documentRef, "button", "ai-workflow-tool__button", "Fechar");
  copyTopButton.type = "button";
  closeButton.type = "button";
  headerActions.append(copyTopButton, closeButton);
  header.append(title, headerActions);

  const body = createElement(documentRef, "div", "ai-workflow-tool__body");
  const list = createElement(documentRef, "ol", "ai-workflow-tool__list");
  const output = createElement(documentRef, "textarea", "ai-workflow-tool__textarea ai-workflow-tool__output");
  const status = createElement(documentRef, "span", "ai-workflow-tool__status", "");

  function syncOutput() {
    output.value = buildPrompt(fieldElements, checkElements);
  }

  WORKFLOW_SECTIONS.forEach((section) => {
    list.append(createSection(documentRef, section, fieldElements, checkElements, syncOutput));
  });
  body.append(list);

  const footer = createElement(documentRef, "footer", "ai-workflow-tool__footer");
  const outputWrap = createElement(documentRef, "label", "ai-workflow-tool__output-wrap");
  const outputLabel = createElement(documentRef, "span", "ai-workflow-tool__output-label", "Texto gerado para copiar");
  output.readOnly = true;
  output.rows = 5;
  outputWrap.append(outputLabel, output);
  const copyBottomButton = createElement(documentRef, "button", "ai-workflow-tool__button ai-workflow-tool__button--primary", "Copiar");
  copyBottomButton.type = "button";
  footer.append(outputWrap, copyBottomButton, status);

  panel.append(header, body, footer);
  backdrop.append(panel);
  root.append(toggle, backdrop);
  documentRef.body.append(root);

  const firstField = fieldElements.get(getFields()[0]?.id);
  let statusClearTimeout = 0;

  function setStatus(message) {
    status.textContent = message;
    if (!message) {
      return;
    }
    windowRef.clearTimeout?.(statusClearTimeout);
    statusClearTimeout = windowRef.setTimeout?.(() => {
      status.textContent = "";
      statusClearTimeout = 0;
    }, 1800) || 0;
  }

  function openModal() {
    syncOutput();
    backdrop.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    firstField?.focus?.();
  }

  function closeModal() {
    backdrop.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus?.();
  }

  function copyPrompt() {
    syncOutput();
    output.focus?.();
    output.select?.();

    const text = output.value;
    const clipboard = windowRef.navigator?.clipboard;
    if (clipboard?.writeText) {
      clipboard.writeText(text).then(
        () => setStatus("Copiado."),
        () => setStatus("Texto selecionado.")
      );
      return;
    }

    setStatus("Texto selecionado.");
  }

  function containModalInput(event) {
    if (backdrop.hidden) {
      return;
    }

    event.stopImmediatePropagation?.();
    event.stopPropagation();

    if (event.code === "Escape") {
      event.preventDefault();
      closeModal();
    }
  }

  toggle.addEventListener("click", openModal);
  closeButton.addEventListener("click", closeModal);
  copyTopButton.addEventListener("click", copyPrompt);
  copyBottomButton.addEventListener("click", copyPrompt);
  backdrop.addEventListener("click", (event) => {
    event.stopPropagation();
    if (event.target === backdrop) {
      closeModal();
    }
  });
  backdrop.addEventListener("keydown", containModalInput, true);
  backdrop.addEventListener("keyup", containModalInput, true);
  windowRef.addEventListener?.("keydown", containModalInput, true);
  windowRef.addEventListener?.("keyup", containModalInput, true);

  syncOutput();
  toggle.setAttribute("aria-expanded", "false");

  return {
    close: closeModal,
    open: openModal,
    syncOutput
  };
}
