# Tokovo Plugin Generator

Generate production-ready Tokovo App Plugins with a single command.

## Usage

```bash
pnpm turbo gen plugin
```

Or with arguments (non-interactive):

```bash
pnpm turbo gen plugin --args "notes" "Notes" "A notes application"
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
│   │   ├── selectors.ts   # State selectors
│   │   └── adapters/
│   │       └── anchors.ts # Camera framing
│   ├── config/
│   │   └── theme.ts       # Theme configuration
│   ├── components/
│   │   └── tokens.ts      # Design tokens
│   ├── ui/
│   │   ├── index.tsx      # Main view with routing
│   │   ├── NotesList.tsx
│   │   └── NoteDetail.tsx
│   │   └── NoteEditor.tsx
│   ├── dsl/
│   │   └── index.ts       # Track builder (v2 DSL)
│   ├── lowering/
│   │   └── index.ts       # Track→Runtime events
│   ├── layout/
│   │   └── index.ts       # Layout strategies
│   ├── types/
│   │   ├── events.ts      # Track/event types
│   │   ├── module-augmentation.ts
│   │   └── index.ts       # Barrel + augmentation import
│   └── __tests__/
│       ├── reducer.test.ts
│       └── selectors.test.ts
```

## Registering Your Plugin

**IMPORTANT**: Plugins must be registered by apps, not episodes.

### Step 1: Add to Video Runner (or your app entry point)

Edit `apps/video-runner/src/runtime.ts` (after other plugin imports/registrations):

```typescript
import { register{{ pascalCase name }}Plugin } from "@tokovo/apps-{{ name }}"; // Add this import

// In initialization (before any episode rendering):
register{{ pascalCase name }}Plugin(pluginManager); // Add this call
```

### Step 2: Use in Episodes

Episodes do NOT call registration - they assume plugins are already registered:

```typescript
// packages/episodes/src/production/my-{{ name }}-episode.episode.ts
import { defineEpisode } from "@tokovo/episodes";
import { episode } from "@tokovo/dsl";
import { {{ pascalCase name }}TrackBuilder } from "@tokovo/apps-{{ name }}";

export default defineEpisode({
  meta: {
    id: "my-{{ name }}-episode",
    title: "{{ displayName }} Demo",
    category: "production",
  },
  config: { format: "1080x1920", durationInFrames: 300, apps: ["app_{{ name }}"] },
  build: () =>
    episode("my-{{ name }}-episode", { fps: 30, duration: "10s" })
      .device("phone", "iphone16", { app: "app_{{ name }}" })
      .track(
        "app_{{ name }}",
        (getOrder) => new {{ pascalCase name }}TrackBuilder(30, "phone", getOrder),
        (api) => {
          api.at("1s").createNote({ id: "note-1", title: "Hello", content: "World" });
        },
      )
      .build(),
});
```

**Why Separate Registration:**

- Apps register plugins once at startup
- Episodes assume plugins are already available
- This pattern enables plugin reuse across multiple episodes

**⚠️ CRITICAL POST-GENERATION STEP** (MUST NOT SKIP):

After generating a plugin with `turbo gen plugin`, you MUST manually register it:

1. Open `apps/video-runner/src/runtime.ts`
2. Add import: `import { register{{ pascalCase name }}Plugin } from "@tokovo/apps-{{ name }}";`
3. Add call after other registrations: `register{{ pascalCase name }}Plugin(pluginManager);`
4. Restart dev server

**Without this step, episodes using the plugin will fail with "Plugin not registered" error.**

## Determinism Rules (Do Not Skip)

- Never use `Date.now()` or `Math.random()` in DSL, lowering, reducers, or runtime.
- Use frame-derived timestamps or seeded RNG (`createSeededRng`) if randomness is required.
- Default IDs should be derived from `(frame, _declarationOrder)` for stable output.

## Type Registries

Ensure `src/types/module-augmentation.ts` registers:

- `@tokovo/ir` → `AppTrackEventRegistry`
- `@tokovo/core` → `AppStateMap`, `AppEventKindRegistry`, `AppInitialStateRegistry`

## Testing

```bash
pnpm test --filter=@tokovo/apps-{{ name }}
```
