# DSL V2

Tokovo DSL v2 builds track-based episode IR. That IR is lowered by `@tokovo/compiler`
into deterministic runtime events for replay and rendering.

## Rules

- Build episodes with explicit devices, snapshots, and tracks
- Keep timeline ordering deterministic
- Treat plugin bootstrap data as schema-validated inputs
- Use `prepareTrackEpisode()` as the canonical preparation path

## Output

- Episode IR
- Runtime events
- Initial world state
- Asset references
- Stable event signatures
