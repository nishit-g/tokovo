# Turbo Plugin Generator - Best-in-Class Scaffolding for Tokovo Apps

## Context

### Original Request

Build a best-in-class Turbo Generator for creating Tokovo App Plugins with full scaffolding, auto-registration, test generation, and example episodes.

### Interview Summary

**Key Discussions**:

- Plugin type: App Plugins only (like WhatsApp, Notes, Instagram)
- Default tiers: Full Stack (Tier A + B + C) - complete plugin with DSL
- UI template: Notes-style app with 3 views (List, Detail, Editor)
- Generator tech: Turbo Gen with Handlebars templates
- Test framework: Vitest
- DSL pattern: Fluent chain (b.use('app_X').action().action())
- Extra features: Auto-register in core, generate tests, generate example episode

**Research Findings**:

- Current state: No existing plugin generator infrastructure (greenfield)
- Plugin contract: `TokovoPluginContract<AppId>` defined in `@tokovo/core/src/types/plugin-contract.ts`
- Reference implementation: `@tokovo/apps-whatsapp` with complete tiered structure
- Turbo Gen: Built on Plop.js, supports add/addMany/append actions, TypeScript config
- Auto-discovery: Generators in `turbo/generators/` are auto-discovered by Turborepo

### Metis Review

**Identified Gaps** (addressed in plan):

- Package naming convention: Use `@tokovo/apps-{name}` pattern (consistent with apps-whatsapp)
- Plugin ID convention: Use `app_{name}` pattern (e.g., `app_notes`, `app_instagram`)
- PluginManager registration: Plugins export `registerXxxPlugin()` function, NOT auto-registered in core
- Test location pattern: `src/__tests__/` within plugin package (no existing tests in WhatsApp to reference)
- Episode location: `packages/episodes/src/production/` (verified directory structure)

---

## Turbo Gen API Reference

**CRITICAL**: This section documents the exact Turbo Gen API for implementation.

### Installation

```bash
pnpm add -D @turbo/gen  # Install at repo root
```

### Config File Structure (`turbo/generators/config.ts`)

```typescript
import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("plugin", {
    description: "Create a new Tokovo App Plugin",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Plugin name (lowercase, no spaces):",
        validate: (input: string) => {
          if (!input) return "Name is required";
          if (/[A-Z]/.test(input)) return "Must be lowercase";
          if (/\s/.test(input)) return "No spaces allowed";
          if (!/^[a-z][a-z0-9-]*$/.test(input)) return "Invalid package name";
          return true;
        },
      },
      // ... more prompts
    ],
    actions: [
      {
        type: "addMany",
        destination: "{{ turbo.paths.root }}/packages/apps-{{ name }}",
        base: "templates/plugin",
        templateFiles: "templates/plugin/**",
      },
      {
        type: "append",
        path: "{{ turbo.paths.root }}/path/to/file.ts",
        pattern: /(?<insertion>\/\/ PLUGIN_IMPORTS)/,
        template:
          'import { register{{ pascalCase name }}Plugin } from "@tokovo/apps-{{ name }}";',
      },
    ],
  });
}
```

### Handlebars Helpers Available

- `{{ pascalCase name }}` → `MyPlugin`
- `{{ camelCase name }}` → `myPlugin`
- `{{ kebabCase name }}` → `my-plugin`
- `{{ snakeCase name }}` → `my_plugin`
- `{{ constantCase name }}` → `MY_PLUGIN` (UPPERCASE_SNAKE for constants)
- `{{ turbo.paths.root }}` → Repo root path

### Action Types

1. **`add`**: Create single file from template
2. **`addMany`**: Create multiple files from template directory
3. **`append`**: Add content to existing file at regex pattern
4. **Custom function**: Run arbitrary code

### Template File Naming Convention (CRITICAL)

**Turbo Gen strips `.hbs` suffix and preserves everything before it:**

| Template File Name     | Generated File     |
| ---------------------- | ------------------ |
| `package.json.hbs`     | `package.json`     |
| `tsconfig.json.hbs`    | `tsconfig.json`    |
| `vitest.config.ts.hbs` | `vitest.config.ts` |
| `index.ts.hbs`         | `index.ts`         |
| `index.tsx.hbs`        | `index.tsx`        |
| `reducer.test.ts.hbs`  | `reducer.test.ts`  |

**Pattern**: `{filename}.{ext}.hbs` → `{filename}.{ext}`

---

## Plugin Registration Pattern

**CRITICAL RESEARCH FINDING**: Plugins are registered in **APPLICATION code** (like `video-runner/src/Root.tsx`), NOT in episodes.

### How Plugin Registration Actually Works (VERIFIED)

**Investigation Findings** (from grep search):

- `registerWhatsAppPlugin()` is called in `apps/video-runner/src/Root.tsx:28` (app entry point)
- `registerWhatsAppPlugin()` is called in `packages/studio/src/pages/TimelineDemo.tsx:8` (studio app)
- Episodes do NOT call registration functions - they only use DSL APIs

**Plugin Lifecycle**:

1. App entry point (e.g., `video-runner/Root.tsx`) imports and calls `registerWhatsAppPlugin()`
2. This calls `PluginManager.register(WhatsAppPluginV2)` internally
3. After registration, the plugin's reducer, views, and DSL are available
4. Episodes can then use `b.use("app_whatsapp")` without calling registration

**Generator Implementation Decision**:

- Generated plugin DOES export `registerXxxPlugin()` function (matches WhatsApp pattern)
- Example episode does NOT need to call registration (apps handle this)
- Documentation will explain that apps must register plugins at startup

### Pattern from WhatsApp (`packages/apps-whatsapp/src/plugin.ts:179-189`)

```typescript
import { PluginManager } from "@tokovo/core";

let _registered = false;

export function register{{ pascalCase name }}Plugin(): void {
  if (_registered) return;  // Guard prevents duplicate registration
  _registered = true;
  PluginManager.register({{ pascalCase name }}Plugin);
}
```

### How Apps Register Plugins (`apps/video-runner/src/Root.tsx`)

```typescript
// App entry point - NOT in episodes
import { registerWhatsAppPlugin } from "@tokovo/apps-whatsapp";
import { register{{ pascalCase name }}Plugin } from "@tokovo/apps-{{ name }}";

// Register all plugins at app startup
registerWhatsAppPlugin();
register{{ pascalCase name }}Plugin();
```

### Episodes Use DSL Without Registration

```typescript
// Episodes DON'T call registration - just use DSL
import { createEpisode, beat } from "@tokovo/episodes";

export const myEpisode = createEpisode({
  script: () => {
    beat("intro", (b) => {
      b.use("app_{{ name }}") // DSL available because app registered plugin
        .createNote({ title: "Hello", content: "World" });
    });
  },
});
```

---

## UI Routing Pattern

**CRITICAL**: Notes plugin uses the same `currentScreen` **mechanism** as WhatsApp, but with **different screen names**.

### WhatsApp Pattern (for reference only)

WhatsApp uses: `currentScreen?: "main" | "chat" | "chats" | "profile"` with default `"chat"`

### Notes Plugin Pattern (NEW - not copying WhatsApp screens)

Notes uses: `currentScreen: "list" | "detail" | "editor"` with default `"list"`

**Key Difference**: We use the same routing MECHANISM (switch on currentScreen), but Notes has its own screen names appropriate for a notes app.

```typescript
// Notes AppRoot component - uses switch pattern like WhatsApp
const currentScreen = appState.currentScreen || "list";

switch (currentScreen) {
  case "list":
    return <NotesList />;
  case "detail":
    return <NoteDetail />;
  case "editor":
    return <NoteEditor />;
  default:
    return <NotesList />;
}
```

### Notes State Structure

**Why Notes is different from WhatsApp**:

- WhatsApp has BOTH `screen` and `currentScreen` (legacy compatibility - `screen` was original, `currentScreen` added later with stricter typing)
- For new plugins, use ONLY `currentScreen` (no legacy baggage)
- This is a **simplification decision**, not a criticism of WhatsApp's pattern

```typescript
interface NoteState {
  notes: Note[];
  currentScreen: "list" | "detail" | "editor"; // Single source of truth for routing (no `screen` field)
  activeNoteId: string | null;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}
```

### Initial State Function (REQUIRED)

```typescript
export function create{{ pascalCase name }}InitialState(): NoteState {
  return {
    notes: [],
    currentScreen: "list",  // Default to list view
    activeNoteId: null,
  };
}
```

---

## Plugin Architecture Pipeline (CRITICAL - How Components Integrate)

**This section explains HOW the plugin pieces connect. The generator creates files for each layer.**

### The Full Execution Pipeline

```
Episode DSL Call → TrackEvent → Lowering Handler → RuntimeEvent[] → Reducer → WorldState
```

**Step-by-Step Flow**:

1. **Episode uses DSL** (user code):

   ```typescript
   b.use("app_notes").createNote({ title: "Hello", content: "World" });
   ```

2. **DSL Extension pushes operation** (generated `dsl/index.ts`):

   ```typescript
   // Inside createNote method
   builder.ops.push({
     kind: "CreateNote",
     title,
     content,
     id: generateNoteId(),
   });
   ```

3. **Episode build phase** creates TrackEvents from ops (handled by core):

   ```typescript
   // TrackEvent with kind: "CreateNote", type: "CREATE_NOTE"
   { at: 1.0, appId: "app_notes", kind: "CreateNote", payload: { title, content, id } }
   ```

4. **Lowering handler transforms** TrackEvent → RuntimeEvent[] (generated `lowering/index.ts`):

   ```typescript
   // Lowering receives TrackEvent, returns RuntimeEvent array
   lower(event) → [{ at: 1.0, type: "ADD_NOTE", kind: "APP", appId: "app_notes", ... }]
   ```

5. **Reducer processes RuntimeEvents** (generated `runtime/reducer.ts`):

   ```typescript
   // Reducer receives RuntimeEvent, mutates WorldState via Immer
   if (event.type === "ADD_NOTE") {
     state.notes.push({ id: event.noteId, title: event.title, ... });
   }
   ```

