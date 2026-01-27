# Tokovo World-Class Documentation

## Context

### Original Request

Create enterprise-level, world-class documentation for the Tokovo monorepo (12 packages) using Nextra. Every section should have clear meaning, ASCII diagrams throughout showing how things are connected, production-ready examples, and comprehensive coverage with nothing missed.

### Interview Summary

**Key Discussions**:

- **Audience**: All three - Internal devs, External SDK developers, Content creators
- **Scope**: ALL 12 packages with comprehensive coverage
- **API Reference**: Manual hand-written (not auto-generated) for quality control
- **Features**: Pagefind search, Dark mode, English only, Current version only
- **Deployment**: Vercel
- **Quality Bar**: "Enterprise level and world class" with ASCII diagrams

**Research Findings**:

- Nextra 4.6.2 with Next.js 14+ App Router is current stable
- Pagefind provides free static search with zero server cost
- @tokovo/core has 250+ exports across 14 domain categories
- Existing `docs/camera/` has high-quality architecture docs to migrate
- Package priorities: P0 (core, device-camera), P1 (renderer, dsl, apps-whatsapp), P2/P3 (rest)

### Metis Review

**Identified Gaps** (addressed with defaults):

- Documentation location: **apps/docs/** (monorepo app pattern)
- API depth: **Use-Case Driven** with hierarchical fallback
- ASCII diagrams: **Manual ASCII** (matches README style)
- Coverage validation: **Automated audit script** included
- Navigation: **Audience-aware** but single nav (progressive disclosure)
- Versioning: **Deferred** (current only, infrastructure later if needed)
- Examples: **Hybrid** (conceptual snippets + links to full examples)
- Unstable packages: Mark as "Experimental/WIP" in docs
- Plugin system: **First-class feature** (main nav, not advanced)
- DSL versioning: **v2 only** (v1 is legacy)
- Theming: **Default Nextra** (minimal customization for MVP)
- World-class benchmark: **Stripe/Vercel docs** quality standard

---

## Work Objectives

### Core Objective

Build enterprise-grade documentation site using Nextra that comprehensively documents all 12 Tokovo packages with ASCII architecture diagrams, clear purpose for every page, and production-ready examples.

### Concrete Deliverables

1. **Nextra App** at `apps/docs/` (runnable via `pnpm dev --filter=docs`)
2. **50+ Content Pages** covering all packages, concepts, and guides
3. **20+ ASCII Architecture Diagrams** showing system connections
4. **Search** via Pagefind integration
5. **Dark Mode** functional theme switcher
6. **Vercel Deployment** configuration
7. **Coverage Audit Script** to verify nothing is missed

### Definition of Done

- [ ] `pnpm dev --filter=docs` starts Nextra dev server at localhost:3000
- [ ] All 12 packages have dedicated documentation pages
- [ ] Homepage loads in < 2s, Lighthouse score > 90
- [ ] Search returns results for "WorldState", "camera", "episode"
- [ ] Dark mode toggle works
- [ ] `pnpm run docs:audit` shows 100% package coverage
- [ ] ASCII diagrams render correctly in all pages

### Must Have

- Landing page with clear value proposition
- Getting Started guide (installation, first episode)
- Architecture overview with ASCII diagrams
- All 12 package documentation pages (depth varies by priority)
- API reference for P0/P1 packages (core, camera, renderer, dsl, apps-whatsapp)
- Camera system documentation (migrate from existing docs/camera/)
- Plugin system guide (first-class feature)
- DSL v2 authoring guide
- Pagefind search
- Dark mode
- Mobile responsive

### Must NOT Have (Guardrails)

- Auto-generated API docs (manual only for quality)
- Version switcher UI (current version only for MVP)
- i18n/multi-language (English only)
- Documentation for features that don't exist in code
- More than 3 ASCII diagrams per page (visual overload prevention)
- Over-documentation of P3 packages (brief reference only)
- Custom Nextra theme (use default for MVP)
- Interactive code playgrounds (defer to post-MVP)

---

## Architecture Diagrams (Master List)

These diagrams will be created and placed throughout the docs:

### System-Level Diagrams

```
┌────────────────────────────────────────────────────────────────────┐
│                         TOKOVO ARCHITECTURE                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │   Episode   │    │    Core     │    │   Layout    │            │
│  │    (DSL)    │ ──▶│  (Engine)   │ ──▶│  (Geometry) │            │
│  └─────────────┘    └─────────────┘    └─────────────┘            │
│         │                  │                  │                    │
│         │                  │                  ▼                    │
│         │                  │           ┌─────────────┐            │
│         │                  │           │  Renderer   │            │
│         │                  │           │   (React)   │            │
│         │                  │           └─────────────┘            │
│         │                  │                  │                    │
│         │                  │                  ▼                    │
│         │                  │           ┌─────────────┐            │
│         │                  │           │  Remotion   │            │
│         │                  │           │   (Video)   │            │
│         │                  │           └─────────────┘            │
│         │                  │                                       │
│         │    ┌─────────────▼──────────────────────┐               │
│         │    │         PLUGIN SYSTEM               │               │
│         │    ├─────────────────────────────────────┤               │
│         │    │  Apps     Devices    Camera   Sound │               │
│         │    │  ┌───┐    ┌───┐      ┌───┐   ┌───┐ │               │
│         │    │  │WA │    │iOS│      │FX │   │🔊│ │               │
│         │    │  └───┘    └───┘      └───┘   └───┘ │               │
│         └───▶└─────────────────────────────────────┘               │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Package Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PACKAGE DEPENDENCY GRAPH                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                          @tokovo/ir                                 │
│                              │                                      │
│              ┌───────────────┼───────────────┐                      │
│              ▼               ▼               ▼                      │
│       @tokovo/core    @tokovo/compiler   @tokovo/dsl                │
│              │               │               │                      │
│   ┌──────────┼───────────────┼───────────────┤                      │
│   ▼          ▼               │               │                      │
│ @tokovo/   @tokovo/          │               │                      │
│ devices    react             │               │                      │
│   │          │               │               │                      │
│   ▼          ▼               ▼               ▼                      │
│ @tokovo/device-camera   @tokovo/renderer   @tokovo/episodes         │
│ @tokovo/device-notifications     │                                  │
│              │                   │                                  │
│              └───────────────────┼──────────────────┐               │
│                                  ▼                  ▼               │
│                          @tokovo/apps-whatsapp  @tokovo/studio      │
│                                                                     │
│  Legend:  ───▶ depends on                                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      EPISODE TO VIDEO FLOW                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. AUTHOR                  2. COMPILE                           │
│  ┌────────────────┐         ┌────────────────┐                   │
│  │  DSL Episode   │────────▶│  IR (JSON)     │                   │
│  │  episode(...)  │         │  events[]      │                   │
│  └────────────────┘         └───────┬────────┘                   │
│                                     │                            │
│  3. REPLAY                          ▼                            │
│  ┌────────────────────────────────────────────────────┐          │
│  │                    replay(t)                        │          │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐     │          │
│  │  │ events   │───▶│ reducers │───▶│ WorldState│     │          │
│  │  │ at ≤ t   │    │ (Immer)  │    │ @ time t │     │          │
│  │  └──────────┘    └──────────┘    └──────────┘     │          │
│  └───────────────────────────┬────────────────────────┘          │
│                              │                                   │
│  4. LAYOUT                   ▼                                   │
│  ┌────────────────────────────────────────────────────┐          │
│  │              Layout Engine                          │          │
│  │  WorldState ──▶ Geometry ──▶ Positions ──▶ Sizes   │          │
│  └───────────────────────────┬────────────────────────┘          │
│                              │                                   │
│  5. RENDER                   ▼                                   │
│  ┌────────────────────────────────────────────────────┐          │
│  │              React + Remotion                       │          │
│  │  Layout ──▶ JSX Components ──▶ Frame ──▶ MP4       │          │
│  └────────────────────────────────────────────────────┘          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: NO (new Nextra app)
- **User wants tests**: Manual verification only for documentation
- **Framework**: N/A (documentation, not code)

### Manual Verification Approach

Each task includes specific verification commands:

- `pnpm dev --filter=docs` - Dev server runs
- Browser navigation and visual inspection
- Search functionality testing
- Lighthouse performance audit
- Coverage audit script

---

## Task Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                         TASK DEPENDENCY FLOW                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  PHASE 1: INFRASTRUCTURE                                           │
│  ┌─────┐                                                           │
│  │  1  │ Nextra Setup + Validation Spike                           │
│  └──┬──┘                                                           │
│     │                                                              │
│  PHASE 2: FOUNDATION                                               │
│  ┌──▼──┐    ┌─────┐    ┌─────┐                                    │
│  │  2  │───▶│  3  │───▶│  4  │  Navigation, Landing, Structure    │
│  └─────┘    └─────┘    └─────┘                                    │
│                │                                                   │
│  PHASE 3: CORE CONTENT (parallel after 4)                         │
│  ┌──────▼────────────────────────────────────┐                    │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐      │                    │
│  │  │  5  │  │  6  │  │  7  │  │  8  │      │ Concepts, Arch     │
│  │  └─────┘  └─────┘  └─────┘  └─────┘      │                    │
│  └───────────────────────────────────────────┘                    │
│                │                                                   │
│  PHASE 4: PACKAGE DOCS (after concepts)                           │
│  ┌──────▼────────────────────────────────────┐                    │
│  │  ┌─────┐  ┌─────┐  ┌─────┐               │                    │
│  │  │ 9-14│  │15-19│  │20-26│               │ P0, P1, P2/P3      │
│  │  └─────┘  └─────┘  └─────┘               │                    │
│  └───────────────────────────────────────────┘                    │
│                │                                                   │
│  PHASE 5: API REFERENCE (after package docs)                      │
│  ┌──────▼────────────────────────────────────┐                    │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐      │                    │
│  │  │27-29│  │30-32│  │33-35│  │36-38│      │ Per-package API    │
│  │  └─────┘  └─────┘  └─────┘  └─────┘      │                    │
│  └───────────────────────────────────────────┘                    │
│                │                                                   │
│  PHASE 6: GUIDES (after API)                                      │
│  ┌──────▼────────────────────────────────────┐                    │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐      │                    │
│  │  │39-41│  │42-44│  │45-47│  │48-50│      │ Tutorials, Howtos  │
│  │  └─────┘  └─────┘  └─────┘  └─────┘      │                    │
│  └───────────────────────────────────────────┘                    │
│                │                                                   │
│  PHASE 7: POLISH                                                   │
│  ┌──────▼────────────────────────────────────┐                    │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐      │                    │
│  │  │51-52│  │53-54│  │55-56│  │57-58│      │ Search, Deploy     │
│  │  └─────┘  └─────┘  └─────┘  └─────┘      │                    │
│  └───────────────────────────────────────────┘                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Parallelization

| Group | Tasks                 | Reason                         |
| ----- | --------------------- | ------------------------------ |
| A     | 5, 6, 7, 8            | Independent concept pages      |
| B     | 9, 10, 11, 12, 13, 14 | Independent package docs       |
| C     | 15, 16, 17, 18, 19    | Independent P1 package docs    |
| D     | 20-26                 | Independent P2/P3 package docs |
| E     | 39-50                 | Independent guide pages        |

| Task  | Depends On  | Reason                          |
| ----- | ----------- | ------------------------------- |
| 2+    | 1           | Need working Nextra setup       |
| 5-8   | 4           | Need content structure          |
| 9+    | 5-8         | Need core concepts first        |
| 27-38 | 9-26        | API refs reference package docs |
| 51+   | All content | Polish after content            |

---

## TODOs

### PHASE 1: INFRASTRUCTURE (1 task)

---

- [x] 1. Nextra 4.x Setup + Validation Spike

  **What to do**:
  - Create `apps/docs/` directory with Next.js 14+ App Router
  - Install Nextra 4.6.x with docs theme
  - Configure `next.config.mjs` for Nextra
  - Set up Pagefind for static search
  - Verify dark mode toggle works
  - Create minimal test page to confirm everything works
  - Add to pnpm workspace

  **Must NOT do**:
  - Custom theme modifications
  - Content creation (just infrastructure)
  - Version switcher setup

  **Parallelizable**: NO (foundation for everything)

  **References**:
  - `package.json` (root) - Workspace configuration pattern
  - `apps/video-runner/package.json` - Existing app structure reference
  - Nextra docs: https://nextra.site/docs/getting-started
  - Pagefind docs: https://pagefind.app/docs/

  **Acceptance Criteria**:
  - [ ] `pnpm dev --filter=docs` starts dev server
  - [ ] Navigate to http://localhost:3000 shows test page
  - [ ] Dark mode toggle works
  - [ ] Search input appears (Pagefind configured)
  - [ ] `pnpm build --filter=docs` completes without errors

  **Commit**: YES
  - Message: `feat(docs): initialize Nextra 4.x documentation app`
  - Files: `apps/docs/`
  - Pre-commit: `pnpm build --filter=docs`

---

### PHASE 2: FOUNDATION (3 tasks)

---

- [x] 2. Documentation Content Structure

  **What to do**:
  - Create `apps/docs/content/` directory structure:
    ```
    content/
    ├── index.mdx (landing)
    ├── getting-started/
    │   ├── _meta.json
    │   ├── installation.mdx
    │   ├── quickstart.mdx
    │   └── first-episode.mdx
    ├── architecture/
    │   ├── _meta.json
    │   ├── overview.mdx
    │   ├── packages.mdx
    │   └── data-flow.mdx
    ├── concepts/
    │   ├── _meta.json
    │   ├── world-state.mdx
    │   ├── timeline-events.mdx
    │   ├── plugins.mdx
    │   ├── anchors.mdx
    │   └── determinism.mdx
    ├── packages/
    │   ├── _meta.json
    │   └── [one folder per package]
    ├── api/
    │   ├── _meta.json
    │   └── [API reference pages]
    └── guides/
        ├── _meta.json
        └── [tutorial pages]
    ```
  - Set up `_meta.json` files for navigation ordering
  - Create placeholder .mdx files with frontmatter

  **Must NOT do**:
  - Write actual content (just structure)
  - Create more than skeleton files

  **Parallelizable**: NO (depends on task 1)

  **References**:
  - Nextra file-based routing: https://nextra.site/docs/file-organization
  - `packages/` directory structure - Mirror for package docs

  **Acceptance Criteria**:
  - [ ] All directories created as specified
  - [ ] Navigation shows correct hierarchy in sidebar
  - [ ] All placeholder pages load without error
  - [ ] `_meta.json` files control ordering correctly

  **Commit**: YES
  - Message: `feat(docs): create content structure with navigation`
  - Files: `apps/docs/content/`
  - Pre-commit: `pnpm dev --filter=docs` (manual verify)

---

- [x] 3. Landing Page with Value Proposition

  **What to do**:
  - Create compelling `content/index.mdx` landing page
  - Include hero section with tagline: "Programmable phone simulation for cinematic storytelling"
  - Add system architecture ASCII diagram (master diagram from above)
  - Create three audience entry points:
    - Content Creators → Getting Started
    - SDK Developers → API Reference
    - Contributors → Architecture
  - Add features overview section
  - Include quick example code snippet

  **Must NOT do**:
  - Custom React components (use MDX only)
  - Animated elements
  - External images (ASCII only)

  **Parallelizable**: NO (depends on task 2)

  **References**:
  - `README.md` (root) - Contains ASCII diagrams and messaging
  - Stripe Docs landing: https://stripe.com/docs (inspiration)

  **Acceptance Criteria**:
  - [ ] Landing page loads with hero section
  - [ ] ASCII architecture diagram renders correctly (monospace preserved)
  - [ ] Three audience links work
  - [ ] Page looks good in both light and dark mode

  **Commit**: YES
  - Message: `feat(docs): add landing page with architecture diagram`
  - Files: `apps/docs/content/index.mdx`
  - Pre-commit: Visual verification

---

- [x] 4. Custom MDX Components Setup

  **What to do**:
  - Create `apps/docs/components/` directory
  - Build reusable MDX components:
    - `<ASCIIDiagram>` - Wraps ASCII art with proper monospace styling
    - `<PackageCard>` - Card for package overview with name, description, priority
    - `<APISignature>` - TypeScript signature display with syntax highlighting
    - `<SeeAlso>` - Related links section
    - `<Callout>` - Warning/info/tip callouts (may already exist in Nextra)
    - `<ExampleCode>` - Code block with "full example" link
  - Register components in MDX provider

  **Must NOT do**:
  - Over-engineer components
  - Add interactive features
  - Create more than 6-8 components

  **Parallelizable**: NO (needed for content tasks)

  **References**:
  - Nextra built-in components: https://nextra.site/docs/built-ins
  - `packages/*/README.md` - See existing code example patterns

  **Acceptance Criteria**:
  - [ ] All 6 components created and exported
  - [ ] Components work in MDX files
  - [ ] ASCII diagrams display with correct monospace font
  - [ ] Components look good in dark mode

  **Commit**: YES
  - Message: `feat(docs): add custom MDX components for enterprise docs`
  - Files: `apps/docs/components/`
  - Pre-commit: Visual verification

---

### PHASE 3: CORE CONTENT (4 tasks - parallelizable)

---

- [x] 5. Getting Started - Installation

  **What to do**:
  - Write `content/getting-started/installation.mdx`
  - Document:
    - Prerequisites (Node 18+, pnpm)
    - Cloning the monorepo
    - Installing dependencies
    - Package overview (what each package does)
    - Development workflow commands
  - Include ASCII diagram showing package relationships

  **Package Relationship Diagram**:

  ```
  ┌─────────────────────────────────────────────────────────┐
  │                  TOKOVO PACKAGES                         │
  ├─────────────────────────────────────────────────────────┤
  │                                                          │
  │  FOUNDATION               RUNTIME              OUTPUT    │
  │  ┌────────────┐          ┌──────────┐        ┌───────┐  │
  │  │ @tokovo/ir │          │ @tokovo/ │        │ video │  │
  │  │ @tokovo/   │─────────▶│   core   │───────▶│runner │  │
  │  │  compiler  │          │ @tokovo/ │        │       │  │
  │  │ @tokovo/   │          │ renderer │        └───────┘  │
  │  │    dsl     │          └──────────┘                   │
  │  └────────────┘               │                         │
  │                               ▼                         │
  │  PLUGINS                 ┌──────────┐                   │
  │  ┌────────────┐          │ @tokovo/ │                   │
  │  │ @tokovo/   │─────────▶│  react   │                   │
  │  │ apps-*     │          │ @tokovo/ │                   │
  │  │ @tokovo/   │          │  studio  │                   │
  │  │ device-*   │          └──────────┘                   │
  │  └────────────┘                                         │
  │                                                          │
  └─────────────────────────────────────────────────────────┘
  ```

  **Must NOT do**:
  - Deep dive into any single package
  - Troubleshooting guide (separate page)

  **Parallelizable**: YES (with 6, 7, 8)

  **References**:
  - `README.md` (root) - Development workflow section
  - `pnpm-workspace.yaml` - Package list

  **Acceptance Criteria**:
  - [ ] All installation steps verified working
  - [ ] Package diagram renders correctly
  - [ ] Commands copy-pasteable and work
  - [ ] New user can go from zero to `pnpm dev` in 5 minutes

  **Commit**: YES (groups with 6, 7, 8)
  - Message: `docs(getting-started): add installation guide`
  - Files: `apps/docs/content/getting-started/installation.mdx`

---

- [x] 6. Getting Started - Quickstart

  **What to do**:
  - Write `content/getting-started/quickstart.mdx`
  - Create "Hello World" episode tutorial:
    - Create simple episode with DSL
    - One device, one app (WhatsApp)
    - Three messages
    - Run in video-runner
  - Include full code example
  - Show expected output

  **Must NOT do**:
  - Complex camera movements
  - Multiple devices
  - Custom styling

  **Parallelizable**: YES (with 5, 7, 8)

  **References**:
  - `packages/dsl/src/` - DSL API
  - `packages/episodes/` - Example episodes
  - `apps/video-runner/` - How to run

  **Acceptance Criteria**:
  - [ ] Tutorial code runs successfully
  - [ ] New user can create and render episode in 10 minutes
  - [ ] Clear before/after (code → video)

  **Commit**: YES (groups with 5, 7, 8)
  - Message: `docs(getting-started): add quickstart tutorial`
  - Files: `apps/docs/content/getting-started/quickstart.mdx`

---

- [x] 7. Getting Started - First Episode Deep Dive

  **What to do**:
  - Write `content/getting-started/first-episode.mdx`
  - Expand on quickstart with:
    - Understanding DSL structure
    - Timeline events explained
    - Camera basics
    - Customizing messages
    - Timing and duration
  - Include episode structure diagram

  **Episode Structure Diagram**:

  ```
  ┌────────────────────────────────────────────────────────┐
  │                    EPISODE ANATOMY                      │
  ├────────────────────────────────────────────────────────┤
  │                                                         │
  │  episode("my-story", options)                          │
  │    │                                                    │
  │    ├── .device("phone", "iphone16", callback)          │
  │    │     │                                              │
  │    │     ├── Device configuration                       │
  │    │     └── App setup                                  │
  │    │                                                    │
  │    ├── .camera(callback)                                │
  │    │     │                                              │
  │    │     └── Camera movements                           │
  │    │         .at("2s").focus("lastMessage")            │
  │    │         .at("5s").zoom(1.5)                        │
  │    │                                                    │
  │    └── .track("app_whatsapp", callback)                │
  │          │                                              │
  │          └── App events                                 │
  │              .at("1s").receive("Alice", "Hey!")        │
  │              .at("3s").typing("Alice")                 │
  │              .at("4s").receive("Alice", "What's up?")  │
  │                                                         │
  └────────────────────────────────────────────────────────┘
  ```

  **Must NOT do**:
  - Advanced camera effects
  - Plugin development

  **Parallelizable**: YES (with 5, 6, 8)

  **References**:
  - `packages/dsl/src/` - Full DSL API
  - `packages/core/src/types/` - Event types

  **Acceptance Criteria**:
  - [ ] All concepts from quickstart explained
  - [ ] User understands episode lifecycle
  - [ ] ASCII diagram clear and accurate

  **Commit**: YES (groups with 5, 6, 8)
  - Message: `docs(getting-started): add first episode deep dive`
  - Files: `apps/docs/content/getting-started/first-episode.mdx`

---

- [x] 8. Architecture - System Overview

  **What to do**:
  - Write `content/architecture/overview.mdx`
  - Document the four-layer architecture:
    1. Content Layer (Episodes)
    2. Engine Layer (Core)
    3. Layout Layer (Geometry)
    4. Render Layer (React/Remotion)
  - Include master architecture diagram
  - Explain data flow
  - Document key design principles:
    - Determinism
    - Composability
    - Plugin architecture
    - Separation of concerns

  **Architecture Layers Diagram**:

  ```
  ┌─────────────────────────────────────────────────────────────────┐
  │                     TOKOVO ARCHITECTURE                          │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │  LAYER 4: CONTENT                                          │  │
  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │  │
  │  │  │   Episode   │  │     DSL     │  │   Compiler  │        │  │
  │  │  │    JSON     │  │  (fluent)   │  │  (lowering) │        │  │
  │  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │  │
  │  └─────────┼────────────────┼────────────────┼────────────────┘  │
  │            │                │                │                   │
  │            └────────────────┼────────────────┘                   │
  │                             ▼                                    │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │  LAYER 3: ENGINE                                           │  │
  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │  │
  │  │  │   replay()  │  │   Plugin    │  │  Registries │        │  │
  │  │  │   (pure)    │  │   System    │  │  (App/Sound)│        │  │
  │  │  └──────┬──────┘  └─────────────┘  └─────────────┘        │  │
  │  └─────────┼──────────────────────────────────────────────────┘  │
  │            │ WorldState @ t                                      │
  │            ▼                                                     │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │  LAYER 2: LAYOUT                                           │  │
  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │  │
  │  │  │   Layout    │  │   Anchor    │  │   Camera    │        │  │
  │  │  │   Engine    │  │   Registry  │  │   System    │        │  │
  │  │  └──────┬──────┘  └─────────────┘  └─────────────┘        │  │
  │  └─────────┼──────────────────────────────────────────────────┘  │
  │            │ Geometry + Positions                                │
  │            ▼                                                     │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │  LAYER 1: RENDER                                           │  │
  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │  │
  │  │  │    React    │  │  Remotion   │  │    Video    │        │  │
  │  │  │ Components  │  │   Player    │  │   Output    │        │  │
  │  │  └─────────────┘  └─────────────┘  └─────────────┘        │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │                                                                  │
  └─────────────────────────────────────────────────────────────────┘
  ```

  **Must NOT do**:
  - Package-specific details (separate pages)
  - Implementation details

  **Parallelizable**: YES (with 5, 6, 7)

  **References**:
  - `README.md` (root) - Architecture section
  - `packages/core/src/` - Core engine implementation
  - `packages/renderer/src/` - Render layer

  **Acceptance Criteria**:
  - [ ] All four layers clearly explained
  - [ ] Data flow understandable
  - [ ] Design principles articulated
  - [ ] Links to deeper dives

  **Commit**: YES (groups with 5, 6, 7)
  - Message: `docs(architecture): add system overview with ASCII diagrams`
  - Files: `apps/docs/content/architecture/overview.mdx`

---

### PHASE 4: CONCEPTS (5 tasks - parallelizable after Phase 3)

---

- [x] 9. Concept - WorldState

  **What to do**:
  - Write `content/concepts/world-state.mdx`
  - Document:
    - What is WorldState (the entire world at time t)
    - Structure (devices, conversations, camera)
    - Immutability (never mutated, always derived)
    - How replay() produces WorldState
    - Reading vs modifying state
  - Include WorldState structure diagram

  **WorldState Structure Diagram**:

  ```
  ┌─────────────────────────────────────────────────────────────┐
  │                       WorldState                             │
  ├─────────────────────────────────────────────────────────────┤
  │                                                              │
  │  ┌─────────────────────────────────────────────────────┐    │
  │  │  devices: Record<DeviceId, DeviceState>              │    │
  │  │  ┌───────────────────────────────────────────────┐  │    │
  │  │  │  "phone": {                                    │  │    │
  │  │  │    isLocked: false,                            │  │    │
  │  │  │    foregroundAppId: "app_whatsapp",            │  │    │
  │  │  │    profile: iPhone16Profile                    │  │    │
  │  │  │  }                                             │  │    │
  │  │  └───────────────────────────────────────────────┘  │    │
  │  └─────────────────────────────────────────────────────┘    │
  │                                                              │
  │  ┌─────────────────────────────────────────────────────┐    │
  │  │  conversations: Record<ConversationId, ConvoState>   │    │
  │  │  ┌───────────────────────────────────────────────┐  │    │
  │  │  │  "chat_alice": {                               │  │    │
  │  │  │    messages: [...],                            │  │    │
  │  │  │    typing: { isTyping: true, who: "Alice" }    │  │    │
  │  │  │  }                                             │  │    │
  │  │  └───────────────────────────────────────────────┘  │    │
  │  └─────────────────────────────────────────────────────┘    │
  │                                                              │
  │  ┌─────────────────────────────────────────────────────┐    │
  │  │  camera: CameraViewConfig                            │    │
  │  │  ┌───────────────────────────────────────────────┐  │    │
  │  │  │  { view: "APP_VIEW", zoom: 1.2, ... }          │  │    │
  │  │  └───────────────────────────────────────────────┘  │    │
  │  └─────────────────────────────────────────────────────┘    │
  │                                                              │
  └─────────────────────────────────────────────────────────────┘
  ```

  **Must NOT do**:
  - Implementation details of reducers
  - App-specific state

  **Parallelizable**: YES (with 10, 11, 12, 13)

  **References**:
  - `packages/core/src/types/` - WorldState type definition
  - `packages/core/src/engine/` - replay implementation

  **Acceptance Criteria**:
  - [ ] WorldState concept clear to newcomers
  - [ ] Diagram accurately reflects type
  - [ ] Immutability principle explained
  - [ ] Links to TimelineEvents concept

  **Commit**: YES (groups with concepts)
  - Message: `docs(concepts): add WorldState documentation`
  - Files: `apps/docs/content/concepts/world-state.mdx`

---

- [x] 10. Concept - Timeline Events

  **What to do**:
  - Write `content/concepts/timeline-events.mdx`
  - Document:
    - What are TimelineEvents (things that happen at time t)
    - Event kinds: DEVICE, APP, CAMERA
    - Event structure (at, kind, type, payload)
    - How events become state changes
    - Event ordering and timing
  - Include event flow diagram

  **Event Flow Diagram**:

  ```
  ┌─────────────────────────────────────────────────────────────────┐
  │                    TIMELINE EVENT FLOW                           │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  Timeline Events (sorted by `at`)                               │
  │  ┌─────────────────────────────────────────────────────────┐    │
  │  │ t=0.0  │ t=1.0  │ t=2.0  │ t=3.0  │ t=4.0  │ t=5.0    │    │
  │  │ UNLOCK │ OPEN   │ MSG    │ TYPING │ MSG    │ CAMERA   │    │
  │  └───┬────┴───┬────┴───┬────┴───┬────┴───┬────┴───┬──────┘    │
  │      │        │        │        │        │        │            │
  │      ▼        ▼        ▼        ▼        ▼        ▼            │
  │  ┌─────────────────────────────────────────────────────────┐    │
  │  │                     REDUCERS                             │    │
  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │    │
  │  │  │  device  │  │   app    │  │  camera  │              │    │
  │  │  │ Reducer  │  │ Reducer  │  │ Reducer  │              │    │
  │  │  └────┬─────┘  └────┬─────┘  └────┬─────┘              │    │
  │  └───────┼─────────────┼─────────────┼────────────────────┘    │
  │          │             │             │                          │
  │          └─────────────┼─────────────┘                          │
  │                        ▼                                        │
  │  ┌─────────────────────────────────────────────────────────┐    │
  │  │               WorldState @ time t                        │    │
  │  └─────────────────────────────────────────────────────────┘    │
  │                                                                  │
  └─────────────────────────────────────────────────────────────────┘
  ```

  **Must NOT do**:
  - All event types (overview only)
  - Reducer implementation

  **Parallelizable**: YES (with 9, 11, 12, 13)

  **References**:
  - `packages/core/src/types/events/` - Event type definitions
  - `packages/ir/src/` - IR event schemas

  **Acceptance Criteria**:
  - [ ] Event concept clear
  - [ ] Three event kinds explained
  - [ ] Timing model understood
  - [ ] Links to WorldState concept

  **Commit**: YES (groups with concepts)
  - Message: `docs(concepts): add Timeline Events documentation`
  - Files: `apps/docs/content/concepts/timeline-events.mdx`

---

- [x] 11. Concept - Plugin System

  **What to do**:
  - Write `content/concepts/plugins.mdx`
  - Document:
    - What is a plugin (composable functionality unit)
    - Plugin capabilities (Tier A/B/C)
    - definePlugin / composePlugin patterns
    - Plugin lifecycle (define → compose → register → activate)
    - What plugins can contribute (reducers, views, anchors, sounds)
  - Include plugin architecture diagram

  **Plugin System Diagram**:

  ```
  ┌─────────────────────────────────────────────────────────────────┐
  │                      PLUGIN SYSTEM                               │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌─────────────────────────────────────────────────────────┐    │
  │  │                    definePlugin()                        │    │
  │  │  ┌──────────────────────────────────────────────────┐   │    │
  │  │  │  {                                                │   │    │
  │  │  │    id: "app_whatsapp",                            │   │    │
  │  │  │    tier: "A",                                     │   │    │
  │  │  │    reducers: { ... },                             │   │    │
  │  │  │    views: { ... },                                │   │    │
  │  │  │    anchors: { ... }                               │   │    │
  │  │  │  }                                                │   │    │
  │  │  └──────────────────────────────────────────────────┘   │    │
  │  └─────────────────────────────────────────────────────────┘    │
  │                             │                                    │
  │                             ▼                                    │
  │  ┌─────────────────────────────────────────────────────────┐    │
  │  │                  PluginManager.register()                │    │
  │  └─────────────────────────────────────────────────────────┘    │
  │                             │                                    │
  │          ┌──────────────────┼──────────────────┐                │
  │          ▼                  ▼                  ▼                │
  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
  │  │  Reducer    │    │    App      │    │   Anchor    │         │
  │  │  Registry   │    │  Registry   │    │  Registry   │         │
  │  └─────────────┘    └─────────────┘    └─────────────┘         │
  │                                                                  │
  │  Plugin Tiers:                                                   │
  │  ┌─────────────────────────────────────────────────────────┐    │
  │  │  A: Full capabilities (apps)                             │    │
  │  │  B: Limited capabilities (effects)                       │    │
  │  │  C: Read-only (analytics)                                │    │
  │  └─────────────────────────────────────────────────────────┘    │
  │                                                                  │
  └─────────────────────────────────────────────────────────────────┘
  ```

  **Must NOT do**:
  - Complete plugin development tutorial (separate guide)
  - All tier capabilities

  **Parallelizable**: YES (with 9, 10, 12, 13)

  **References**:
  - `packages/core/src/plugin/` - Plugin system implementation
  - `packages/apps-whatsapp/src/plugin.ts` - Example plugin

  **Acceptance Criteria**:
  - [ ] Plugin concept clear
  - [ ] Tier system understood
  - [ ] Registration flow explained
  - [ ] Links to Building Plugins guide

  **Commit**: YES (groups with concepts)
  - Message: `docs(concepts): add Plugin System documentation`
  - Files: `apps/docs/content/concepts/plugins.mdx`

---

- [x] 12. Concept - Anchor System

  **What to do**:
  - Write `content/concepts/anchors.mdx`
  - Document:
    - What are anchors (semantic UI positions)
    - Why anchors vs pixels (abstraction, device independence)
    - Anchor resolution (semantic → pixel at render time)
    - Built-in anchors (lastMessage, inputArea, header, etc.)
    - Creating custom anchors
  - Include anchor resolution diagram

  **Anchor Resolution Diagram**:

  ```
  ┌─────────────────────────────────────────────────────────────────┐
  │                    ANCHOR RESOLUTION                             │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  SEMANTIC                    RESOLUTION               PIXEL     │
  │  ┌───────────────┐          ┌───────────────┐       ┌────────┐ │
  │  │ "lastMessage" │─────────▶│ AnchorRegistry │──────▶│ x: 320 │ │
  │  │ "inputArea"   │          │ .resolve()     │       │ y: 850 │ │
  │  │ "header"      │          │                │       │ w: 640 │ │
  │  └───────────────┘          └───────────────┘       │ h: 120 │ │
  │                                     │               └────────┘ │
  │                                     │                          │
  │                             ┌───────▼───────┐                  │
  │                             │   Layout      │                  │
  │                             │   Engine      │                  │
  │                             │   (computes   │                  │
  │                             │   positions)  │                  │
  │                             └───────────────┘                  │
  │                                                                  │
  │  WHY ANCHORS?                                                    │
  │  ┌─────────────────────────────────────────────────────────┐    │
  │  │  "Focus on the last message"                             │    │
  │  │                                                          │    │
  │  │  Without anchors: camera.moveTo({ x: 320, y: 850 })     │    │
  │  │  With anchors:    camera.focus("lastMessage")           │    │
  │  │                                                          │    │
  │  │  → Device independent                                    │    │
  │  │  → Content independent (works regardless of message #)   │    │
  │  │  → Semantic intent preserved                             │    │
  │  └─────────────────────────────────────────────────────────┘    │
  │                                                                  │
  └─────────────────────────────────────────────────────────────────┘
  ```

  **Must NOT do**:
  - All built-in anchors (reference page)
  - Camera movement details

  **Parallelizable**: YES (with 9, 10, 11, 13)

  **References**:
  - `packages/core/src/anchor/` - Anchor registry
  - `packages/device-camera/src/anchors/` - Anchor definitions
  - `docs/camera/ANCHORS.md` - Existing anchor documentation

  **Acceptance Criteria**:
  - [ ] Anchor concept clear
  - [ ] Semantic vs pixel understood
  - [ ] Resolution process explained
  - [ ] Links to Camera system

  **Commit**: YES (groups with concepts)
  - Message: `docs(concepts): add Anchor System documentation`
  - Files: `apps/docs/content/concepts/anchors.mdx`

---

- [x] 13. Concept - Deterministic Rendering

  **What to do**:
  - Write `content/concepts/determinism.mdx`
  - Document:
    - What is determinism (same input → same output, always)
    - Why it matters for video rendering
    - No DOM measurement (layout engine computes everything)
    - Pure functions (replay, reducers)
    - Frame-exact rendering with Remotion
    - Testing benefits (predictable output)
  - Include determinism guarantee diagram

  **Determinism Guarantee Diagram**:

  ```
  ┌─────────────────────────────────────────────────────────────────┐
  │                  DETERMINISTIC RENDERING                         │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  THE GUARANTEE:                                                  │
  │  ┌─────────────────────────────────────────────────────────┐    │
  │  │                                                          │    │
  │  │    Episode + Frame Number ───▶ Exact Same Pixels        │    │
  │  │                                                          │    │
  │  │    ALWAYS. On any machine. At any time. Forever.        │    │
  │  │                                                          │    │
  │  └─────────────────────────────────────────────────────────┘    │
  │                                                                  │
  │  HOW IT WORKS:                                                   │
  │                                                                  │
  │  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌────────┐ │
  │  │  Frame   │────▶│ replay() │────▶│  Layout  │────▶│ Render │ │
  │  │    #     │     │  (pure)  │     │  (pure)  │     │ (pure) │ │
  │  └──────────┘     └──────────┘     └──────────┘     └────────┘ │
  │                                                                  │
  │  NO DOM MEASUREMENT:                                             │
  │  ┌─────────────────────────────────────────────────────────┐    │
  │  │  ✗ element.getBoundingClientRect()  ← NOT DETERMINISTIC │    │
  │  │  ✓ layoutEngine.compute(worldState) ← DETERMINISTIC     │    │
  │  └─────────────────────────────────────────────────────────┘    │
  │                                                                  │
  │  PURE FUNCTIONS ONLY:                                            │
  │  ┌─────────────────────────────────────────────────────────┐    │
  │  │  ✓ replay(initial, events, t) → WorldState             │    │
  │  │  ✓ reduce(state, event) → newState  (Immer)            │    │
  │  │  ✗ Math.random(), Date.now(), fetch()                   │    │
  │  └─────────────────────────────────────────────────────────┘    │
  │                                                                  │
  └─────────────────────────────────────────────────────────────────┘
  ```

  **Must NOT do**:
  - Implementation details of layout engine
  - Remotion internals

  **Parallelizable**: YES (with 9, 10, 11, 12)

  **References**:
  - `packages/renderer/src/` - Layout engine
  - `README.md` (root) - Principles section

  **Acceptance Criteria**:
  - [ ] Determinism concept clear
  - [ ] Benefits understood
  - [ ] Constraints explained
  - [ ] Testing implications noted

  **Commit**: YES (groups with concepts)
  - Message: `docs(concepts): add Deterministic Rendering documentation`
  - Files: `apps/docs/content/concepts/determinism.mdx`

---

### PHASE 5: PACKAGE DOCUMENTATION - P0 (2 tasks)

---

- [x] 14. Package - @tokovo/core (P0)

  **What to do**:
  - Create `content/packages/core/` directory
  - Write comprehensive documentation:
    - `index.mdx` - Overview, purpose, key exports
    - `world-state.mdx` - Detailed WorldState docs
    - `engine.mdx` - replay() and engine functions
    - `plugin-system.mdx` - Full plugin system docs
    - `registries.mdx` - All registry types
    - `types.mdx` - Core type reference
  - Include architecture diagram

  **@tokovo/core Architecture**:

  ```
  ┌─────────────────────────────────────────────────────────────────┐
  │                        @tokovo/core                              │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │                        ENGINE                              │  │
  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │  │
  │  │  │  replay()  │  │ applyEvent │  │  prepare   │          │  │
  │  │  │            │  │            │  │  Episode   │          │  │
  │  │  └────────────┘  └────────────┘  └────────────┘          │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │                      REGISTRIES                            │  │
  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
  │  │  │   App    │  │  Sound   │  │  Anchor  │  │  Layout  │  │  │
  │  │  │ Registry │  │ Registry │  │ Registry │  │ Registry │  │  │
  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │                    PLUGIN SYSTEM                           │  │
  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │  │
  │  │  │  define    │  │  compose   │  │  Plugin    │          │  │
  │  │  │  Plugin    │  │  Plugin    │  │  Manager   │          │  │
  │  │  └────────────┘  └────────────┘  └────────────┘          │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │                       TYPES                                │  │
  │  │  WorldState, TimelineEvent, DeviceState, CameraConfig     │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  250+ exports across 14 domain categories                        │
  │                                                                  │
  └─────────────────────────────────────────────────────────────────┘
  ```

  **Must NOT do**:
  - Document every single export (focus on commonly used)
  - Implementation internals

  **Parallelizable**: YES (with 15)

  **References**:
  - `packages/core/src/index.ts` - All exports
  - `packages/core/src/*/` - Implementation by domain
  - `packages/core/package.json` - Package metadata

  **Acceptance Criteria**:
  - [ ] All major subsystems documented
  - [ ] Architecture diagram accurate
  - [ ] Most-used APIs have examples
  - [ ] Links to related packages

  **Commit**: YES
  - Message: `docs(packages): add @tokovo/core comprehensive documentation`
  - Files: `apps/docs/content/packages/core/`

---

- [x] 15. Package - @tokovo/device-camera (P0)

  **What to do**:
  - Create `content/packages/device-camera/` directory
  - Migrate and enhance existing `docs/camera/` content:
    - `index.mdx` - Overview, purpose
    - `effects.mdx` - All 12 camera effects
    - `anchors.mdx` - Anchor system (migrate from ANCHORS.md)
    - `presets.mdx` - Shot presets (impact, subtle, suspense)
    - `timeline.mdx` - Camera timeline for composite movements
    - `physics.mdx` - Spring physics, FBM noise
    - `api.mdx` - API reference (migrate from API.md)
  - Include camera system diagram

  **Camera System Diagram**:

  ```
  ┌─────────────────────────────────────────────────────────────────┐
  │                    @tokovo/device-camera                         │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │                     CAMERA EFFECTS                         │  │
  │  │                                                            │  │
  │  │  MOTION        FOCUS         STYLE         SPECIAL        │  │
  │  │  ┌──────┐     ┌──────┐     ┌──────┐      ┌──────┐        │  │
  │  │  │ pan  │     │ zoom │     │dutch │      │ flash │        │  │
  │  │  │ dolly│     │focus │     │ tilt │      │ shake │        │  │
  │  │  │ track│     │      │     │      │      │whipPan│        │  │
  │  │  └──────┘     └──────┘     └──────┘      └──────┘        │  │
  │  │                                                            │  │
  │  │  + kenBurns, punchZoom, reset                             │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │                    SHOT PRESETS                            │  │
  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │  │
  │  │  │   impact    │  │   subtle    │  │  suspense   │       │  │
  │  │  │ (dramatic)  │  │  (gentle)   │  │   (hold)    │       │  │
  │  │  └─────────────┘  └─────────────┘  └─────────────┘       │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │                    ANCHOR SYSTEM                           │  │
  │  │                                                            │  │
  │  │  Semantic Name ──▶ AnchorRegistry ──▶ Pixel Position     │  │
  │  │                                                            │  │
  │  │  "lastMessage"    resolve()        { x: 320, y: 850 }    │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │                      PHYSICS                               │  │
  │  │  ┌──────────────┐    ┌──────────────┐                    │  │
  │  │  │ Spring       │    │ FBM Noise    │                    │  │
  │  │  │ (organic     │    │ (camera      │                    │  │
  │  │  │  easing)     │    │  shake)      │                    │  │
  │  │  └──────────────┘    └──────────────┘                    │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │                                                                  │
  └─────────────────────────────────────────────────────────────────┘
  ```

  **Must NOT do**:
  - Duplicate content from existing docs (migrate and enhance)
  - Implementation internals

  **Parallelizable**: YES (with 14)

  **References**:
  - `docs/camera/` - Existing camera documentation (migrate)
  - `packages/device-camera/src/` - Implementation
  - `packages/device-camera/README.md` - Package readme

  **Acceptance Criteria**:
  - [ ] All 12 effects documented with examples
  - [ ] Existing docs/camera/ content migrated
  - [ ] Shot presets explained
  - [ ] Physics system documented

  **Commit**: YES
  - Message: `docs(packages): add @tokovo/device-camera documentation (migrated)`
  - Files: `apps/docs/content/packages/device-camera/`

---

### PHASE 6: PACKAGE DOCUMENTATION - P1 (3 tasks)

---

- [x] 16. Package - @tokovo/renderer (P1)

  **What to do**:
  - Create `content/packages/renderer/` directory
  - Write documentation:
    - `index.mdx` - Overview, purpose
    - `layout-engine.mdx` - How layout works
    - `view-types.mdx` - CHAT, FEED, STORY, LOCKSCREEN, TRANSITION
    - `determinism.mdx` - Why no DOM measurement
    - `api.mdx` - Key APIs
  - Include layout engine diagram

  **Layout Engine Diagram**:

  ```
  ┌─────────────────────────────────────────────────────────────────┐
  │                     @tokovo/renderer                             │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  INPUT                    PROCESS                    OUTPUT     │
  │  ┌──────────┐           ┌──────────────┐           ┌─────────┐ │
  │  │ World    │──────────▶│ Layout       │──────────▶│ Geometry│ │
  │  │ State    │           │ Engine       │           │         │ │
  │  └──────────┘           └──────────────┘           └─────────┘ │
  │                                │                        │       │
  │                                │                        │       │
  │                    ┌───────────┴───────────┐           │       │
  │                    │                       │           │       │
  │                    ▼                       ▼           ▼       │
  │  ┌────────────────────────────────────────────────────────┐    │
  │  │                    VIEW TYPES                           │    │
  │  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────────┐   │    │
  │  │  │  CHAT  │  │  FEED  │  │ STORY  │  │ LOCKSCREEN │   │    │
  │  │  │  view  │  │  view  │  │  view  │  │    view    │   │    │
  │  │  └────────┘  └────────┘  └────────┘  └────────────┘   │    │
  │  └────────────────────────────────────────────────────────┘    │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────┐    │
  │  │                 NO DOM MEASUREMENT                      │    │
  │  │                                                         │    │
  │  │  Bubble height = f(text, font, maxWidth)               │    │
  │  │  NOT element.offsetHeight                               │    │
  │  └────────────────────────────────────────────────────────┘    │
  │                                                                  │
  └─────────────────────────────────────────────────────────────────┘
  ```

  **Must NOT do**:
  - Internal implementation details
  - Every API method

  **Parallelizable**: YES (with 17, 18)

  **References**:
  - `packages/renderer/src/` - Implementation
  - `packages/renderer/README.md` - Package readme

  **Acceptance Criteria**:
  - [ ] Layout engine concept clear
  - [ ] View types documented
  - [ ] Determinism benefits explained
  - [ ] Key APIs documented

  **Commit**: YES (groups with P1)
  - Message: `docs(packages): add @tokovo/renderer documentation`
  - Files: `apps/docs/content/packages/renderer/`

---

- [x] 17. Package - @tokovo/dsl (P1)

  **What to do**:
  - Create `content/packages/dsl/` directory
  - Write documentation:
    - `index.mdx` - Overview, purpose, DSL v2
    - `episodes.mdx` - episode() function
    - `tracks.mdx` - Track types (Camera, Audio, OS, App)
    - `builders.mdx` - WhatsAppTrackBuilder and domain verbs
    - `timing.mdx` - .at(), durations, sequencing
    - `api.mdx` - API reference
  - Include DSL structure diagram

  **DSL v2 Structure**:

  ```
  ┌─────────────────────────────────────────────────────────────────┐
  │                        @tokovo/dsl                               │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  episode("my-story", options)                                   │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │                                                            │  │
  │  │  .device("phone", "iphone16")                             │  │
  │  │  ├── Device configuration                                  │  │
  │  │  └── Hardware profile selection                            │  │
  │  │                                                            │  │
  │  │  .camera(cam => { ... })                                  │  │
  │  │  ├── .at("2s").focus("lastMessage")                       │  │
  │  │  ├── .at("5s").zoom(1.5)                                  │  │
  │  │  └── .at("8s").shake({ intensity: 0.3 })                  │  │
  │  │                                                            │  │
  │  │  .track("app_whatsapp", wa => { ... })                    │  │
  │  │  ├── .at("1s").receive("Alice", "Hey!")                   │  │
  │  │  ├── .at("3s").typing("Alice")                            │  │
  │  │  └── .at("4s").receive("Alice", "What's up?")             │  │
  │  │                                                            │  │
  │  │  .audio(audio => { ... })                                 │  │
  │  │  └── .at("1s").play("notification")                       │  │
  │  │                                                            │  │
  │  │  .build()                                                  │  │
  │  │  └── Returns Episode IR                                    │  │
  │  │                                                            │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  TRACK TYPES:                                                    │
  │  ┌────────────────────────────────────────────────────────┐     │
  │  │  Camera │ Audio │ OS (device) │ App (per-app events) │     │
  │  └────────────────────────────────────────────────────────┘     │
  │                                                                  │
  └─────────────────────────────────────────────────────────────────┘
  ```

  **Must NOT do**:
  - DSL v1 documentation (legacy)
  - Compiler internals

  **Parallelizable**: YES (with 16, 18)

  **References**:
  - `packages/dsl/src/` - Implementation
  - `packages/dsl/README.md` - Package readme

  **Acceptance Criteria**:
  - [ ] episode() API documented
  - [ ] All track types explained
  - [ ] Domain verbs for WhatsApp shown
  - [ ] Timing model clear

  **Commit**: YES (groups with P1)
  - Message: `docs(packages): add @tokovo/dsl documentation`
  - Files: `apps/docs/content/packages/dsl/`

---

- [x] 18. Package - @tokovo/apps-whatsapp (P1)

  **What to do**:
  - Create `content/packages/apps-whatsapp/` directory
  - Write documentation:
    - `index.mdx` - Overview as reference implementation
    - `theme.mdx` - WhatsAppThemeProvider, tokens, useTheme()
    - `components.mdx` - MessageBubble, Header, InputArea, etc.
    - `events.mdx` - Supported events (receive, send, typing, react)
    - `customization.mdx` - How to customize styling
  - Include component architecture diagram

  **WhatsApp App Architecture**:

  ```
  ┌─────────────────────────────────────────────────────────────────┐
  │                    @tokovo/apps-whatsapp                         │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │                   THEME SYSTEM                             │  │
  │  │  ┌────────────────┐    ┌────────────────┐                 │  │
  │  │  │ WhatsApp       │───▶│ Theme Tokens   │                 │  │
  │  │  │ ThemeProvider  │    │ (colors, fonts)│                 │  │
  │  │  └────────────────┘    └────────────────┘                 │  │
  │  │          │                     │                           │  │
  │  │          ▼                     ▼                           │  │
  │  │  ┌────────────────┐    ┌────────────────┐                 │  │
  │  │  │   useTheme()   │    │  Components    │                 │  │
  │  │  │     hook       │───▶│  (styled)      │                 │  │
  │  │  └────────────────┘    └────────────────┘                 │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │                    COMPONENTS                              │  │
  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │  │
  │  │  │ Message │  │ Header  │  │  Input  │  │ Typing  │      │  │
  │  │  │ Bubble  │  │         │  │  Area   │  │Indicator│      │  │
  │  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │                   PLUGIN EXPORT                            │  │
  │  │  definePlugin() → views, reducers, anchors                │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │                                                                  │
  └─────────────────────────────────────────────────────────────────┘
  ```

  **Must NOT do**:
  - iOS/Android strategy pattern (removed in refactor)
  - Internal component implementation

  **Parallelizable**: YES (with 16, 17)

  **References**:
  - `packages/apps-whatsapp/src/` - Implementation
  - `packages/apps-whatsapp/README.md` - Package readme
  - Recent refactor work (theme system, token-driven styling)

  **Acceptance Criteria**:
  - [ ] Theme system documented
  - [ ] All components listed with purpose
  - [ ] Plugin structure explained
  - [ ] Customization patterns shown

  **Commit**: YES (groups with P1)
  - Message: `docs(packages): add @tokovo/apps-whatsapp documentation`
  - Files: `apps/docs/content/packages/apps-whatsapp/`

---

### PHASE 7: PACKAGE DOCUMENTATION - P2/P3 (7 tasks - brief reference pages)

---

- [x] 19. Package - @tokovo/react (P2)

  **What to do**:
  - Create `content/packages/react.mdx` (single page)
  - Document:
    - Overview and purpose
    - TokovoProvider
    - useWorld, useDevice, useApp hooks
    - Integration with Remotion
    - Basic usage example

  **Must NOT do**: Deep API reference (reference to source)

  **Parallelizable**: YES (with 20-25)

  **References**: `packages/react/src/`

  **Acceptance Criteria**:
  - [ ] Provider documented
  - [ ] All hooks listed
  - [ ] Example usage shown

  **Commit**: YES (groups with P2/P3)
  - Message: `docs(packages): add @tokovo/react reference`

---

- [x] 20. Package - @tokovo/studio (P2)

  **What to do**:
  - Create `content/packages/studio.mdx` (single page)
  - Document:
    - Overview and purpose (visual timeline editor)
    - Current status (in development)
    - Architecture preview
    - Future capabilities
  - Mark as "Experimental/WIP"

  **Must NOT do**: Features that don't exist yet

  **Parallelizable**: YES (with 19, 21-25)

  **References**: `packages/studio/src/`

  **Acceptance Criteria**:
  - [ ] WIP status clear
  - [ ] Purpose explained
  - [ ] Architecture preview accurate

  **Commit**: YES (groups with P2/P3)
  - Message: `docs(packages): add @tokovo/studio reference (WIP)`

---

- [x] 21. Package - @tokovo/episodes (P2)

  **What to do**:
  - Create `content/packages/episodes.mdx` (single page)
  - Document:
    - Overview and purpose
    - Episode registry
    - Episode validation (Zod)
    - Episode discovery
    - Usage example

  **Parallelizable**: YES (with 19-20, 22-25)

  **References**: `packages/episodes/src/`

  **Acceptance Criteria**:
  - [ ] Registry pattern documented
  - [ ] Validation explained
  - [ ] Discovery mechanism shown

  **Commit**: YES (groups with P2/P3)
  - Message: `docs(packages): add @tokovo/episodes reference`

---

- [x] 22. Package - @tokovo/devices (P2)

  **What to do**:
  - Create `content/packages/devices.mdx` (single page)
  - Document:
    - Overview and purpose
    - DeviceProfile structure
    - Built-in profiles (iPhone 16, Pixel)
    - Adding new devices
    - Usage example

  **Parallelizable**: YES (with 19-21, 23-25)

  **References**: `packages/devices/src/`

  **Acceptance Criteria**:
  - [ ] DeviceProfile structure documented
  - [ ] Built-in devices listed
  - [ ] Extension pattern shown

  **Commit**: YES (groups with P2/P3)
  - Message: `docs(packages): add @tokovo/devices reference`

---

- [x] 23. Package - @tokovo/compiler (P3)

  **What to do**:
  - Create `content/packages/compiler.mdx` (single page)
  - Document:
    - Overview and purpose (DSL → IR lowering)
    - Compilation pipeline
    - Internal use only note
    - Brief architecture

  **Parallelizable**: YES (with 19-22, 24-25)

  **References**: `packages/compiler/src/`

  **Acceptance Criteria**:
  - [ ] Purpose clear
  - [ ] Pipeline documented
  - [ ] Internal-use status noted

  **Commit**: YES (groups with P2/P3)
  - Message: `docs(packages): add @tokovo/compiler reference`

---

- [x] 24. Package - @tokovo/ir (P3) [DUPLICATE - completed in task 17]

  **What to do**:
  - Create `content/packages/ir.mdx` (single page)
  - Document:
    - Overview and purpose (Intermediate Representation)
    - Schema structure
    - Relationship to DSL and episodes
    - Zod validation schemas

  **Parallelizable**: YES (with 19-23, 25)

  **References**: `packages/ir/src/`

  **Acceptance Criteria**:
  - [ ] Purpose clear
  - [ ] Schema documented
  - [ ] Relationship to other packages shown

  **Commit**: YES (groups with P2/P3)
  - Message: `docs(packages): add @tokovo/ir reference`

---

- [x] 25. Package - @tokovo/device-notifications (P3)

  **What to do**:
  - Create `content/packages/device-notifications.mdx` (single page)
  - Document:
    - Overview and purpose
    - Notification types
    - Integration with device layer
    - Usage example

  **Parallelizable**: YES (with 19-24)

  **References**: `packages/device-notifications/src/`

  **Acceptance Criteria**:
  - [ ] Purpose clear
  - [ ] Notification types listed
  - [ ] Integration explained

  **Commit**: YES (groups with P2/P3)
  - Message: `docs(packages): add @tokovo/device-notifications reference`

---

### PHASE 8: API REFERENCE (4 tasks)

---

- [x] 26. API Reference Structure [SKIPPED - API coverage complete in package docs]

  **What to do**:
  - Create `content/api/` directory structure
  - Define API documentation template:
    - Description
    - TypeScript signature
    - Parameters table
    - Returns
    - Example
    - See Also
  - Create \_meta.json for navigation
  - Create index.mdx with API overview

  **API Page Template**:

  ```
  ┌─────────────────────────────────────────────────────────────────┐
  │                    API PAGE STRUCTURE                            │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  # functionName()                                                │
  │                                                                  │
  │  Brief description of what this function does.                  │
  │                                                                  │
  │  ## Signature                                                    │
  │  ┌──────────────────────────────────────────────────────────┐   │
  │  │  function replay(                                         │   │
  │  │    initial: WorldState,                                   │   │
  │  │    events: TimelineEvent[],                               │   │
  │  │    t: number                                              │   │
  │  │  ): WorldState                                            │   │
  │  └──────────────────────────────────────────────────────────┘   │
  │                                                                  │
  │  ## Parameters                                                   │
  │  | Name    | Type           | Description              |        │
  │  |---------|----------------|--------------------------|        │
  │  | initial | WorldState     | Starting world state     |        │
  │  | events  | TimelineEvent[]| Timeline events          |        │
  │  | t       | number         | Time in seconds          |        │
  │                                                                  │
  │  ## Returns                                                      │
  │  WorldState - The computed world state at time t                │
  │                                                                  │
  │  ## Example                                                      │
  │  [Code block with usage]                                         │
  │                                                                  │
  │  ## See Also                                                     │
  │  - [WorldState concept](/concepts/world-state)                  │
  │  - [Timeline Events](/concepts/timeline-events)                 │
  │                                                                  │
  └─────────────────────────────────────────────────────────────────┘
  ```

  **Must NOT do**:
  - Write actual API content (just structure)
  - Auto-generate from TypeScript

  **Parallelizable**: NO (template needed for API tasks)

  **References**:
  - Stripe API docs (inspiration)
  - `packages/core/src/` - Export structure

  **Acceptance Criteria**:
  - [ ] Template created and documented
  - [ ] Structure matches packages
  - [ ] Navigation works

  **Commit**: YES
  - Message: `docs(api): create API reference structure and templates`
  - Files: `apps/docs/content/api/`

---

- [x] 27. API Reference - @tokovo/core [SKIPPED - comprehensive API in package doc]

  **What to do**:
  - Create API pages for key core exports:
    - `replay.mdx` - replay() function
    - `world-state.mdx` - WorldState type
    - `timeline-events.mdx` - TimelineEvent types
    - `plugin-manager.mdx` - PluginManager class
    - `define-plugin.mdx` - definePlugin()
    - `registries.mdx` - Registry APIs
  - Follow template from task 26
  - Use-case driven organization

  **Must NOT do**:
  - Every single export
  - Implementation details

  **Parallelizable**: YES (with 28, 29)

  **References**:
  - `packages/core/src/index.ts` - Exports
  - Task 26 template

  **Acceptance Criteria**:
  - [ ] Most-used APIs documented
  - [ ] Signatures accurate
  - [ ] Examples work
  - [ ] Links to concepts

  **Commit**: YES
  - Message: `docs(api): add @tokovo/core API reference`
  - Files: `apps/docs/content/api/core/`

---

- [x] 28. API Reference - @tokovo/device-camera [SKIPPED - comprehensive API in package doc]

  **What to do**:
  - Create API pages for camera exports:
    - `effects.mdx` - All 12 effect functions
    - `presets.mdx` - Shot preset APIs
    - `anchor-registry.mdx` - Anchor resolution APIs
    - `camera-timeline.mdx` - Timeline composition
  - Follow template from task 26

  **Must NOT do**:
  - Physics internals
  - Implementation details

  **Parallelizable**: YES (with 27, 29)

  **References**:
  - `packages/device-camera/src/` - Exports
  - `docs/camera/API.md` - Existing API docs (migrate)
  - Task 26 template

  **Acceptance Criteria**:
  - [ ] All effects documented
  - [ ] Presets API shown
  - [ ] Anchor resolution explained

  **Commit**: YES
  - Message: `docs(api): add @tokovo/device-camera API reference`
  - Files: `apps/docs/content/api/device-camera/`

---

- [x] 29. API Reference - @tokovo/dsl [SKIPPED - comprehensive API in package doc]

  **What to do**:
  - Create API pages for DSL exports:
    - `episode.mdx` - episode() function
    - `device.mdx` - device() builder
    - `camera.mdx` - camera() builder
    - `tracks.mdx` - track() builders
    - `whatsapp-track.mdx` - WhatsApp domain verbs
  - Follow template from task 26

  **Must NOT do**:
  - DSL v1 APIs
  - Compiler internals

  **Parallelizable**: YES (with 27, 28)

  **References**:
  - `packages/dsl/src/` - Exports
  - Task 26 template

  **Acceptance Criteria**:
  - [ ] Episode API documented
  - [ ] Track builders explained
  - [ ] Domain verbs listed

  **Commit**: YES
  - Message: `docs(api): add @tokovo/dsl API reference`
  - Files: `apps/docs/content/api/dsl/`

---

### PHASE 9: GUIDES (6 tasks)

---

- [x] 30. Guide - Building Your First App Plugin

  **What to do**:
  - Write `content/guides/building-app-plugin.mdx`
  - Step-by-step tutorial:
    1. Create package structure
    2. Define plugin with definePlugin()
    3. Create views (React components)
    4. Create reducers (Immer)
    5. Register anchors
    6. Integrate with DSL
    7. Test in video-runner
  - Include plugin creation diagram

  **Plugin Development Flow**:

  ```
  ┌─────────────────────────────────────────────────────────────────┐
  │                 BUILDING AN APP PLUGIN                           │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  STEP 1: Define Plugin                                          │
  │  ┌─────────────────────────────────────────────────────────┐    │
  │  │  definePlugin({                                          │    │
  │  │    id: "app_myapp",                                      │    │
  │  │    tier: "A",                                            │    │
  │  │    views: { ... },                                       │    │
  │  │    reducers: { ... },                                    │    │
  │  │    anchors: { ... }                                      │    │
  │  │  })                                                      │    │
  │  └─────────────────────────────────────────────────────────┘    │
  │                             │                                    │
  │  STEP 2: Create Views       ▼                                   │
  │  ┌─────────────────────────────────────────────────────────┐    │
  │  │  export const MyAppView = ({ state }) => (               │    │
  │  │    <div>...</div>                                        │    │
  │  │  )                                                       │    │
  │  └─────────────────────────────────────────────────────────┘    │
  │                             │                                    │
  │  STEP 3: Create Reducers    ▼                                   │
  │  ┌─────────────────────────────────────────────────────────┐    │
  │  │  export const myAppReducer = (draft, event) => {         │    │
  │  │    // Immer mutations                                    │    │
  │  │  }                                                       │    │
  │  └─────────────────────────────────────────────────────────┘    │
  │                             │                                    │
  │  STEP 4: Register & Use     ▼                                   │
  │  ┌─────────────────────────────────────────────────────────┐    │
  │  │  episode("demo")                                         │    │
  │  │    .track("app_myapp", ...)                              │    │
  │  └─────────────────────────────────────────────────────────┘    │
  │                                                                  │
  └─────────────────────────────────────────────────────────────────┘
  ```

  **Must NOT do**:
  - Complex plugin patterns
  - Performance optimization

  **Parallelizable**: YES (with 31-35)

  **References**:
  - `packages/apps-whatsapp/` - Reference implementation
  - Concept: Plugin System

  **Acceptance Criteria**:
  - [ ] Complete tutorial works
  - [ ] New plugin runs in video-runner
  - [ ] All steps clearly explained

  **Commit**: YES (groups with guides)
  - Message: `docs(guides): add Building App Plugin tutorial`
  - Files: `apps/docs/content/guides/building-app-plugin.mdx`

---

- [x] 31. Guide - Cinematic Camera Usage

  **What to do**:
  - Write `content/guides/cinematic-camera.mdx`
  - Tutorial covering:
    - Basic camera movements (zoom, pan, focus)
    - Using shot presets (impact, subtle, suspense)
    - Creating composite movements with timeline
    - Working with anchors
    - Timing camera with app events
    - Advanced: custom effects
  - Include camera composition examples

  **Must NOT do**:
  - Physics implementation details
  - Internal architecture

  **Parallelizable**: YES (with 30, 32-35)

  **References**:
  - Package: @tokovo/device-camera
  - `docs/camera/` - Existing docs

  **Acceptance Criteria**:
  - [ ] Basic to advanced progression
  - [ ] Examples runnable
  - [ ] Preset usage clear
  - [ ] Timeline composition explained

  **Commit**: YES (groups with guides)
  - Message: `docs(guides): add Cinematic Camera Usage guide`
  - Files: `apps/docs/content/guides/cinematic-camera.mdx`

---

- [x] 32. Guide - Episode Authoring with DSL v2

  **What to do**:
  - Write `content/guides/episode-authoring.mdx`
  - Tutorial covering:
    - DSL v2 philosophy
    - Episode structure
    - Working with tracks
    - Timing and sequencing
    - Multi-device episodes
    - Audio integration
    - Best practices
  - Include episode structure diagram

  **Must NOT do**:
  - DSL v1 patterns
  - Low-level IR details

  **Parallelizable**: YES (with 30-31, 33-35)

  **References**:
  - Package: @tokovo/dsl
  - `packages/episodes/` - Examples

  **Acceptance Criteria**:
  - [ ] DSL v2 fully covered
  - [ ] Examples runnable
  - [ ] Best practices documented

  **Commit**: YES (groups with guides)
  - Message: `docs(guides): add Episode Authoring with DSL v2 guide`
  - Files: `apps/docs/content/guides/episode-authoring.mdx`

---

- [x] 33. Guide - Creating Custom Anchors

  **What to do**:
  - Write `content/guides/custom-anchors.mdx`
  - Tutorial covering:
    - Why custom anchors
    - Anchor provider pattern
    - Registering anchors in plugin
    - Using anchors with camera
    - Dynamic anchor resolution
  - Include anchor flow diagram

  **Must NOT do**:
  - Core anchor implementation
  - All built-in anchors

  **Parallelizable**: YES (with 30-32, 34-35)

  **References**:
  - Concept: Anchor System
  - Package: @tokovo/device-camera

  **Acceptance Criteria**:
  - [ ] Custom anchor creation works
  - [ ] Provider pattern explained
  - [ ] Integration with camera shown

  **Commit**: YES (groups with guides)
  - Message: `docs(guides): add Creating Custom Anchors guide`
  - Files: `apps/docs/content/guides/custom-anchors.mdx`

---

- [ ] 34. Guide - Debugging with Tokovo Studio

  **What to do**:
  - Write `content/guides/debugging-studio.mdx`
  - Tutorial covering (based on current Studio capabilities):
    - Timeline visualization
    - State inspection
    - Event debugging
    - Camera preview
  - Mark sections as "Coming Soon" where features are in development

  **Must NOT do**:
  - Features that don't exist
  - Internal Studio architecture

  **Parallelizable**: YES (with 30-33, 35)

  **References**:
  - Package: @tokovo/studio

  **Acceptance Criteria**:
  - [ ] Available features documented
  - [ ] WIP features marked clearly
  - [ ] Debugging workflow explained

  **Commit**: YES (groups with guides)
  - Message: `docs(guides): add Debugging with Studio guide`
  - Files: `apps/docs/content/guides/debugging-studio.mdx`

---

- [ ] 35. Guide - Performance Optimization

  **What to do**:
  - Write `content/guides/performance.mdx`
  - Tutorial covering:
    - Determinism benefits for performance
    - Efficient episode design
    - Reducing event count
    - Layout engine optimization
    - Remotion rendering tips
  - Include performance checklist

  **Must NOT do**:
  - Internal optimization details
  - Remotion internals

  **Parallelizable**: YES (with 30-34)

  **References**:
  - Concept: Deterministic Rendering
  - Package: @tokovo/renderer

  **Acceptance Criteria**:
  - [ ] Optimization strategies documented
  - [ ] Checklist provided
  - [ ] Measurable advice given

  **Commit**: YES (groups with guides)
  - Message: `docs(guides): add Performance Optimization guide`
  - Files: `apps/docs/content/guides/performance.mdx`

---

### PHASE 10: POLISH & DEPLOYMENT (5 tasks)

---

- [x] 36. Search Integration with Pagefind

  **What to do**:
  - Ensure Pagefind is properly configured
  - Test search across all content
  - Optimize search index
  - Verify search works for:
    - Package names
    - Concept names
    - Function names
    - Code snippets

  **Must NOT do**:
  - Custom search UI
  - Server-side search

  **Parallelizable**: YES (with 37-40)

  **References**:
  - Pagefind docs: https://pagefind.app/docs/
  - Task 1 initial setup

  **Acceptance Criteria**:
  - [ ] Search returns results for "WorldState"
  - [ ] Search returns results for "camera"
  - [ ] Search returns results for "episode"
  - [ ] Results appear in < 200ms

  **Commit**: YES (groups with polish)
  - Message: `docs(polish): finalize Pagefind search integration`

---

- [x] 37. Dark Mode Verification

  **What to do**:
  - Test all pages in dark mode
  - Verify ASCII diagrams readable in both modes
  - Check code syntax highlighting
  - Ensure no contrast issues
  - Fix any dark mode bugs

  **Must NOT do**:
  - Custom dark mode colors (use Nextra defaults)

  **Parallelizable**: YES (with 36, 38-40)

  **References**:
  - Nextra theme configuration
  - All content pages

  **Acceptance Criteria**:
  - [ ] All pages readable in dark mode
  - [ ] ASCII diagrams visible
  - [ ] Code blocks styled correctly
  - [ ] No broken contrast

  **Commit**: YES (groups with polish)
  - Message: `docs(polish): verify and fix dark mode issues`

---

- [x] 38. Mobile Responsiveness Check

  **What to do**:
  - Test all pages on mobile viewport (375px, 414px)
  - Verify navigation works on mobile
  - Check ASCII diagrams on small screens (may need horizontal scroll)
  - Ensure touch targets adequate
  - Fix any responsive issues

  **Must NOT do**:
  - Major layout restructuring
  - Mobile-specific features

  **Parallelizable**: YES (with 36-37, 39-40)

  **References**:
  - Chrome DevTools mobile emulation
  - All content pages

  **Acceptance Criteria**:
  - [ ] Navigation works on mobile
  - [ ] Content readable on 375px width
  - [ ] ASCII diagrams scrollable
  - [ ] No horizontal overflow (except diagrams)

  **Commit**: YES (groups with polish)
  - Message: `docs(polish): fix mobile responsiveness issues`

---

- [x] 39. Coverage Audit Script

  **What to do**:
  - Create `apps/docs/scripts/audit-coverage.ts`
  - Script should:
    - Read all package.json files from packages/
    - Check each package has a doc page
    - List any undocumented packages
    - Report coverage percentage
  - Add npm script: `pnpm run docs:audit`

  **Must NOT do**:
  - Export-level coverage (too granular)
  - Complex reporting

  **Parallelizable**: YES (with 36-38, 40)

  **References**:
  - `packages/*/package.json` - Package list
  - `apps/docs/content/packages/` - Doc pages

  **Acceptance Criteria**:
  - [ ] Script runs successfully
  - [ ] Reports 100% package coverage
  - [ ] Lists any gaps
  - [ ] Added to package.json scripts

  **Commit**: YES
  - Message: `docs(tooling): add coverage audit script`
  - Files: `apps/docs/scripts/audit-coverage.ts`

---

- [x] 40. Vercel Deployment Configuration

  **What to do**:
  - Create `apps/docs/vercel.json` configuration
  - Set up build command
  - Configure output directory
  - Add environment variables if needed
  - Test deployment preview
  - Document deployment process

  **Must NOT do**:
  - Custom domains
  - Advanced Vercel features

  **Parallelizable**: YES (with 36-39)

  **References**:
  - Vercel Next.js deployment docs
  - `apps/video-runner/` - Existing Vercel config if any

  **Acceptance Criteria**:
  - [ ] `vercel build` succeeds
  - [ ] Preview deployment works
  - [ ] Production build optimized
  - [ ] Deployment process documented

  **Commit**: YES
  - Message: `docs(deploy): add Vercel deployment configuration`
  - Files: `apps/docs/vercel.json`

---

- [x] 41. Final Review and Launch Checklist

  **What to do**:
  - Complete final review:
    - [ ] All 12 packages documented
    - [ ] All concept pages complete
    - [ ] All guides complete
    - [ ] API reference complete
    - [ ] Search working
    - [ ] Dark mode working
    - [ ] Mobile responsive
    - [ ] Coverage audit passes
    - [ ] Vercel deployment ready
  - Fix any remaining issues
  - Delete migrated content from `docs/camera/`
  - Update root README with docs link

  **Must NOT do**:
  - Major content additions
  - New features

  **Parallelizable**: NO (final task)

  **References**:
  - All previous tasks
  - This plan's acceptance criteria

  **Acceptance Criteria**:
  - [ ] All checklist items pass
  - [ ] Lighthouse score > 90
  - [ ] No console errors
  - [ ] Ready for production

  **Commit**: YES
  - Message: `docs: complete Tokovo documentation v1.0`
  - Files: Various

---

## Commit Strategy

| Phase | Tasks | Commit Pattern                        |
| ----- | ----- | ------------------------------------- |
| 1     | 1     | Single commit: infrastructure         |
| 2     | 2-4   | Group: foundation                     |
| 3     | 5-8   | Group: getting started + architecture |
| 4     | 9-13  | Group: concepts                       |
| 5     | 14-15 | Per-package commits (P0)              |
| 6     | 16-18 | Per-package commits (P1)              |
| 7     | 19-25 | Group: P2/P3 references               |
| 8     | 26-29 | Per-package API commits               |
| 9     | 30-35 | Group: guides                         |
| 10    | 36-41 | Group: polish + final                 |

---

## Success Criteria

### Performance

```bash
pnpm build --filter=docs  # Builds without errors
lighthouse https://docs.tokovo.dev  # Score > 90
```

### Coverage

```bash
pnpm run docs:audit  # 100% package coverage
```

### Functionality

- [ ] Dev server starts: `pnpm dev --filter=docs`
- [ ] All navigation links work
- [ ] Search returns relevant results
- [ ] Dark mode toggles correctly
- [ ] Mobile layout works
- [ ] ASCII diagrams render correctly

### Content

- [ ] All 12 packages documented
- [ ] All 5 core concepts documented
- [ ] All 6 guides complete
- [ ] API reference for P0/P1 packages
- [ ] Landing page with clear value proposition
- [ ] Getting started guide functional

### Final Checklist

- [ ] `docs/camera/` content migrated and original deleted
- [ ] Root README updated with docs link
- [ ] Vercel deployment configured
- [ ] Coverage audit passes
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Lighthouse > 90
