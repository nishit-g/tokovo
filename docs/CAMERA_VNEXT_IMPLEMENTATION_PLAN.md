# Camera VNext Hard-Cut Implementation Plan

Status: Active implementation

Branch: `codex/camera-vnext-hard-cut`

Architecture references:

- [Camera VNext Architecture](./CAMERA_VNEXT_ARCHITECTURE.md)
- [Engine VNext Architecture](./ENGINE_VNEXT_ARCHITECTURE.md)

## Outcome

Replace Tokovo's effect-oriented camera stack with a deterministic cinematic projection system in
which:

- story behavior, stage placement, and cinematography are independent programs;
- an episode can switch CameraPlans without rebuilding or changing its story;
- apps and device capabilities expose typed cinematic subjects from the exact projection they paint;
- the camera evaluates one complete pose and one ordered projection-pass pipeline per output;
- renderer code paints prepared projections and does not select shots, infer fallbacks, or replay
  camera effects;
- multi-device stage placement is never stored under camera state;
- non-linear lens treatments such as fisheye are real render operations rather than CSS-scale
  approximations;
- the old camera package, runtime events, reducers, DSL, anchor fallbacks, compatibility paths, and
  documentation are deleted before the branch is considered complete.

This is a hard replacement. There will be no compatibility compiler, compatibility runtime, dual
authoring surface, deprecated export layer, or permanent migration fixture in the completed tree.

## Current Inventory

The implementation must account for the following current repository usage:

- 47 episode files containing `.camera(...)` authoring;
- 198 `focus(...)` operations;
- 57 `trackCinematic(...)` operations;
- 5 direct `track(...)` operations;
- 27 stage-layout operations authored through camera;
- 3 camera `animate(...)` operations;
- 1 camera `set(...)` operation;
- 1 authored shake;
- 117 source, configuration, test, and documentation files referring to old camera concepts;
- 10 app/device anchor providers;
- broad heuristic fallback and alias logic across app providers;
- direct `@tokovo/device-camera` dependencies in compiler, renderer, episodes, video-runner, and
  WhatsApp package manifests.

The low usage of the remaining effect helpers is intentional evidence for deletion, not a reason to
preserve their APIs.

## Non-Negotiable Decisions

### Story, stage, and camera are separate programs

The prepared episode envelope will own independent artifacts and hashes:

```ts
interface PreparedEpisode {
  storyProgram: PreparedStoryProgram;
  stageProgram: PreparedStageProgram;
  cameraPrograms: readonly PreparedCameraProgram[];
  defaultCameraPlanId: string;
  storySignature: string;
  stageSignature: string;
  cameraSignatures: Readonly<Record<string, string>>;
}
```

Changing a CameraPlan must preserve the story signature and every replayed world-state hash.

### Camera is not replay state

`WorldState` will not contain camera state. Camera selection, tracking, lens evaluation, and shot
lifetime will not be runtime events. Camera output is a pure projection of:

```text
prepared camera program + projected stage at frame t + cinematic subjects at frame t
```

### Stage is not camera

Stage owns device and scene-node placement, including single, two-up, split, PIP/inset, and authored
placement transitions. Camera observes the solved stage. A shot cannot rearrange devices.

### Subjects replace loose public anchor strings

The public direction contract targets structured `CinematicSubjectRef` values. Exact app/entity
handles are preferred. Semantic queries are allowed only when their selection rule and lifecycle
are explicit and deterministic.

There is no implicit chain such as:

```text
lastMessage -> content -> app -> device -> invented rectangle
```

### Painted geometry and subject geometry share one source

App/device projection returns both render nodes and cinematic subjects. React does not independently
lay out geometry that camera targets. DOM measurement is never authoritative.

### A shot owns a complete pose

Every evaluated shot defines center, scale, rotation, clip, crop compensation, opacity, lens
parameters, and modifiers. No property leaks from an earlier effect or shot.

### Lens treatments compile to renderer projection passes

Named looks compile into a small generic pass vocabulary. Adding a look that uses existing pass
mathematics does not modify renderer code. A genuinely new projection operation adds one explicit
contract and one explicit renderer implementation without changing app or story code.

### No hidden recovery in release renders

Missing registrations, subjects, profiles, projection-pass renderers, invalid intervals, uncovered
outputs, and non-finite poses fail preparation or render. Preview may display a diagnostic overlay,
but it may not silently invent production behavior.

