# WhatsApp Plugin Enterprise Refactor

## Context

### Original Request

User wants to fix all issues in WhatsApp plugin: anchor registry split (critical bug), duplicate components, dead code, strategy pattern overhead, and `as any` casts. Goal is enterprise-grade, scalable, extensible architecture.

### Interview Summary

**Key Discussions**:

- Token structure: Keep WhatsAppTheme interface (structured), delete flat tokens/config.ts
- Platforms: Support both iOS and Android via token-driven components
- Themes: Ghibli/Cyberpunk as token overrides + optional component overrides
- Anchor fix: Include in this refactor (P0 critical)

**Research Findings**:

- **WhatsAppDirector**: 354-line class, exported but NEVER consumed - safe to delete
- **whatsappConfig**: Only defined in tokens/, NO usages in components (0 matches for `whatsappConfig.`) - safe to delete
- **Legacy components** (root MessageBubble.tsx, Header.tsx, ChatsListScreen.tsx): NO imports found - safe to delete
- **Strategy pattern**: UIStrategyRegistry used in plugin.ts, ChatScreen.tsx, 4 strategy files - ACTIVE, needs migration
- **ios/android components**: 42 imports across 9 files - heavily used by strategies, need consolidation
- **Anchor registry**: Split between core and device-camera - CRITICAL BUG

### Metis Review

**Identified Gaps** (addressed):

- Need `lsp_find_references` before deletions → Verified via grep: WhatsAppDirector unused, whatsappConfig unused, legacy components unused
- Need explicit DELETE list → Provided in Phase 5
- Need acceptance criteria beyond "builds" → Added functional verification steps
- Need guardrails on scope creep → Added "MUST NOT" rules per phase

---

## Work Objectives

### Core Objective

Fix critical anchor registry bug, consolidate duplicate components into token-driven architecture, and eliminate dead code to create enterprise-grade WhatsApp plugin.

### Concrete Deliverables

1. Unified anchor registry (device-camera re-exports from core)
2. Theme context system (ThemeProvider + useTheme hook)
3. Single set of token-driven components (no ios/android folders)
4. Clean plugin contract (no `as any` casts)
5. Zero dead code

### Definition of Done

- [ ] `pnpm build` passes with 0 errors in apps-whatsapp
- [ ] `pnpm dev` renders WhatsApp chat correctly
- [ ] Focus/track camera effects resolve anchors (test with sample episode)
- [ ] Both iOS and Android themes render correctly
- [ ] No `as any` in plugin.ts
- [ ] No files in components/ios/ or components/android/

### Must Have

- Unified anchor registry
- Theme context with useTheme() hook
- Token-driven components (platform-agnostic)
- Clean plugin contract

### Must NOT Have (Guardrails)

- DO NOT change component external APIs (props, exports) unless necessary for token integration
- DO NOT add new features while consolidating
- DO NOT modify runtime/, lowering/, dsl/, layout/ layers
- DO NOT touch other apps (Twitter, etc.)
- DO NOT change camera system (already v1 ready)
- DO NOT introduce new `as any` casts
- DO NOT delete files with active references (verify with grep first)

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES (pnpm build, pnpm dev)
- **User wants tests**: Manual verification (functional testing)
- **Framework**: Visual inspection via pnpm dev

### Manual Verification Procedures

Each phase includes specific verification steps. Final verification:

1. **Build Check**: `pnpm build` in packages/apps-whatsapp
2. **Runtime Check**: `pnpm dev` and navigate to WhatsApp chat
3. **Theme Check**: Verify iOS and Android themes apply correctly
4. **Camera Check**: Render sample episode with focus/track effects

---

## Task Flow

```
Phase 1 (Anchors) → Phase 2 (Theme) → Phase 3 (Components) → Phase 4 (Screens)
                                                                    ↓
                                                          Phase 5 (Cleanup)
                                                                    ↓
                                                          Phase 6 (Plugin)
                                                                    ↓
                                                          Phase 7 (Verify)
```

## Parallelization