6. **UI renders from WorldState** (generated `ui/index.tsx`):
   ```typescript
   // Views read from world.appState["app_notes"]
   const appState = world.appState?.["app_notes"] as NoteState;
   ```

### Why Lowering Exists

- **DSL describes USER INTENT**: "Create a note" (semantic action)
- **Runtime describes STATE CHANGES**: "Add note to array" (mutation)
- **One-to-Many Mapping**: One DSL operation can produce multiple state changes
  - Example: `viewNote(id)` → `SET_ACTIVE_NOTE` + `SET_SCREEN` (two events)

### Event Naming Transformation

| Layer             | Convention      | Example            | Location                                   |
| ----------------- | --------------- | ------------------ | ------------------------------------------ |
| DSL Operation     | PascalCase      | `CreateNote`       | `builder.ops.push({ kind: "CreateNote" })` |
| TrackEvent type   | UPPERCASE_SNAKE | `CREATE_NOTE`      | Automatic from kind                        |
| RuntimeEvent type | UPPERCASE_SNAKE | `ADD_NOTE`         | Lowering output                            |
| Reducer cases     | UPPERCASE_SNAKE | `case "ADD_NOTE":` | Reducer switch                             |

### Layout Strategy Purpose

**What Layout Does**: Computes UI measurements SEPARATE from state.

**Why Separate**: Enables:

- Smooth animations (elements sliding in)
- Scroll position calculations
- Dynamic sizing based on content

**WhatsApp Example**: Chat bubbles need Y-positions calculated based on message heights. The layout strategy computes these positions at each frame.

**Notes MVP**: Returns empty objects because a simple list doesn't need complex layout math. Expand later for:

- Note card grid positioning
- Masonry layout calculations
- Smooth list transitions

**When Layout Runs**: Computed by renderer at frame-time using `computeLayout(ctx)`, NOT stored in WorldState.

---

## DSL Implementation Pattern

**CRITICAL**: DSL uses `DslExtension` type with `createApi` function.

### Builder Interface (REQUIRED for DSL)

The DSL builder interface defines what operations can be recorded. Based on `packages/apps-whatsapp/src/dsl/extension.ts:52-56`:

```typescript
// Define the Builder interface for your plugin
interface {{ pascalCase name }}Builder {
  ops: { kind: string; [key: string]: unknown }[];  // Operation queue
  wait: (duration: number) => void;                  // Wait helper
}

// Utility function for generating unique IDs (include in template)
function generateNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

### DSL Extension Template

Reference: `packages/apps-whatsapp/src/dsl/extension.ts`

```typescript
import type { DslExtension } from "@tokovo/core";

// Method Chaining Design Decision (INTENTIONAL IMPROVEMENT over WhatsApp):
//
// Generated plugins use method chaining (methods return Api type) to enable fluent syntax:
//   b.use("app_notes").createNote({ title: "A" }).viewNote("1").editNote("1", { content: "B" });
//
// WhatsApp's DSL methods return void (no chaining). We intentionally improved this for
// better developer experience. Each method pushes an operation and returns the api.

interface {{ pascalCase name }}DslApi {
  createNote: (data: { title: string; content: string }) => {{ pascalCase name }}DslApi;
  viewNote: (noteId: string) => {{ pascalCase name }}DslApi;
  editNote: (noteId: string, data: { title?: string; content?: string }) => {{ pascalCase name }}DslApi;
  deleteNote: (noteId: string) => {{ pascalCase name }}DslApi;
}

// Builder interface for recording operations
interface {{ pascalCase name }}Builder {
  ops: { kind: string; [key: string]: unknown }[];
  wait: (duration: number) => void;
}

