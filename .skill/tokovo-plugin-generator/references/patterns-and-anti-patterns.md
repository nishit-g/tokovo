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
- Providers return normalized 0–1 bounds.
- Names are local keys; registry namespaces by `appId:anchor`.
- Return `null` to fall back to default framing.

### Deterministic DSL
- Default IDs and timestamps should be derived from `event.at` and `_declarationOrder`.
- Use seeded RNG if randomness is required.

## Anti-Patterns

### Scaling Anti-Patterns
- Mixing device pixel density with layout units directly.
- Using pixel units in anchors instead of normalized (0–1) bounds.
- Applying camera scale and UI scale independently without a defined rule.

### Static Asset Anti-Patterns
- Using raw file paths without registering assets.
- Changing icons/sounds without updating the asset registry.

### Event System Anti-Patterns
- Missing `eventKinds` in plugin contract.
- Emitting TrackEvents that are not declared in module augmentation.
- Using `Date.now()`/`Math.random()` in runtime code.
