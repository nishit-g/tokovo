# Anti-Patterns

- Returning normalized (0–1) bounds from `AnchorProvider` (Tokovo v1 `AnchorProvider` anchors are pixel-space `Rect`).
- Mixing camera scale with layout sizing without a rule.
- Using long, slow zooms for fast UI actions.
- Camera movement not aligned with UI state changes.
