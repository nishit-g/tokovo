# Determinism Rules

## Hard Rules
- No `Date.now()` or `Math.random()` in DSL, lowering, reducers, or runtime.
- Default IDs should be derived from `(event.at, _declarationOrder)`.
- If randomness is needed, use a seeded RNG and surface the seed.

## Why It Matters
- Deterministic output enables caching and reproducible renders.
- Non-determinism leads to drifting frames and unstable snapshots.
