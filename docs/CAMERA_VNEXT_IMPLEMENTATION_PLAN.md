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

### Camera-independent stage-plate checkpoint — 2026-07-22

The first compositor slice has been replaced by a genuinely re-cuttable stage-plate contract:

- camera capture contract v2 records the full normalized stage domain, view matrix, output opacity,
  clip radius, viewport, ordered projection passes, and independent story/stage/camera identities;
- the camera plate paints the raw full-stage device/app/OS tree. It contains no CameraPlan framing,
  crop compensation, projective transform, or lens displacement;
- the WhatsApp flagship stage root is normalized to the complete 1290x2796 iPhone plate while the
  final output remains 1080x1920;
- affine framing, crop compensation, and projective tilt are composed into one per-frame destination
  homography and sampled by FFmpeg's cubic perspective filter on independent RGB and alpha paths;
- bounded radial, fisheye, and anamorphic residuals remain deterministic 512x512 8-bit displacement
  maps, and directional smear remains a named per-frame filter command;
- the attempted absolute 16-bit remap path was rejected before landing because its integer source
  sampling produced visible stair-stepping. No remap code or compatibility path remains;
- one-output/full-frame restrictions fail explicitly until multi-output masks are connected.

Evidence at this checkpoint:

- editorial and expressive plans produced the exact same real-WhatsApp stage frame SHA-256
  `7f591dc225c9b4eec9acbeee28fb4239be6e2b4d29db0dc65f618faa85a869ca`, while their
  camera signatures and projection-pass programs differed;
- repeated three-frame projective release renders produced identical MP4 SHA-256
  `cce412402511b4eb0604654b309392d3d1632abb11c7c1b6dc54b0769b10c2d6` and poster
  SHA-256 `c5d660022886bdd204ca45b57cc96a6198a7c079bf6f5d13ec3d616176658a08`;
- the projective proof retained crisp WhatsApp typography, smooth phone silhouette alpha, and no
  rectangular browser-transform leakage;
- a 15-frame release proof across source frames 552–566 exercised continuously changing projective
  corners, two overlapping directional-smear passes, the app transition into the real Parcel
  Partner chat, and clean transition settlement;
- homography command plus optical-map generation took 35ms for three frames and 153ms for 15 frames;
  complete deterministic software-GL layer rendering still took 21.32s and 78.57s respectively, so
  persistent stage-plate caching and render scheduling remain performance gates;
- render-service compositor/profile suite: 12 tests passing; renderer, video-runner, and
  render-service focused typechecks passing.

This checkpoint proves plan-independent pixels and a high-quality recut path. It does not claim that
the render service has persistent plate storage yet, or that multi-output and full-episode
performance gates are complete.

### Persistent stage-plate cache checkpoint — 2026-07-22

Camera-independent pixels are now reused by the normal render service:

- `.remotion/camera-stage-plates` stores versioned ProRes 4444 stage plates outside git;
- the cache key includes episode, stage-painter source, story, stage, exact frame range, dimensions,
  fps, image format, and codec, and its API has no CameraPlan or camera-signature input;
- the stage-painter signature covers built modules capable of changing app/device pixels while
  excluding episode CameraPlan output, so a built cinematography edit does not invalidate reusable
  pixels;
- each plate has a size and SHA-256 integrity manifest; malformed, truncated, or checksum-mismatched
  entries become diagnosed misses rather than trusted pixels;
- the manifest records the complete reusable identity for inspection and intentionally contains no
  CameraPlan ID or camera signature;
- stores use temporary files plus atomic renames, and a failed store never fails an otherwise valid
  render;
- cache hits run a 2x2 `camera-projection-data` composition that evaluates the selected plan and
  emits the versioned per-frame capture without repainting the full app/device stage;
- `TOKOVO_CAMERA_STAGE_PLATE_CACHE=off` provides a direct fresh-versus-cached verification path.
- root `render:episode` workflows synchronize the video-runner dependency build through Turbo before
  preparing data, preventing a source edit from silently rendering stale workspace `dist` output;

