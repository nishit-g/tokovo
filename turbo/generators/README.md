# Tokovo Plugin Generator

Generate production-ready Tokovo App Plugins with a single command.

## Usage

```bash
turbo gen plugin
```

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
