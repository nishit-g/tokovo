# Tokovo Engine VNext Architecture

**Status:** Proposed architecture and migration plan
**Audience:** maintainers, product engineers, app-package owners, rendering engineers, and contributors
**Last reviewed:** 2026-07-21
**Governs:** authoring, IR, compilation, runtime, device systems, app plugins, layout, rendering, audio, and deterministic enforcement
**Specialist companions:** [Camera VNext Architecture](./CAMERA_VNEXT_ARCHITECTURE.md) and [Visual System VNext Architecture](./VISUAL_SYSTEM_VNEXT_ARCHITECTURE.md)

## Executive Summary

Tokovo has a strong product thesis and several strong technical primitives:

- episodes are authored as checked-in structured data;
- replay is frame-addressable rather than driven by wall-clock UI state;
- application behavior is modeled through reducers and snapshots;
- plugins are explicitly registered;
- multiple simulated devices and applications can participate in one episode;
- audio already contains useful deterministic buses, policies, and frame envelopes;
- semantic app subjects can support cinematic direction without episode-level pixel guesses.

The engine is not yet a coherent best-in-class platform. It contains production-quality islands connected by compatibility paths that distribute ownership across the DSL, compiler, core, device packages, app packages, renderer, and video runner. Several features have more than one authoring surface, event namespace, reducer, state representation, or renderer. Some authored fields are accepted and then silently discarded during lowering. Camera state also owns part of multi-device stage composition, which makes camera direction capable of changing the scene it is supposed to observe.

The principal risk is not that any individual implementation is unsalvageable. The risk is **non-local behavior**: changing one layer can alter another system because responsibilities are not exclusive. More product features added to this model will increase integration entropy and slow creator iteration.

Engine VNext establishes one invariant:

> Every concern has one canonical owner, every authored intent either survives compilation or fails loudly, and rendering is a pure projection of prepared episode data and replayed world state.

The target pipeline is:

```text
Authoring DSL
    -> Canonical semantic IR
    -> Capability compilers
    -> Prepared episode programs
    -> Pure replay kernel
    -> Pure frame projection
    -> React/Remotion painter
    -> Pixels and audio
```

The migration must be incremental. Existing episodes remain valuable fixtures, but compatibility paths must have explicit removal dates. New code must not deepen legacy ownership.

## Decision

Tokovo will evolve toward a capability-oriented deterministic engine with:

1. one canonical authoring surface per capability;
2. one canonical event and state model per capability;
3. a small headless replay kernel with no feature-specific behavior;
4. capability compilation that resolves intent before rendering;
5. device-scoped app state for every app instance;
6. stage composition independent from camera direction;
7. a pure, non-React frame projection layer;
8. a renderer that paints projections without inventing product behavior;
9. exact deterministic replay tests separated from visual-regression tests;
10. fail-loudly validation for unsupported events, missing assets, missing subjects, and incomplete registration;
11. explicit legacy tombstones followed by deletion after catalog migration.

This document is the whole-engine policy. The camera document describes the camera capability in greater detail and must obey the ownership, dependency, compilation, projection, and enforcement rules defined here.

## Implementation Checkpoint: Canonical OS Surfaces

The keyboard, notifications, lockscreen, and homescreen slices now implement this
policy end to end:

- keyboard intent is one field-scoped input-session IR, prepared and evaluated by
  `@tokovo/device-keyboard`, then painted once by `InputKeyboard`;
- notification intent and interaction data compile into one immutable notification
  program, with random-access lifecycle evaluation, typed cross-capability action
  effects, one projection layer, and one `NotificationSurface`;
- lockscreen and homescreen contracts, deterministic localization, platform themes,
  projection, and painting live in `@tokovo/devices`;
- renderer only composes those projections and registers their semantic cinematic subjects;
- app packages retain app semantics, theme, notification content adapters, and action
  targets; core has no keyboard or notification state mirror;
- superseded keyboard, notification, renderer lock/home, and core app-config paths were
  deleted after catalog migration.

The proof fixture is `os-surface-mega-exhaustive`: four devices spanning iOS/Android,
light/dark, Hindi/Arabic/Japanese/English input, RTL, lock/home, notification privacy,
grouping, DND/foreground policy, notification center, and a real quick reply that mutates
WhatsApp state.

The visual-system hard cut is recorded in
[VISUAL_SYSTEM_VNEXT_IMPLEMENTATION_PLAN.md](./VISUAL_SYSTEM_VNEXT_IMPLEMENTATION_PLAN.md). Device
geometry, platform themes, app viewport geometry, editorial composition, and governed backdrops now
share one versioned contract. App-local inset defaults and renderer/device substitution paths are
deleted.

## Product and Engineering Verdict

### Product verdict

Tokovo can become a category-defining product. Phone-native, multi-device, deterministic cinematic episodes occupy a meaningful space between motion design software, game engines, browser automation, and conventional video editors. The product becomes defensible when a creator can express application semantics once and receive reliable cinematic output across devices, formats, and arbitrary frames.

It will not win because it has the most abstractions or the largest simulated-app catalog. It wins if it provides:

- unusually fast authoring;
- visibly excellent outputs;
- predictable behavior under iteration;
- reusable cinematic direction;
- reliable multi-device composition;
- deterministic rendering at scale;
- app packages deep enough to tell real stories rather than display mock screens.

### Engineering verdict

The current repository is an ambitious early platform, not a finished engine architecture. It has a sound direction and useful implementations, but several public capabilities are broader than their real runtime support. Some passing gates validate compilation or local reducer mechanics while missing semantic loss across the complete authoring-to-pixel path.

The right response is neither a blind rewrite nor indefinite compatibility. Preserve algorithms and package knowledge that work; replace ambiguous contracts, competing execution paths, and silent fallback behavior.

## Scope

This document covers:

- episode authoring and fluent builders;
- canonical IR and schema validation;
- lowering and prepared episode construction;
- replay, world state, reducer registration, and finalization;
- app package contracts and app instance state;
- device profiles, metrics, chrome, and OS surfaces;
- stage composition and multi-device layout;
- camera integration boundaries;
- keyboard and text-input sessions;
- notifications and notification actions;
- navigation and transitions;
- calls and system activities;
- audio, sound effects, voice, and ducking;
- backgrounds and story overlays;
- subjects, solved layout, and frame projection;
- React/Remotion rendering;
- determinism, visual regression, performance, accessibility, and localization enforcement;
- legacy removal and migration sequencing.

## Non-Goals

This document does not:

- prescribe every app's visual design;
- require an immediate workspace-package split for every capability;
- require a big-bang rewrite;
- make core aware of React, Remotion, browser APIs, or product-specific semantics;
- preserve unsupported behavior merely because a type or helper once exposed it;
- define the camera solver in full; that belongs in the camera companion document;
- mandate Unity, Cinemachine, or another engine's object model;
- authorize deletion without consumer discovery, migration, and replacement tests.