## Target Data Flow

```text
StoryProgram ---------------------> deterministic replay at frame t
                                          |
StageProgram ------------------------------|
                                          v
App/device capability projectors --> FrameProjection + SubjectTree
                                          |
CameraPlan -> camera compiler ------------|
                                          v
                              evaluateCamera(frame t, output)
                                          |
                                          v
                         EvaluatedCameraFrame per output
                         - complete pose
                         - view matrix
                         - ordered projection passes
                         - debug provenance
                                          |
                                          v
                                 thin projection painter
```

## Canonical Contracts

### Coordinate spaces

All public geometry must identify its space:

- app logical space;
- device screen space;
- device body space;
- stage/world space;
- output viewport space.

Transform chains are explicit and deterministic. Rectangles from different spaces are not silently
interchangeable.

### Cinematic subjects

Initial structured reference forms:

```ts
type CinematicSubjectRef =
  | {
      kind: "semantic";
      deviceId: string;
      appId: string;
      subjectId: string;
    }
  | {
      kind: "entity";
      deviceId: string;
      appId: string;
      entityType: string;
      entityId: string;
      region: string;
    }
  | {
      kind: "device";
      deviceId: string;
      subjectId: string;
    }
  | {
      kind: "group";
      members: readonly CinematicSubjectRef[];
    };
```

The resolved form includes local bounds, world bounds, owning scene node, visibility, clipping,
lifecycle, schema version, and provenance.

### Missing-subject policy

Implemented policies are explicit data:

- `error` for authored hero shots;
- `skip-shot` for optional generated coverage;
- `use-explicit` with another complete subject reference.

`hold-last-valid` with a finite maximum frame count is deliberately absent from the current IR and
remains deferred until trajectory baking exists. It must not be exposed as a runtime error path.

No default broad fallback chain exists.

### CameraPlan

Serializable CameraPlan IR uses sorted arrays and records, not Maps, functions, React components, or
class instances. It contains:

- output definitions;
- rigs;
- shot clips with inclusive start and exclusive end frames;
- complete framing/composer configuration;
- motion profiles;
- lens definitions and references;
- modifiers;
- explicit output coverage behavior;
- explicit missing-subject behavior.

### PreparedCameraProgram

Preparation produces:

- stable shot and rig IDs;
- interval indexes per output;
- resolved registrations;
- validated subject schemas;
- compact baked trajectories where tracking requires temporal smoothing;
- stable diagnostics;
- deterministic program signature;
- JSON-safe debug manifest.

### EvaluatedCameraFrame

The renderer consumes only the evaluated result:

- active output, shot, and rig IDs;
- complete pose;
- view matrix;
- clip and safe area;
- ordered projection passes;
- resolved subject provenance;
- constraint results;
- optional debug values that cannot affect pixels.

## Lens and Projection-Pass Scope

The first production set contains:

1. `wide-angle-barrel`
   - radial edge expansion;
   - configurable optical center;
   - deterministic crop compensation.
2. `fisheye`
   - bounded equidistant radial projection;
   - independent strength and radius;
   - not implemented as an exaggerated affine scale.
3. `perspective-tilt`
   - homography/matrix3d projection;
   - top-down, oblique, and keyboard-leaning compositions.
4. `anamorphic-edge-stretch`
   - axis-biased edge stretching;
   - chromatic separation is deferred until the texture backend implements and tests it.
5. `directional-smear`
   - velocity-driven multi-sample blur for editorial whips;
   - horizontal, vertical, and authored-vector directions;
   - guaranteed clean settlement at transition completion.

`lens-breathing` is included as a pose/optical modifier and does not count toward the five passes.

The backend feasibility gate must verify crisp text, video/image content, rounded device clipping,
alpha edges, 1080x1920 output, deterministic repeated frames, and acceptable render overhead. SVG
`foreignObject` plus deterministic filters/displacement maps is the first candidate. If it fails the
gate, the implementation moves to a texture-backed compositor instead of weakening the effects.

## Motion and Continuity

The compiler calculates trajectories, rather than asking the renderer to smooth previous frames.

For each shot it will:

