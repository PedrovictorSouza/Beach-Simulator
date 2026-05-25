# Task System Migration Plan

Este documento define o plano de migracao para substituir os sistemas atuais de
quest/progression por um unico **Task System**.

## Decisoes Fechadas

- O player-facing deve chamar tudo de **tasks**.
- O sistema novo substitui tanto `questIndex/STORY_QUESTS` quanto
  `createQuestSystem/SMALL_ISLAND_QUESTS`.
- Resetar progresso antigo e aceitavel.
- Field tasks atuais viram objetivos secundarios dentro de tasks principais.
- O HUD deve mostrar uma prioridade calculada entre objetivos principais e
  opcionais.
- O terminal da colonia permite rastrear objetivos opcionais e passa a ser peca
  central da progressao da colonia.
- Tasks podem ter multiplos objetivos visiveis.
- Story beats continuam existindo, mas devem usar uma API unica de progressao.
- O novo sistema deve guardar fatos permanentes do mundo.
- O final do capitulo atual continua sendo `Tell Chopper the Base Is Ready`.

## Objetivo Arquitetural

Criar uma unica fonte de verdade para:

- fatos permanentes do mundo;
- task principal ativa;
- objetivos obrigatorios;
- objetivos secundarios/opcionais;
- foco atual do HUD;
- tracking manual pelo terminal;
- unlocks;
- effects de dialogo/story beats;
- estado serializavel de save.

O novo fluxo alvo:

```txt
gameplay / dialogue / terminal
-> taskSystem.applyEvent(...)
-> facts, objectives e tasks mudam
-> taskSystem calcula foco ativo
-> HUD renderiza foco e objetivos visiveis
-> terminal renderiza arvore completa
-> save persiste taskSystem state
```

## Problema Atual

Hoje ha tres camadas concorrentes:

| Camada | Fonte | Papel atual | Problema |
| --- | --- | --- | --- |
| Quest formal | `app/quest/createQuestSystem.js`, `app/quest/questData.js` | cadeia linear com objectives e eventos | nao cobre todo o MVP real |
| Progressao legada | `story/progression.js`, `gameplayContent.js` | `questIndex`, flags e helpers | mistura fatos, quest, save e utilitarios |
| Field tasks/story beats | `app/story/storyBeatData.js` | checklist mais fiel ao MVP e dialogos | nao e runtime unico, depende de flags soltas |

O alvo e remover a concorrencia. `TaskSystem` passa a ser o dono da progressao.

## Modelo De Dominio

### Task

Uma task representa um bloco de progressao. Pode ser campanha principal,
objetivo de colonia, ou opcional.

Campos propostos:

```ts
type Task = {
  id: string;
  title: string;
  description?: string;
  kind: "main" | "colony" | "optional";
  status: "locked" | "available" | "active" | "completed";
  priority?: number;
  chapterId?: string;
  ownerId?: string;
  objectives: TaskObjective[];
  effects?: TaskEffect[];
  nextTaskId?: string | null;
};
```

Regras:

- `main` define o esqueleto do jogo.
- `colony` representa progresso ligado ao terminal.
- `optional` pode ser rastreado pelo player, mas nao trava a campanha.
- Uma task completa quando todos os objetivos `required` estao completos.

### Objective

Um objective e uma unidade visivel de progresso dentro de uma task.

Campos propostos:

```ts
type TaskObjective = {
  id: string;
  title: string;
  description?: string | ((state: TaskSystemState) => string);
  required: boolean;
  status?: "locked" | "visible" | "completed";
  progress?: {
    kind: "fact" | "counter" | "event" | "inventory" | "custom";
    factId?: string;
    counterId?: string;
    eventType?: string;
    targetId?: string;
    required?: number;
  };
};
```

Regras:

- Objectives required conduzem a task principal.
- Objectives opcionais vivem dentro do mesmo contexto narrativo.
- O HUD pode mostrar multiplos objectives, mas escolhe um foco principal.

### Fact

Facts sao fatos permanentes do mundo. Eles substituem gradualmente
`storyState.flags`.

Formato proposto:

```ts
type TaskFactValue = boolean | number | string | string[] | Record<string, unknown> | null;

type TaskFacts = Record<string, TaskFactValue>;
```

Padrao de nomes:

```txt
bot.hydro.awake
ability.hydroTool.unlocked
world.dryGrass.restoredCount
colony.terminal.unlocked
build.firstBase.completed
chapter.mvp.completed
```

Regras:

- Facts devem representar verdades persistentes.
- Counters tambem podem ser facts numericos quando forem estado de mundo.
- Facts nao devem carregar detalhes puramente visuais ou temporarios.

### Event

Events entram no Task System vindos de gameplay, story beat ou terminal.