## Non-Negotiable Invariants

### Deterministic random access

For a prepared episode `E`, frame `f`, and render configuration `c`:

```text
project(replay(E, f), c)
```

must produce the same logical projection regardless of:

- whether earlier frames were rendered;
- render order;
- worker assignment;
- React mount history;
- preview versus render mode;
- cache warmth;
- wall-clock time;
- machine-local state;
- network availability.

### One authority per concern

One capability owns each domain's contract, compilation, runtime state, lifecycle, and projection. Other capabilities interact through typed intents or registered events, not direct foreign-state mutation.

### Authored intent is preserved or rejected

Every authored field must do one of the following:

1. influence a prepared program, runtime state, frame projection, audio output, or validation result; or
2. fail compilation with an actionable unsupported-capability error.

Returning an empty event list for a supported-looking operation is forbidden.

### Core remains a kernel

Core may own event ordering, replay, immutable state transitions, registration, cache contracts, and lifecycle orchestration. Core must not implement keyboard cleanup, notification policy, camera effects, call semantics, voice timing, or app behavior.

### Renderer paints; it does not decide

Presentation code may choose implementation details required to draw an already-decided projection. It must not select the active device, invent app layouts, derive navigation policy, pick notification behavior, or interpret arbitrary app state.

### Camera observes a stage

Stage layout determines where devices and other scene nodes exist. Camera selects and transforms a
view of that stage. A CameraPlan must not rearrange stage nodes.

### App instances are always device-scoped

An app mounted on one device and the same app mounted on multiple devices use the same state schema. Cardinality must not change state shape.

### No hidden fallback

Missing plugins, subjects, layouts, assets, profiles, event handlers, or capability adapters must fail at preparation or validation. Preview-only diagnostic output may visualize a failure; it must not silently invent production behavior.

### Exact contracts precede compatibility

Compatibility adapters must be named, measurable, tested, and temporary. They may translate legacy data into canonical data but must not create a permanent second source of truth.

## Terminology

### Intent

A semantic authoring request, such as “type this draft,” “show this notification,” “open this app,” or “frame these subjects.” It describes desired behavior without prescribing low-level state mutations.

### Canonical IR

The validated, serializable representation of authored intent. It is complete enough for capability compilers and contains no React components or live geometry.

### Capability

A system with its own semantic contract and lifecycle, such as keyboard, notifications, navigation, camera, audio, or an app runtime.

### Prepared episode

The fully resolved deterministic input to replay and projection. It contains normalized frame intervals, resolved device profiles, validated assets, capability programs, initial state, and explicit registrations.

### Program

A capability-specific prepared representation optimized for deterministic evaluation, such as a camera shot program, audio cue program, notification schedule, or input-session program.

### Replay kernel

The headless engine responsible for applying ordered events and capability finalizers to world state.

### Projection

A serializable, render-ready description of what should be painted or played at a frame. Projection is a pure function of prepared data, world state, frame, and render configuration.

### Painter

React/Remotion components that turn projections into DOM, SVG, canvas, video, and audio nodes without creating domain behavior.

### Stage

The coordinate system and scene graph containing devices, backgrounds, overlays, and other renderable nodes before camera transformation.

### Tombstone

A legacy API or implementation scheduled for removal with an identified replacement, consumer inventory, migration owner, and deletion gate.

## Current Architecture Snapshot

The repository currently has the intended macro layers:

- `packages/episodes` composes canonical episodes and the runtime plugin manifest;
- `packages/dsl` provides authoring builders;
- `packages/ir` provides episode schemas and event definitions;
- `packages/compiler` lowers authoring data and prepares runtime state;
- `packages/core` replays events and stores world state;
- `packages/react` registers runtime and UI plugin behavior;
- `packages/renderer` paints device/application output;
- `packages/apps-*` implement app-specific semantics and UI;
- `packages/device-*` and `packages/devices` implement system capabilities;
- `apps/video-runner` composes Remotion output;
- `apps/render-service` orchestrates renders.

The problem is not the existence of these directories. The problem is that the dependency and ownership boundaries do not always match their names.

## Confirmed Cross-Cutting Findings

### Mega plugin contract

The core plugin contract includes runtime reducers, UI view components, assets, audio rules, layout constants, bootstrap behavior, lowering, DSL extensions, subjects, and notification adapters. This makes one contract span headless runtime, authoring, compilation, and presentation.

See [`packages/core/src/types/plugin-contract.ts`](../packages/core/src/types/plugin-contract.ts).

The React plugin manager then registers both runtime and presentation concerns, including reducers, event kinds, views, layouts, subjects, audio rules, and notification behavior.

See [`packages/react/src/plugin/plugin.ts`](../packages/react/src/plugin/plugin.ts).

**Required direction:** capability descriptors must be separated into headless and presentation registrations. A package's `/plugin` entry point composes these descriptors but does not define domain behavior.

### Feature behavior inside core

The core engine performs feature-specific lifecycle work for camera, audio, notifications, and keyboard. Built-in handlers also know numerous feature event namespaces and sometimes route them using string matching.

See [`packages/core/src/engine.ts`](../packages/core/src/engine.ts) and [`packages/core/src/engine/built-in-handlers.ts`](../packages/core/src/engine/built-in-handlers.ts).

**Required direction:** capabilities register exact handlers and finalizers. Core invokes them without understanding their semantic meaning.

### Conditional app-state shape

Compiler preparation uses a singleton app state when an app appears once and device-scoped state when it appears more than once. Core temporarily aliases device-scoped state into the singleton map to run legacy reducers.

See [`packages/compiler/src/v2/prepare.ts`](../packages/compiler/src/v2/prepare.ts) and [`packages/core/src/engine.ts`](../packages/core/src/engine.ts).

**Required direction:** canonical app state is always keyed by app instance identity, minimally `deviceId + appId`. Projections provide convenient device views without changing storage shape.

### Presentation-layer orchestration

The renderer currently decides notification surfaces, calls, keyboard visibility, system screens, status-bar theming, unlock geometry, camera-aware layout, and app-state-derived layout fallbacks.

See [`packages/renderer/src/TokovoRenderer.tsx`](../packages/renderer/src/TokovoRenderer.tsx) and [`packages/renderer/src/engines/useLayoutEngine.ts`](../packages/renderer/src/engines/useLayoutEngine.ts).

**Required direction:** a pure projection layer resolves these decisions before React. Renderer components consume discriminated projection types.

### Silent lowering loss

Read-only lowering probes confirmed that some supported-looking authoring data does not reach meaningful runtime behavior:

- OS notification show operations can lower to no event;
- OS state fields such as battery, network, and DND can be carried by an event whose handler only applies time;
- rich notification fields can be dropped;
- call type, display mode, and caller metadata can be dropped.