1. resolve the subject lifecycle and desired subject trajectory;
2. compute composer framing samples;
3. solve crop, safe-area, scale, and rotation constraints;
4. unwrap rotation and move scale into logarithmic space;
5. create minimum-jerk or analytic critically damped motion;
6. interpolate lens parameters and crop compensation with the pose;
7. validate velocity, acceleration, and jerk budgets;
8. bake compact deterministic curves when a moving subject requires them;
9. quantize serialized values to a documented precision;
10. prove random-access evaluation matches sequential evaluation.

Normal movement and editorial whips use separate named constraint profiles. Exceeding a normal
profile is a diagnostic. Whip behavior must be explicitly authored and paired with a transition
treatment.

## Work Plan

### Implementation checkpoint — 2026-07-21

Completed foundation on `codex/camera-vnext-hard-cut`:

- JSON-safe `CameraPlanIR`, `StageProgramIR`, cinematic-subject refs, and strict Zod schemas;
- headless `@tokovo/stage` and `@tokovo/camera` packages with deterministic signatures and
  random-access evaluation;
- exact structured subject registration through the core/plugin boundary, with WhatsApp as the
  first app-owned provider;
- independent story/stage/camera signatures in the prepared cinematic envelope;
- a thin preview/reference projection surface with real projective, barrel, fisheye, anamorphic,
  and directional-smear operations;
- a 1080x1920 Remotion optical probe using the prepared stage/camera/subject pipeline rather than
  direct visual effects;
- deterministic per-frame camera trace data containing plan, selection, transition, subject
  provenance, and projection-pass decisions.

Evidence recorded at this checkpoint:

- camera kernel: 12 tests passing;
- stage kernel: 4 tests passing;
- WhatsApp suite: 86 tests passing;
- IR contract: 8 tests passing;
- camera, stage, compiler, core, React integration, WhatsApp, renderer, and video-runner focused
  typechecks passing;
- solution-wide TypeScript project-reference check passing;
- repeated render of optical-probe frame 210 produced the identical SHA-256
  `b4c1e75255ac7435f528b6df261af8acc04bfadd709b83fd3236f07bc38c6425`;
- repeated post-cleanup render of peak-whip frame 318 produced the identical SHA-256
  `a0c96a6cb4b1c621ac0351117eba31c0f40fe90ac4c1cf31b57cbd9640a93626`;
- whip probe is clean at frame 300, velocity-smears during frames 301–335, and is clean again from
  frame 336 without a compensating lens reset;
- 60-frame 1080x1920 timings: neutral 4.59s, eight-sample SVG smear 16.18s, optimized single-
  convolution SVG smear 12.19s;
- first texture-plate crisp-plus-trail microbenchmark: 0.83s after a 4.59s plate render, an estimated
  18% end-to-end overhead. This proves the direction but is not yet the integrated dynamic backend.

Backend decision: reject SVG `foreignObject` filters for production non-linear optics. Vector-grid
displacement tore typography; raster displacement fixed fidelity, but both sampled and convolution
smear failed the render-overhead gate. SVG remains preview/reference only. Release non-linear passes
must run through reusable raster plates and an offline texture compositor; the live renderer fails
loudly when that backend is required but absent.

This checkpoint does **not** claim cutover. The current event camera remains in the repository until
episodes and the main render pipeline are migrated, after which it must be deleted in one hard-cut
phase. No compatibility compiler or old-to-new translation layer has been added.

### Implementation checkpoint — 2026-07-22

The first real-product vertical slice now runs through Tokovo's normal episode composition rather
than a duplicated visual probe:

- `TrackEpisodeIR.cinematics` owns one StageProgram, multiple replaceable CameraPlans, and an
  explicit default plan; the DSL carries this data directly without producing CAMERA events;
- `prepareTrackEpisode` prepares and serializes the cinematic envelope against the story event
  signature, using the runtime's explicit camera registries;
- the main `TokovoRenderer` disables the event camera for VNext episodes, evaluates the prepared
  stage and selected plan, projects subjects from the same layout used to paint the app, and applies
  the result around the real device tree;
- `cameraPlanId` is a preview/render prop, so cinematography changes without story replay changes;
- the synthetic `CameraLensProbe` composition and its duplicate phone, WhatsApp, messages, and
  keyboard JSX were deleted;