| Phase/Task       | Depends On | Reason                                       |
| ---------------- | ---------- | -------------------------------------------- |
| 1 (Anchors)      | None       | Independent critical fix                     |
| 2 (Theme Ctx)    | None       | Can parallel with Phase 1                    |
| 3 (Del Tokens)   | 2          | Sequential with 2 (context must exist first) |
| 4-7 (Components) | 2, 3       | Needs useTheme() hook from Phase 2           |
| 8 (Move Files)   | 4-7        | After token-driven components done           |
| 9 (Screens)      | 8          | Uses consolidated components                 |
| 10-11 (Cleanup)  | 9          | Delete after migration complete              |
| 12 (Plugin)      | 1, 10-11   | Needs anchors fixed and dead code gone       |
| 13 (Verify)      | All        | Final check                                  |

**Execution Order**:

- Phase 1 and Phase 2 can run in PARALLEL
- Phase 3 runs AFTER Phase 2 (sequential within phase)
- Phases 3-7 commit together after all complete

---

## TODOs

### Phase 1: Fix Anchor Registry Split (P0 CRITICAL)

- [x] 1. Unify Anchor Registry

  **What to do**:
  - Modify `packages/device-camera/src/anchors/registry.ts` to re-export from `@tokovo/core` instead of maintaining its own Map
  - Update any internal device-camera imports that reference the local registry
  - Verify the merge doesn't break initialization timing

  **Must NOT do**:
  - Create new circular dependencies
  - Change the AnchorRegistry public API

  **Parallelizable**: YES (independent of other phases)

  **References**:
  - `packages/core/src/anchors/registry.ts` - Source of truth for anchor registry (keep as-is)
  - `packages/device-camera/src/anchors/registry.ts` - DELETE local Map, re-export from core
  - `packages/device-camera/src/index.ts` - Update exports if needed

  **Acceptance Criteria**:
  - [x] `packages/device-camera/src/anchors/registry.ts` contains only re-exports from `@tokovo/core`
  - [x] No duplicate `Map` instances for anchor providers
  - [x] `pnpm build` passes in device-camera package
  - [x] Grep for "new Map" in device-camera/anchors/ returns 0 results

  **Commit**: YES
  - Message: `fix(device-camera): unify anchor registry with core`
  - Files: `packages/device-camera/src/anchors/registry.ts`, `packages/device-camera/src/index.ts`

---

### Phase 2: Create Unified Theme Context

- [x] 2. Create Theme Context Provider

  **What to do**:
  - Create `packages/apps-whatsapp/src/theme/context.tsx` with ThemeProvider and useTheme hook
  - Keep existing `theme/index.ts` (WhatsAppTheme, iosTheme, androidTheme, getTheme)
  - Add variant overlays (ghibli, cyberpunk) to theme/index.ts if not present
  - Export context from theme/index.ts

  **Must NOT do**:
  - Change WhatsAppTheme interface structure
  - Modify existing iosTheme/androidTheme values
  - Add ThemeProvider to plugin initialization (it goes in UI layer)

  **Parallelizable**: YES (with Phase 1)

  **References**:
  - `packages/apps-whatsapp/src/theme/index.ts:1-260` - Existing theme definitions (WhatsAppTheme, iosTheme, androidTheme, getTheme)
  - React Context pattern: createContext, useContext, Provider

  **Implementation Pattern** (exact code structure):

  ```typescript
  // theme/context.tsx
  import React, { createContext, useContext, useMemo } from "react";
  import { WhatsAppTheme, getTheme, Platform } from "./index";

  const ThemeContext = createContext<WhatsAppTheme | null>(null);

  export interface WhatsAppThemeProviderProps {
    platform?: Platform;        // "ios" | "android", defaults to "ios"
    darkMode?: boolean;         // defaults to false
    children: React.ReactNode;
  }

  export function WhatsAppThemeProvider({
    platform = "ios",
    darkMode = false,
    children,
  }: WhatsAppThemeProviderProps) {
    const theme = useMemo(
      () => getTheme(platform, darkMode),
      [platform, darkMode]
    );
    return (
      <ThemeContext.Provider value={theme}>
        {children}
      </ThemeContext.Provider>
    );
  }

  export function useTheme(): WhatsAppTheme {
    const theme = useContext(ThemeContext);
    if (!theme) {
      throw new Error("useTheme must be used within WhatsAppThemeProvider");
    }
    return theme;
  }
  ```

  **Acceptance Criteria**:
  - [x] `theme/context.tsx` exists with WhatsAppThemeProvider and useTheme
  - [x] `useTheme()` returns WhatsAppTheme type
  - [x] ThemeProvider accepts platform and darkMode props
  - [x] TypeScript compiles with 0 errors

  **Commit**: YES
  - Message: `feat(apps-whatsapp): add theme context provider`
  - Files: `packages/apps-whatsapp/src/theme/context.tsx`, `packages/apps-whatsapp/src/theme/index.ts`