**Required direction:** introduce preservation tests for every IR operation and property. Unsupported fields fail compilation. Generic default branches may not return `[]` for unknown operations.

## System-by-System Assessment

## Authoring DSL and IR

### Current strengths

- TypeScript authoring is a strong fit for reusable, checked-in episodes.
- Structured tracks are superior to loose JSON timelines.
- The v2 DSL provides useful narrative ergonomics.
- Zod-backed schemas can provide an explicit public contract.

### Current problems

- Some capabilities expose more than one builder surface.
- Similar concepts exist in both OS and device tracks.
- A fluent method can exist while its lowering is incomplete or absent.
- The DSL currently participates in compiler orchestration, creating a dependency direction that makes authoring aware of lowering implementation.
- `at()` and `span()` style methods are not uniformly meaningful across secondary builders.

### Target ownership

- `@tokovo/dsl` emits canonical IR only.
- `@tokovo/ir` owns versioned serialized contracts and validation.
- `@tokovo/compiler` consumes canonical IR.
- Capability packages may expose typed authoring extensions, but those extensions emit canonical capability intents rather than executing compilation.
- Every builder operation has a contract test proving its exact IR output.

### Required rules

1. No builder method is released without lowering and runtime/projection coverage.
2. No second builder exists for the same canonical capability.
3. IR operations use discriminated unions, not string-pattern interpretation.
4. All intervals use one documented boundary convention.
5. Unsupported version or property combinations fail with path-aware messages.

## Compiler and Preparation

### Current strengths

- Compilation provides the correct place to normalize author intent.
- Plugin-based lowering allows apps to own app semantics.
- Preparation already resolves important runtime inputs.

### Current problems

- The compiler depends on concrete system implementations.
- Some compiler plugins hardcode app-flavored event assumptions.
- Platform inference may rely on profile-name string inspection.
- Feature options may be silently dropped.
- Some timing remains converted again inside runtime or rendering.

### Target ownership

Compiler is an orchestrator of registered capability compilers. It does not know WhatsApp event names, notification reducer details, or retired camera runtime implementation classes.

Preparation must resolve:

- device profile IDs into validated immutable metrics;
- assets into deterministic asset records;
- all seconds/durations into canonical frame intervals;
- stage layout into a scene program;
- camera intent into a shot program;
- keyboard intent into input-session programs;
- notifications into lifecycle programs and app-action references;
- calls into call-session programs;
- audio and voice into one cue program;
- overlays into interval-indexed records;
- exact capability registrations and versions.

### Prepared episode envelope

Conceptually:

```ts
interface PreparedEpisode {
  version: string;
  episodeId: string;
  fps: number;
  durationInFrames: number;
  initialWorld: WorldState;
  devices: Record<DeviceId, PreparedDevice>;
  programs: {
    scene: SceneProgram;
    camera: CameraProgram;
    input: InputProgram;
    notifications: NotificationProgram;
    navigation: NavigationProgram;
    calls: CallProgram;
    activities: ActivityProgram;
    audio: AudioProgram;
    overlays: OverlayProgram;
  };
  capabilityManifest: PreparedCapabilityManifest;
  assetManifest: PreparedAssetManifest;
  sourceMap: EpisodeSourceMap;
}
```

The exact type may differ. The invariant is that render-time code receives resolved programs, not partially interpreted authoring configuration.

## Replay Kernel

### Required responsibilities

Core owns:

- stable event ordering;
- replay to an arbitrary frame;
- immutable/pure reducer invocation;
- handler and finalizer registration;
- snapshot/cache contracts;
- deterministic diagnostics;
- event provenance and source mapping;
- replay equivalence utilities.

Core does not own:

- notification grouping;
- keyboard timing;
- camera tracking;
- voice duration calculation;
- call lifecycle;
- navigation policy;
- app reducers;
- React component contracts;
- Remotion integration;
- browser or wall-clock APIs.

### Capability runtime contract

Conceptually:

```ts
interface RuntimeCapability<State, Event, Projection> {
  id: string;
  version: string;
  eventKinds: readonly Event["type"][];
  reduce(state: State, event: Event, context: ReplayContext): State;
  finalize?(state: State, frame: number, context: ReplayContext): State;
  project?(state: State, context: ProjectionContext): Projection;
}
```

This must not be a single generic escape hatch. Registration validates exact event kinds and detects collisions.

### Time access

Replay context contains `frame` and `fps`. Domain handlers must never assume 30 fps or access wall-clock time. Observability clocks are injected outside deterministic state calculation and cannot influence replay results.

## App Packages

### Canonical responsibilities

An app package owns:

- app-specific IR payloads or typed intent extensions;
- app compilation/lowering;
- bootstrap snapshots;
- app reducer and selectors;
- semantic layouts;
- semantic subject declarations;
- app notification-content adapters;
- app audio rules;
- UI projection and UI components;
- app-specific validation and fixtures.

An app package does not own:

- OS keyboard lifecycle;
- device notification policy;
- navigation state transitions;
- physical safe areas;
- camera transforms;
- renderer-level fallback geometry.

### App instance identity

Use a canonical identity such as:

```ts
type AppInstanceId = `${DeviceId}:${AppId}`;
```

World state stores all app instances identically:

```ts
interface WorldState {
  appInstances: Record<AppInstanceId, unknown>;
}
```

Device-specific projection can expose `activeApp`, but storage and reducer routing remain canonical.

### Cross-capability behavior

Apps emit typed intents. Examples:

- app asks input capability to begin a text-input session;
- notification capability asks navigation to open an app route;
- an app notification action emits an app-specific action event;
- camera consumes cinematic subjects projected by the app but never reads app DOM.

No app mutates device-system state directly, and no device system interprets arbitrary app-state properties.

## Device Profiles and Chrome

### Current assessment

The devices package combines headless metrics, React shells, navigation, calls, activities, DSL
code, lowering, runtime reducers, and physical projection geometry. Camera-critical safe-area,
screen, and body bounds now come from the registered device profile; remaining device UI
tokenization is tracked separately from the camera architecture.

### Target model

Device support should be divided into enforced layers, even if initially retained in one workspace package:

```text
devices/contract     immutable device/profile types
devices/profiles     validated profile data
devices/runtime      device-local OS telemetry and lifecycle
devices/ui           frame, glass, notch, status bar, home indicator
devices/plugin       thin registration
```

Navigation, calls, activities, notifications, and keyboard remain separate capabilities or subpaths with their own contracts.

### Metrics authority

One resolved profile owns:

- logical viewport dimensions;
- pixel ratio if needed for assets;
- physical frame/chrome geometry;
- safe-area insets;
- status-bar geometry;
- home-indicator geometry;
- supported system capabilities;
- platform presentation strategy ID.

