# Camera VNext Hard-Cut Implementation Plan

Status: Complete; final release gates passed

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
- the old camera package, runtime events, reducers, DSL, target fallbacks, compatibility paths, and
  documentation are deleted before the branch is considered complete.

This is a hard replacement. There will be no compatibility compiler, compatibility runtime, dual
authoring surface, deprecated export layer, or permanent migration fixture in the completed tree.

## Hard-Cut Inventory

The completed tree has one camera model:

- every episode receives an explicit StageProgram and one or more CameraPlans;
- no episode authors camera runtime events or effect operations;
- all app, device, keyboard, notification, and system geometry is published as typed cinematic
  subjects from the projection that paints it;
- the headless `@tokovo/camera` package owns preparation, evaluation, constraints, tracking,
  diagnostics, and projection-pass data;
- `CinematicStageRenderer` owns stage/output composition and explicitly registered projection
  backends;
- the previous package, state, reducers, processors, lowering, DSL, registries, renderer hooks,
  fallbacks, dependencies, tests, and public documentation have been removed.

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

### Subjects replace loose public target strings

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
- clip and editorial insets;
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
3. solve crop, editorial-frame, scale, and rotation constraints;
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

This checkpoint predated the completed hard cut. No compatibility compiler or translation layer was
introduced during the migration.

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
- `whatsapp-flagship-v2` was the first directly migrated episode: its camera direction is now an
  independent cinematic program, and its three sends use canonical input sessions;
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

This checkpoint was the first renderer cutover. Multi-device stage painting, the offline texture
compositor, repository-wide migration, and deletion were completed in subsequent phases. The
historical optical probe evidence
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
  maps, evaluates projective corners with frame-local expressions, drives named command-capable
  FFmpeg filters with adjacent local command streams, preserves RGB and alpha through separate warp
  paths, and recomposes underlay, optical camera, and foreground;
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
prove multi-output composition, plan-independent reusable layer plates, chunk scheduling, a complete
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
  the corner coordinates use bounded frame-evaluated expressions rather than unsupported runtime
  commands;
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

### Camera-independent layer-plate cache checkpoint — 2026-07-22

Camera-independent pixels are reused by the normal render service as three explicit layers:

- `.remotion/camera-layer-plates` stores versioned ProRes underlay, device-stage, and foreground
  plates outside git;
- underlay uses opaque 10-bit ProRes with the source audio stream, while stage and foreground use
  muted ProRes 4444 with alpha;
- cache identity includes layer, episode, camera-layer painter source, story, stage, exact frame
  range, dimensions, fps, and encoding, and its API has no CameraPlan or camera-signature input;
- the camera-layer painter signature covers every package capable of painting those layers,
  including apps, devices, background, overlay, renderer, stage, and voice, while excluding episode
  CameraPlan output;
- each plate has a byte length and SHA-256 integrity manifest; malformed, truncated, or
  checksum-mismatched entries become diagnosed misses rather than trusted pixels;
- stores use temporary files plus atomic renames, and a failed store never fails an otherwise valid
  render;
- cache hits run a 2x2 `camera-projection-data` composition that evaluates the selected plan and
  emits only the versioned per-frame camera program;
- `TOKOVO_CAMERA_LAYER_PLATE_CACHE=off` is the sole fresh-versus-cached verification switch;
- root render workflows synchronize video-runner dependencies before preparing data, preventing a
  source edit from silently rendering stale workspace output.

Evidence at this checkpoint:

- after a final Calls/PIP framing recut changed camera signature from `faa38846` to `d245137a`, story
  signature `42:d83ccdb7` and stage signature `4effedc2` remained fixed;
- camera-layer painter signature `903ac1e89f0d9301f31335aa064b1312` produced plan-independent
  underlay key `b574b4a05515821fbbe5a5173e6d2a6cb466f3f95677a0882c8bbd16c3ec8c53`, stage key
  `1d9a302bb3ba83b79ecac96b5295036ce8360d13e2cc227826cdb7dd376362e9`, and foreground key
  `f38ac90269f161c61a17ca1aee0f19f598b05a24ce6c44603c4022622615939b`;