---

- [x] 3. Delete Unused Token System

  **What to do**:
  - Delete `packages/apps-whatsapp/src/tokens/config.ts`
  - Delete `packages/apps-whatsapp/src/tokens/index.ts`
  - Delete `packages/apps-whatsapp/src/tokens/` directory
  - Update any imports (verified: NO usages of whatsappConfig in components)

  **Must NOT do**:
  - Delete if any usages found (re-verify with grep before deletion)

  **Parallelizable**: NO (after task 2)

  **References**:
  - Grep verification: `whatsappConfig\.` returned 0 matches in components
  - `packages/apps-whatsapp/src/tokens/config.ts` - 161 lines, unused
  - `packages/apps-whatsapp/src/tokens/index.ts` - 9 lines, just re-exports

  **Acceptance Criteria**:
  - [x] `src/tokens/` directory does not exist
  - [x] `pnpm build` passes (no broken imports)

  **Commit**: YES (groups with task 2)
  - Message: `refactor(apps-whatsapp): remove unused tokens system`
  - Files: DELETE `packages/apps-whatsapp/src/tokens/`

---

### Phase 3: Consolidate Components

- [x] 4. Make MessageBubble Token-Driven

  **What to do**:
  - Copy `components/ios/MessageBubble.tsx` to `components/MessageBubble.tsx`
  - Add `useTheme()` hook at top of component
  - Replace hardcoded colors with `theme.colors.*`
  - Replace hardcoded spacing with `theme.spacing.*`
  - Update all imports to use new path
  - Delete `components/ios/MessageBubble.tsx`
  - Delete `components/android/MessageBubble.tsx`
  - Delete legacy `components/MessageBubble.tsx` (if different from ios version)

  **Must NOT do**:
  - Change component props interface
  - Add new features
  - Change rendering logic (only token substitution)

  **Parallelizable**: NO (depends on Phase 2)

  **References**:
  - `packages/apps-whatsapp/src/components/ios/MessageBubble.tsx` - Base implementation
  - `packages/apps-whatsapp/src/theme/index.ts` - Token values to use

  **Token Mapping Strategy** (exact substitutions):

  ```
  FROM COMPONENT                  → TO THEME TOKEN
  ─────────────────────────────────────────────────────────────
  Colors:
  "#DCF8C6"                       → theme.colors.sentBubble
  "#FFFFFF" (bubble bg)           → theme.colors.receivedBubble
  "#000000" (bubble text)         → theme.colors.sentBubbleText / receivedBubbleText
  "#667781" (timestamp)           → theme.colors.timestamp
  "#53BDEB" (read checkmark)      → theme.colors.checkmarkRead
  "#667781" (unread checkmark)    → theme.colors.checkmark
  "#027EB5" (links)               → theme.colors.link

  Typography:
  fontSize: 17                    → theme.typography.messageFontSize
  fontSize: 11 (timestamp)        → theme.typography.timestampFontSize
  fontFamily: (keep hardcoded)    → theme.typography.fontFamily

  Spacing:
  padding: "8px 12px"             → `${theme.spacing.messagePaddingVertical}px ${theme.spacing.messagePaddingHorizontal}px`
  borderRadius: 18                → theme.spacing.bubbleRadius
  borderRadius: 4 (tail)          → theme.spacing.bubbleRadiusTail
  ```

  **Pattern** (add at top of component):

  ```typescript
  import { useTheme } from "../../theme/context";

  export function MessageBubble({ ... }) {
    const theme = useTheme();

    // Then replace:
    // background: "#DCF8C6"
    // WITH:
    // background: isMe ? theme.colors.sentBubble : theme.colors.receivedBubble
  }
  ```

  **Acceptance Criteria**:
  - [ ] Single `components/MessageBubble.tsx` exists
  - [ ] No `components/ios/MessageBubble.tsx`
  - [ ] No `components/android/MessageBubble.tsx`
  - [ ] Component uses `useTheme()` for colors and spacing
  - [ ] No hardcoded color values (e.g., no `#DCF8C6`)
  - [ ] All imports updated (grep for old paths returns 0)

  **Commit**: NO (groups with 5, 6, 7)

---