Legacy camera-safe-area fields must be migrated to canonical device metrics before deletion. Runtime screen dimensions may describe an output or orientation but must not silently conflict with the resolved profile.

## Stage and Multi-Device Composition

### Current problem

Multi-device layout is partially stored under camera state. Camera focus can therefore change the primary device and indirectly rearrange the stage.

### Target ownership

A scene/stage capability owns:

- devices and non-device scene nodes;
- node transforms;
- z-order;
- multi-device layout templates;
- primary narrative node when relevant;
- entry/exit and stage transitions;
- output aspect-ratio adaptation;
- device spacing and collision constraints.

Camera owns only the view into the solved stage.

### Required invariant

For a fixed scene program and frame, changing the camera shot may change crop, pan, zoom, rotation, depth treatment, and output selection. It may not change the scene-node transforms produced by the stage solver.

## Camera

Camera must follow [Camera VNext Architecture](./CAMERA_VNEXT_ARCHITECTURE.md).

At the whole-engine boundary:

- apps provide typed cinematic subjects through solved layout;
- scene owns node placement;
- camera compiles shot intent into deterministic shot clips;
- camera runtime/projector produces complete poses;
- renderer applies an already-resolved camera/output projection;
- camera cannot mutate stage layout, app state, notification state, or device state;
- camera is a system capability, not a fake app with a null view.

## Layout and Subjects

### Current assessment

Semantic subjects are the correct direction, but layout calculation and rendering can diverge. The current layout hook may inspect generic app fields, apply global chat constants, choose preview fallbacks, and cache using an incomplete signature.

### Target model

Apps own a pure layout solver:

```ts
solveAppLayout({
  appState,
  deviceViewport,
  safeArea,
  locale,
  direction,
  textMetrics,
  frame,
}): AppLayoutProjection
```

That projection contains render geometry and subjects from the same solved source:

```ts
interface AppLayoutProjection {
  nodes: Record<NodeId, LayoutNode>;
  subjects: Record<SubjectId, ResolvedSubject>;
  contentBounds: Rect;
  revisionHash: string;
}
```

Renderer and camera both consume this projection. Neither independently reconstructs geometry.

### Cache contract

Projection caching keys are content-addressed from complete canonical inputs. A manually incremented `layoutRevision` may be an optimization hint but cannot be the only correctness mechanism.

## Keyboard and Text Input

### Implementation status

Keyboard and text input now use one explicit, prepared capability. Core has no keyboard state or keyboard event reducer. App lowerers never synthesize keyboard events, and app message/post payloads have no `typed` timing flags. All visual input comes from field-scoped `InputSession` projections.

### Canonical capability

Keyboard owns `InputSession`:

```ts
interface InputSession {
  id: InputSessionId;
  deviceId: DeviceId;
  appInstanceId: AppInstanceId;
  fieldId: string;
  startFrame: number;
  endFrame: number;
  submitAtFrame?: number;
  locale: ResolvedInputLocale;
  direction: "ltr" | "rtl" | "auto";
  keyboard: InputKeyboardConfig;
  operations: readonly PreparedInputOperation[];
}
```

### Ownership

- App declares the semantic field, draft, and submit result.
- Input compiler expands intent into a deterministic session.
- Input evaluation owns visibility, focused field, draft projection, key highlighting, and lifecycle.
- App reads the canonical draft projection for its composer.
- App reducer receives a semantic submit event at the prepared frame.
- Core only routes registered events.

### Required behavior

- Use grapheme clusters rather than UTF-16 code-unit length.
- Support explicit typing cadence and prepared deterministic variation.
- Define interruption and replacement semantics.
- Define hardware, software, voice, paste, and suggestion input variants if exposed.
- Keep the renderer on the single `InputKeyboard` painter; do not reintroduce app- or device-owned keyboard painters.

## Notifications

### Implemented assessment

Notifications now have one authoring contract in `@tokovo/ir`, one DSL surface, one
prepared program, one random-access evaluator, one projection layer, and one painter.
Unsupported apps, invalid targets, duplicate actions, impossible interactions, and
out-of-lifecycle actions fail during preparation. Rich authored properties are preserved
or explicitly rejected.

### Canonical model

Separate four concerns:

1. **App notification intent:** content, semantic action IDs, thread/group information, privacy level.
2. **Notification policy:** delivery, interruption level, grouping, queueing, lockscreen/banner/center eligibility.
3. **Notification lifecycle:** scheduled, delivered, presented, dismissed, acted upon, expired.
4. **Platform presentation:** iOS/Android/device-profile visual projection.

### Canonical program and frame state

One immutable prepared program is authoritative. Runtime state is derived from that
program, device ID, and frame rather than accumulated by render order:

```ts
interface NotificationRuntimeState {
  records: Record<NotificationId, NotificationRecord>;
  orderedIds: readonly NotificationId[];
  centerOpen: boolean;
  centerOpenedAtFrame?: number;
}
```

Groups, visible surfaces, banners, lockscreen cards, status-bar badges, and audio cues are
projections. They are not separately mutated state.

### Actions

Notification action handling emits typed cross-capability intent:

```text
notification action
    -> navigation intent and/or app action
    -> owning capability reducer
```

Notification code does not set `foregroundAppId` directly. Preparation lowers action
effects into ordinary registered navigation and app events.

### Platform strategies

iOS and Android light/dark theme resolution is explicit and fail-loudly. One painter
consumes the resolved platform theme; there is no generic fallback renderer.

## Navigation and Transitions

### Current assessment

Navigation behavior exists in more than one reducer path and those paths do not fully agree. Renderer also participates in system-screen and transition decisions.

### Target ownership

Navigation owns:

- foreground app identity;
- app route requests at the device-system boundary;
- home/lock/unlock transitions;
- transition phase and progress;
- interruption policy;
- notification/call action routing into navigation intents.

Apps own their internal navigation state. Device navigation owns only the boundary between the OS and an app instance.

### Required deletion gate

The old core navigation handler and device reducer path cannot coexist indefinitely. Create behavior-parity tests, migrate all event producers, register the canonical reducer, then remove the old path in the same milestone.

## Calls

### Current assessment

Calls have more than one event path, and authored call metadata can be lost during lowering. Call surfaces overlap device state, renderer overlays, notifications, audio, and live activities.

### Target model

Calls are sessions:

```ts
interface CallSession {
  id: CallId;
  deviceId: DeviceId;
  appInstanceId?: AppInstanceId;
  direction: "incoming" | "outgoing";
  media: "audio" | "video";
  presentation: "fullScreen" | "banner" | "compact";
  participants: readonly CallParticipant[];
  lifecycle: CallLifecycle;
  metadata: Readonly<Record<string, unknown>>;
}
```

Calls own lifecycle. Audio owns playback/mix. Navigation owns app opening. Activities own compact system presentation. Renderer paints the selected call projection.

## System Activities and Dynamic Island