- two independent 16-frame camera-motion release jobs produced byte-identical MP4 SHA-256
  `61fa936d080abd6d41ca61dfd348eea09d0c88ab70b93dc133c86bdc9cdcce4d`, poster SHA-256
  `87f54cd4834eeead08486b1bbc1c1364f02a6c32a3e203d6b31376b7a31d7914`, and camera-trace
  SHA-256 `72968c34882edb5c7008e75c2db08520a32bd16009299f2900c79bd82ed26b48`;
- the release proof shows a complete iOS keyboard and device silhouette, intentional side spacing,
  no adjacent-device leakage, and alpha-safe fisheye distortion;
- cache identity/integrity tests cover stable identity changes, verified hits, and corrupt-entry
  misses.

Persistent exact-range reuse is complete. Remote cache distribution and bounded eviction are
operational extensions, not Camera VNext correctness dependencies.

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

This was the final pre-cutover checkpoint. The remaining episode choreography and multi-device
painting migrations were subsequently completed, after which Phase 10 deleted the retired camera
implementation. The completed tree contains no adapter or dual authoring path.

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

Status: Complete

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

Status: Complete

- [x] Add CameraPlan IR contracts to `@tokovo/ir`.
- [x] Add StageProgram IR contracts.
- [x] Add cinematic-subject schema/ref contracts.
- [x] Create `packages/camera` as `@tokovo/camera`.
- [x] Add matrix, coordinate-space, and rectangle primitives.
- [x] Add composer math.
- [x] Add complete-pose interpolation.
- [x] Add deterministic interval selection.
- [x] Add constraints and stable diagnostic codes.
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

Status: Complete

- [x] Split story, stage, and camera data in top-level episode IR.
- [x] Add independent story, stage, and camera signatures in the prepared VNext envelope.
- [x] Add explicit default CameraPlan selection.
- [x] Add preview/render override for CameraPlan ID.
- [x] Keep Camera VNext data out of runtime-event lowering.
- [x] Keep StageProgram clips out of camera state.
- [x] Add separate preparation signatures and CameraPlan-independent layer-plate cache keys.

Focused verification:

- changing only camera data preserves story signatures;
- story replay hashes match across camera plans;
- camera preparation rejects missing output/rig/subject/lens registration;
- prepared data remains JSON serializable through video-runner render data.

### Phase 3: Stage extraction

Status: Complete

- [x] Introduce deterministic stage nodes and transforms.
- [x] Move SINGLE/SPLIT/PIP placement to stage ownership.
- [x] Migrate authored layout calls to stage authoring.
- [x] Add same-stage main and inset output composition.
- [x] Give every output independent camera evaluation.
- [x] Make device selection explicit in stage/output data.

Focused verification:

- target-device focus never changes stage roles;
- main and PIP cameras are independent;
- a subject group can frame two devices;
- stage projection is identical with camera enabled and disabled.

### Phase 4: Unified app/device projection and subjects

Status: Complete

First vertical slice:

- [x] WhatsApp chat cinematic-subject provider from canonical layout projection;
- [x] exact message-bubble, reply, media, and reaction-region subjects;
- [x] canonical composer/input projection;
- [x] canonical keyboard subjects;
- [x] canonical notification subjects;
- [x] device screen and OS-surface subjects;
- [x] iPhone profile vertical slice;
- [x] Android profile visual verification;
- [x] RTL and long-thread fixtures.

Then migrate:

- [x] iMessage;
- [x] Instagram;
- [x] X;
- [x] LinkedIn;
- [x] Teams;
- [x] Snapchat;
- [x] Typewriter;
- [x] remaining device/system surfaces.

Each migrated capability must delete its old subject provider, heuristic geometry, aliases, and
camera-specific dependency in the same slice.

Focused verification:

