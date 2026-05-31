# Claude Guide

Read `AGENTS.md` first. It is the canonical agent guide for this repository.

Tokovo is a deterministic TypeScript monorepo for multi-device phone-show generation and rendering. Keep work aligned with the repo's core rules:

- use `pnpm`
- preserve deterministic replay
- keep app semantics inside app packages
- keep runtime registration explicit
- use semantic camera anchors
- declare sound, voice, background, overlay, and render choices as episode data
- do not commit generated renders, caches, secrets, or local outputs unless they are intentional docs showcase assets

Recommended first commands:

```bash
pnpm validate
pnpm -s typecheck:solution
pnpm --filter @tokovo/episodes test
```

For public-release or cross-package work, run:

```bash
pnpm verify:release
```