Dynamic Island is not a notification queue. It is one possible device-profile presentation for active system activities.

Activities may include:

- calls;
- music/playback;
- recording;
- navigation/location;
- timers;
- app live activities;
- transfers or background work.

An activity capability owns arbitration, priority, compact/minimal/expanded projection, and lifecycle. A device profile maps that projection to Dynamic Island, status-bar pill, heads-up chip, or no special surface.

## Device OS State

Device OS owns deterministic telemetry and OS modes:

- time display;
- battery and charging;
- network state;
- airplane mode;
- focus/DND mode;
- orientation;
- lock state if not assigned to navigation;
- screen recording indicator;
- permission/system prompts when supported.

The authoring contract and handler must agree field-for-field. A generic `SET_STATE` request must not lower into an event whose handler applies only time.

## Audio, Sound Effects, and Voice

### Current strengths

The audio implementation has a useful deterministic foundation: explicit buses, frame envelopes, policy state, and pure volume calculation.

### Current problems

- Audio behavior is embedded in core rather than registered as a capability.
- Similar mix calculations exist in more than one renderer path.
- Voice may enter through runtime audio state or a separate video-runner layer.
- Targeted voice stopping uses inconsistent field names.
- Runtime voice timing can assume 30 fps.

### Target ownership

- Voice generation is offline tooling that produces licensed/declared assets and timing metadata.
- Compiler turns voice schedules and sound effects into one `AudioProgram`.
- Audio capability owns cue lifecycle, buses, gains, ducking, fades, spatial parameters, and final audio projection.
- Renderer contains one audio painter.
- Video runner does not maintain an independent voice state machine.

### Required invariant

At a given frame, there is exactly one canonical audio projection. No host-level composition option may accidentally render a second voice or overlay path.

## Backgrounds and Story Overlays

### Current assessment

Background rendering is mostly deterministic and contains useful frame-based effects. Some declared configuration fields are not meaningfully implemented. Overlay state is stored under a magic app-state key even though it is not an app, and renderer types can duplicate package contracts. Overlay lifecycle cleanup is incomplete and the package currently lacks meaningful tests.

### Target ownership

- Scene/background owns prepared background assets and deterministic effects.
- Overlay owns story overlay records, intervals, placement, and projection.
- Overlay state is a first-class capability state, not `appState.sys_overlay`.
- Renderer imports canonical projection types.
- Configuration fields are implemented and tested or removed from the public contract.

## Frame Projection and Renderer

### Frame projection

Introduce a pure function outside React:

```ts
function projectFrame(
  prepared: PreparedEpisode,
  world: WorldState,
  frame: number,
  config: RenderConfig,
): FrameProjection;
```

Conceptually, `FrameProjection` includes:

```ts
interface FrameProjection {
  stage: StageProjection;
  outputs: readonly CameraOutputProjection[];
  devices: Record<DeviceId, DeviceProjection>;
  apps: Record<AppInstanceId, AppProjection>;
  overlays: readonly OverlayProjection[];
  audio: AudioProjection;
  diagnostics: readonly ProjectionDiagnostic[];
}
```

### Renderer responsibilities

Renderer may:

- map projection nodes to React components;
- apply already-resolved transforms and clipping;
- paint text, SVG, images, chrome, and app surfaces;
- instantiate Remotion audio/video nodes from prepared asset references;
- expose deterministic debug visualization.

Renderer may not:

- select the active device;
- inspect arbitrary app state to infer layout;
- invent conversations or preview content;
- implement notification policy;
- mutate world state;
- query live DOM geometry for camera or subjects;
- choose semantic fallback subjects;
- perform capability timing.

### Host composition

`EpisodeRenderer`, `CinematicStageRenderer`, and render-service composition must not each
independently decide whether to render audio, voice, backgrounds, or overlays. The prepared output
composition owns that decision once.

## Package and Dependency Rules

### Allowed direction

```text
contracts / IR
    <- authoring extensions
    <- capability compilers
    <- runtime capabilities
    <- projection
    <- UI painters
    <- composition roots
```

More concretely:

- IR depends on no compiler, runtime, React, or renderer package.
- DSL depends on IR and headless authoring contracts.
- Capability contracts depend only on stable headless contracts.
- Compiler depends on IR and capability compile contracts, never capability UI.
- Core depends on headless runtime contracts, never React or Remotion.
- Projection depends on headless state, prepared programs, and layout contracts.
- UI packages depend on projection and UI primitives.
- Episodes and video runner are composition roots and may import broad public surfaces.

### Enforced subpaths

Capability packages should expose narrow entry points:

```text
@tokovo/<capability>/contract
@tokovo/<capability>/authoring
@tokovo/<capability>/compile
@tokovo/<capability>/runtime
@tokovo/<capability>/projection
@tokovo/<capability>/ui
@tokovo/<capability>/plugin
```

Package exports and dependency linting must prevent importing `/ui` from compiler or core code.

### Composition roots

Only explicit composition roots assemble capabilities:

- episode/runtime plugin manifest;
- preview application;
- video runner;
- render service.

Registries must reject duplicate capability IDs, duplicate event ownership, missing declared dependencies, and incompatible versions.

## Determinism Contract

### Logical determinism

For each capability:

- sequential replay to frame `f` equals direct replay to frame `f`;
- rendering frames in ascending, descending, or random order yields identical projections;
- repeated preparation of identical canonical IR yields identical prepared data;
- cache enabled and cache disabled yield identical state and projection;
- capability registration order does not affect output unless order is explicitly part of the manifest contract;
- no reducer reads wall-clock time, random global state, browser layout, or live network data.

### Visual determinism

Logical equality and pixel equality are distinct gates.

#### Exact replay gate

Purpose: detect nondeterministic output.

- pin OS/container, browser, browser version, fonts, and rendering flags;
- render in separate cold processes or browser instances;
- use tolerance zero for decoded RGBA equality in the pinned environment;
- probe randomized frame order;
- include first frame, last frame, event boundaries, transition midpoints, and randomly selected quiet frames;
- compare projection hashes before comparing pixels;
- compare audio sample hashes or a canonical decoded representation.

#### Visual regression gate

Purpose: detect intentional or accidental design changes.

- store approved golden frames for representative fixtures;
- report changed-pixel percentage, perceptual difference, and bounding regions;
- require explicit approval for baseline updates;
- keep platform/profile/format goldens separate;
- never use perceptual tolerance as proof of determinism.

### Full-render enforcement

Critical showcase episodes should periodically receive:

- decoded per-frame hashes;
- final MP4 metadata validation;
- audio track presence and duration validation;
- black/blank-frame detection;
- asset-missing diagnostics;
- exact duration and fps checks.

## Test Architecture

### Capability contract suite

Every capability must run the same contract categories:

1. authoring fixture produces expected IR;
2. schema accepts supported input and rejects unsupported input;
3. lowering preserves every supported field;
4. prepared program contains normalized frame data;
5. reducer handles every registered event exactly once;
6. finalizer owns lifecycle expiry without core knowledge;
7. sequential and direct replay agree;
8. projection is pure and stable;
9. UI paints the projection in representative goldens;
10. missing registration fails loudly.

### Preservation table tests

For every authoring operation, maintain a table:

```text
authored field -> IR path -> prepared path -> runtime/projection effect -> assertion
```

If a field is compile-only, validation-only, or intentionally ignored for backward compatibility, that status must be explicit and temporary.

### Integration fixtures

Required fixtures include:

- one device, one app;
- one device, multiple apps;
- multiple devices with the same app;
- multiple devices with different profiles/platforms;
- camera focus changes without stage rearrangement;
- notification action opening a route;
- keyboard interruption and Unicode graphemes;
- call transition across full-screen and compact activity surfaces;
- simultaneous voice, effects, and ducking;
- direct frame access during every lifecycle boundary;
- missing subject and missing asset failures.

### No empty production suites

Production capability packages may not use `--passWithNoTests` as their normal test contract. A package with no tests fails its release gate.

## Performance Requirements

Performance optimizations must preserve the pure model.

### Compile time

- Index program intervals for efficient frame queries.
- Pre-resolve assets and profiles.
- Precompute stable text/layout inputs where practical.
- Bake trajectories when analytic evaluation is unsuitable.

### Replay

- Use immutable structural sharing or controlled draft mutation with deterministic output.
- Snapshot at explicit deterministic intervals.
- Measure direct-frame latency separately from sequential throughput.
- Avoid compatibility aliasing in hot reducer paths.

### Projection

- Cache by complete content hashes.
- Separate static app layout from frame-varying projections.
- Never use React hook history as a correctness cache.
- Benchmark long threads, media-heavy screens, grouped notifications, and multi-device scenes.

### Rendering

- Minimize DOM size for long conversations.
- Use deterministic image components and declared dimensions.
- Avoid CSS animation and transition timing.
- Track per-frame render time, memory high-water marks, and asset decode cost.

Performance gates should report percentile distributions and worst-case fixtures, not only happy-path averages.

## Accessibility, Localization, and Text Fidelity

Best-in-class app simulation includes behavior beyond visual resemblance.

### Required dimensions

- left-to-right and right-to-left layout;
- locale-aware dates, timestamps, plurals, and number formats;
- deterministic font selection and fallback;
- grapheme-aware text input;
- dynamic text scaling strategy where supported;
- contrast validation;
- accessible labels and semantic roles for interactive preview surfaces;
- reduced-motion projection where relevant;
- safe truncation and wrapping for translated strings.

These inputs belong in preparation and projection contracts. Renderer must not read machine locale or accessibility preferences implicitly.

## Observability and Diagnostics

Deterministic diagnostics are episode data products, not arbitrary console output.

Diagnostics should include:

- source location or builder path;
- device/app/capability identity;
- frame or interval;
- stable diagnostic code;
- severity;
- actionable remediation;
- legacy-adapter usage;
- fallback usage, if explicitly permitted in preview.

Operational timing may use wall-clock clocks outside the replay kernel. Such metrics cannot enter state, projection, cache keys, or rendered output.

## Legacy Removal Policy

### Do not mass-delete first

Legacy code may still carry hidden geometry, catalog compatibility, or public exports. Deletion begins only after canonical behavior exists and consumers are enumerated.

### Tombstone record

Each removal candidate receives:

| Field                 | Meaning                                        |
| --------------------- | ---------------------------------------------- |
| Legacy symbol/path    | Exact API or implementation                    |
| Canonical replacement | New owner and entry point                      |
| Consumers             | Source, tests, docs, and external/public usage |
| Compatibility adapter | Temporary translation path, if required        |
| Parity tests          | Behavior that must remain                      |
| Migration owner       | Responsible maintainer                         |
| Deadline              | Milestone where new usage becomes forbidden    |
| Deletion gate         | Objective conditions for removal               |

### Initial deletion candidates

These are candidates, not pre-authorized deletions:

- duplicate device and keyboard DSL builders;
- duplicate iOS keyboard implementation under devices;
- competing core/device navigation reducer;
- competing call event paths;
- unused renderer wrappers such as legacy device-frame surfaces;
- superseded device camera-physics fields after safe-area migration;
- notification alias event names and duplicate priority vocabularies;
- generic notification strategy fallback masquerading as platform behavior;
- notification state mirrors;
- `appState.sys_overlay` compatibility storage;
- renderer-local copies of capability types;
- second voice playback/ducking path;
- unused render/audio hooks and incomplete public helpers;
- configuration fields that have no implemented effect.

Before deletion, confirm source reachability, public exports, docs, episode catalogs, and downstream compatibility.

## Migration Plan

## Phase 0: Stop semantic loss

**Goal:** authored behavior cannot disappear silently.

- Add authoring-to-runtime preservation tests.
- Fail on unhandled IR operations.
- Fix OS notification and OS state lowering/handling.
- Preserve or reject all rich notification fields.
- Preserve or reject all call fields.
- Fix targeted voice-stop field naming.
- Pass actual fps through voice/audio preparation.
- Remove zero-test success from production capabilities.
- Add stable diagnostic codes for unsupported behavior.

**Exit criteria:** every released builder operation either produces an asserted effect or fails compilation.

## Phase 1: Architecture constitution and dependency enforcement

**Goal:** prevent new boundary violations.

- Adopt this document and focused ADRs.
- Define `/contract`, `/compile`, `/runtime`, `/projection`, `/ui`, and `/plugin` exports.
- Add dependency graph checks.
- Ban React/Remotion imports from core, IR, and compiler.
- Ban feature UI imports from headless capability code.
- Validate exact event ownership at registration.

**Exit criteria:** CI rejects new upward or circular capability dependencies.

## Phase 2: Canonical world and app instances

**Goal:** one state shape for all device/app cardinalities.

- Introduce canonical app instance IDs.
- Store every app state by app instance.
- Update reducer dispatch and selectors.
- Migrate projection helpers.
- Remove temporary singleton aliasing.
- Add same-app/multi-device replay fixtures.

**Exit criteria:** adding a second device does not change the state schema or reducer path of the first.

## Phase 3: Stage independent from camera

**Goal:** camera direction cannot rearrange scene composition.

- Introduce scene/stage contract and program.
- Move multi-device layout out of camera state.
- Define scene nodes and coordinate spaces.
- Project device transforms independently.
- Adapt camera to consume the stage projection.
- Add focus-without-reflow tests.

**Exit criteria:** identical stage hashes are produced for different shots at the same frame.

## Phase 4: Canonical device capabilities

**Goal:** one owner per OS behavior.

