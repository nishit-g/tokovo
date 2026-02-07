# Patterns and Anti-Patterns

## Patterns

### Strategy Pattern (Layouts)
- Use `src/layout/index.ts` to register one or more `PluginLayoutStrategy` items.
- Keep layout strategies pure: compute layout from inputs, no side effects.
- Prefer small view-kind-specific strategies rather than a single monolith.

### Tokens + Theme
- Define shared design constants in `components/tokens.ts`.
- Use `config/theme.ts` to construct theme objects from tokens.
- UI components should import tokens/theme rather than hard-coded values.

### Anchor Providers
- Preferred: implement `anchorProvider` (pixel-space `Rect` anchors, layout-aware).
- Anchor IDs are plain keys within a snapshot (no `appId:` prefix in DSL).
- Device-owned anchors are merged into every snapshot: `device`, `app`, `keyboard`, `dynamicIsland`, `notification_banner`.
- Legacy support: `anchors.providers` can still return normalized (0–1) bounds, but avoid for new plugins.

### Deterministic DSL
- Default IDs and timestamps should be derived from `event.at` and `_declarationOrder`.
- Use seeded RNG if randomness is required.

## Anti-Patterns

### Scaling Anti-Patterns
- Mixing device pixel density with layout units directly.
- Using normalized bounds in the pixel-space `AnchorProvider` pipeline (wrong coordinate system).
- Applying camera scale and UI scale independently without a defined rule.

### Static Asset Anti-Patterns
- Using raw file paths without registering assets.
- Changing icons/sounds without updating the asset registry.

### Event System Anti-Patterns
- Missing `eventKinds` in plugin contract.
- Emitting TrackEvents that are not declared in module augmentation.
- Using `Date.now()`/`Math.random()` in runtime code.