// Utility for generating unique note IDs
function generateNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const {{ camelCase name }}Dsl: DslExtension<{{ pascalCase name }}DslApi> = {
  createApi: (builderUnknown) => {
    const builder = builderUnknown as {{ pascalCase name }}Builder;

    const api: {{ pascalCase name }}DslApi = {
      createNote: (data) => {
        builder.ops.push({
          kind: "CreateNote",
          ...data,
          id: generateNoteId()  // Uses local utility, not imported
        });
        return api;  // Enable chaining
      },
      viewNote: (noteId) => {
        builder.ops.push({ kind: "ViewNote", noteId });
        return api;
      },
      editNote: (noteId, data) => {
        builder.ops.push({ kind: "EditNote", noteId, ...data });
        return api;
      },
      deleteNote: (noteId) => {
        builder.ops.push({ kind: "DeleteNote", noteId });
        return api;
      },
    };

    return api;
  }
};
```

### Template Variable Naming Convention

| Context           | Case                   | Example                                                       |
| ----------------- | ---------------------- | ------------------------------------------------------------- |
| Types/Interfaces  | PascalCase             | `{{ pascalCase name }}DslApi`, `{{ pascalCase name }}Builder` |
| Variables/Exports | camelCase              | `{{ camelCase name }}Dsl`, `{{ camelCase name }}Reducer`      |
| Plugin ID         | snake_case with prefix | `app_{{ name }}`                                              |
| Package name      | kebab-case             | `@tokovo/apps-{{ name }}`                                     |

### Key Points

- Returns `api` object from each method to enable fluent chaining
- Uses `builder.ops.push()` to record operations
- `generateNoteId()` is a LOCAL utility function defined in the DSL file (not imported)
- Operations are later processed by lowering handlers

---

## Work Objectives

### Core Objective

Create a production-quality Turbo Generator that scaffolds complete Tokovo App Plugins with a single command, including full tier support (A+B+C), UI components, tests, and example episodes.

### Concrete Deliverables

1. `turbo/generators/config.ts` - Generator configuration with interactive prompts
2. `turbo/generators/templates/plugin/` - Complete plugin package templates
3. Registration function export (episodes call `registerXxxPlugin()` - NOT auto-registered in core)
4. Vitest test file templates
5. Example episode template using generated plugin's DSL

### Definition of Done

- [x] `turbo gen plugin` runs successfully with interactive prompts
- [x] Generated plugin follows `@tokovo/apps-{name}` naming convention
- [x] Generated plugin implements full `TokovoPluginContract` (Tier A+B+C)
- [x] Generated UI has 3 views: List, Detail, Editor (Notes-style)
- [x] Generated tests pass with `pnpm test --filter=@tokovo/apps-{name}`
- [x] Example episode compiles and renders the plugin
- [x] Plugin exports `registerXxxPlugin()` function (called by episodes, not auto-registered)
- [x] `pnpm build` succeeds after generation

### Must Have

- Interactive prompts for plugin name, display name, description
- Input validation (valid package names, no conflicts)
- Full Tier A (runtime, views) + Tier B (lowering, layout) + Tier C (DSL) scaffolding
- Notes-style UI template (List/Detail/Editor views)
- Vitest test files for reducer and selectors
- Example episode file
- Registration function export (`registerXxxPlugin()`)

### Must NOT Have (Guardrails)

- ❌ Multiple UI templates (only Notes-style for MVP)
- ❌ Device plugin support (app plugins only)
- ❌ Storybook stories generation
- ❌ Migration/replacement of existing create-plugin script
- ❌ Complex component library (keep UI minimal and functional)
- ❌ Over-engineered state (simple notes state: id, title, content, timestamps)
- ❌ External API calls in generated code

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES (Vitest configured in monorepo)
- **User wants tests**: YES (TDD for generator logic, tests for generated code)
- **Framework**: Vitest

### Verification Approach

1. **Generator tests**: Verify prompts, actions, and output files
2. **Generated code tests**: Verify reducer, components compile and pass
3. **Integration test**: Full flow from `turbo gen plugin` to working episode

---

## Task Flow

```
1. Setup → 2. Config → 3. Templates (parallel: 4,5,6,7) → 8. Auto-register → 9. Tests → 10. Episode → 11. Docs → 12. Verify
```

## Parallelization

| Group | Tasks      | Reason                      |
| ----- | ---------- | --------------------------- |
| A     | 4, 5, 6, 7 | Independent template files  |
| B     | 9, 10      | Independent after templates |

| Task | Depends On | Reason                                 |
| ---- | ---------- | -------------------------------------- |
| 2    | 1          | Config needs directory structure       |
| 3    | 2          | Prompts need config file               |
| 4-7  | 3          | Templates need config defined          |
| 8    | 4-7        | Auto-register needs plugin.ts template |
| 9-10 | 4-7        | Tests/episodes need templates          |
| 11   | 8-10       | Docs after all features                |
| 12   | 11         | Verification last                      |

---

## TODOs

- [x] 1. Setup Turbo Generators Directory Structure

  **What to do**:
  - Create `turbo/generators/` directory at repo root
  - Create `turbo/generators/templates/plugin/` directory for templates
  - Create `turbo/generators/templates/episode/` directory for episode template
  - Install `@turbo/gen` as dev dependency at repo root: `pnpm add -D @turbo/gen`

  **Installation Command**:

  ```bash
  pnpm add -D @turbo/gen
  mkdir -p turbo/generators/templates/plugin
  mkdir -p turbo/generators/templates/episode
  ```

  **Note**: The `turbo gen` command is provided by the `@turbo/gen` package. After installation, Turborepo will automatically discover generators in `turbo/generators/`.

  **Must NOT do**:
  - Don't modify root package.json scripts (leave existing `create-plugin` script as-is, even if it references a non-existent path)

  **Parallelizable**: NO (first task)

  **References**:
  - `turbo.json` - Existing Turborepo configuration
  - All template paths in actions are relative to `turbo/generators/` directory

  **Acceptance Criteria**:
  - [ ] Directory exists: `turbo/generators/`
  - [ ] Directory exists: `turbo/generators/templates/plugin/`
  - [ ] Directory exists: `turbo/generators/templates/episode/`
  - [ ] `@turbo/gen` installed: `pnpm ls @turbo/gen` shows package
  - [ ] `turbo gen` command works (may show empty list initially)
  - [ ] `pnpm build` still succeeds

  **Commit**: YES
  - Message: `feat(generators): setup turbo generators directory structure`
  - Files: `turbo/generators/`, `pnpm-lock.yaml`, `package.json`

---

- [x] 2. Create Generator Configuration File

  **What to do**:
  - Create `turbo/generators/config.ts` with TypeScript
  - Define `plugin` generator with description
  - Export using PlopTypes from `@turbo/gen`
  - Setup basic structure (prompts array, actions array)

  **Exact File Structure** (see "Turbo Gen API Reference" section for full details):

  ```typescript
  import type { PlopTypes } from "@turbo/gen";

  export default function generator(plop: PlopTypes.NodePlopAPI): void {
    plop.setGenerator("plugin", {
      description: "Create a new Tokovo App Plugin",
      prompts: [], // Will be added in Task 3
      actions: [], // Will be added in Task 8
    });
  }
  ```

  **Must NOT do**:
  - Don't add prompts yet (next task)
  - Don't add actions yet (after templates)

  **Parallelizable**: NO (depends on 1)

  **References**:
  - See "Turbo Gen API Reference" section in this plan for complete API documentation
  - `packages/apps-whatsapp/package.json` - Reference package structure

  **Acceptance Criteria**:
  - [ ] File exists: `turbo/generators/config.ts`
  - [ ] Exports default function with `PlopTypes.NodePlopAPI` parameter
  - [ ] Calls `plop.setGenerator("plugin", {...})`
  - [ ] `turbo gen` shows "plugin" generator in list
  - [ ] TypeScript compiles without errors

  **Commit**: YES
  - Message: `feat(generators): add plugin generator config skeleton`
  - Files: `turbo/generators/config.ts`

---

- [x] 3. Implement Interactive Prompts with Validation

  **What to do**:
  - Add prompts for: `name` (package name), `displayName`, `description`
  - Implement validation:
    - `name`: lowercase, no spaces, valid npm package name, no existing package conflict
    - `displayName`: non-empty, proper capitalization hint
    - `description`: non-empty
  - Add computed values: `pluginId` (app\_{name}), `packageName` (@tokovo/apps-{name})

  **Computed Variables Implementation** (CRITICAL - how derived values become template variables):

  **Template Variable Injection - TWO TYPES**:
  1. **Automatic (From Prompts)** - NO configuration needed:
     - User prompt answers are automatically available in templates
     - `{{ name }}`, `{{ displayName }}`, `{{ description }}`

  2. **Manual (Computed Values)** - Requires explicit data object:
     - Derived values must be computed and passed explicitly
     - `pluginId`, `packageName` are computed from `name`

  **COMPLETE Turbo Gen Implementation Pattern** (exact syntax):

  ```typescript
  // turbo/generators/config.ts - FULL IMPLEMENTATION
  import type { PlopTypes } from "@turbo/gen";

  export default function generator(plop: PlopTypes.NodePlopAPI): void {
    plop.setGenerator("plugin", {
      description: "Create a new Tokovo app plugin",

      // Step 1: Prompts collect user input
      prompts: [
        {
          type: "input",
          name: "name",
          message: "Plugin name (lowercase, no spaces):",
          validate: (input) =>
            /^[a-z][a-z0-9-]*$/.test(input) ||
            "Must be lowercase with hyphens only",
        },
        {
          type: "input",
          name: "displayName",
          message: "Display name (e.g., 'Notes'):",
          validate: (input) => input.length > 0 || "Required",
        },
        {
          type: "input",
          name: "description",
          message: "Description:",
        },
      ],

      // Step 2: Actions function receives answers, returns action array
      // CRITICAL: This is a FUNCTION, not an array - allows computing derived values
      actions: (answers) => {
        // Compute derived values from user inputs
        const data = {
          ...answers, // Spread all prompt answers
          pluginId: `app_${answers.name}`, // e.g., "app_notes"
          packageName: `@tokovo/apps-${answers.name}`, // e.g., "@tokovo/apps-notes"
        };

        return [
          {
            type: "addMany",
            destination: "{{ turbo.paths.root }}/packages/apps-{{ name }}",
            base: "templates/plugin",
            templateFiles: "templates/plugin/**/*.hbs",
            data: data, // <-- Pass computed data object here
          },
          {
            type: "add",
            path: "{{ turbo.paths.root }}/packages/episodes/src/production/example-{{ name }}.episode.ts",
            templateFile: "templates/episode/example.episode.ts.hbs",
            data: data, // <-- Same data object for episode template
          },
        ];
      },
    });
  }
  ```

  **Key Points**:
  - `actions` is a FUNCTION `(answers) => Action[]`, NOT a static array
  - `data` property on each action passes variables to that action's templates
  - All prompt answers are in `answers` object (answers.name, answers.displayName, etc.)
  - Handlebars helpers like `{{ pascalCase name }}` work automatically

  **Available in Templates after this:**
  - `{{ name }}` → "notes" (raw input)
  - `{{ displayName }}` → "Notes" (raw input)
  - `{{ description }}` → "A notes app" (raw input)
  - `{{ pluginId }}` → "app_notes" (computed)
  - `{{ packageName }}` → "@tokovo/apps-notes" (computed)
  - `{{ pascalCase name }}` → "Notes" (Handlebars helper)
  - `{{ camelCase name }}` → "notes" (Handlebars helper)

  **Must NOT do**:
  - Don't add tier selection prompts (always Full Stack for MVP)
  - Don't add UI template selection (always Notes-style for MVP)

  **Parallelizable**: NO (depends on 2)

  **References**:
  - Research: Inquirer.js prompt types (input, list, confirm)
  - `packages/apps-whatsapp/package.json` - name: `@tokovo/apps-whatsapp`
  - `packages/apps-whatsapp/src/plugin.ts` - id: `app_whatsapp`

  **Acceptance Criteria**:
  - [ ] `turbo gen plugin` prompts for name, displayName, description
  - [ ] Invalid name (spaces, uppercase) shows validation error
  - [ ] Empty displayName shows validation error
  - [ ] Computed `pluginId` follows `app_{name}` pattern
  - [ ] Computed `packageName` follows `@tokovo/apps-{name}` pattern

  **Commit**: YES
  - Message: `feat(generators): add interactive prompts with validation`
  - Files: `turbo/generators/config.ts`

---

- [x] 4. Create Package Configuration Templates

  **What to do**:
  - Create `templates/plugin/package.json.hbs`:
    - name: `@tokovo/apps-{{name}}`
    - version: `0.0.0`
    - dependencies: `@tokovo/core`
    - devDependencies: `vitest` (for tests)
    - exports, main, types fields
  - Create `templates/plugin/tsconfig.json.hbs`:
    - extends: `../../tsconfig.base.json` (matching WhatsApp's actual pattern)
    - include/exclude patterns
  - Create `templates/plugin/vitest.config.ts.hbs`:
    - Reference pattern from `packages/device-camera/vitest.config.ts`

  **Package.json Template** (matches WhatsApp - NO exports field):

  ```json
  {
    "name": "@tokovo/apps-{{ name }}",
    "version": "0.0.0",
    "main": "./src/index.ts",
    "types": "./src/index.ts",
    "dependencies": {
      "@tokovo/core": "workspace:*"
    },
    "devDependencies": {
      "vitest": "^1.0.0"
    },
    "scripts": {
      "test": "vitest run",
      "test:watch": "vitest"
    }
  }
  ```

  **Note**: WhatsApp doesn't use `exports` field - we match that pattern exactly for consistency.

  **TSConfig Template** (matches WhatsApp's actual pattern EXACTLY):

  ```json
  {
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
      "outDir": "dist",
      "rootDir": "src",
      "jsx": "react-jsx"
    },
    "include": ["src/**/*"]
  }
  ```

  **Note**: WhatsApp uses `"extends": "../../tsconfig.base.json"`, NOT a shared config package. The `jsx: "react-jsx"` is REQUIRED for React components.

  **Must NOT do**:
  - Don't add build scripts (handled by turbo pipeline)
  - Don't add complex bundler config
  - Don't reference non-existent `@tokovo/typescript-config` package

  **Parallelizable**: YES (with 5, 6, 7)

  **References**:
  - `packages/apps-whatsapp/package.json` - Reference structure
  - `packages/apps-whatsapp/tsconfig.json` - Extends `../../tsconfig.base.json`
  - `packages/device-camera/vitest.config.ts` - Vitest config pattern

  **Acceptance Criteria**:
  - [ ] Template file: `turbo/generators/templates/plugin/package.json.hbs`
  - [ ] Template file: `turbo/generators/templates/plugin/tsconfig.json.hbs`
  - [ ] Template file: `turbo/generators/templates/plugin/vitest.config.ts.hbs`
  - [ ] Handlebars variables: `{{name}}`, `{{displayName}}`, `{{description}}`
  - [ ] Generated package.json is valid JSON after template processing
  - [ ] Generated tsconfig extends `../../tsconfig.base.json`
  - [ ] Vitest is included in devDependencies

  **Commit**: NO (groups with 5, 6, 7)

---

- [x] 5. Create Plugin Core Templates (Tier A - Runtime)

  **What to do**:
  - Create `templates/plugin/src/index.ts.hbs` - Barrel exports
  - Create `templates/plugin/src/plugin.ts.hbs` - Plugin contract definition + registration function
  - Create `templates/plugin/src/runtime/state.ts.hbs` - Notes state interface + initial state
  - Create `templates/plugin/src/runtime/reducer.ts.hbs` - Immer reducer
  - Create `templates/plugin/src/runtime/selectors.ts.hbs` - State selectors

  **State structure for Notes** (uses `currentScreen` pattern from WhatsApp):

  ```typescript
  // State type
  interface NoteState {
    notes: Note[];
    currentScreen: "list" | "detail" | "editor";
    activeNoteId: string | null;
  }

  interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: number;
    updatedAt: number;
  }

  // Initial state function (REQUIRED)
  export function create{{ pascalCase name }}InitialState(): NoteState {
    return {
      notes: [],
      currentScreen: "list",
      activeNoteId: null,
    };
  }
  ```

  **Reducer actions**:
  - `ADD_NOTE`, `UPDATE_NOTE`, `DELETE_NOTE`, `SET_ACTIVE_NOTE`, `SET_SCREEN`

  **Reducer Implementation Pattern** (CRITICAL - how to access plugin state from WorldState):

  ```typescript
  // reducer.ts template - shows how to access plugin state from WorldState
  import type { WorldState, PluginReducer, RuntimeEvent } from "@tokovo/core";
  import type { NoteState } from "./state";
  import { create{{ pascalCase name }}InitialState } from "./state";

  // Helper to access plugin state from WorldState (copy from WhatsApp reducer:29-37)
  function getAppState(draft: WorldState): NoteState {
    if (!draft.appState) {
      draft.appState = {};
    }
    if (!draft.appState["app_{{ name }}"]) {
      draft.appState["app_{{ name }}"] = create{{ pascalCase name }}InitialState();
    }
    return draft.appState["app_{{ name }}"] as NoteState;
  }

  // Reducer signature - receives WorldState and event, mutates draft via Immer
  // Returns void (Immer handles immutability - DO NOT return new state)
  export const {{ camelCase name }}Reducer: PluginReducer<"app_{{ name }}"> = (
    draft: WorldState,
    event: RuntimeEvent & { kind: "APP"; appId: "app_{{ name }}" }
  ) => {
    const appState = getAppState(draft);

    switch (event.type) {
      case "ADD_NOTE":
        appState.notes.push(event.payload as Note);
        break;
      case "UPDATE_NOTE":
        const noteToUpdate = appState.notes.find(n => n.id === event.payload.noteId);
        if (noteToUpdate) {
          if (event.payload.title) noteToUpdate.title = event.payload.title;
          if (event.payload.content) noteToUpdate.content = event.payload.content;
          noteToUpdate.updatedAt = event.payload.updatedAt;
        }
        break;
      case "DELETE_NOTE":
        appState.notes = appState.notes.filter(n => n.id !== event.payload.noteId);
        break;
      case "SET_ACTIVE_NOTE":
        appState.activeNoteId = event.payload.noteId;
        break;
      case "SET_SCREEN":
        appState.currentScreen = event.payload.screen;
        break;
    }
  };
  ```

  **Integration Pattern Explanation**:
  1. `WorldState` is the global state containing all app states
  2. `draft.appState["app_{{ name }}"]` is where THIS plugin's state lives
  3. `getAppState()` helper ensures state is initialized if missing
  4. Reducer mutates `appState` directly (Immer handles immutability)

  **Registration function** (in plugin.ts):

  ```typescript
  import { PluginManager } from "@tokovo/core";

  let _registered = false;

  export function register{{ pascalCase name }}Plugin(): void {
    if (_registered) return;
    _registered = true;
    PluginManager.register({{ pascalCase name }}Plugin);
  }
  ```

  **PluginViews Assembly Pattern** (CRITICAL - how views connect to plugin):

  Reference: `packages/apps-whatsapp/src/plugin.ts:46-53`

  ```typescript
  // In plugin.ts template - assemble the views object
  import type { PluginViews, TokovoPluginContract } from "@tokovo/core";
  import { {{ pascalCase name }}View } from "./ui";
  import { {{ camelCase name }}Anchors } from "./runtime/adapters/anchors";

  // The view component is named {{ pascalCase name }}View but registered under 'AppRoot' key
  const {{ camelCase name }}Views: PluginViews = {
    AppRoot: {{ pascalCase name }}View,  // REQUIRED - main view component
  };

  export const {{ pascalCase name }}Plugin: TokovoPluginContract<"app_{{ name }}"> = {
    id: "app_{{ name }}",
    displayName: "{{ displayName }}",
    views: {{ camelCase name }}Views,
    reducer: {{ camelCase name }}Reducer,
    lowering: {{ camelCase name }}Lowering,
    dsl: {{ camelCase name }}Dsl,
    layout: {{ camelCase name }}Layout,
    anchors: {{ camelCase name }}Anchors,  // Camera framing for UI regions (Task 6a)
  };
  ```

  **Key Point**: Component export is `{{ pascalCase name }}View` but registered under `AppRoot` key in views object.

  **Template File Creation Order** (CRITICAL - avoid circular dependencies):

  Even though templates are created with a single `addMany` action, TypeScript will process imports when the generated package is built. The file structure ensures correct import order:

  **Complete Directory Structure** (created by generator):

  ```
  packages/apps-{name}/
  ├── package.json
  ├── tsconfig.json
  ├── vitest.config.ts
  └── src/
      ├── index.ts
      ├── plugin.ts              ← Main plugin contract (imports all)
      ├── runtime/
      │   ├── state.ts           ← State interfaces
      │   ├── reducer.ts         ← State mutations
      │   ├── selectors.ts       ← State selectors
      │   └── adapters/
      │       └── anchors.ts     ← Camera framing (Task 6a)
      ├── config/
      │   └── theme.ts           ← Theme configuration (Task 6b)
      ├── components/
      │   └── tokens.ts          ← Design tokens (Task 6b)
      ├── dsl/
      │   └── index.ts           ← DSL extension
      ├── lowering/
      │   └── index.ts           ← Lowering handler
      ├── ui/
      │   ├── index.tsx          ← Main view (screen router)
      │   ├── NotesList.tsx
      │   ├── NoteDetail.tsx
      │   └── NoteEditor.tsx
      └── __tests__/
          └── reducer.test.ts    ← Unit tests
  ```

  1. **Base files first** (no dependencies):
     - `runtime/state.ts` - State interfaces
     - `types/index.ts` - Type definitions

  2. **Implementation files** (import from base):
     - `runtime/reducer.ts` - Imports state types
     - `dsl/index.ts` - Imports core types
     - `lowering/index.ts` - Imports core types
     - `ui/index.tsx` - Imports state types

  3. **Assembly file LAST** (imports from all):
     - `plugin.ts` - Imports from ui/, dsl/, lowering/, runtime/
     - `index.ts` - Re-exports from plugin.ts

  **If Circular Dependency Errors Occur** (during `pnpm build`):
  - Check that `plugin.ts.hbs` doesn't import from files that import from `plugin.ts`
  - Use separate export files (e.g., `ui/index.tsx` exports view, `plugin.ts` imports from `ui/index.tsx`)
  - Test build as part of Task 12 verification

  **Must NOT do**:
  - Don't add complex state (categories, tags, search)
  - Don't add async actions

  **Parallelizable**: YES (with 4, 6, 7)

  **References**:
  - `packages/apps-whatsapp/src/plugin.ts` - Plugin contract pattern
  - `packages/apps-whatsapp/src/runtime/` - Reducer/state patterns
  - `packages/core/src/types/plugin-contract.ts` - TokovoPluginContract interface

  **Acceptance Criteria**:
  - [ ] Template: `templates/plugin/src/index.ts.hbs`
  - [ ] Template: `templates/plugin/src/plugin.ts.hbs`
  - [ ] Template: `templates/plugin/src/runtime/state.ts.hbs`
  - [ ] Template: `templates/plugin/src/runtime/reducer.ts.hbs`
  - [ ] Template: `templates/plugin/src/runtime/selectors.ts.hbs`
  - [ ] Plugin implements `TokovoPluginContract<'app_{{name}}'>`
  - [ ] Reducer handles all 5 actions

  **Commit**: NO (groups with 4, 6, 7)

---

- [x] 6. Create UI Component Templates (Tier A - Views)

  **What to do**:
  - Create `templates/plugin/src/ui/index.tsx.hbs` - Main view component with screen routing
  - Create `templates/plugin/src/ui/NotesList.tsx.hbs` - List view
  - Create `templates/plugin/src/ui/NoteDetail.tsx.hbs` - Detail view
  - Create `templates/plugin/src/ui/NoteEditor.tsx.hbs` - Editor view

  **CRITICAL FILE NAMING**:
  - **CORRECT**: `ui/index.tsx` (what WhatsApp actually uses)
  - **WRONG**: `ui/AppRoot.tsx` (this file does NOT exist in WhatsApp)
  - The main view component MUST be named `index.tsx` to match the established pattern
  - Component export name: `{{ pascalCase name }}View` (e.g., `NotesView`)

  **View Component Props Interface** (CRITICAL - what props views receive):

  Views receive props from the renderer. Use the **core `PluginViewProps`** interface (from `@tokovo/core/src/types/plugin-contract.ts:75-80`):

  ```typescript
  // EXACT interface from @tokovo/core - DO NOT add extra fields
  import type { PluginViewProps } from "@tokovo/core";

  // PluginViewProps contains:
  // {
  //   world: WorldState;      // Full world state
  //   deviceId: string;       // ID of device rendering this view
  //   platform?: "ios" | "android";  // Device platform
  //   t?: number;             // Current time in seconds
  // }
  ```

  **NOTE**: WhatsApp defines its OWN extended props interface with additional fields (width, height, safeAreaInsets). For the generator MVP, we use the **core contract only**. Plugins can extend later if needed.

  **WHY core props work for MVP**: The extended props (width, height, safeAreaInsets) are optional convenience fields. Generated plugins can access these via:
  - `world.devices[deviceId]` for device dimensions
  - CSS media queries or container queries for responsive layout
  - Parent component context if needed

  This keeps generated plugins simple while WhatsApp's extended interface is an optimization.

  **Accessing Plugin State from Props**:

  ```typescript
  // In view component - access YOUR plugin's state from world.appState
  import type { PluginViewProps } from "@tokovo/core";

  const {{ pascalCase name }}View: React.FC<PluginViewProps> = ({ world, platform }) => {
    // Access this plugin's state from WorldState
    const appState = world.appState?.["app_{{ name }}"] as NoteState | undefined;
    const currentScreen = appState?.currentScreen || "list";
    // ... render based on state
  };
  ```

  **UI Pattern** (uses `currentScreen` switch statement, same MECHANISM as WhatsApp `packages/apps-whatsapp/src/ui/index.tsx:39`):

  ```typescript
  // ui/index.tsx template structure
  import React from "react";
  import type { PluginViewProps } from "@tokovo/core";
  import type { NoteState } from "../runtime/state";
  import { NotesList } from "./NotesList";
  import { NoteDetail } from "./NoteDetail";
  import { NoteEditor } from "./NoteEditor";

  // Use core PluginViewProps - DO NOT define custom interface
  export const {{ pascalCase name }}View: React.FC<PluginViewProps> = ({ world, platform }) => {
    // Access plugin state from world.appState (NOT useAppState hook)
    const appState = world.appState?.["app_{{ name }}"] as NoteState | undefined;
    const currentScreen = appState?.currentScreen || "list";

    switch (currentScreen) {
      case "list":
        return <NotesList appState={appState} />;
      case "detail":
        return <NoteDetail appState={appState} />;
      case "editor":
        return <NoteEditor appState={appState} />;
      default:
        return <NotesList appState={appState} />;
    }
  };
  ```

  - NotesList shows grid/list of notes with title preview, dispatches `SET_SCREEN` to navigate
  - NoteDetail shows full note content with back button
  - NoteEditor shows text inputs for title and content

  **Must NOT do**:
  - Don't use external UI libraries (keep vanilla React)
  - Don't add complex animations
  - Don't use conditional logic with `activeNoteId + isEditing` (use `currentScreen` pattern)
  - Don't name file `AppRoot.tsx` (WhatsApp uses `index.tsx`)

  **Parallelizable**: YES (with 4, 5, 7)

  **References**:
  - `packages/apps-whatsapp/src/ui/index.tsx` - Main view component (NOT AppRoot.tsx which doesn't exist)
  - `packages/apps-whatsapp/src/ui/index.tsx:39` - currentScreen switch pattern

  **Acceptance Criteria**:
  - [ ] Template: `templates/plugin/src/ui/index.tsx.hbs`
  - [ ] Template: `templates/plugin/src/ui/NotesList.tsx.hbs`
  - [ ] Template: `templates/plugin/src/ui/NoteDetail.tsx.hbs`
  - [ ] Template: `templates/plugin/src/ui/NoteEditor.tsx.hbs`
  - [ ] Main view component exported as `{{ pascalCase name }}View`
  - [ ] Component registered in plugin.ts under `views.AppRoot` key (see Task 5)
  - [ ] Components use selectors to read state
  - [ ] Components dispatch reducer actions

  **Commit**: Groups with 5, 6a, 6b

---

- [x] 6a. Create Camera Anchors Template (Tier A - Framing)

  **What to do**:
  - Create `templates/plugin/src/runtime/adapters/anchors.ts.hbs`
  - Defines camera framing configuration for UI regions

  **WHY Anchors Exist**:
  - Camera needs to know WHERE to frame when focusing on plugin UI
  - Each UI region (note card, header, editor) has an anchor point and framing config
  - Enables smooth camera transitions to different parts of the UI

  **Anchor Template**:

  Reference: `packages/apps-whatsapp/src/runtime/adapters/anchors.ts`

  ```typescript
  // runtime/adapters/anchors.ts
  // =====================================================
  // CAMERA ANCHORS - Defines where camera frames for UI regions
  // =====================================================
  //
  // Each region specifies:
  //   - anchorPoint: {x, y} normalized coordinates (0-1)
  //   - paddingPx: margin around the target
  //   - targetFill: how much of the screen the target should fill
  //

  import type { PluginAnchorRegistry } from "@tokovo/core";

  export const {{ camelCase name }}Anchors: PluginAnchorRegistry = {
    // Provider functions (optional - return null for default behavior)
    providers: {
      default: (world, deviceId) => null,
    },

    // Framing configurations for each UI region
    framing: {
      // Note card in list view - center of screen
      note_card: {
        anchorPoint: { x: 0.5, y: 0.5 },
        paddingPx: 16,
        targetFill: 0.8,
      },
      // Header region - top of screen
      header: {
        anchorPoint: { x: 0.5, y: 0.15 },
        paddingPx: 8,
        targetFill: 0.9,
      },
      // Editor input area - bottom portion
      editor: {
        anchorPoint: { x: 0.5, y: 0.7 },
        paddingPx: 20,
        targetFill: 0.85,
      },
      // Full device view
      device: {
        anchorPoint: { x: 0.5, y: 0.5 },
        paddingPx: 0,
        targetFill: 1.0,
      },
    },
  };
  ```

  **Must NOT do**:
  - Don't add complex anchor animations
  - Don't reference non-existent UI components

  **Parallelizable**: YES (with 6, 6b)

  **References**:
  - `packages/apps-whatsapp/src/runtime/adapters/anchors.ts` - Complete anchor pattern

  **Acceptance Criteria**:
  - [ ] Template: `templates/plugin/src/runtime/adapters/anchors.ts.hbs`
  - [ ] Exports `{{ camelCase name }}Anchors: PluginAnchorRegistry`
  - [ ] At least 4 framing regions defined (note_card, header, editor, device)
  - [ ] Each region has anchorPoint, paddingPx, targetFill

---

- [x] 6b. Create Theme and Design Tokens Template (Tier A - Styling)

  **What to do**:
  - Create `templates/plugin/src/config/theme.ts.hbs` - Full theme configuration
  - Create `templates/plugin/src/components/tokens.ts.hbs` - Design tokens (colors, typography, spacing)

  **WHY Theme/Tokens Exist**:
  - Consistent styling across all plugin components
  - Light/dark mode support
  - Centralized design values for maintainability

  **Design Tokens Template**:

  Reference: `packages/apps-whatsapp/src/components/theme.ts`

  ```typescript
  // components/tokens.ts
  // =====================================================
  // DESIGN TOKENS - Colors, Typography, Spacing values
  // =====================================================
  //
  // Define all design values here. Components import these tokens
  // instead of hardcoding values, enabling easy theming.
  //

  // Color palette
  export const {{ camelCase name }}Colors = {
    // Primary brand color
    primary: "#4A90D9",
    primaryLight: "#7EB3F0",
    primaryDark: "#2B5C8A",

    // Text colors
    textPrimary: "#000000",
    textSecondary: "#666666",
    textTertiary: "#999999",

    // Background colors
    background: "#FFFFFF",
    backgroundSecondary: "#F5F5F5",

    // Note-specific colors
    noteCardBackground: "#FFFFFF",
    noteCardBorder: "#E0E0E0",
    noteEditorBackground: "#FAFAFA",

    // Status colors
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
  } as const;

  // Typography scale
  export const {{ camelCase name }}Typography = {
    largeTitle: { fontSize: 34, fontWeight: "700" as const, letterSpacing: 0.37 },
    title: { fontSize: 28, fontWeight: "700" as const, letterSpacing: 0.36 },
    headline: { fontSize: 17, fontWeight: "600" as const, letterSpacing: -0.41 },
    body: { fontSize: 17, fontWeight: "400" as const, letterSpacing: -0.41 },
    caption: { fontSize: 12, fontWeight: "400" as const, letterSpacing: 0 },
  } as const;

  // Spacing values
  export const {{ camelCase name }}Spacing = {
    noteCardHeight: 80,
    noteCardPadding: 16,
    headerHeight: 44,
    editorPadding: 20,
    listItemGap: 8,
  } as const;

  // Combined theme export
  export const {{ camelCase name }}Theme = {
    colors: {{ camelCase name }}Colors,
    typography: {{ camelCase name }}Typography,
    spacing: {{ camelCase name }}Spacing,
  } as const;
  ```

  **Theme Configuration Template**:

  Reference: `packages/apps-whatsapp/src/config/whatsapp-theme.ts`

  ```typescript
  // config/theme.ts
  // =====================================================
  // THEME CONFIGURATION - Light/Dark mode support
  // =====================================================

  import { {{ camelCase name }}Colors, {{ camelCase name }}Typography, {{ camelCase name }}Spacing } from "../components/tokens";

  export interface {{ pascalCase name }}ThemeColors {
    primary: string;
    background: string;
    text: string;
    noteCard: string;
    border: string;
  }

  export interface {{ pascalCase name }}Theme {
    mode: "light" | "dark";
    colors: {{ pascalCase name }}ThemeColors;
    typography: typeof {{ camelCase name }}Typography;
    spacing: typeof {{ camelCase name }}Spacing;
  }

  // Light mode theme
  export const {{ constantCase name }}_LIGHT: {{ pascalCase name }}Theme = {
    mode: "light",
    colors: {
      primary: {{ camelCase name }}Colors.primary,
      background: {{ camelCase name }}Colors.background,
      text: {{ camelCase name }}Colors.textPrimary,
      noteCard: {{ camelCase name }}Colors.noteCardBackground,
      border: {{ camelCase name }}Colors.noteCardBorder,
    },
    typography: {{ camelCase name }}Typography,
    spacing: {{ camelCase name }}Spacing,
  };

  // Dark mode theme
  export const {{ constantCase name }}_DARK: {{ pascalCase name }}Theme = {
    mode: "dark",
    colors: {
      primary: {{ camelCase name }}Colors.primaryLight,
      background: "#1C1C1E",
      text: "#FFFFFF",
      noteCard: "#2C2C2E",
      border: "#3A3A3C",
    },
    typography: {{ camelCase name }}Typography,
    spacing: {{ camelCase name }}Spacing,
  };

  // Theme getter
  export function get{{ pascalCase name }}Theme(mode: "light" | "dark"): {{ pascalCase name }}Theme {
    return mode === "dark" ? {{ constantCase name }}_DARK : {{ constantCase name }}_LIGHT;
  }
  ```

  **How UI Components Use Theme Tokens** (CRITICAL - integration pattern):

  UI components import theme directly (not passed through plugin contract):

  ```typescript
  // In ui/NotesList.tsx - example usage
  import { get{{ pascalCase name }}Theme } from "../config/theme";
  import { {{ camelCase name }}Spacing } from "../components/tokens";

  export const NoteCard: React.FC<{ note: Note }> = ({ note }) => {
    const theme = get{{ pascalCase name }}Theme("light"); // or from props/context

    return (
      <div style={{
        backgroundColor: theme.colors.noteCard,
        color: theme.colors.text,
        padding: {{ camelCase name }}Spacing.noteCardPadding,
        borderColor: theme.colors.border,
      }}>
        <h3 style={{ ...theme.typography.headline }}>{note.title}</h3>
        <p style={{ ...theme.typography.body }}>{note.content}</p>
      </div>
    );
  };
  ```

  **Theme is NOT in Plugin Contract**: Unlike anchors which are registered in the plugin contract,
  theme tokens are used directly by UI components. The pattern is:
  - `anchors` → registered in plugin contract → used by camera system
  - `theme` → imported by UI components → used for styling

  **Theme File Naming Decision**: Generated plugins use `components/tokens.ts` (not `theme.ts` like WhatsApp's `components/theme.ts`) for clearer separation of concerns:
  - `components/tokens.ts` - Design values (colors, typography, spacing)
  - `config/theme.ts` - Theme configuration (light/dark mode, theme getter)

  WhatsApp combines both in `components/theme.ts` - we split them for better maintainability.

  **Must NOT do**:
  - Don't add complex theme switching logic (just export light/dark)
  - Don't use CSS-in-JS libraries

  **Parallelizable**: YES (with 6, 6a)

  **References**:
  - `packages/apps-whatsapp/src/components/theme.ts` - Design tokens pattern
  - `packages/apps-whatsapp/src/config/whatsapp-theme.ts` - Theme configuration

  **Acceptance Criteria**:
  - [ ] Template: `templates/plugin/src/components/tokens.ts.hbs`
  - [ ] Template: `templates/plugin/src/config/theme.ts.hbs`
  - [ ] Colors, typography, spacing tokens exported
  - [ ] Light and dark theme variants exported
  - [ ] `get{{ pascalCase name }}Theme(mode)` helper function

  **Commit**: Groups with 6, 6a

---

- [x] 7. Create Tier B + C Templates (Lowering, Layout, DSL)

  **What to do**:
  - Create `templates/plugin/src/lowering/index.ts.hbs` - IR→Runtime event handlers
  - Create `templates/plugin/src/layout/index.ts.hbs` - Layout computation (minimal stub for MVP)
  - Create `templates/plugin/src/dsl/index.ts.hbs` - Fluent chain DSL builder

  **Event Naming Pattern** (CRITICAL - naming transformation through the pipeline):

  Events use different naming conventions at different layers. The lowering handler transforms between them:

  | Layer            | Convention      | Example      | Where Used                                            |
  | ---------------- | --------------- | ------------ | ----------------------------------------------------- |
  | **DSL**          | PascalCase      | `CreateNote` | `builder.ops.push({ kind: "CreateNote", ... })`       |
  | **TrackEvent**   | PascalCase      | `CreateNote` | Input to lowering handler (`event.kind`)              |
  | **RuntimeEvent** | UPPERCASE_SNAKE | `ADD_NOTE`   | Output from lowering, input to reducer (`event.type`) |

  **Why the transformation?**
  - DSL operations describe user intent (`CreateNote` = "user wants to create a note")
  - Runtime events describe state changes (`ADD_NOTE` = "add note to state array")
  - One DSL operation may produce multiple runtime events (e.g., `ViewNote` → `SET_ACTIVE_NOTE` + `SET_SCREEN`)

  **Naming Examples**:

  ```
  DSL Operation     →  Runtime Event(s)
  ─────────────────────────────────────
  CreateNote        →  ADD_NOTE
  ViewNote          →  SET_ACTIVE_NOTE, SET_SCREEN
  EditNote          →  UPDATE_NOTE
  DeleteNote        →  DELETE_NOTE
  ```

  **Lowering Handler Template**:

  Reference: `packages/apps-whatsapp/src/lowering/v2/handler.ts:5-50`

  **RuntimeEvent Complete Structure** (ALL required fields):

  ```typescript
  interface RuntimeEvent {
    at: number; // Timestamp (from event.at or ctx.frame)
    kind: "APP"; // Always "APP" for plugin events
    appId: string; // e.g., "app_notes" (from template variable)
    type: string; // e.g., "ADD_NOTE" (your custom event type)
    payload: unknown; // Event-specific data
    deviceId?: string; // Optional device context (from event.deviceId)
  }
  ```

  ```typescript
  // lowering/index.ts template
  // Transforms TrackEvents (PascalCase) → RuntimeEvents (UPPERCASE_SNAKE)
  import type { TrackEvent, RuntimeEvent } from "@tokovo/core";

  export interface {{ pascalCase name }}LoweringHandler {
    lower: (event: TrackEvent) => RuntimeEvent[];
  }

  // Helper to build RuntimeEvent with all required fields
  function createRuntimeEvent(
    event: TrackEvent,
    type: string,
    payload: unknown
  ): RuntimeEvent {
    return {
      at: event.at,                    // Inherit timestamp from TrackEvent
      kind: "APP",                     // Always "APP" for plugin events
      appId: "app_{{ name }}",         // Plugin ID
      type: type,                      // Your event type (UPPERCASE_SNAKE)
      payload: payload,                // Event-specific data
      deviceId: event.deviceId,        // Pass through device context
    };
  }

  export const {{ camelCase name }}Lowering: {{ pascalCase name }}LoweringHandler = {
    lower: (event: TrackEvent): RuntimeEvent[] => {
      switch (event.kind) {
        case "CreateNote":
          return [createRuntimeEvent(event, "ADD_NOTE", {
            id: event.id,
            title: event.title,
            content: event.content,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })];
        case "ViewNote":
          return [
            createRuntimeEvent(event, "SET_ACTIVE_NOTE", { noteId: event.noteId }),
            createRuntimeEvent(event, "SET_SCREEN", { screen: "detail" })
          ];
        case "EditNote":
          return [createRuntimeEvent(event, "UPDATE_NOTE", {
            noteId: event.noteId,
            title: event.title,
            content: event.content,
            updatedAt: Date.now(),
          })];
        case "DeleteNote":
          return [createRuntimeEvent(event, "DELETE_NOTE", { noteId: event.noteId })];
        default:
          return [];
      }
    }
  };
  ```

  **Layout Strategy Template** (MINIMAL STUB - can be expanded later):

  Reference: `packages/apps-whatsapp/src/layout/index.ts` and `packages/core/src/types/plugin-contract.ts:146-155`

  ```typescript
  // layout/index.ts template
  import type { PluginLayoutStrategy } from "@tokovo/core";

  // Minimal stub for MVP - Notes app doesn't need complex layout computation
  // Layout strategies compute UI measurements (bubble sizes, positions, etc.)
  // For a simple Notes app, we return empty layout data

  export const {{ camelCase name }}LayoutStrategies: PluginLayoutStrategy[] = [
    {
      viewKind: "notes-list",
      // platforms field is optional; omitted for MVP stub (matches WhatsApp pattern)
      computeLayout: (ctx: unknown) => {
        // For MVP, return empty object - no complex layout needed
        // Can be expanded later for note card sizing, grid layout, etc.
        return {};
      }
    }
  ];
  ```

  **Note on Layout**: WhatsApp's layout/ directory is substantial (16KB) because it calculates message bubble sizes, scroll positions, etc. For a simple Notes app MVP, layout can be a minimal stub that returns empty objects. This is intentionally simpler than WhatsApp.

  **DSL Pattern** - See "DSL Implementation Pattern" section above for complete template.

  **Must NOT do**:
  - Don't add complex lowering logic beyond the 4 operations
  - Don't add animation in layout
  - Don't add too many DSL methods (keep minimal for MVP)

  **Parallelizable**: YES (with 4, 5, 6)

  **References**:
  - `packages/apps-whatsapp/src/lowering/v2/handler.ts:5-50` - Lowering handler interface and pattern
  - `packages/apps-whatsapp/src/layout/index.ts` - Layout export pattern (actual impl in cache.ts, chat.ts)
  - `packages/core/src/types/plugin-contract.ts:146-155` - PluginLayoutStrategy interface
  - See "DSL Implementation Pattern" section in this plan for complete DSL template

  **Acceptance Criteria**:
  - [ ] Template: `templates/plugin/src/lowering/index.ts.hbs`
  - [ ] Template: `templates/plugin/src/layout/index.ts.hbs`
  - [ ] Template: `templates/plugin/src/dsl/index.ts.hbs`
  - [ ] Lowering handler implements `lower(event) => RuntimeEvent[]` signature
  - [ ] Layout returns minimal stub (empty object) for MVP
  - [ ] DSL implements all 4 methods: createNote, viewNote, editNote, deleteNote
  - [ ] All registered in plugin contract
  - [ ] DSL registered in plugin contract
  - [ ] DSL methods: `createNote()`, `viewNote()`, `editNote()`, `deleteNote()`

  **Commit**: YES (groups 4, 5, 6, 7 together)
  - Message: `feat(generators): add complete plugin templates (Tier A+B+C)`
  - Files: `turbo/generators/templates/plugin/**`

---

- [x] 8. Implement Generator Actions with Plugin Scaffolding

  **What to do**:
  - Add `addMany` action to create all plugin files from templates
  - Add `add` action to create example episode
  - Set destination: `{{ turbo.paths.root }}/packages/apps-{{ name }}`

  **Template Variable Injection (AUTOMATIC)**:

  Turbo Gen/Plop automatically injects prompt answers as Handlebars variables - NO manual configuration needed:
  - User's answer to "name" prompt → available as `{{ name }}` in templates
  - User's answer to "displayName" prompt → available as `{{ displayName }}`
  - User's answer to "description" prompt → available as `{{ description }}`

  Built-in Handlebars helpers also available:
  - `{{ pascalCase name }}` - converts "my-plugin" to "MyPlugin"
  - `{{ camelCase name }}` - converts "my-plugin" to "myPlugin"
  - `{{ turbo.paths.root }}` - repository root path

  Example: If user inputs name="notes", templates receive:
  - `{{ name }}` → "notes"
  - `{{ pascalCase name }}` → "Notes"
  - `{{ camelCase name }}` → "notes"

  **Note on Terminology**: This is NOT "auto-registration" - plugins export a registration function that episodes must explicitly call. The generator creates the registration function, but registration happens at runtime when episodes import and call it.

  **Generator Actions Structure**:

  All paths in actions are relative to `turbo/generators/` directory.

  **Conflict Handling** (if package already exists):
  - Turbo Gen's `addMany` will FAIL if target directory exists
  - This is intentional: prevents accidental overwrites
  - User must manually delete `packages/apps-{name}/` before re-running
  - No automatic prompt for overwrite (matches Turbo Gen default behavior)
  - Error message: "Destination already exists: packages/apps-{name}"

  ```typescript
  actions: [
    // 1. Create all plugin files
    {
      type: "addMany",
      destination: "{{ turbo.paths.root }}/packages/apps-{{ name }}",
      base: "templates/plugin",
      templateFiles: "templates/plugin/**",
    },
    // 2. Create example episode
    {
      type: "add",
      path: "{{ turbo.paths.root }}/packages/episodes/src/production/example-{{ name }}.episode.ts",
      templateFile: "templates/episode/example.episode.ts.hbs",
    },
  ];
  ```

  **Registration Pattern** (NOT auto-registered in core):
  - Generated plugin exports `register{{ pascalCase name }}Plugin()` function
  - Example episode imports and calls this function at top of file
  - No modification to core package needed
  - Apps (NOT episodes) that use the plugin must call the register function

  **App Registration Example** (in `apps/video-runner/src/Root.tsx`):

  ```typescript
  // Root.tsx - app entry point
  import { register{{ pascalCase name }}Plugin } from "@tokovo/apps-{{ name }}";

  // At startup, BEFORE episodes run:
  registerDevicesPlugin();
  registerWhatsAppPlugin();
  register{{ pascalCase name }}Plugin();  // Add your plugin here
  ```

  **IMPORTANT**: Episodes do NOT call registration. Episodes assume plugins are already registered by the app.

  **Must NOT do**:
  - Don't modify `packages/core/` files
  - Don't add append actions to core registry (plugins self-register)
  - Don't add optional feature flags

  **Parallelizable**: NO (depends on 4-7)

  **References**:
  - See "Turbo Gen API Reference" section above for exact action syntax
  - See "Plugin Registration Pattern" section above for registration approach
  - `packages/apps-whatsapp/src/plugin.ts:179-189` - Registration function pattern

  **Acceptance Criteria**:
  - [ ] `addMany` action creates complete plugin package
  - [ ] Generated plugin exports `register{{ pascalCase name }}Plugin()` function
  - [ ] `turbo gen plugin --args "test" "Test" "Test plugin"` creates `packages/apps-test/`
  - [ ] Generated plugin is importable: `import { registerTestPlugin } from '@tokovo/apps-test'`
  - [ ] No modifications to `packages/core/`

  **Commit**: YES
  - Message: `feat(generators): implement generator actions with plugin scaffolding`
  - Files: `turbo/generators/config.ts`

---

- [x] 9. Create Test File Templates

  **What to do**:
  - Create `templates/plugin/src/__tests__/reducer.test.ts.hbs` - Reducer unit tests
  - Create `templates/plugin/src/__tests__/selectors.test.ts.hbs` - Selector tests
  - Add test script to generated package.json
  - Configure Vitest for the generated package

  **Test File Structure** (no existing WhatsApp tests to reference - create from scratch):

  **IMPORTANT: Immer Testing Pattern**

  Since the reducer uses Immer (mutates draft, returns void), tests MUST wrap reducer calls in `produce`:

  ```typescript
  // reducer.test.ts template
  import { describe, it, expect } from "vitest";
  import { produce } from "immer";  // <-- REQUIRED for testing Immer reducers
  import { {{ camelCase name }}Reducer } from "../runtime/reducer";
  import { create{{ pascalCase name }}InitialState } from "../runtime/state";
  import type { WorldState, RuntimeEvent } from "@tokovo/core";

  // Helper to create a minimal WorldState with plugin state
  function createTestWorldState(): WorldState {
    return {
      appState: {
        "app_{{ name }}": create{{ pascalCase name }}InitialState(),
      },
      // ... other required WorldState fields (devices, etc.)
    } as WorldState;
  }

  // Helper to run reducer and get new state
  function runReducer(state: WorldState, event: RuntimeEvent): WorldState {
    // Wrap in produce() because reducer mutates draft and returns void
    return produce(state, draft => {
      {{ camelCase name }}Reducer(draft, event as any);
    });
  }

  describe("{{ pascalCase name }} Reducer", () => {
    it("ADD_NOTE creates a new note", () => {
      const state = createTestWorldState();
      const newState = runReducer(state, {
        at: 0,
        kind: "APP",
        appId: "app_{{ name }}",
        type: "ADD_NOTE",
        payload: { id: "1", title: "Test", content: "Content", createdAt: Date.now(), updatedAt: Date.now() }
      });

      const appState = newState.appState?.["app_{{ name }}"];
      expect(appState.notes).toHaveLength(1);
      expect(appState.notes[0].title).toBe("Test");
    });

    // ... 4 more tests following same pattern
  });
  ```

  **Why `produce()` is Required**:
  - Reducer signature is `(draft, event) => void` (Immer pattern)
  - Calling `reducer(state, event)` directly returns `undefined`
  - `produce()` wraps the mutation and returns the new immutable state

  **Test File Pattern Decision**: Using `src/__tests__/` directory (Jest-style convention) because:
  1. Separates test files from source files for cleaner package structure
  2. Vitest config will use `include: ["src/__tests__/**/*.test.ts"]`
  3. No existing test pattern in WhatsApp to match (greenfield decision)

  **Test cases for reducer**:
  - ADD_NOTE creates a new note
  - UPDATE_NOTE modifies existing note
  - DELETE_NOTE removes note
  - SET_ACTIVE_NOTE updates activeNoteId
  - SET_SCREEN changes currentScreen

  **Vitest Config Template** (tests run in Node environment - no component tests):

  ```typescript
  // vitest.config.ts template
  import { defineConfig } from "vitest/config";

  export default defineConfig({
    test: {
      include: ["src/__tests__/**/*.test.ts"],
      environment: "node", // Node environment for reducer/selector tests (no JSX)
    },
  });
  ```

  **Package.json test script**:

  ```json
  {
    "scripts": {
      "test": "vitest run",
      "test:watch": "vitest"
    }
  }
  ```

  **Must NOT do**:
  - Don't add component tests (too complex for MVP)
  - Don't add integration tests
  - Don't add snapshot tests

  **Parallelizable**: YES (with 10)

  **References**:
  - Vitest documentation: https://vitest.dev/guide/
  - Standard Vitest patterns: describe/it/expect

  **Acceptance Criteria**:
  - [ ] Template: `templates/plugin/src/__tests__/reducer.test.ts.hbs`
  - [ ] Template: `templates/plugin/src/__tests__/selectors.test.ts.hbs`
  - [ ] Generated package.json has `"test": "vitest run"`
  - [ ] `pnpm test --filter=@tokovo/apps-{name}` runs successfully
  - [ ] All 5 reducer action tests pass

  **Commit**: NO (groups with 10)