- Consolidate device metrics and safe areas.
- Consolidate navigation.
- Consolidate keyboard/input sessions.
- Consolidate notifications.
- Consolidate calls.
- Extract activities/Dynamic Island.
- Consolidate OS telemetry events.
- Migrate the episode catalog.
- Delete corresponding legacy paths.

**Exit criteria:** each device-system event kind is owned by exactly one registered capability.

## Phase 5: Pure projection and thin renderer

**Goal:** rendering becomes history-independent painting.

- Create `projectFrame` outside React.
- Move active-device, system-surface, transition, and presentation decisions into capability projections.
- Make app layout solvers pure.
- Unify solved layout and subject geometry.
- Remove generic app-state interpretation from renderer.
- Replace hook-history correctness caches with content-addressed projection caches.

**Exit criteria:** frame projection can be snapshot-tested in Node without React, DOM, or Remotion.

## Phase 6: Unified audio and overlay composition

**Goal:** one output path per nonvisual/overlay capability.

- Compile voice and sound into one audio program.
- Remove video-runner voice state and duplicate ducking.
- Move audio feature logic out of core into a capability.
- Make overlay state first-class.
- Resolve background and overlay assets during preparation.
- Ensure host composition cannot double-render layers.

**Exit criteria:** one canonical audio projection and one canonical overlay projection exist per frame.

## Phase 7: Pixel and product enforcement

**Goal:** determinism and visual quality are independently measurable.

- Set exact deterministic pixel tolerance to zero in pinned CI.
- Render cold independent probes.
- Randomize frame order.
- Add projection hashes and geometry assertions.
- Add approved visual goldens.
- Add long-thread and multi-device benchmarks.
- Add RTL, localization, accessibility, and profile matrices.
- Add full-video frame/audio checks for flagship episodes.

**Exit criteria:** CI distinguishes nondeterminism, semantic regression, visual change, and performance regression.

## Phase 8: Camera VNext

**Goal:** build cinematic direction on a stable scene and geometry spine.

- Implement the camera program, rigs, composer, tracking, modifiers, outputs, and automatic direction described in the camera companion document.
- Migrate episodes and cinematic helpers.
- Remove fake-app camera registration and old device camera physics.
- Validate multi-output and multi-device scenes.

**Exit criteria:** arbitrary-frame camera output is deterministic, subject-accurate, independent of stage layout, and visually approved.

## Release Gates for Engine VNext

A capability is not complete until all applicable gates pass.

### Contract gates

- One canonical authoring path.
- One canonical event namespace.
- One canonical state model.
- Exact event registration.
- Unsupported input fails loudly.
- No silent field loss.

### Runtime gates

- Direct and sequential replay equality.
- Random frame-order equality.
- Cache-on/cache-off equality.
- Cross-device isolation.
- Explicit lifecycle finalization.
- No feature-specific core branch.

### Projection gates

- Pure Node-testable projection.
- No DOM measurement.
- Layout and subjects from one solved result.
- No arbitrary app-state interpretation in renderer.
- Stable serialized projection hashes.

### Presentation gates

- Exact deterministic pixel probe.
- Approved visual goldens.
- Platform/profile coverage.
- Accessibility and localization coverage.
- Long-content performance coverage.

### Product gates

- Flagship episode demonstrates the capability.
- Documentation matches released behavior.
- Public helpers have complete semantics.
- Removal candidates are migrated or explicitly deferred.
- Asset licensing is recorded.

## Best-in-Class Definition

Tokovo is best-in-class when the following statements are true in practice, not merely in type declarations:

1. A creator expresses semantic intent once and never manually synchronizes app, keyboard, camera, notification, or audio state.
2. Unsupported behavior fails before rendering with a precise source location.
3. Rendering frame 9,000 directly is identical to reaching it sequentially.
4. A second device or app instance cannot contaminate the first.
5. Changing a camera shot cannot rearrange devices.
6. Subjects exactly match the geometry rendered on screen.
7. Notifications, calls, keyboard, and system activities behave consistently across supported device profiles.
8. Voice, effects, and ducking use one deterministic audio program.
9. Renderer components paint typed projections and contain no domain policy.
10. Exact determinism, visual design, performance, localization, and accessibility each have separate enforcement.
11. Flagship episodes can be revised quickly without discovering hidden cross-layer contracts.
12. Legacy paths are deleted after migration rather than preserved indefinitely.

## Explicit Anti-Patterns

New code must not introduce:

- `default: return []` for unknown authored operations;
- event routing via `includes`, prefix guessing, or substring matching;
- direct mutation of another capability's state;
- a second reducer for an existing event namespace;
- app semantics inside compiler/core/renderer generic code;
- camera-owned stage layout;
- DOM measurement as authoritative subject geometry;
- state shape that depends on number of instances;
- render-time wall-clock or unseeded random behavior;
- public options with no tested effect;
- fake platform strategies that always select generic behavior;
- independent voice/audio/overlay rendering paths in multiple hosts;
- React-hook cache history as a correctness dependency;
- permanent compatibility aliasing;
- `--passWithNoTests` for a production capability.

## Architecture Decision Records Required

This proposal should be split into focused accepted ADRs during implementation:

1. Capability package layers and dependency direction.
2. Canonical app-instance world state.
3. Stage/camera separation.
4. Pure frame-projection contract.
5. Device capability ownership.
6. Unified audio and voice program.
7. Determinism versus visual-regression enforcement.
8. Legacy tombstone and deletion policy.

Existing accepted decisions remain relevant:

- [ADR 0001: Runtime Contract](./adr/0001-runtime-contract.md)
- [ADR 0002: App Package Boundaries](./adr/0002-app-package-boundaries.md)

Engine VNext should make those rules mechanically enforceable rather than relying on convention.

## Audit Evidence Map

The following files are important starting points for implementation review. Paths identify ownership evidence, not necessarily defects in every line.

### Runtime and plugin boundaries

- [`packages/core/src/types/plugin-contract.ts`](../packages/core/src/types/plugin-contract.ts)
- [`packages/core/src/engine.ts`](../packages/core/src/engine.ts)
- [`packages/core/src/engine/built-in-handlers.ts`](../packages/core/src/engine/built-in-handlers.ts)
- [`packages/react/src/plugin/plugin.ts`](../packages/react/src/plugin/plugin.ts)
- [`packages/episodes/src/runtime/plugin-manifest.ts`](../packages/episodes/src/runtime/plugin-manifest.ts)

### Compiler and app state

- [`packages/compiler/src/v2/prepare.ts`](../packages/compiler/src/v2/prepare.ts)
- [`packages/compiler/src/v2/lowering.ts`](../packages/compiler/src/v2/lowering.ts)
- [`packages/ir/src/v2/episode-ir.ts`](../packages/ir/src/v2/episode-ir.ts)
- [`packages/dsl/src/v2/device-track.ts`](../packages/dsl/src/v2/device-track.ts)
- [`packages/dsl/src/v2/os-track.ts`](../packages/dsl/src/v2/os-track.ts)