- `whatsapp-flagship-v2` is the first directly migrated episode: its old `.camera(...)` block is
  gone, its three sends use canonical input sessions, and it ships `whatsapp-editorial` plus
  `whatsapp-expressive-lenses` plans;
- the real WhatsApp provider emits app-logical subjects, which are mapped through the exact
  plugin-declared AppSurface scale before stage projection;
- the real keyboard, notifications, system surfaces, device screen, and device body are projected
  as device-owned subjects from canonical layout output;
- preview debug data now exposes story/stage signatures, selected plan/shot/rig, projection passes,
  and exact subject provenance; release errors bypass the visual error boundary and fail the render
  process.

Evidence at this checkpoint:

- the 91-frame, 1080x1920 keyboard-entry and typing transition rendered successfully through the
  normal WhatsApp composition at 30fps;
- two independent renders of keyboard frame 120 produced the identical SHA-256
  `24b404e7c63029a0ec5d3d1b86e13554aa52e21af5e70ed03f9d4a882c8479c5`;
- inspected frames cover the full-device chat list, keyboard attached to the WhatsApp composer,
  and a semantic latest-message composition;
- the expressive nonlinear plan fails the release renderer with
  `CAM_TEXTURE_COMPOSITOR_REQUIRED` instead of emitting an SVG fallback or error-card video;
- compiler tests: 26 passing; renderer tests: 12 passing; WhatsApp tests: 86 passing;
  React registry tests: 6 passing; episode tests: 16 passing; video-runner tests: 21 passing;
- focused public-package and video-runner typechecks pass.

This is a real renderer cutover for one single-device episode, not completion of the repository
hard cut. Multi-device stage painting, the offline texture compositor, remaining episode migration,
and deletion of the event-camera packages are still open. The historical optical probe evidence
above remains as benchmark provenance; the probe source itself no longer exists.

### Texture-compositor checkpoint — 2026-07-22

The nonlinear release path is now connected to the normal render service and the real WhatsApp
flagship episode:

- every prepared lens and modifier declares whether it requires the composited or texture backend;
- the video composition exposes explicit `underlay`, `camera-plate`, and `foreground-plate` layers;
- camera plates contain the real app, keyboard, notifications, OS surfaces, and device chrome with
  alpha; backgrounds/audio and final story overlays stay independently attached;
- camera projection captures are versioned, frame-addressed, identity-checked data containing the
  story, stage, camera, plan, output viewport, and ordered projection passes;
- the render service emits deterministic 512x512 displacement-map sequences, hard-links repeated
  maps, drives named FFmpeg smear filters with per-frame commands, preserves RGB and alpha through
  separate warp paths, and recomposes underlay, optical camera, and foreground;
- projective homography is evaluated by the offline map whenever a texture plan is selected. The
  browser plate keeps only affine framing and crop scale, avoiding Chromium `foreignObject` corner
  artifacts;
- capture completion is range-aware and map filenames/timestamps are local to the rendered segment,
  establishing the seam required for deterministic chunking and retry;
- direct render paths still fail with `CAM_TEXTURE_COMPOSITOR_REQUIRED`; there is no SVG release
  fallback and no second optical implementation in the fast renderer;
- the iPhone physical shell no longer uses large spread shadows. A rounded in-bounds bezel and
  silhouette-following shadow produce a clean alpha plate at oblique and distorted angles.

Evidence at this checkpoint:

- a 51-frame 1080x1920 real-episode render across source frames 540–590 completed all three layers,
  optical maps, directional whip smear, transition settlement, anamorphic edge stretch, H.264/AAC
  output, and poster extraction;
- all 51 captures shared story signature `17:40166d16`, stage signature `c58b7ce3`, camera signature
  `b1734279`, and plan `whatsapp-expressive-lenses`;
- displacement-map generation for the 51-frame span took 466ms; the complete deterministic
  software-GL plate/render/composite path took 95.45s, so full-episode performance and plate reuse
  remain open gates rather than being misreported as complete;
- a post-fix three-frame projective render completed in 9.49s with clean rounded device alpha and no
  rectangular plate leakage;
- repeating that projective render produced identical MP4 SHA-256
  `14da5530739b631f28b932f3dc0da27c0bb8e99f02f23f2ca5462c687337feeb` and poster SHA-256
  `071c3b3caed3ccf37823675f288598cc0d71f25c8d49bc2fe8e2c9904588b08e`;