---

- [x] 10. Create Example Episode Template

  **What to do**:
  - Create `templates/episode/example.episode.ts.hbs`
  - Generator action creates file at `packages/episodes/src/production/example-{{ name }}.episode.ts`
  - Episode demonstrates all DSL methods:
    - createNote with sample content
    - viewNote to show the note
    - editNote to modify content
    - Camera movements between views
  - **CRITICAL: Do NOT include any registration imports or calls**

  **Episode Template Structure**:

  **IMPORTANT - Registration Separation**:
  - Episodes do NOT import `registerXxxPlugin`
  - Episodes do NOT call `registerXxxPlugin()`
  - Registration is ONLY done in app entry points (e.g., `video-runner/Root.tsx`)
  - When an episode runs, the app has already registered all plugins at startup

  ```typescript
  // example-{{ name }}.episode.ts
  //
  // IMPORTANT: This episode does NOT register the plugin.
  // Plugin registration is handled by the app entry point (e.g., video-runner/Root.tsx)
  // before any episodes run. Episodes only use DSL APIs.
  //
  import { createEpisode, beat } from "@tokovo/episodes";

  export const example{{ pascalCase name }}Episode = createEpisode({
    id: "example-{{ name }}",
    title: "{{ displayName }} Demo",

    script: () => {
      beat("intro", (b) => {
        b.use("app_{{ name }}")
          .createNote({ title: "Hello World", content: "This is my first note!" })
          .wait(1000);
      });

      beat("view", (b) => {
        b.use("app_{{ name }}")
          .viewNote("note-1")
          .wait(2000);
      });

      beat("edit", (b) => {
        b.use("app_{{ name }}")
          .editNote("note-1", { content: "Updated content!" })
          .wait(1000);
      });
    }
  });
  ```

  **Registration Clarification**:
  - Episodes do NOT call registration functions (verified from actual codebase)
  - Apps (like `video-runner`) register plugins at startup in their entry points
  - The generator README (Task 11) will document that apps must register the plugin

  **Must NOT do**:
  - Don't create complex multi-scene episodes
  - Don't add other app plugins to the episode
  - Don't add sound effects

  **Parallelizable**: YES (with 9)

  **References**:
  - `packages/episodes/src/production/` - Episode file location (verified)
  - See "DSL Implementation Pattern" section for DSL usage

  **Acceptance Criteria**:
  - [ ] Template: `turbo/generators/templates/episode/example.episode.ts.hbs`
  - [ ] Generator creates file at `packages/episodes/src/production/example-{{ name }}.episode.ts`
  - [ ] Episode does NOT import or call registration functions
  - [ ] Episode uses DSL API directly (assumes app already registered plugin)
  - [ ] Episode uses all 4 DSL methods
  - [ ] Episode compiles without errors

  **Commit**: YES (groups 9, 10 together)
  - Message: `feat(generators): add test and example episode templates`
  - Files: `turbo/generators/templates/plugin/src/__tests__/**`, `turbo/generators/templates/episode/**`