### Keyboard

- [`packages/ir/src/v2/input-session.ts`](../packages/ir/src/v2/input-session.ts)
- [`packages/dsl/src/v2/episode.ts`](../packages/dsl/src/v2/episode.ts)
- [`packages/device-keyboard/src/compile/prepare.ts`](../packages/device-keyboard/src/compile/prepare.ts)
- [`packages/device-keyboard/src/runtime/evaluate.ts`](../packages/device-keyboard/src/runtime/evaluate.ts)
- [`packages/device-keyboard/src/projection/project.ts`](../packages/device-keyboard/src/projection/project.ts)
- [`packages/device-keyboard/src/ui/InputKeyboard.tsx`](../packages/device-keyboard/src/ui/InputKeyboard.tsx)
- [`packages/react/src/KeyboardAware.tsx`](../packages/react/src/KeyboardAware.tsx)

### Notifications

- [`packages/ir/src/v2/notification.ts`](../packages/ir/src/v2/notification.ts)
- [`packages/device-notifications/src/compile/prepare.ts`](../packages/device-notifications/src/compile/prepare.ts)
- [`packages/device-notifications/src/runtime/evaluate.ts`](../packages/device-notifications/src/runtime/evaluate.ts)
- [`packages/device-notifications/src/projection/project.ts`](../packages/device-notifications/src/projection/project.ts)
- [`packages/device-notifications/src/ui/NotificationSurface.tsx`](../packages/device-notifications/src/ui/NotificationSurface.tsx)

### Lock and home surfaces

- [`packages/devices/src/surfaces/contract.ts`](../packages/devices/src/surfaces/contract.ts)
- [`packages/devices/src/surfaces/project.ts`](../packages/devices/src/surfaces/project.ts)
- [`packages/devices/src/surfaces/theme.ts`](../packages/devices/src/surfaces/theme.ts)
- [`packages/devices/src/surfaces/ui/SystemSurface.tsx`](../packages/devices/src/surfaces/ui/SystemSurface.tsx)

### Devices, navigation, and calls

- [`packages/devices/src/types.ts`](../packages/devices/src/types.ts)
- [`packages/devices/src/reducer.ts`](../packages/devices/src/reducer.ts)
- [`packages/core/src/engine/handlers/navigation.ts`](../packages/core/src/engine/handlers/navigation.ts)
- [`packages/core/src/engine/handlers/call.ts`](../packages/core/src/engine/handlers/call.ts)

### Renderer, layout, camera, and stage

- [`packages/renderer/src/TokovoRenderer.tsx`](../packages/renderer/src/TokovoRenderer.tsx)
- [`packages/renderer/src/CinematicStageRenderer.tsx`](../packages/renderer/src/CinematicStageRenderer.tsx)
- [`packages/renderer/src/engines/useLayoutEngine.ts`](../packages/renderer/src/engines/useLayoutEngine.ts)
- [`packages/camera/src/program.ts`](../packages/camera/src/program.ts)
- [`packages/camera/src/evaluate.ts`](../packages/camera/src/evaluate.ts)
- [`packages/stage/src/evaluate.ts`](../packages/stage/src/evaluate.ts)

### Audio, voice, backgrounds, and overlays

- [`packages/core/src/audio`](../packages/core/src/audio)
- [`packages/core/src/engine/handlers/voice.ts`](../packages/core/src/engine/handlers/voice.ts)
- [`packages/core/src/types/runtime-event.ts`](../packages/core/src/types/runtime-event.ts)
- [`packages/renderer/src/AudioLayer.tsx`](../packages/renderer/src/AudioLayer.tsx)
- [`packages/renderer/src/engines/useAudioEngine.ts`](../packages/renderer/src/engines/useAudioEngine.ts)
- [`packages/overlay`](../packages/overlay)
- [`packages/background`](../packages/background)
- [`apps/video-runner/src/EpisodeRenderer.tsx`](../apps/video-runner/src/EpisodeRenderer.tsx)

### Existing architecture and enforcement

- [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)
- [`docs/V1_STABILITY.md`](./V1_STABILITY.md)
- [`scripts/check-render-determinism.mjs`](../scripts/check-render-determinism.mjs)
- [`apps/video-runner/scripts/assert-render-determinism.mjs`](../apps/video-runner/scripts/assert-render-determinism.mjs)

## Audit Validation Snapshot

At the time of the audit:

- the episode validator accepted 52 episode definitions;
- focused keyboard tests passed with 5 tests;
- focused notification tests passed with 4 tests;
- focused devices tests passed with 4 tests;
- overlay tests reported no tests while exiting successfully;
- the static render-determinism check passed across its configured production-source scope.

These results are useful but do not prove end-to-end semantic preservation, exact pixel equality, random-access equivalence, or system ownership. The migration plan adds those missing guarantees.

## Open Decisions

Implementation owners must resolve these questions explicitly:

1. Whether capability layers remain subpaths initially or become separate workspace packages immediately.
2. Whether navigation and lock state are one capability or two cooperating capabilities.
3. Whether text measurement is compiled, deterministically emulated, or provided through a pinned projection service.
4. Whether prepared camera trajectories are analytic, baked, or hybrid.
5. Which device profiles are product-supported versus showcase-only.
6. How public compatibility is versioned when superseded event names are removed.
7. Which additional flagship episodes are mandatory golden and full-render fixtures.

These choices may affect implementation shape but may not violate the non-negotiable invariants.

## Immediate Next Actions

The first implementation milestone should remain deliberately unglamorous:

1. Create a machine-readable authored-field preservation matrix.
2. Add failing tests demonstrating the confirmed silent-loss cases.
3. Replace silent lowering defaults with explicit errors.
4. Fix voice stop targeting and fps propagation.
5. Introduce capability ownership metadata and exact event-kind validation.
6. Create the legacy tombstone inventory before deleting files.
7. Draft ADRs for canonical app instances and stage/camera separation.

Only after these protections exist should broad system migration begin. This prevents the cleanup from replacing visible legacy behavior with differently incomplete behavior.

## Final Standard

Tokovo should feel less like a collection of convincing simulated screens and more like a deterministic cinematic operating system:

- authors describe narrative intent;
- apps own app truth;
- device capabilities own system truth;
- the compiler resolves ambiguity;
- the replay kernel applies registered state transitions;
- projection solves the complete frame;
- camera observes a stable scene;
- renderer paints without improvising;
- enforcement proves both repeatability and quality.

That architecture is sufficient for deep WhatsApp storytelling, multi-app and multi-device episodes, cinematic camera direction, reliable render-service execution, and future creator tooling without forcing every new feature to understand the entire engine.