- [x] 5. Make Header Token-Driven

  **What to do**:
  - Copy `components/ios/Header.tsx` to `components/Header.tsx`
  - Add `useTheme()` hook, replace hardcoded values with tokens
  - Update all imports to use new path
  - Delete `components/ios/Header.tsx`
  - Delete `components/android/Header.tsx`
  - Delete legacy `components/Header.tsx` (verified: no imports)

  **Must NOT do**:
  - Change component props interface
  - Modify header behavior/logic

  **Parallelizable**: YES (with tasks 4, 6, 7)

  **References**:
  - `packages/apps-whatsapp/src/components/ios/Header.tsx` - Base implementation
  - `packages/apps-whatsapp/src/theme/index.ts` - Token values

  **Acceptance Criteria**:
  - [ ] Single `components/Header.tsx` exists
  - [ ] No ios/android Header files
  - [ ] Uses `useTheme()` for styling

  **Commit**: NO (groups with 4, 6, 7)

---

- [x] 6. Make InputArea Token-Driven

  **What to do**:
  - Copy `components/ios/InputArea.tsx` to `components/InputArea.tsx`
  - Add `useTheme()` hook, replace hardcoded values with tokens
  - Update all imports to use new path
  - Delete `components/ios/InputArea.tsx`
  - Delete `components/android/InputArea.tsx`

  **Must NOT do**:
  - Change component props interface
  - Modify input behavior

  **Parallelizable**: YES (with tasks 4, 5, 7)

  **References**:
  - `packages/apps-whatsapp/src/components/ios/InputArea.tsx` - Base implementation
  - `packages/apps-whatsapp/src/theme/index.ts` - Token values

  **Acceptance Criteria**:
  - [ ] Single `components/InputArea.tsx` exists
  - [ ] No ios/android InputArea files
  - [ ] Uses `useTheme()` for styling

  **Commit**: NO (groups with 4, 5, 7)

---

- [x] 7. Make TypingIndicator Token-Driven

  **What to do**:
  - Copy `components/ios/TypingIndicator.tsx` to `components/TypingIndicator.tsx`
  - Add `useTheme()` hook, replace hardcoded values with tokens
  - Update all imports to use new path
  - Delete `components/ios/TypingIndicator.tsx`
  - Delete `components/android/TypingIndicator.tsx`
  - Delete `components/shared/TypingIndicator.tsx` if exists

  **Must NOT do**:
  - Change animation logic
  - Modify component API

  **Parallelizable**: YES (with tasks 4, 5, 6)

  **References**:
  - `packages/apps-whatsapp/src/components/ios/TypingIndicator.tsx` - Base implementation

  **Acceptance Criteria**:
  - [ ] Single `components/TypingIndicator.tsx` exists
  - [ ] No ios/android/shared TypingIndicator files
  - [ ] Uses `useTheme()` for styling

  **Commit**: YES
  - Message: `refactor(apps-whatsapp): consolidate components to token-driven`
  - Files: All modified/deleted component files

---

- [x] 8. Move Remaining iOS Components to Root

  **What to do**:
  - Move `components/ios/MessageList.tsx` → `components/MessageList.tsx`
  - Move `components/ios/MessageContent.tsx` → `components/MessageContent.tsx`
  - Move `components/ios/ChatListItem.tsx` → `components/ChatListItem.tsx`
  - Move `components/ios/ChatListHeader.tsx` → `components/ChatListHeader.tsx`
  - Move `components/ios/GroupHeader.tsx` → `components/GroupHeader.tsx`
  - Move `components/ios/GroupTypingIndicator.tsx` → `components/GroupTypingIndicator.tsx`
  - Move `components/ios/TabNavigation.tsx` → `components/TabNavigation.tsx`
  - Move `components/ios/Icons.tsx` → `components/Icons.tsx`
  - Update all imports across the codebase
  - Delete empty `components/ios/` folder
  - Delete empty `components/android/` folder

  **Must NOT do**:
  - Modify component logic during move
  - Add useTheme() to components that don't need it

  **Parallelizable**: NO (after tasks 4-7)

  **References**:
  - All files in `packages/apps-whatsapp/src/components/ios/`

  **Acceptance Criteria**:
  - [ ] `components/ios/` folder deleted
  - [ ] `components/android/` folder deleted
  - [ ] All components at `components/` root level
  - [ ] All imports updated
  - [ ] `pnpm build` passes

  **Commit**: YES
  - Message: `refactor(apps-whatsapp): flatten component structure`
  - Files: Moved components, updated imports