Evidence at this checkpoint:

- a real three-frame WhatsApp cache miss stored a 3,237,842-byte plate with SHA-256
  `a1d657ba33410cd29d275ad66e4391bd699b31bb8c27e1cedacdba0ae8b23326`;
- an authored recut changed perspective tilt from 3.5 to 4 degrees and rebuilt the episode package;
  story signature `17:40166d16` and stage signature `8cd79bff` stayed fixed, camera signature changed
  from `b1734279` to `0a958369`, and the bundle signature changed from
  `079f4fa84ba5bf4329807a3d06348e58` to `df455612fabaa1d1ccae84fe6d5c72d3`;
- despite that real source/build/camera change, both renders used stage-plate cache key
  `22dec9d6e24d7a0f7119155302ac937befac2b13222ba15c09d6498cade2995a` and plate SHA-256
  `a1d657ba33410cd29d275ad66e4391bd699b31bb8c27e1cedacdba0ae8b23326`;
- the authored recut reduced texture-stage time from 15.14s on the baseline miss to 3.21s on the
  verified hit, approximately 78.8%;
- fresh and cached outputs retained identical MP4 SHA-256
  `cce412402511b4eb0604654b309392d3d1632abb11c7c1b6dc54b0769b10c2d6` and poster
  SHA-256 `c5d660022886bdd204ca45b57cc96a6198a7c079bf6f5d13ec3d616176658a08`;
- the recut intentionally produced different final MP4 SHA-256
  `f5df69b664ad819496d8e410b0814838f3a6748c193f498c88e891188d80a98e` and poster SHA-256
  `86909e3378ca2c3faa8264a6e8a7a3c97b1c651ed13dac19d89ec2f3227b1b0f`, proving that
  cached stage pixels do not freeze cinematography;
- cache key/integrity tests cover stable identity changes, verified hits, and corrupt-entry misses.

Persistent single-range reuse is complete. Chunk/subrange reuse, bounded eviction, shared remote
storage, underlay/foreground caching, and full-episode performance measurement remain open.

### Multi-output and semantic-framing checkpoint — 2026-07-22

Same-stage multi-output release composition and context-safe close framing are now connected without
moving app semantics into the camera or compositor:

- camera projection capture is a version-3 hard cut containing a stable list of independently
  evaluated outputs; version 2 is not parsed or adapted;
- the release compositor validates and freezes output topology for the captured range, orders outputs
  by z-index and ID, and gives each output its own homography, optical maps, opacity, rounded clip,
  shadow, smear, and viewport composition;
- affine/projective-only outputs bypass the displacement filter and do not create or read optical
  map inputs. A mathematically neutral displacement map is no longer allowed to resample alpha or
  subtly deform device/app pixels;
- `CameraRigIR.framingGuard` accepts any structured cinematic subject and constrains a tighter hero
  subject against its semantic context. The flagship follows app-owned messages, keyboard, media,
  and navigation subjects while keeping the device body centered and completely inside frame;
- guard resolution and bounds are recorded in deterministic evaluation trace data, so a crop can be
  explained without DOM measurement or render-pixel guesses;
- the flagship's independent PIP output follows the exact sent-message entity, then fades before the
  notification shot. The main output remains uninterrupted and independently directed;
- the iPhone 16 painter now separates the screen glass aperture from the physical shell with an
  in-bounds inner edge. This adds perceived bezel depth without changing screen coordinates, app
  layout, keyboard geometry, notification geometry, or cinematic subject bounds.

Evidence at this checkpoint:

- real release-compositor proofs were inspected at the opening, keyboard, sent-message/PIP,
  notification, and media frames;
- the sent-message PIP retains the complete bubble and input bar after the neutral-displacement
  bypass; the main device stays centered and fully contained during close subject shots;
- a real one-frame release proof with neutral main and PIP outputs reported zero optical outputs and
  spent 2ms in command/map preparation before completing the FFmpeg composition;
- camera kernel: 16 tests passing; IR contract: 8 tests passing; episode suite: 17 tests passing;
  render-service compositor/profile suite: 20 tests passing;
