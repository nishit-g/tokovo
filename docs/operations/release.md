# Release Gate

Tokovo has one canonical release command:

```bash
pnpm verify:release
```

That command runs:

1. `pnpm lint:packages`
2. `pnpm lint:ox`
3. `pnpm lint:release`
4. `pnpm -s typecheck:solution`
5. `pnpm validate`
6. `pnpm test`
7. `pnpm build`
8. `pnpm render:smoke`
9. `pnpm verify:docs`

## Operator Notes

- Release branches should be merged only if `pnpm verify:release` is green.
- Render-service smoke is part of the release gate because Tokovo is not “healthy” unless a real render path passes.
- Docs verification stays inside the release command so architecture and package docs cannot drift silently.
- CI runs the complete gate on both supported Node.js majors (22 and 24).
- If `pnpm verify:release` fails inside render-service, use `docs/operations/render-service-failures.md`.
- Before a public release, complete `docs/operations/public-release.md`.