---

- [x] 11. Add Generator Documentation

  **What to do**:
  - Create `turbo/generators/README.md` with usage instructions
  - Document all prompts and their validation rules
  - Document generated file structure
  - Add examples of running the generator
  - Explain that apps must register plugins (not episodes)

  **README.md Content Template**:

  ````markdown
  # Tokovo Plugin Generator

  Generate production-ready Tokovo App Plugins with a single command.

  ## Usage

  ```bash
  turbo gen plugin
  ```
  ````

  Or with arguments (non-interactive):

  ```bash
  turbo gen plugin --args "notes" "Notes" "A notes application"
  ```

  ## Prompts

  | Prompt          | Description              | Validation                                 |
  | --------------- | ------------------------ | ------------------------------------------ |
  | **name**        | Package name (lowercase) | `[a-z][a-z0-9-]*`, no spaces, no uppercase |
  | **displayName** | Human-readable name      | Non-empty                                  |
  | **description** | Brief description        | Non-empty                                  |

  ## Generated Structure

  ```
  packages/apps-{name}/
  ├── package.json
  ├── tsconfig.json
  ├── vitest.config.ts
  ├── src/
  │   ├── index.ts           # Barrel exports
  │   ├── plugin.ts          # Plugin contract + registration
  │   ├── runtime/
  │   │   ├── state.ts       # State types + initial state
  │   │   ├── reducer.ts     # Immer reducer
  │   │   └── selectors.ts   # State selectors
  │   ├── ui/
  │   │   ├── index.tsx      # Main view with routing
  │   │   ├── NotesList.tsx
  │   │   ├── NoteDetail.tsx
  │   │   └── NoteEditor.tsx
  │   ├── dsl/
  │   │   └── index.ts       # Fluent DSL extension
  │   ├── lowering/
  │   │   └── index.ts       # Track→Runtime events
  │   ├── layout/
  │   │   └── index.ts       # Layout strategies
  │   └── __tests__/
  │       ├── reducer.test.ts
  │       └── selectors.test.ts
  ```

  ## Registering Your Plugin

  **IMPORTANT**: Plugins must be registered by apps, not episodes.

  ### Step 1: Add to Video Runner (or your app entry point)

  Edit `apps/video-runner/src/Root.tsx` (around line 27, after other plugin registrations):

  ```typescript
  import { registerDevicesPlugin } from "@tokovo/device-plugins";
  import { registerWhatsAppPlugin } from "@tokovo/apps-whatsapp";
  import { register{{ pascalCase name }}Plugin } from "@tokovo/apps-{{ name }}";  // Add this import

  // In initialization (before any episode rendering):
  registerDevicesPlugin();
  registerWhatsAppPlugin();
  register{{ pascalCase name }}Plugin();  // Add this call
  ```

  ### Step 2: Use in Episodes

  Episodes do NOT call registration - they assume plugins are already registered:

  ```typescript
  // packages/episodes/src/production/my-{{ name }}-episode.episode.ts
  import { defineEpisode } from "../types/episode-definition";
  import { episode } from "@tokovo/dsl";

  export default defineEpisode({
    config: { apps: ["app_{{ name }}"] },
    build: () => episode(...)
      .device("phone", "iphone16", { app: "app_{{ name }}" })
      .track("app_{{ name }}", () => builder, api => {
        api.at("1s").createNote({ title: "Hello", content: "World" });
      })
      .build(),
  });
  ```

  **Why Separate Registration:**
  - Apps register plugins once at startup
  - Episodes assume plugins are already available
  - This pattern enables plugin reuse across multiple episodes

  **⚠️ CRITICAL POST-GENERATION STEP** (MUST NOT SKIP):

  After generating a plugin with `turbo gen plugin`, you MUST manually register it:
  1. Open `apps/video-runner/src/Root.tsx`
  2. Add import: `import { register{{ pascalCase name }}Plugin } from "@tokovo/apps-{{ name }}";`
  3. Add call after other registrations (line ~28): `register{{ pascalCase name }}Plugin();`
  4. Restart dev server

  **Without this step, episodes using the plugin will fail with "Plugin not registered" error.**

  ## Testing

  ```bash
  pnpm test --filter=@tokovo/apps-{{ name }}
  ```

  **Must NOT do**:
  - Don't add to main docs site (internal tooling)
  - Don't create video tutorials

  **Parallelizable**: NO (depends on 8-10)

  **References**:
  - See "Plugin Registration Pattern" section in this plan

  **Acceptance Criteria**:
  - [ ] File exists: `turbo/generators/README.md`
  - [ ] Includes: Usage instructions (`turbo gen plugin`)
  - [ ] Includes: Prompt descriptions and validation
  - [ ] Includes: Generated file structure diagram
  - [ ] Includes: Example command with sample values
  - [ ] Includes: Registration instructions for apps

  **Commit**: YES
  - Message: `docs(generators): add plugin generator documentation`
  - Files: `turbo/generators/README.md`

  ```

  ```