- devices, renderer, video-runner, episodes, and render-service focused builds/typechecks pass.

This connects multiple independent camera outputs sourced from one stage plate. It does not yet
connect multi-device stage painting: `EpisodeRenderer` still rejects a Camera VNext episode with
more than one device, and the old event-camera system remains for unmigrated episodes until the
repository-wide hard cut.

### Typed direction, physical display, and grading checkpoint — 2026-07-22

The flagship camera surface is now authorable without constructing raw CameraPlan IR, and the
device geometry seen by camera matches the physical device painter:

- `cinematicProgram`, `cameraSubject`, and typed plan/shot builders own stage, outputs, rigs, shots,
  lenses, modifiers, and filters as JSON-safe episode data;
- typed movement verbs cover dolly, truck, pedestal, pan, tilt, roll, crane, orbit, cut, settle, and
  whip, with authored movement intent retained in deterministic trace data;
- `orbit` is explicitly a projective 2.5D plate movement today, leaving a stable intent boundary for
  a future true multi-plane renderer without pretending current output has 3D parallax;
- deterministic color-grade filters are explicitly registered, validated, interpolated, traced,
  previewed, and executed by named FFmpeg filters after geometric projection and before smear;
- iPhone and Pixel profiles now distinguish physical body bounds from an inset display aperture;
  app, keyboard, notification, and OS geometry uses display dimensions while device-body subjects
  remain in body space;
- the flagship is authored entirely with the new builder and includes restrained and kinetic plans,
  four geometric lens looks, breathing and smear modifiers, three grades, an independent message
  PIP, semantic/entity targeting, and a clean neutral landing.

Evidence at this checkpoint:

- the complete 1440-frame kinetic episode rendered and decoded at 1080x1920/60 with H.264 video and
  AAC audio;
- full-resolution inspection covered the oblique opening, fisheye keyboard, notification whip,
  projective media reframe, semantic navigation, and final neutral settle;
- the display is visibly inset inside the body/glass rail at both wide and close framing, with no
  episode-authored bezel compensation;
- renderer coordinate-space regression coverage proves body-space geometry remains at the origin
  while screen/app geometry receives the exact profile display inset;
- DSL: 13 tests passing; camera: 17; IR: 8; episodes: 17; renderer: 12; render service: 20.

This checkpoint does not claim repository-wide legacy deletion. Forty-seven episode files still
author event-camera choreography, and multi-device VNext painting remains intentionally fail-closed.
Deleting the old package before those two migrations would silently remove direction from shipped
episodes, so Phase 10 remains gated rather than being papered over with a compatibility adapter.

### Enterprise contract and hot-path checkpoint — 2026-07-22

The VNext authoring, preparation, stage, and evaluation boundaries now pay validation and indexing
cost once instead of repeating authoring work for every rendered frame:

- cinematic builders reject empty/duplicate IDs, invalid stage data, out-of-range shots, missing
  outputs, invalid default rigs, and missing lens/modifier/filter references with stable authoring
  error codes before an episode reaches preparation;
- prepared camera program v2 stores compact integer indexes for outputs, rigs, lenses, modifiers,
  and filters, plus non-overlapping shot segments ordered by selection precedence;
- camera shot selection uses binary search over prepared intervals. It performs no per-frame shot
  filtering or sorting;
- prepared stage program v2 stores topological order, stable paint order, and compact keyframe
  indexes per node. Stage evaluation performs no per-node keyframe filtering or per-frame z-sort;
- subject frames are indexed once per output evaluation and use collision-safe length-prefixed
  identities in selection, trace, and diagnostics;
- duplicate members in structured subject groups fail preparation instead of producing ambiguous
  trace and framing behavior;
- missing framing guards, prepared definitions, and runtime model registrations produce stable
  camera diagnostics rather than generic errors;
- lens, modifier, and filter parameter handling shares one strict internal validation utility, so
  extensions use identical finite/range/unknown-key behavior;
- every new prepared index is JSON-safe and covered by serialization round-trip tests; it contains
  integers and IDs rather than Maps, functions, or duplicated definition objects.

