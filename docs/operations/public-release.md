# Public Release Readiness

Tokovo's v1 public release needs to be understandable, buildable, auditable, and maintainable by people outside the original development context.

This checklist complements [`release.md`](release.md) and [`../V1_STABILITY.md`](../V1_STABILITY.md).

## Required Before v1.0.0

- [ ] `pnpm verify:release` passes from a clean checkout.
- [ ] The default branch is protected by `.github/workflows/release-gate.yml`.
- [ ] `README.md` accurately explains what Tokovo is, how to install it, and how to verify it.
- [ ] `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and `CHANGELOG.md` are present.
- [ ] GitHub issue templates and the pull request template match the current maintainer workflow.
- [ ] `ASSET_LICENSES.md` accounts for bundled media, generated sounds, icons, fonts, and sample assets.
- [ ] `.env.example` files contain placeholders only.
- [ ] No local `.env`, credential, render output, or generated cache files are tracked.
- [ ] Package metadata reflects the intended public surface and private/internal packages are marked private.
- [ ] A v1.0.0 tag and release notes are drafted from `CHANGELOG.md`.

## OSS Maintainer Automation

The OpenAI Codex for Open Source program supports maintainers using Codex for pull request review, maintainer automation, release workflows, and other core OSS work. Tokovo's release process should make those workflows straightforward:

- Keep `pnpm verify:release` as the single high-confidence command for Codex and humans.
- Keep issue and PR templates structured enough for automated triage.
- Keep release docs precise enough for agents to update changelogs, run checks, and propose release notes.
- Keep security reporting separate from public triage.

## Pre-Publish Audit

Run these before tagging v1.0.0:

```bash
git status --short
git ls-files | rg '(^|/)\\.env($|\\.)|\\.pem$|secret|key' || true
pnpm install --frozen-lockfile
pnpm verify:release
```

If package publishing is part of v1.0.0, also check:

```bash
pnpm -r publish --dry-run
```

Review the dry-run output for accidental files, missing licenses, broken exports, and private packages that should not publish.