---

### Phase 4: Consolidate Screens

- [x] 9. Consolidate Screen Files

  **What to do**:
  - Create `components/screens/` directory
  - Move `ui/screens/ios/ChatScreen.tsx` → `components/screens/ChatScreen.tsx`
  - Move `ui/screens/ios/ChatListScreen.tsx` → `components/screens/ChatListScreen.tsx`
  - Move `ui/screens/ios/GroupInfoScreen.tsx` → `components/screens/GroupInfoScreen.tsx`
  - Update `ui/index.tsx` (WhatsappChatView) to:
    - Import from new paths
    - Wrap with ThemeProvider (get platform from props)
    - Remove UIStrategyRegistry usage
  - Update all screen imports across codebase

  **Must NOT do**:
  - Change screen logic
  - Modify navigation patterns
  - Change WhatsappChatView props interface

  **Parallelizable**: NO (depends on Phase 3)

  **References**:
  - `packages/apps-whatsapp/src/ui/screens/ios/ChatScreen.tsx` - Main chat screen
  - `packages/apps-whatsapp/src/ui/index.tsx` - Entry point (WhatsappChatView)

  **UIStrategyRegistry Removal Strategy** (exact changes):

  **In ui/index.tsx (WhatsappChatView):**

  ```typescript
  // BEFORE (current):
  import { ChatScreen } from "./screens/ios/ChatScreen";
  import { ChatListScreen } from "./screens/ios/ChatListScreen";
  // ... renders screens directly

  // AFTER (new):
  import { WhatsAppThemeProvider } from "../theme/context";
  import { ChatScreen } from "../components/screens/ChatScreen";
  import { ChatListScreen } from "../components/screens/ChatListScreen";

  export const WhatsappChatView: React.FC<WhatsappChatViewProps> = ({
    world,
    platform = "ios",  // Already exists in props
    ...rest
  }) => {
    // Wrap entire content with ThemeProvider
    return (
      <WhatsAppThemeProvider platform={platform}>
        <div style={{ width: "100%", height: "100%", backgroundColor: "#000" }}>
          {/* existing screen switch logic stays the same */}
          {activeScreenContent}
        </div>
      </WhatsAppThemeProvider>
    );
  };
  ```

  **In moved screen files (ChatScreen.tsx, etc.):**
  - Remove any `UIStrategyRegistry.get()` or `UIStrategyRegistry.forPlatform()` calls
  - Remove `tokens` variable if exists (components get theme from useTheme())
  - Remove conditional platform rendering (one component, token-driven)
  - Remove strategy imports: `import { UIStrategyRegistry } from "../../ui/ui-strategy";`

  **Acceptance Criteria**:
  - [ ] `components/screens/` contains ChatScreen, ChatListScreen, GroupInfoScreen
  - [ ] `ui/index.tsx` wraps content with `<WhatsAppThemeProvider platform={platform}>`
  - [ ] `ui/index.tsx` does NOT import UIStrategyRegistry
  - [ ] No file imports from `ui/strategies/`
  - [ ] `pnpm build` passes

  **Commit**: YES
  - Message: `refactor(apps-whatsapp): consolidate screens, remove strategy pattern`
  - Files: Screen files, ui/index.tsx

---

### Phase 5: Delete Dead Code