```ts
type TaskEvent = {
  type: string;
  targetId?: string;
  amount?: number;
  source?: "gameplay" | "story" | "terminal" | "system";
  payload?: Record<string, unknown>;
};
```

Tipos iniciais:

- `move`
- `talk`
- `collect`
- `place`
- `build`
- `restore`
- `unlock`
- `inspect`
- `terminal-action`
- `story-beat-complete`

### Effect

Effects sao a saida padronizada para UI, unlocks e facts.

```ts
type TaskEffect = {
  type:
    | "set-fact"
    | "increment-fact"
    | "unlock"
    | "notice"
    | "track-task"
    | "open-terminal"
    | "open-pokedex"
    | "autosave";
  id?: string;
  value?: unknown;
  amount?: number;
  message?: string;
  payload?: Record<string, unknown>;
};
```

Regra: story beats, terminal e gameplay devem convergir para effects do Task
System, em vez de cada um mutar progresso de um jeito proprio.

## Estado Serializavel

Estado proposto:

```ts
type TaskSystemState = {
  version: 1;
  activeTaskId: string | null;
  trackedObjectiveIds: string[];
  completedTaskIds: string[];
  facts: TaskFacts;
  taskProgress: Record<string, {
    status: Task["status"];
    objectives: Record<string, {
      current?: number;
      completed?: boolean;
      visible?: boolean;
    }>;
  }>;
};
```

Como resetar progresso antigo e aceitavel, a primeira versao pode ignorar
migracao de saves antigos e iniciar estado novo quando `version !== 1`.

## Foco Do HUD

O HUD nao deve escolher lendo flags soltas. Ele deve pedir:

```ts
taskSystem.getActiveFocus()
```

Prioridade sugerida:

1. Objetivo required incompleto da task `main` ativa.
2. Objetivo required desbloqueado por story beat recente.
3. Objetivo manualmente rastreado pelo terminal.
4. Objetivo opcional recomendado pela task ativa.
5. Objetivo de colonia disponivel.

Retorno proposto:

```ts
type TaskFocus = {
  taskId: string;
  objectiveId: string;
  title: string;
  description: string;
  progressText?: string;
  required: boolean;
  source: "main" | "tracked" | "optional" | "colony";
};
```

## Terminal Da Colonia

O terminal deve ler do mesmo sistema:

```ts
taskSystem.getTerminalTaskTree()
```

Ele mostra:

- tasks principais;
- objectives completados e pendentes;
- objectives opcionais;
- progresso de colonia;
- acao para rastrear um objetivo opcional;
- acoes terminal-specific, como registrar relatorio ou emitir kit.

O terminal nao deve manter uma lista paralela de tasks.

## Story Beats

Story beats continuam sendo o lugar de dialogo e ritmo narrativo, mas devem
parar de escrever diretamente em varios sistemas.

Alvo:

```txt
storyBeats.playDialogue(...)
-> taskSystem.applyEffects(beat.effects)
-> facts/unlocks/notices/task progress
```

Na migracao, `STORY_BEAT_EFFECT.SET_FLAG` pode virar:

```txt
TASK_EFFECT.SET_FACT
```

`STORY_BEAT_EFFECT.QUEST_EVENT` vira:

```txt
taskSystem.applyEvent(...)
```

## Mapa Inicial Das Tasks Principais

As 11 quests formais atuais viram tasks principais. Os nomes podem ser
ajustados depois, mas os ids iniciais devem ser estaveis.

| Ordem | Task id | Objetivo principal |
| --- | --- | --- |
| 1 | `learn-to-move` | Confirmar controle depois do crash |
| 2 | `wake-guide` | Falar com Chopper |
| 3 | `wake-hydro` | Acordar Hydro Bot |
| 4 | `restore-first-patch` | Restaurar o primeiro terreno |
| 5 | `restore-dry-grass` | Restaurar terreno suficiente para abrir a rota |
| 6 | `meet-grow` | Falar com Grow Bot |
| 7 | `grow-first-habitat` | Criar o primeiro patch vivo |
| 8 | `clear-white-ground` | Usar Thermal para limpar terreno |
| 9 | `unlock-colony-terminal` | Ativar o terminal da colonia |
| 10 | `build-first-base` | Construir a primeira base |
| 11 | `report-base-ready` | Falar com Chopper e fechar o capitulo |

## Field Tasks Como Objectives Secundarios

As field tasks atuais nao somem como conteudo. Elas deixam de ser sistema
paralelo e entram como objectives opcionais ou secundarios dentro das tasks
principais.

Mapeamento inicial:

| Field task atual | Destino no Task System |
| --- | --- |
| `making-habitats` | objective opcional recorrente em tasks de colonia |
| `bulbasaur-dry-grass-request` | objective secundario em `meet-grow` |
| `revive-leppa-tree` | optional em `restore-dry-grass` |
| `water-dry-tall-grass` | required/secondary em `restore-dry-grass` |
| `bulbasaur-leafage-reward` | required em `meet-grow` |
| `bulbasaur-green-corner-play-seed` | optional em `grow-first-habitat` |
| `give-leppa-berry` | optional em `restore-dry-grass` ou `meet-grow` |
| `tangrowth-log-chair` | optional/colony em etapa inicial |
| `build-greenhouse` | colony objective pos-terminal |
| `workbench-campfire` | required ou secondary antes de `clear-white-ground` |
| `spit-out-campfire` | required em `clear-white-ground` |
| `charmander-tall-grass` | secondary em Thermal/Grow branch |
| `ruined-pokemon-center` | required em `unlock-colony-terminal` |
| `boulder-shaded-tall-grass` | colony optional pos-terminal |
| `bulbasaur-straw-bed` | colony optional |
| `straw-bed-recipe` | colony/build optional |
| `new-challenges-in-pc` | terminal optional |
| `leaf-den-kit` | colony/build objective |
| `build-leaf-den` | colony/build objective |
| `leaf-den-furniture` | colony optional |
| `charmander-celebration` | optional narrative objective |
| `ditto-flag-house` | optional completion flourish |

## APIs Iniciais

Modulo alvo:

```txt
app/tasks/
  taskData.js
  createTaskSystem.js
  taskSelectors.js
```

API minima:

```ts
createTaskSystem({
  tasks,
  initialState,
  onChange
})
```

Metodos:

```ts
taskSystem.applyEvent(event)
taskSystem.applyEffects(effects, context)
taskSystem.getState()
taskSystem.getFacts()
taskSystem.getTask(taskId)
taskSystem.getActiveTask()
taskSystem.getActiveFocus()
taskSystem.getVisibleObjectives(taskId)
taskSystem.getTerminalTaskTree()
taskSystem.trackObjective(objectiveId)
taskSystem.untrackObjective(objectiveId)
taskSystem.reset()
```

## Ordem De Migracao Segura

### Fase 1: contrato e dados sem runtime

- Criar `docs/task-system-migration-plan.md`.
- Criar `app/tasks/taskData.js` com tasks principais e objectives.
- Criar testes de integridade de dados.
- Nao tocar `gameLoop.js`.

### Fase 2: runtime isolado

- Criar `createTaskSystem`.
- Criar testes para event/effect/fact/focus.
- Garantir serializacao simples.
- Ainda nao substituir UI.

### Fase 3: adaptador temporario

- Criar adapter que traduz estado novo para formatos que HUD atual espera.
- Fazer HUD ler `getActiveFocus`.
- Fazer terminal ler `getTerminalTaskTree`.
- Manter chamadas antigas vivas enquanto compara saida.

### Fase 4: story beats via API unica

- Trocar effects de story beats para `taskSystem.applyEffects`.
- Remover writes duplicados quando houver fact equivalente.
- Manter flags antigas somente se alguma feature ainda depender delas.

### Fase 5: gameplay events

- Trocar `questSystem.emit` por `taskSystem.applyEvent`.
- Trocar `getActiveSystemQuest` por `getActiveTask`/`getActiveFocus`.
- Migrar coleta, unlock, build, restore e talk.

### Fase 6: remover sistemas antigos

- Remover `createQuestSystem` do boot.
- Remover uso runtime de `storyState.questIndex`.
- Remover `SMALL_ISLAND_FIELD_TASKS` como runtime paralelo.
- Manter ou apagar arquivos antigos conforme testes indicarem.

## Limites Do Primeiro PR De Codigo

O primeiro PR de codigo nao deve remover sistemas antigos. Ele deve fazer
apenas:

- `app/tasks/taskData.js`;
- `tests/taskData.test.js`;
- talvez `app/tasks/taskSchemas.js` se a validacao pedir.

Validacao:

```txt
npm run test -- tests/taskData.test.js
npm run build
```

## Riscos

- `questIndex` aparece em muitos testes de gameplay interactions.
- `storyState.flags` ainda carrega fatos de mundo e fatos de UI.
- O terminal hoje junta quest log formal e field tasks.
- Save DTO ainda conhece `questIndex`.
- `gameLoop.js` consulta quest formal e legada.

## Regra De Parada

Se a migracao exigir editar `gameLoop.js`, `createApplicationRuntime.js` e UI
ao mesmo tempo, parar e reduzir o corte. A ordem correta e dados, runtime puro,
adapter, UI, gameplay, remocao.