- camera kernel: 15 tests passing; render-service compositor/profile suite: 11 tests passing;
  camera, renderer, devices, render-service, and video-runner focused typechecks passing.

This checkpoint proves production routing and pixel feasibility for one output. It does not yet
prove multi-output composition, plan-independent reusable stage plates, chunk scheduling, a complete
full-episode performance budget, or repository-wide legacy deletion.

### Phase 0: Architecture lock and renderer feasibility

Status: In progress

- [x] Amend Camera VNext architecture to remove compatibility compilation and dual authoring.
- [x] Add replaceable CameraPlan sidecars and independent signatures.
- [x] Add the cinematic-subject contract and unified projection requirement.
- [x] Add the renderer projection-pass contract.
- [x] Add an optical feasibility composition covering projective, radial, fisheye, and smear passes.
- [x] Render representative stills.
- [x] Render and inspect a short encoded motion probe.
- [x] Record the preview-backend rejection and measured overhead.
- [x] Implement and benchmark the first production texture-compositor path.

Exit gate:

- real non-linear output is proven before repository migration;
- repeated probe frames are deterministic;
- the selected path preserves text and clipping quality;
- no compatibility layer has been introduced.

### Phase 1: JSON-safe IR and headless camera kernel

Status: In progress

- [x] Add CameraPlan IR contracts to `@tokovo/ir`.
- [x] Add StageProgram IR contracts.
- [x] Add cinematic-subject schema/ref contracts.
- [x] Create `packages/camera` as `@tokovo/camera`.
- [x] Add matrix, coordinate-space, and rectangle primitives.
- [x] Add composer math.
- [x] Add complete-pose interpolation.
- [x] Add deterministic interval selection.
- [ ] Add constraints and stable diagnostic codes.
- [x] Add projection-pass evaluation contracts.
- [x] Enforce no React, Remotion, DOM, browser, app-package, or wall-clock imports.

Focused verification:

- serialization round-trip;
- stable ordering and signatures;
- finite-pose property tests;
- matrix composition/inversion tests;
- interval boundary tests;
- random frame-order tests.

### Phase 2: Prepared envelope and independent signatures

Status: In progress

- [x] Split story, stage, and camera data in top-level episode IR.
- [x] Add independent story, stage, and camera signatures in the prepared VNext envelope.
- [x] Add explicit default CameraPlan selection.
- [x] Add preview/render override for CameraPlan ID.
- [x] Keep Camera VNext data out of runtime-event lowering.
- [x] Keep StageProgram clips out of camera state.
- [x] Add separate preparation signatures; render-service cache-key integration remains open.

Focused verification:

- changing only camera data preserves story signatures;
- story replay hashes match across camera plans;
- camera preparation rejects missing output/rig/subject/lens registration;
- prepared data remains JSON serializable through video-runner render data.

### Phase 3: Stage extraction

Status: In progress

- [x] Introduce deterministic stage nodes and transforms.
- [ ] Move current SINGLE/SPLIT/PIP layout ownership out of camera.
- [ ] Migrate 27 authored camera layout calls to stage authoring.
- [ ] Add main and inset output composition.
- [ ] Give every output independent camera evaluation.
- [ ] Make device selection explicit in stage/output data.

Focused verification:

- target-device focus never changes stage roles;
- main and PIP cameras are independent;
- a subject group can frame two devices;
- stage projection is identical with camera enabled and disabled.

### Phase 4: Unified app/device projection and subjects

Status: In progress

First vertical slice:

- [x] WhatsApp chat cinematic-subject provider from canonical layout projection;
- [x] exact message-bubble, reply, media, and reaction-region subjects;
- [x] canonical composer/input projection;
- [x] canonical keyboard subjects;
- [x] canonical notification subjects;
- [x] device screen and OS-surface subjects;
- [x] iPhone profile vertical slice;
- [ ] Android profile visual verification;
- [ ] RTL and long-thread fixtures.

Then migrate:

- [ ] iMessage;
- [ ] Instagram;
- [ ] X;
- [ ] LinkedIn;
- [ ] Teams;
- [ ] Snapchat;
- [ ] Typewriter;
- [ ] remaining device/system surfaces.

Each migrated capability must delete its old anchor provider, heuristic geometry, aliases, and
camera-specific dependency in the same slice.

