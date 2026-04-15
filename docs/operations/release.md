# Release Gate

Tokovo has one canonical release command:

```bash
pnpm verify:release
```

That command runs:

1. `pnpm lint:ox`
2. `pnpm lint:release`
3. `pnpm -s typecheck:solution`
4. `pnpm validate`
5. `pnpm --filter @tokovo/episodes run test -- --runInBand`
6. `pnpm build`
7. `pnpm render:smoke`
8. `pnpm verify:docs`

## Operator Notes

- Release branches should be merged only if `pnpm verify:release` is green.
- Render-service smoke is part of the release gate because Tokovo is not “healthy” unless a real render path passes.
- Docs verification stays inside the release command so architecture and package docs cannot drift silently.
- If `pnpm verify:release` fails inside render-service, use `docs/operations/render-service-failures.md`.