- projected subject bounds equal painted bounds within one output pixel;
- keyboard-open and notification states remain aligned;
- hidden/clipped subject lifecycle is explicit;
- missing profiles and schemas fail;
- no 430x932 or invented-rectangle fallback remains.

### Phase 5: Camera compiler and trajectory baking

Status: Complete

- [x] Compile outputs, rigs, shots, composers, blends, motion, lenses, and modifiers.
- [x] Validate full output coverage.
- [x] Implement exact cuts and minimum-jerk complete-pose blends.
- [x] Implement subject groups and semantic framing guards.
- [x] Implement general output safe-zone constraints.
- [x] Implement bounded missing-subject behavior.
- [x] Implement deterministic subject tracking.
- [x] Bake compact curves for moving subjects.
- [x] Interpolate lens projection strength with pose state.
- [x] Produce program manifests, stable diagnostics, evaluation traces, and failure packets.

Focused verification:

- a looser next shot can zoom out;
- reset behavior cannot reveal an older shot;
- shot boundaries and gaps are deterministic;
- normal blends meet motion budgets;
- whips settle completely;
- cache enabled and disabled outputs match.

### Phase 6: Renderer cutover and lens passes

Status: Complete

- [x] Add pure frame projection before React.
- [x] Evaluate camera outside device painters.
- [x] Apply view/lens transforms at output roots in the feasibility surface.
- [x] Route non-linear release output to a required texture backend without SVG fallback.
- [x] Add explicit renderer registration for every projection-pass kind/version.
- [x] Add affine/projective painter.
- [x] Add barrel/fisheye painter.
- [x] Add anamorphic edge painter.
- [x] Add directional-smear painter.
- [x] Add first-output attachment rules for underlay, camera plate, and final foreground HUD.
- [x] Make full-stage camera plates independent from the selected CameraPlan.
- [x] Apply affine/projective framing with a cubic release homography before optical residuals.
- [x] Bypass optical displacement for affine/projective-only outputs.
- [x] Persist and integrity-check reusable underlay, stage, and foreground plates across render jobs.
- [x] Evaluate new CameraPlans through a projection-data-only cache-hit path.
- [x] Evaluate perspective corners with bounded frame-local expressions.
- [x] Encode exact contiguous 120-frame compositor chunks and stream-concatenate them before audio
      muxing.
- [x] Keep every command-capable mutable filter on an adjacent output-local command stream.
- [x] Delete the prior renderer camera hook after cutover.
- [x] Replace hardcoded multi-device layout components with stage/output projection.

Focused verification:

- camera affects complete intended scene nodes, including device chrome;
- final-HUD overlays remain unwarped when requested;
- pass registration failure is loud;
- golden frames cover neutral, peak, and settling frames for each pass;
- compositor chunk topology has no gaps, overlaps, dropped frames, or duplicated frames;
- affine-only renders have a low-overhead fast path.

### Phase 7: Direct episode migration

Status: Complete

- [x] Replace effect-style focus calls with shots/rigs.
- [x] Replace tracking calls with subject-follow shots.
- [x] Replace direct track calls.
- [x] Replace stage-layout calls.
- [x] Replace animate/set/shake authoring.
- [x] Introduce stable entity handles from app/device authoring where needed.
- [x] Replace ambiguous latest-item aliases with exact handles or explicit queries.
- [x] Prepare every episode and inspect CameraPlan manifests.

Every repository episode now uses the same cinematic program model.

No compatibility compiler or old-to-new translation layer will be written.

### Phase 8: Flagship mega episode

Status: Complete; final repeated release-render evidence is recorded with Phase 11.

`whatsapp-cinematic-flagship` is the single Camera VNext mega episode: 1080x1920, 30fps, 36 seconds,
two physical device profiles, one immutable story, and replaceable `restrained` and `kinetic` plans.

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

Delivered:

- real WhatsApp projections on iPhone and Pixel stage nodes, including English and Arabic RTL;
- canonical keyboard, notification, screen-recording, app navigation, gesture, reply, Calls,
  Updates, message, media, and device surfaces;