---

- [ ] 12. End-to-End Verification

  **What to do**:
  - Run full generator flow: `turbo gen plugin --args "demo" "Demo Notes" "A demo notes app"`
  - Verify all files created correctly
  - Run `pnpm install` to link new package
  - Run `pnpm build` to verify compilation
  - Run tests on generated package
  - Verify example episode renders

  **Must NOT do**:
  - Don't leave test-generated packages (clean up after verification)

  **Parallelizable**: NO (final task)

  **References**:
  - All previous tasks

  **Acceptance Criteria**:
  - [ ] `turbo gen plugin --args "demo" "Demo Notes" "Demo"` completes without errors
  - [ ] `packages/apps-demo/` exists with correct structure
  - [ ] `packages/apps-demo/src/runtime/adapters/anchors.ts` exists (Task 6a)
  - [ ] `packages/apps-demo/src/config/theme.ts` exists (Task 6b)
  - [ ] `packages/apps-demo/src/components/tokens.ts` exists (Task 6b)
  - [ ] `grep "anchors:" packages/apps-demo/src/plugin.ts` shows anchors field
  - [ ] `pnpm install` succeeds
  - [ ] `pnpm build` succeeds (verifies anchors/theme compile correctly)
  - [ ] `pnpm test --filter=@tokovo/apps-demo` passes (5 tests)
  - [ ] Plugin registered in PluginManager (check import exists)
  - [ ] Example episode file exists and compiles
  - [ ] Clean up: `rm -rf packages/apps-demo` after verification

  **Commit**: NO (verification only, cleanup after)