Local synthetic sanity measurements on the exact mise-pinned Node.js 22.22.0 runtime:

- a 2,000-shot plan prepared 2,000 interval segments in 37.5ms; after warm-up, 20,000 complete
  output evaluations averaged approximately 0.81µs each;
- a 101-node stage with 10,000 transform keyframes prepared in 31.2ms; 1,000 complete stage-frame
  evaluations averaged approximately 22.3µs each.

End-to-end evidence on the same pinned runtime:

- the complete 1,440-frame kinetic cut rendered as a 540x960/60 watchable preview with H.264 video,
  AAC audio, and SHA-256 `c2072fc8a9ae951b93d5d6c8239ba13b0d811dc3a9a9d380e462f75544b25228`;
- full-resolution frame 840 rendered at 1080x1920 with SHA-256
  `56f70a4e9feb5e11fb25877528546ac455c14a0a3823c7db27e92ce31205f249`;
- direct release rendering rejected the first texture-only lens pass as designed. Watchable preview
  and release texture composition remain separate, and release pixels must flow through the offline
  render-service compositor.

These measurements validate the algorithmic shape against the current sub-0.2ms camera selection
and sub-2ms stage/camera budgets. They do not replace repeatable CI benchmarks, real episode
profiling, or end-to-end renderer measurements.

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
- [x] Add separate preparation signatures and CameraPlan-independent stage-plate cache keys.

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
- [x] Add same-stage main and inset output composition.
- [x] Give every output independent camera evaluation.
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
- [x] Implement subject groups and semantic framing guards.
- [ ] Implement general output safe-zone constraints.
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
- [x] Make full-stage camera plates independent from the selected CameraPlan.
- [x] Apply affine/projective framing with a cubic release homography before optical residuals.
- [x] Bypass optical displacement for affine/projective-only outputs.
- [x] Persist and integrity-check reusable stage plates across render jobs.
- [x] Evaluate new CameraPlans through a projection-data-only cache-hit path.
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

Status: In progress — the watchable same-stage main/PIP release slice is complete; second-device
stage painting and the cross-device handoff remain gated on Phase 3 rather than being faked through
the old camera layout path.

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

Landed vertical slice:

- `camera-vnext-cinematic-flagship` is a 24-second, 1080x1920, 60fps episode painted by the real
  WhatsApp package on the canonical iOS device, input, notification, screen-recording, overlay, and
  audio surfaces;
- one immutable story supplies exact sent-message/media entities, semantic header/input/last-message
  subjects, the canonical keyboard, a foreground notification banner, app navigation, and a grouped
  conversation settle;
- independently evaluated main and PIP outputs are composited from the same reusable stage plate;
  the PIP follows the exact sent-message entity, uses its own viewport/clip/shadow, and fades before
  the notification beat;
- each main rig uses a semantic device-body framing guard, allowing close app-owned subjects while
  keeping the physical phone centered and fully contained;
- selectable `restrained` and `kinetic` plans have different camera signatures while the prepared
  story signature stays equal to the episode event signature;
- the kinetic cut covers perspective tilt, barrel, fisheye, horizontal and vertical anamorphic edge
  stretch, directional smear, and lens breathing before a fully neutral final shot;
- a full 1440-frame local kinetic preview and restrained comparison cut completed at 1080x1920/60;
- a 641-frame kinetic proof completed through the actual offline texture compositor while reusing the
  camera-independent 1290x2796 stage plate; the single RGBA optical path preserves chroma and alpha
  across perspective, displacement, and smear;
- fast-preview manifests now record the selected CameraPlan and explicit preview projection mode;
  release jobs still fail closed unless nonlinear passes use the texture compositor.

Remaining before Phase 8 is complete:

- stage-authored second-device placement;
- cross-device notification handoff;
- a texture-compositor release render of the completed two-device episode and repeated pixel/hash
  comparison.

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
- [x] Camera V1 reference documentation (deleted and replaced by `docs/CAMERA_REFERENCE.md`);
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
