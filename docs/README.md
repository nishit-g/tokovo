# Tokovo Documentation

Tokovo intentionally keeps one small, current documentation set. Historical implementation plans,
duplicate architecture summaries, tiny package fragments, and completed migration checklists are
deleted after their durable decisions are folded into these documents.

## Canonical Documents

| Document                                                    | Purpose                                                                                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [Engineering Handbook](./ENGINEERING_HANDBOOK.md)           | Complete product, authoring, compiler, runtime, app, device, camera, renderer, testing, and extension architecture              |
| [Episode Planning Playbook](./EPISODE_PLANNING_PLAYBOOK.md) | Creative-production standard for story, cast, character style, color, performance, voice, sound, camera, retention, and release |
| [Camera](./CAMERA.md)                                       | Exact cinematography model, authoring API, subjects, motion, optics, diagnostics, and extension rules                           |
| [WhatsApp](./WHATSAPP.md)                                   | Reference app package and hard-cut migration                                                                                    |
| [X](./X.md)                                                 | Second reference app package and fidelity contract                                                                              |
| [Platform Visuals](./PLATFORM_VISUALS.md)                   | Device geometry, safe areas, typography, keyboard, notifications, lock/home, island, and composition                            |
| [Rendering and Performance](./RENDERING.md)                 | Release pipeline, caching, benchmark evidence, render jobs, Remotion, and MediaBunny decisions                                  |
| [Visual Editor Decision](./STUDIO.md)                       | Deleted editor scope, retained engine boundaries, and reconsideration criteria                                                  |
| [Operations](./OPERATIONS.md)                               | Toolchain, release gate, logging, render failures, cache diagnosis, and public-release checklist                                |

The [Engineering Handbook](./ENGINEERING_HANDBOOK.md) is authoritative when a topic crosses more
than one specialist document.

## Product Status

- Active priority: code-first, LLM-assisted content creation and publishing.
- Visual editor: deleted, including its app, model, interaction, compiler-adapter, package-contribution,
  and render-job surfaces.
- Reference migrated app packages: WhatsApp and X.
- Other app packages: code-first runtime support where implemented, but not claimed as reference
  headless migrations.
- Toolchain: Node.js `22.22.0` and pnpm `10.28.2` through mise.

## Public Documentation Site

`apps/docs` is the user-facing documentation application. Its guides and package pages may explain
the same APIs at a beginner level, but they must link back to this canonical engineering set for
architecture and operational truth.

## Documentation Policy

- Do not add `*_IMPLEMENTATION_PLAN.md` after a migration is complete.
- Do not add `V1`, `V2`, or `VNEXT` filenames for the one supported current architecture.
- Do not keep superseded architecture for historical interest in the main tree; Git is the history.
- Do not create a separate tiny file when the content belongs in one of the canonical documents above.
- Treat the episode-planning playbook as the owner of reusable creative-production decisions and
  the engineering handbook as the owner of runtime and authoring architecture.
- Do not describe a target as measured or a deleted surface as present.
- Update the owning document in the same change as a contract, workflow, or support-boundary change.
- Every relative Markdown link must resolve.

## Where New Information Belongs

| Change                                                             | Owning document                |
| ------------------------------------------------------------------ | ------------------------------ |
| Cross-system architecture or content workflow                      | `ENGINEERING_HANDBOOK.md`      |
| Story, cast, character style, color, sound, and editorial planning | `EPISODE_PLANNING_PLAYBOOK.md` |
| Camera API, motion, subject, lens, or diagnostic                   | `CAMERA.md`                    |
| WhatsApp contract or migration rule                                | `WHATSAPP.md`                  |
| X contract or migration rule                                       | `X.md`                         |
| Device/OS visual behavior                                          | `PLATFORM_VISUALS.md`          |
| Render performance, caching, encoding, or job identity             | `RENDERING.md`                 |
| Visual-editor deletion or reconsideration decision                 | `STUDIO.md`                    |
| Toolchain, release, logging, or incident response                  | `OPERATIONS.md`                |

If information has no clear owner in this table, first decide which architectural boundary owns it.
Do not solve uncertainty by creating another document.