Focused verification:

- projected subject bounds equal painted bounds within one output pixel;
- keyboard-open and notification states remain aligned;
- hidden/clipped subject lifecycle is explicit;
- missing profiles and schemas fail;
- no 430x932 or invented-rectangle fallback remains.

### Phase 5: Camera compiler and trajectory baking

Status: In progress

- [x] Compile outputs, rigs, shots, composers, blends, motion, lenses, and modifiers.
- [ ] Validate full output coverage.
- [x] Implement exact cuts and minimum-jerk complete-pose blends.
- [ ] Implement subject groups and safe zones (group union is complete; safe-zone solving remains).
- [ ] Implement bounded missing-subject behavior.
- [ ] Implement deterministic subject tracking.
- [ ] Bake compact curves for moving subjects.
- [x] Interpolate lens projection strength with pose state.
- [ ] Produce program manifests and stable diagnostics (evaluation trace and preparation diagnostics
  exist; artifact writers and full stable code catalog remain).

Focused verification:

- a looser next shot can zoom out;
- reset behavior cannot reveal an older shot;
- shot boundaries and gaps are deterministic;
- normal blends meet motion budgets;
- whips settle completely;
- cache enabled and disabled outputs match.

### Phase 6: Renderer cutover and lens passes

Status: In progress

- [x] Add pure frame projection before React.
- [ ] Evaluate camera outside device painters.
- [x] Apply view/lens transforms at output roots in the feasibility surface.
- [x] Route non-linear release output to a required texture backend without SVG fallback.
- [ ] Add explicit renderer registration for every projection-pass kind/version.
- [x] Add affine/projective painter.
- [x] Add barrel/fisheye painter.
- [x] Add anamorphic edge painter.
- [x] Add directional-smear painter.
- [x] Add first-output attachment rules for underlay, camera plate, and final foreground HUD.
- [ ] Delete `useCameraEngine` after cutover.
- [ ] Replace hardcoded multi-device layout components with stage/output projection.

Focused verification:

- camera affects complete intended scene nodes, including device chrome;
- final-HUD overlays remain unwarped when requested;
- pass registration failure is loud;
- golden frames cover neutral, peak, and settling frames for each pass;
- affine-only renders have a low-overhead fast path.

### Phase 7: Direct episode migration

Status: In progress

- [ ] Replace all 198 focus calls with shots/rigs.
- [ ] Replace all 57 `trackCinematic` calls with subject-follow shots.
- [ ] Replace all direct track calls.
- [ ] Replace all stage-layout calls.
- [ ] Replace animate/set/shake authoring.
- [ ] Introduce stable entity handles from app/device authoring where needed.
- [ ] Replace ambiguous latest-item aliases with exact handles or explicit queries.
- [ ] Prepare every episode and snapshot CameraPlan manifests.

First direct migration completed: `whatsapp-flagship-v2` no longer authors event-camera effects.

No compatibility compiler or old-to-new translation layer will be written.

### Phase 8: Flagship mega episode

Status: Pending

Create `camera-vnext-cinematic-flagship` at 1080x1920, 60fps, approximately 24 seconds.

Story requirements:

- two device profiles;
- WhatsApp conversation and canonical keyboard input;
- cross-device notification handoff;
- message, media, composer, keyboard, banner, device, and group subjects;
- main and independent PIP outputs;
- canonical typing, send, notification, and transition audio cues.

Camera requirements:

- top-down/oblique opening using perspective tilt;
- vertical move from header to keyboard;
- barrel and controlled fisheye during typing;
- exact sent-message and media reframing;
- directional-smear notification whip;
- independent main/PIP tracking;
- clean two-device final composition;
- every distortion reaches a neutral, crisp state before the final frame.

The same story ships with `restrained` and `kinetic` CameraPlans. Their story/replay hashes must be
identical and camera signatures different.

### Phase 9: Diagnostics and render artifacts

Status: Pending

- [ ] `camera explain` command;
- [ ] `camera diff` command;
- [ ] `camera subjects` command;
- [ ] preview overlay for stage nodes, subjects, safe/soft/dead zones, desired pose, final pose, and
  projection passes;
