# Release Check

Run the Tokovo public-release gate and summarize failures by package.

```bash
pnpm verify:release
```

If the full gate is too broad for the current change, start with:

```bash
pnpm validate
pnpm -s typecheck:solution
pnpm --filter @tokovo/episodes test
```