---

## Commit Strategy

| After Task | Message                                                                | Files                               | Verification             |
| ---------- | ---------------------------------------------------------------------- | ----------------------------------- | ------------------------ |
| 1          | `feat(generators): setup turbo generators directory structure`         | `turbo/generators/`, `package.json` | `pnpm build`             |
| 2          | `feat(generators): add plugin generator config skeleton`               | `turbo/generators/config.ts`        | `turbo gen` shows plugin |
| 3          | `feat(generators): add interactive prompts with validation`            | `turbo/generators/config.ts`        | Run prompts manually     |
| 4-7        | `feat(generators): add complete plugin templates (Tier A+B+C)`         | `turbo/generators/templates/**`     | Templates exist          |
| 8          | `feat(generators): implement generator actions with auto-registration` | `turbo/generators/config.ts`        | Generate test plugin     |
| 9-10       | `feat(generators): add test and example episode templates`             | `turbo/generators/templates/**`     | Templates exist          |
| 11         | `docs(generators): add plugin generator documentation`                 | `turbo/generators/README.md`        | File readable            |

---

## Success Criteria

### Verification Commands

```bash
# 1. Verify @turbo/gen is installed
pnpm ls @turbo/gen  # Expected: @turbo/gen in devDependencies

# 2. Generator shows in list
turbo gen  # Expected: "plugin" appears in generator list

# 3. Generate a test plugin
turbo gen plugin --args "demo" "Demo Notes" "A demo notes application"

# 4. Verify package created with correct structure
ls packages/apps-demo/  # Expected: package.json, tsconfig.json, vitest.config.ts, src/
ls packages/apps-demo/src/  # Expected: index.ts, plugin.ts, runtime/, ui/, dsl/, lowering/, layout/
ls packages/apps-demo/src/__tests__/  # Expected: reducer.test.ts, selectors.test.ts

# 5. Verify episode created in correct location (NO registration call in episode)
ls packages/episodes/src/production/example-demo.episode.ts  # Expected: File exists
grep "registerDemoPlugin" packages/episodes/src/production/example-demo.episode.ts  # Expected: NO MATCH (episodes don't register)

# 6. Verify plugin exports registration function (for apps to use)
grep "registerDemoPlugin" packages/apps-demo/src/plugin.ts  # Expected: Function found
grep "registerDemoPlugin" packages/apps-demo/src/index.ts  # Expected: Export found

# 7. Install and build
pnpm install && pnpm build  # Expected: Success, no TypeScript errors

# 8. Run tests on generated package
pnpm test --filter=@tokovo/apps-demo  # Expected: 5 tests pass

# 9. Verify plugin can be imported
node -e "require('@tokovo/apps-demo')"  # Expected: No errors

# 10. Clean up after verification
rm -rf packages/apps-demo
rm packages/episodes/src/production/example-demo.episode.ts
```

### Vitest Prerequisite Check

Before Task 9 (test templates), verify Vitest is available:

```bash
pnpm ls vitest  # Expected: vitest in devDependencies at root or workspace level
```

Vitest IS installed (verified in `packages/device-camera`). Generated plugin will include vitest in its own devDependencies.

### Final Checklist

- [ ] All "Must Have" features present
- [ ] All "Must NOT Have" items absent
- [ ] Generator produces working plugin in single command
- [ ] Generated code follows Tokovo patterns exactly (currentScreen routing, DSL chaining)
- [ ] Tests pass on generated code
- [ ] Example episode compiles and registers plugin correctly
- [ ] No modifications to packages/core/ required