- [ ] `camera-program.json` render artifact;
- [ ] `camera-diagnostics.json` render artifact;
- [ ] `projection-hashes.json` render artifact;
- [ ] optional `camera-trace.ndjson` artifact;
- [ ] failing-frame subject/projection packet;
- [ ] stable lens, shot, rig, subject, output, and constraint identifiers in logs.

Diagnostics are deterministic data products. Wall-clock operational timings remain outside replay,
projection, signatures, cache keys, and pixels.

### Phase 10: Legacy deletion

Status: Pending

Delete:

- [ ] `packages/device-camera`;
- [ ] old camera DSL builder and exports;
- [ ] CAMERA IR payloads and track-event variants;
- [ ] camera runtime-event variants and type guards;
- [ ] core camera types and `WorldState.camera`;
- [ ] core camera handler and reducer registration;
- [ ] duplicate engine camera cleanup/finalization;
- [ ] `effectCleanupBuffer`;
- [ ] old lowering;
- [ ] old director and compiler plugin;
- [ ] app camera behavior registries;
- [ ] old anchor registry and fallback resolver;
- [ ] app anchor-provider files and aliases;
- [ ] old renderer hook and debug types;
- [ ] camera runtime plugin manifest entry;
- [ ] old camera CLI and migration commands;
- [ ] Camera V1 reference documentation;
- [ ] obsolete mechanical tests;
- [ ] every `@tokovo/device-camera` package dependency and TypeScript reference.

Required zero-match production searches:

```text
@tokovo/device-camera
world.camera
activeEffects
effectCleanupBuffer
deviceTransforms
resolveAnchorWithFallback
CameraDirectorPlugin
kind: "CAMERA"
trackCinematic(
camera.layout(
```

### Phase 11: Final release gates

Status: Pending

During implementation, run focused tests only. Run full repository checks at the final cutover:

1. camera/IR/compiler focused suites;
2. app projection alignment suites;
3. renderer golden stills and short motion probes;
4. prepare all episode definitions;
5. solution typecheck at the public-contract cutover;
6. repeated flagship render determinism;
7. `pnpm verify:release` once after legacy deletion.

## Smart Verification Cadence

Do not run full lint, build, and release verification after small edits.

Use:

- contract-specific Vitest files while defining IR;
- `@tokovo/camera` tests while changing camera math;
- one app's projection tests while migrating that app;
- selected still frames for renderer changes;
- a short motion composition for optical/continuity changes;
- package typecheck when a package's public surface stabilizes;
- solution typecheck only at cross-package cutovers;
- one final release verification after all deletion gates pass.

## Performance Budgets

Initial budgets, measured on the repository's pinned render environment:

- camera interval selection and pose evaluation: below 0.2ms p95 per output/frame;
- subject projection lookup after frame projection: below 0.2ms p95;
- complete one-device camera projection overhead: below 1ms p95 excluding app layout;
- complete two-device camera projection overhead: below 2ms p95 excluding app layout;
- affine-only rendering overhead: below 15 percent versus camera disabled;
- one full-frame non-linear pass: below 30 percent render-time overhead at 1080x1920;
- no more than two simultaneous full-frame non-linear passes outside an explicitly approved
  transition;
- no per-frame DOM measurements;
- no unbounded trace accumulation in production renders;
- no previous-frame mutable camera state.

Budgets may be tightened after the feasibility probe. They may not be silently relaxed to make an
implementation pass.

## Definition of Done

Camera VNext is complete only when:

- story, stage, and camera programs are independent and independently hashed;
- changing CameraPlan preserves story replay hashes;
- `WorldState` contains no camera state;
- stage placement is independent from camera direction;
- renderer consumes one evaluated camera result per output;
- camera and compiler contain no app IDs or hardcoded app event names;
- apps/devices publish cinematic subjects from the exact projection they paint;
- no hidden subject or profile fallback remains;
- main and PIP outputs evaluate independently;
- normal blends meet continuity budgets;
- arbitrary frame order matches sequential evaluation;
- five real lens/effect treatments work end to end;
- debug artifacts explain any frame from story subject through final output pass;
- every repository episode uses CameraPlan authoring;
- the flagship story renders through both restrained and kinetic plans;
- every old camera runtime, DSL, reducer, processor, fallback, dependency, and document is deleted;
- zero-match deletion searches pass;
- focused suites, deterministic flagship rendering, and the final release gate pass.
