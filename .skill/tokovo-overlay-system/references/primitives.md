# Overlay Primitives (Creator Surface)

The v2 DSL provides:
- `ov.at(t).hook(text, options?)`
- `ov.at(t).caption(text, options?)`
- `ov.at(t).receipt(text, options?)`
- `ov.at(t).cliffhanger(text, options?)`
- `ov.at(t).reactionGif(src, options?)`
- `ov.at(t).hide({ id | lane | variant })`
- `ov.at(t).clear()`

Options (high-signal):
- `durationFrames`: deterministic lifetime
- `preset`: `top|bottom|...` placement
- `intensity`: 0-1 emphasis
- `lane`: replacement channel (one item per lane)

Repo path:
- DSL: `packages/dsl/src/v2/overlay-track.ts`