- stage-authored two-device placement plus independently evaluated main and PIP outputs;
- cross-device notification and conversation handoff without camera-owned layout mutation;
- exact entity handles, semantic regions, subject groups, and physical-body framing guards;
- dolly in/out, truck, settle, and whip motion with minimum-jerk blends;
- barrel, fisheye, horizontal/vertical anamorphic edge treatments, directional smear, lens breathing,
  and two color grades, all returning to a clean neutral final composition;
- independent story, stage, restrained-plan, and kinetic-plan signatures;
- fail-closed release rendering through reusable camera-independent texture plates.

### Phase 9: Diagnostics and render artifacts

Status: Complete

- [x] `camera explain` command;
- [x] `camera diff` command;
- [x] `camera subjects` command;
- [x] preview overlay for stage nodes, subjects, editorial insets, framing guards, desired pose, final pose,
      and projection passes;
- [x] `camera-program.json` render artifact;
- [x] `camera-diagnostics.json` render artifact;
- [x] `projection-hashes.json` render artifact;
- [x] `camera-trace.ndjson` artifact;
- [x] failing-frame subject/projection packet;
- [x] stable lens, shot, rig, subject, output, and constraint identifiers in logs.

Diagnostics are deterministic data products. Wall-clock operational timings remain outside replay,
projection, signatures, cache keys, and pixels.

### Phase 10: Legacy deletion

Status: Complete

Delete:

- [x] prior camera package directory;
- [x] prior camera DSL builder and exports;
- [x] camera-event IR payloads and track-event variants;
- [x] camera runtime-event variants and type guards;
- [x] mutable core camera state;
- [x] core camera handler and reducer registration;
- [x] duplicate engine camera cleanup/finalization;
- [x] cleanup-driven camera lifetime;
- [x] prior lowering;
- [x] prior director and compiler plugin;
- [x] app camera behavior registries;
- [x] heuristic subject registry and fallback resolver;
- [x] duplicate app subject-provider files and aliases;
- [x] prior renderer camera hook and debug types;
- [x] camera runtime plugin manifest entry;
- [x] prior camera CLI and migration commands;
- [x] Camera V1 reference documentation (deleted and replaced by `docs/CAMERA_REFERENCE.md`);
- [x] obsolete mechanical tests;
- [x] every dependency and TypeScript reference to the removed implementation.

The release-hardening test owns the retired-identifier denylist. Production source, package graphs,
tests, and public documentation must all remain at zero matches.

### Phase 11: Final release gates

Status: Complete

During implementation, run focused tests only. Run full repository checks at the final cutover:

1. camera/IR/compiler focused suites;
2. app projection alignment suites;
3. renderer golden stills and short motion probes;
4. prepare all episode definitions;
5. solution typecheck at the public-contract cutover;
6. repeated flagship render determinism;
7. `pnpm verify:release` once after legacy deletion.

Final evidence on the mise-pinned Node.js 22.22.0 runtime:

- two independent full kinetic release jobs produced byte-identical 1080x1920 H.264/AAC artifacts:
  1,080 decoded frames at 30fps and exactly 36 seconds;
- both MP4 files have SHA-256
  `4b80a61dab0134e143d83c109d34b99d769b685dd0639d118b7a737026899473`, both posters have
  SHA-256 `62559ed52cca979bc86627e9b6871a467f57f207df4994474a31ea7b731fa711`, and both
  camera traces have SHA-256
  `c8a9b3d289ff4c2cbf4146c94678eada4aea8be7ade089ab0fbc54f597a68079`;
- each job encoded nine exact contiguous chunks. Inspection covered every 120-frame seam plus the
  opening, keyboard, sent-message/PIP, notification, media, RTL handoff, screen recording,
  Calls/PIP, and final two-device landing;
- the final hard-cut denylist, package checks, lint, solution typecheck, episode validation, complete
  test/build suite, render determinism checks, render smoke test, and docs build all pass through one
  `pnpm verify:release` invocation.

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