- [x] 10. Delete Dead Camera Code

  **What to do**:
  - Delete `packages/apps-whatsapp/src/camera/whatsapp-director.ts`
  - Update `camera/index.ts` to remove WhatsAppDirector export
  - Verify behaviors.ts remains (it's actually used)

  **Must NOT do**:
  - Delete behaviors.ts (it's used in plugin contract)
  - Delete anchors.ts (it's used in plugin contract)

  **Parallelizable**: YES (independent)

  **References**:
  - Grep verification: WhatsAppDirector only in whatsapp-director.ts and index.ts exports, NO consumers
  - `packages/apps-whatsapp/src/camera/behaviors.ts` - KEEP (used in plugin.ts)
  - `packages/apps-whatsapp/src/camera/anchors.ts` - KEEP (used in plugin.ts)

  **Acceptance Criteria**:
  - [ ] `camera/whatsapp-director.ts` does not exist
  - [ ] `camera/behaviors.ts` still exists
  - [ ] `camera/anchors.ts` still exists
  - [ ] No broken imports

  **Commit**: NO (groups with task 11)

---

- [x] 11. Delete Legacy Components and Strategy Files

  **What to do**:
  - Delete `src/components/ChatsListScreen.tsx` (legacy, verified no imports)
  - Delete `src/ui/screens/` folder (moved to components/screens/)
  - Delete `src/ui/strategies/` folder (ios.tsx, android.tsx, ghibli.tsx, cyberpunk.tsx)
  - Delete `src/ui/ui-strategy.ts`
  - Delete `src/views/` folder if exists
  - Update `src/index.ts` to remove dead exports

  **Must NOT do**:
  - Delete ui/index.tsx (it's the entry point, modified in Phase 4)

  **Parallelizable**: NO (after Phase 4)

  **References**:
  - Grep verification: Legacy components have 0 imports
  - UIStrategyRegistry will be removed from plugin.ts in Phase 6

  **Acceptance Criteria**:
  - [ ] `ui/screens/` folder deleted
  - [ ] `ui/strategies/` folder deleted
  - [ ] `ui/ui-strategy.ts` deleted
  - [ ] `components/ChatsListScreen.tsx` (legacy) deleted
  - [ ] `views/` folder deleted (if existed)
  - [ ] `pnpm build` passes

  **Commit**: YES
  - Message: `chore(apps-whatsapp): delete dead code and strategy pattern`
  - Files: All deleted files

---

### Phase 6: Clean Plugin Contract

- [x] 12. Remove as any Casts and Clean Exports

  **What to do**:
  - In `plugin.ts`:
    - Remove `as any` from `anchors: WhatsAppAnchors as any` (fix types if needed)
    - Remove `as any` from `reducer: whatsappReducer as PluginReducer<...>`
    - Remove UIStrategyRegistry.register() calls
    - Remove ghibliStrategy, cyberpunkStrategy imports (deleted in Phase 5)
    - Consolidate exports: keep only `WhatsAppPlugin` (remove `WhatsAppPluginV2`, `WhatsApp` aliases)
  - In `camera/anchors.ts`:
    - Ensure WhatsAppAnchors type matches TokovoPluginContract expectations
  - In `src/index.ts`:
    - Remove WhatsAppDirector export
    - Remove dead exports

  **Must NOT do**:
  - Introduce new type errors
  - Change plugin behavior
  - Modify event kinds or reducer logic

  **Parallelizable**: NO (after Phase 5)

  **Type Fix Strategy** (concrete steps):

  **Issue 1: `anchors: WhatsAppAnchors as any` (plugin.ts:166)**

  Expected type from TokovoPluginContract (core/types/plugin-contract.ts:196-199):

  ```typescript
  interface PluginAnchorRegistry {
    providers: Record<string, PluginAnchorProvider>;
    framing?: Record<string, AnchorFraming>;
  }

  type PluginAnchorProvider = (
    world: WorldState,
    deviceId: string,
  ) => AnchorBounds | null;
  ```

  **Resolution**: Update `camera/anchors.ts` to match this interface:

  ```typescript
  // camera/anchors.ts
  import type {
    PluginAnchorRegistry,
    PluginAnchorProvider,
    AnchorBounds,
  } from "@tokovo/core";

  const lastMessageProvider: PluginAnchorProvider = (world, deviceId) => {
    // Return AnchorBounds { x, y, width, height } in 0-1 normalized coords
    // Extract from layout state
    return null; // or actual bounds
  };

  export const WhatsAppAnchors: PluginAnchorRegistry = {
    providers: {
      lastMessage: lastMessageProvider,
      inputArea: inputAreaProvider,
      header: headerProvider,
    },
    framing: {
      lastMessage: { targetFill: 0.4, padding: { top: 0.1, bottom: 0.2 } },
      inputArea: { targetFill: 0.3, padding: { bottom: 0.1 } },
    },
  };
  ```

  **Issue 2: `reducer: whatsappReducer as PluginReducer<...>` (plugin.ts:88)**

  **Resolution**: If whatsappReducer already has correct signature, remove cast:

  ```typescript
  // If type error appears, ensure reducer signature matches:
  // (draft: WorldState, event: RuntimeEvent & { kind: "APP"; appId: "app_whatsapp" }) => void
  reducer: whatsappReducer,  // Remove "as PluginReducer<...>"
  ```

  **Fallback**: If types genuinely don't match (legacy issue), keep cast but add comment:

  ```typescript
  // TODO: Fix reducer signature to match PluginReducer<"app_whatsapp">
  reducer: whatsappReducer as PluginReducer<"app_whatsapp">,
  ```

  **Action for Worker**:
  1. First attempt: Remove both `as any` casts
  2. Run `pnpm build`
  3. If type error on anchors → Fix WhatsAppAnchors to match PluginAnchorRegistry
  4. If type error on reducer → Check signature, fix or document

  **References**:
  - `packages/apps-whatsapp/src/plugin.ts:166` - `anchors: WhatsAppAnchors as any`
  - `packages/apps-whatsapp/src/plugin.ts:88` - `reducer: whatsappReducer as PluginReducer<...>`
  - `@tokovo/core/src/types/plugin-contract.ts:188-199` - PluginAnchorRegistry interface
  - `@tokovo/core/src/types/plugin-contract.ts:63-66` - PluginReducer type

  **Acceptance Criteria**:
  - [ ] No `as any` in plugin.ts (or documented reason if unavoidable)
  - [ ] No UIStrategyRegistry usage
  - [ ] Single export name: `WhatsAppPlugin`
  - [ ] TypeScript compiles with 0 errors
  - [ ] Plugin still registers correctly

  **Commit**: YES
  - Message: `refactor(apps-whatsapp): clean plugin contract, remove as any`
  - Files: `plugin.ts`, `camera/anchors.ts`, `index.ts`

---

### Phase 7: Final Verification

- [x] 13. Verify Build and Runtime

  **What to do**:
  - Run `pnpm build` in packages/apps-whatsapp
  - Run `pnpm build` in root (full monorepo)
  - Run `pnpm dev` and verify WhatsApp renders
  - Test iOS theme: verify correct colors/spacing
  - Test Android theme: verify correct colors/spacing (if theme switcher available)
  - Test camera: render sample episode with focus effect on lastMessage anchor

  **Must NOT do**:
  - Skip any verification step
  - Consider done if visual issues exist

  **Parallelizable**: NO (final step)

  **References**:
  - Sample episodes in apps/video-runner or similar

  **Acceptance Criteria**:
  - [ ] `pnpm build` passes with 0 errors
  - [ ] `pnpm dev` starts without errors
  - [ ] WhatsApp chat renders correctly
  - [ ] iOS theme applied (correct bubble colors)
  - [ ] Android theme applied when selected
  - [ ] Camera focus/track effects work (anchors resolve)
  - [ ] No console errors related to WhatsApp plugin

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message                                                                 | Files               | Verification |
| ---------- | ----------------------------------------------------------------------- | ------------------- | ------------ |
| 1          | `fix(device-camera): unify anchor registry with core`                   | anchors/registry.ts | pnpm build   |
| 2-3        | `feat(apps-whatsapp): add theme context, remove unused tokens`          | theme/\*, tokens/   | pnpm build   |
| 4-7        | `refactor(apps-whatsapp): consolidate components to token-driven`       | components/\*       | pnpm build   |
| 8          | `refactor(apps-whatsapp): flatten component structure`                  | components/\*       | pnpm build   |
| 9          | `refactor(apps-whatsapp): consolidate screens, remove strategy pattern` | screens/_, ui/_     | pnpm build   |
| 10-11      | `chore(apps-whatsapp): delete dead code and strategy pattern`           | camera/_, ui/_      | pnpm build   |
| 12         | `refactor(apps-whatsapp): clean plugin contract, remove as any`         | plugin.ts, index.ts | pnpm build   |

---

## Success Criteria

### Verification Commands

```bash
# Build check
cd packages/apps-whatsapp && pnpm build

# Full monorepo build
pnpm build

# Runtime check
pnpm dev
# → Navigate to WhatsApp, verify rendering

# Anchor check
# → Render episode with camera focus on lastMessage
# → Verify camera moves to message (anchor resolves)
```

### Final Checklist

- [ ] Anchor registry unified (1 Map in core, device-camera re-exports)
- [ ] Theme context exists (ThemeProvider + useTheme)
- [ ] No components/ios/ folder
- [ ] No components/android/ folder
- [ ] No ui/strategies/ folder
- [ ] No tokens/ folder
- [ ] No whatsapp-director.ts
- [ ] No `as any` in plugin.ts
- [ ] All components use useTheme() for styling
- [ ] pnpm build passes with 0 errors
- [ ] pnpm dev renders WhatsApp correctly
