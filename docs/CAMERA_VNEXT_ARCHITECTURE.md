# Camera VNext Architecture

Status: Accepted; hard-cut implementation in progress
Audience: engine, compiler, renderer, app-plugin, episode-authoring, and tooling maintainers
Scope: deterministic 2D cinematography across one or more simulated devices
Supersedes: the current effect-oriented camera architecture and docs/CAMERA_V1_REFERENCE.md at the
hard cutover
Implementation plan: docs/CAMERA_VNEXT_IMPLEMENTATION_PLAN.md

## Executive Summary

Tokovo needs a camera system built around complete shots, virtual camera rigs, deterministic
screen-space composition, explicit blends, and independent render outputs.

The current implementation is an effect accumulator. Episode instructions such as focus, zoom,
track, reset, and shake become effects that are replayed and combined into a CSS transform on one
active device. That implementation is deterministic, but its central abstraction is too weak for
cinematic direction:

- camera targeting and multi-device layout are coupled
- completed effects persist temporarily and are then removed by cleanup timing
- focus changes transform origin instead of solving an intentional screen-space composition
- transitions are accumulated effect arithmetic rather than pose-to-pose blends
- app anchor geometry can diverge from the geometry rendered by React
- core camera transform state and the renderer's calculated transform are separate sources of truth
- only one device is camera-driven in multi-device layouts
- several public camera operations are incomplete, ignored, or visually inert
- automatic direction emits raw effects rather than an authored and inspectable shot program

Camera VNext replaces that model with:

1. a deterministic 2D scene graph
2. world-space projection of app and device anchors
3. virtual camera rigs that describe possible compositions
4. explicit shot clips on named output tracks
5. one camera brain per output
6. a pure composer that produces a complete CameraPose2D for any frame
7. explicit pose-to-pose cuts and blends
8. post-pose modifiers for shake, impulse, tilt, blur, and flash
9. compile-time validation and render-time diagnostics
10. pixel-level tests that prove anchor geometry, transitions, and replay determinism
11. independently replaceable CameraPlans over an unchanged story and stage
12. ordered renderer projection passes for real non-linear lens treatments

This is not a literal Unity or Cinemachine port. Tokovo is a deterministic offline 2D engine and
should borrow the useful abstractions while exploiting information unavailable to a real-time game
camera: the complete episode, future anchor trajectories, exact frame timing, and pre-render
validation.

## Decision

Camera VNext will use shots and complete poses as its primary model.

Raw persistent camera effects will not be the primary state model. Layout will not be mutated by
camera targeting. Semantic anchors will remain first-class, but they will be projected through a
shared scene graph and must derive from the same solved geometry used to render the UI.

The existing camera system will receive no new features. Repository episodes migrate directly to
CameraPlan authoring and the old implementation is then deleted. No adapter, compatibility
compiler, dual runtime, or deprecated export layer will ship.

## Why This Document Exists

Tokovo already has useful camera-related infrastructure, but the behavior is spread across:

- packages/dsl
- packages/ir
- packages/compiler
- packages/core
- packages/device-camera
- packages/renderer
- app layout and anchor providers
- app camera behavior mappings
- video-runner and render-service

Individual files often describe themselves as production-grade, but the end-to-end contract is not
coherent. This RFC establishes one model and one source of truth for each responsibility.

## Goals

Camera VNext must:

- produce the same camera pose and pixels for the same prepared episode, render configuration, and
  frame
- support random-access frame evaluation without depending on evaluation order
- frame semantic app, device, and system targets intentionally
- support one device, multiple devices, split screen, picture-in-picture, and future arbitrary stage
  layouts
- support independent camera outputs
- express establishing shots, close-ups, tracking shots, group framing, cuts, blends, and modifiers
- keep episode authoring readable and stable
- validate missing anchors, invalid shot overlaps, impossible framing, and conflicting output intent
- let the renderer consume a complete camera pose instead of recreating camera semantics
- let automatic direction create a visible, editable, deterministic shot program
- make rendered geometry and anchor geometry agree at pixel level
- provide a direct repository migration sequence for existing episodes without a compatibility API
- remove obsolete camera state, event types, processors, registries, and tooling

## Non-Goals

Camera VNext will not:

- simulate a physical 3D lens, depth of field, or perspective camera in its first version
- depend on DOM measurement during rendering
- use wall-clock time, requestAnimationFrame, mutable React refs, or frame-order-dependent smoothing
- infer app semantics inside the compiler or renderer
- silently repair invalid episode direction
- preserve every current camera helper indefinitely
- treat visual effects as persistent camera state
- rearrange the multi-device stage merely because a camera targets a different device
- reproduce all Cinemachine APIs or terminology

## Non-Negotiable Invariants

### Deterministic random access

Evaluating frame 420 directly must produce the same result as evaluating frames 0 through 420 in
order.

### One authority per concern

- Stage layout owns scene-node placement.
- App and device packages own semantic geometry.
- The camera program owns shot selection.
- The composer owns base camera poses.
- The blend evaluator owns transitions between poses.
- Modifiers own transient visual movement.
- The renderer applies the final pose and does not reinterpret camera intent.

### No live geometry reads

Production rendering must not use getBoundingClientRect, ResizeObserver, browser layout reads, or
React mount order as camera inputs.

### Explicit registration

Missing app anchor schemas, geometry providers, camera outputs, rigs, or modifier implementations
must fail preparation or rendering according to an explicit policy.

### No hidden fallback

An unresolved hero-shot anchor must not silently become an app-sized or device-sized rectangle.

### Camera does not own stage layout

Changing the selected camera, subject, rig, or shot must not change primaryDeviceId,
secondaryDeviceId, PIP placement, or stage-node ordering.

### A shot has a complete pose

A shot is not the sum of every focus, zoom, and pan that happened before it.

## Terminology

### Stage

The complete visual world being filmed: background, devices, overlays, and other renderable nodes.

### Scene node

A deterministically positioned item in the stage hierarchy. A device, device screen, overlay, or
background may be a scene node.

### Anchor

A semantic rectangle or point attached to a scene node, such as a message, composer, notification,
device screen, or group of targets.

### Rig

A reusable virtual camera configuration describing a possible shot: subject, composition rules,
tracking behavior, constraints, and modifiers.

### Shot

A frame interval that activates a rig on an output. A shot owns its transition and hold behavior.

### Camera brain

The deterministic evaluator that selects the active shot for an output and produces its base and
blended pose.

### Composer

The pure geometry solver that maps one or more world-space subjects into a desired screen-space
composition.

### Pose

The complete camera result for one output and one frame.

### Modifier

A deterministic transformation or visual effect applied after the base shot and blend are solved.

### Output

A camera-controlled render destination such as main, split.left, split.right, or pip.

### Camera program

The validated, compiled rigs, shots, blends, outputs, and modifier references used by the renderer.

## Current Architecture

The current flow is approximately:

```text
episode camera DSL
  -> camera TrackEvent IR
  -> camera lowering
  -> runtime CAMERA event
  -> camera reducer
  -> world.camera.activeEffects
  -> app/device anchor provider
  -> processActiveEffects
  -> CameraTransform
  -> CSS transform on one TokovoRenderer
```

The multi-device renderer separately positions devices and enables camera processing only for
world.camera.activeDeviceId.

## Current Failure Catalogue

This section records known architectural failures so they are not accidentally reproduced.

### Split camera state

Core stores CameraTransform, transform, and deviceTransforms. During finalization, deviceTransforms
are reset to the default transform and transform is selected from those identity values.

The renderer separately reads activeEffects and calculates the transform it actually renders.

Consequences:

- world.camera.transform is not a trustworthy representation of the rendered camera
- tests can validate state without validating output
- consumers can read a camera transform that is always identity
- two models must be maintained without a defined owner

Relevant files:

- packages/core/src/types/camera.ts
- packages/core/src/engine.ts
- packages/renderer/src/engines/useCameraEngine.ts

### Effect cleanup controls shot lifetime

The effect processor treats zoom, focus, pan, dolly, Ken Burns, and track as persistent after their
end frame. Core later deletes effects after endFrame plus effectCleanupBuffer.

Consequences:

- a completed focus holds only until cleanup removes it
- a shot can snap to identity without an authored transition
- shot lifetime changes when a runtime cleanup setting changes
- reset effects can end while older persistent effects still exist, allowing previous framing to
  reappear temporarily
- a lifecycle policy intended for memory cleanup becomes visible cinematography

Relevant files:

- packages/device-camera/src/processors/index.ts
- packages/core/src/engine.ts
- packages/core/src/config/index.ts

### Focus is not composition

Focus resolves an anchor center, changes transform origin, and chooses a scale. It does not solve
translation to place the subject at an authored screen position.

Consequences:

- a bottom message remains near the bottom of the output
- close-ups have no consistent visual grammar
- safe areas and captions cannot participate correctly
- two anchors with the same size but different locations produce unrelated-looking framing
- scale and placement cannot be reasoned about independently

### Scale cannot reliably relax

Zoom, focus, and track compose scale using the maximum current and requested delta.

Consequences:

- a tighter earlier focus can prevent a later looser focus
- the author cannot reliably return from close-up to medium framing
- effect declaration order influences composition

### Focus transitions restart from center

A new focus interpolates origin from 0.5, 0.5 rather than from the outgoing solved pose.

Consequences:

- a new shot may snap toward center at activation
- overlapping focus effects do not form a continuous transition
- changing the old effect cleanup window can change the apparent transition

### Tracking is not a stateful operator or a compiled trajectory

Track starts from a recomputed transform and uses elapsed-frame response math. It does not consume a
previous solved pose, and it does not use a precompiled subject trajectory.

Consequences:

- smoothing semantics are difficult to predict
- dead zones are applied to transform origin rather than a true screen-space subject position
- predictive behavior has limited knowledge of future anchor movement
- multiple tracking effects can accumulate

### Layout and camera targeting are coupled

A targeted camera event can set activeDeviceId and mutate layout.primaryDeviceId.

Consequences:

- targeting the secondary device can promote it to primary
- PIP can duplicate a device in both roles
- camera direction changes scene staging
- authors need layout workarounds to direct multi-device shots

Relevant file:

- packages/device-camera/src/reducer/index.ts

### One effective camera in multi-device scenes

MultiDeviceRenderer disables camera processing for every device except activeDeviceId.

Consequences:

- split outputs cannot have independent framing
- a PIP cannot track internally while the main output maintains its own shot
- the system cannot express a stage-wide move across devices
- output ownership is encoded as a boolean rather than an explicit camera channel

Relevant file:

- packages/renderer/src/MultiDeviceRenderer.tsx

### The camera lives inside a device renderer

Camera CSS is applied inside TokovoRenderer, while multi-device placement is performed outside it.

Consequences:

- the camera cannot naturally observe the complete stage
- local device coordinates and composition coordinates are conflated
- zooming across two devices requires layout manipulation instead of camera movement
- device chrome, app surfaces, and system overlays do not have an explicit scene hierarchy

### Anchor and rendered geometry can diverge

App anchor providers can consume analytical LayoutState geometry while React components independently
lay out the visible UI.

Consequences:

- typography changes can move the rendered component without moving the anchor
- media aspect ratios can differ
- localization and RTL can invalidate calculated rectangles
- anchor tests can pass while the camera visibly misses
- component padding and layout-token changes require synchronized duplicate updates

WhatsApp currently demonstrates this risk through:

- packages/apps-whatsapp/src/layout/chat.ts
- packages/apps-whatsapp/src/anchors/provider.ts
- packages/apps-whatsapp/src/components/MessageList.tsx
- packages/apps-whatsapp/src/components/screens/ChatScreen.tsx

### Anchor fallbacks hide invalid direction

The resolver can fall back from a missing semantic target to broader app or device rectangles and
ultimately to a hardcoded rectangle.

Consequences:

- invalid hero shots can render successfully
- typos can become bland wide shots rather than errors
- app packages can appear camera-ready without complete semantic geometry
- production regressions are difficult to detect

### Framing options are not consistently honored

Focus padding is present in DSL and IR contracts but is not preserved through the full runtime
pipeline. AnchorFraming.paddingPx does not affect the fill-scale calculation.

Consequences:

- the authoring API promises control that is not rendered
- app framing metadata is misleading
- tests validate object creation instead of visual results

### Lowering and runtime contracts drift

The IR uses uppercase event names and one easing vocabulary. Camera lowering emits generic
lowercase strings and device-camera defines another easing vocabulary. Several boundaries use
unknown casts.

Consequences:

- missing cases can compile
- public types do not describe runtime reality
- plugin registration does not fully decouple the compiler from device-camera
- invalid values silently fall back

### Public helpers include incomplete behavior

Known examples include:

- set lowers to CUT and its x, y, scale, rotation, and origin values are ignored
- animated rotation is authored but not preserved by lowering
- focus padding is dropped
- flash produces no rendered flash
- whip-pan blur is stored but not rendered
- dolly and Ken Burns processors do not have a coherent normal DSL path
- pan normally lowers through a zoom-shaped event despite a separate PanEffect implementation

These helpers must not be carried into VNext merely for API symmetry.

### Automatic direction is effect-oriented

CameraDirectorPlugin categorizes hardcoded app event strings and maps them into behavior names such as
fluid-tennis. The director emits raw focus, shake, reset, zoom, and animate effects.

Consequences:

- app semantics leak into compiler code
- multi-device source identity is incomplete
- priorities sort same-time effects but do not arbitrate complete shot candidates
- the result is difficult to inspect as a sequence of shots
- global pacing and future events cannot be evaluated coherently

### Multiple behavior registries overlap

Core defines app camera intent mappings. App packages publish camera behavior maps. Device-camera
contains another BehaviorRegistry. The compiler director uses its own hardcoded event categories.

Consequences:

- registration does not imply consumption
- there is no single source for automatic direction semantics
- app behavior data and compiler behavior logic can disagree

### Current tests validate mechanics, not cinematography

The camera package has broad reducer and processor unit tests, but important integration guarantees
are missing:

- a target-device focus must not change stage layout roles
- a resolved anchor must match the rendered component bounds
- one shot must hold until another shot replaces it
- a reset must not reveal an older focus
- a looser next shot must zoom out
- PIP and main outputs must have independent camera state
- a blend must be continuous at both boundaries
- unresolved hero anchors must fail
- final pixels must remain stable across repeated renders

## Target System Overview

```text
Episode DSL
  -> Camera IR
  -> Camera compiler
  -> validated CameraProgram
                           Scene layout
                               |
                               v
WorldState at frame t -> SceneGraph at frame t
                               |
                               v
                    World-space AnchorTree
                               |
CameraProgram + frame t ------> CameraBrain per output
                               |
                               v
                         base shot pose
                               |
                               v
                           shot blend
                               |
                               v
                           modifiers
                               |
                               v
                       final CameraPose2D
                               |
                               v
                        renderer matrix
```

## Ownership and Package Boundaries

The final package naming remains a release decision, but the recommended ownership is:

### packages/ir

Owns serializable camera authoring and compiled-program contracts:

- CameraOutputDefinitionIR
- CameraRigDefinitionIR
- CameraShotClipIR
- CameraBlendIR
- CameraModifierIR
- CameraProgramIR

IR must not import React, Remotion, app packages, or browser APIs.

### packages/dsl

Owns ergonomic builders that produce camera IR:

- output definitions
- rig definitions
- shot clips
- cuts and blends
- modifier references

### packages/compiler

Owns orchestration:

- resolves and validates rig and output references
- validates shot intervals
- invokes app semantic-direction adapters
- builds interval indexes
- compiles automatic shot candidates into a camera program
- emits diagnostics and a camera-program manifest

Compiler must not hardcode WhatsApp, Instagram, X, LinkedIn, Teams, Snapchat, or iMessage event names.

### packages/core

Owns only headless shared primitives needed by replay and scene evaluation:

- Matrix2D and Rect contracts
- scene-node identity
- stage-layout state
- anchor schema and geometry contracts
- deterministic evaluator interfaces

Core should not own a mutable rendered CameraTransform.

### packages/camera or packages/device-camera

Recommended final name: packages/camera and package name @tokovo/camera.

Owns:

- scene-anchor projection
- rig resolution
- composer math
- camera brain
- pose blending
- deterministic tracking evaluators
- modifier implementations that do not require React
- diagnostics

It must stay headless.

### packages/renderer

Owns:

- construction of renderable scene nodes from prepared state
- application of final camera matrices to output roots
- visual debug guides
- visual-only modifier surfaces such as flash or blur, driven by evaluated modifier output

Renderer must not select shots, resolve fallback policy, or combine arbitrary camera effects.

### App packages

Own:

- typed anchor schema
- deterministic solved layout
- semantic event classification for automatic direction
- anchor groups
- anchor visibility and lifecycle metadata
- UI rendering from the solved layout or shared layout primitives

App packages must not prescribe global shot timing or camera effects.

### Device and system packages

Own deterministic geometry for:

- screen
- safe areas
- device body
- status bar
- Dynamic Island
- keyboard
- notifications
- lockscreen
- call surfaces

### Episodes

Own:

- intentional stage layout
- explicit hero shots
- output selection
- story-specific blends and modifiers
- opt-in automatic direction style
- explicit fallback policy when a target is intentionally optional

## Deterministic Scene Graph

### Scene node contract

```ts
export type SceneNodeId = string;

export interface Matrix2D {
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
}

export interface SceneNode {
  id: SceneNodeId;
  parentId?: SceneNodeId;
  localTransform: Matrix2D;
  localBounds: Rect;
  visible: boolean;
  zIndex: number;
  clip?: Rect;
  tags?: readonly string[];
}

export interface SceneGraph {
  rootId: SceneNodeId;
  nodes: ReadonlyMap<SceneNodeId, SceneNode>;
}
```

### Required coordinate spaces

The engine must name coordinate spaces rather than passing unlabelled rectangles:

- app logical space
- device-screen physical space
- device-body local space
- stage/world space
- output/screen space

Public contracts should make accidental mixing difficult.

```ts
export interface RectIn<Space extends string> extends Rect {
  readonly space: Space;
}
```

Branded coordinate types may be used if they remain practical for plugin authors.

### Transform chain

For an app anchor:

```text
app logical rect
  -> app-surface scale
  -> device-screen rect
  -> device-body transform
  -> stage/world rect
  -> camera view transform
  -> output/screen rect
```

Every transform must be deterministic data. No production stage may depend on the browser measuring
the result.

### Scene graph outputs

At minimum, the stage builder should expose nodes for:

- stage.root
- background
- device:{deviceId}
- device:{deviceId}:screen
- device:{deviceId}:chrome
- device:{deviceId}:keyboard
- device:{deviceId}:notifications
- output overlays when they participate in safe-area constraints

An app anchor attaches to the screen or app-surface node, not directly to the stage root.

## Unified Geometry and Anchor Contract

### One solved geometry source

An app's layout system must produce a solved result used by both UI rendering and anchor export.

```ts
export interface SolvedAppLayout<RenderNode, AnchorId extends string> {
  renderTree: RenderNode;
  anchors: ReadonlyMap<AnchorId, LocalAnchor>;
  contentBounds: Rect;
  version: number;
}
```

Acceptable implementation patterns include:

- rendering components from explicit solved rectangles
- using shared deterministic layout primitives that emit both render styles and anchor rectangles
- rendering from a structured layout tree

Unacceptable patterns include:

- calculating anchor geometry in one system while flexbox independently decides visible geometry
- measuring the DOM during rendering
- maintaining duplicate constants without a single token source

### Typed app anchor schema

Each app plugin should register a typed schema.

```ts
export interface AnchorSchema<AnchorId extends string> {
  appId: string;
  version: number;
  ids: readonly AnchorId[];
  groups?: Readonly<Record<string, readonly AnchorId[]>>;
}
```

Stable entity anchors should use structured references rather than ambiguous global strings.

```ts
export type AnchorRef =
  | {
      kind: "semantic";
      deviceId: string;
      appId: string;
      anchorId: string;
    }
  | {
      kind: "entity";
      deviceId: string;
      appId: string;
      entityType: string;
      entityId: string;
      region?: string;
    }
  | {
      kind: "device";
      deviceId: string;
      anchorId: string;
    }
  | {
      kind: "group";
      members: readonly AnchorRef[];
    };
```

Examples:

- semantic composer region
- message entity by stable message ID
- device notification banner
- group containing both devices

### Resolved anchor

```ts
export interface ResolvedAnchor {
  ref: AnchorRef;
  localRect: Rect;
  worldRect: Rect;
  nodeId: SceneNodeId;
  visible: boolean;
  clippedWorldRect?: Rect;
  sourceVersion: number;
}
```

### Anchor lifecycle

The provider must define whether an anchor:

- exists before the entity becomes visible
- becomes valid on an exact frame
- remains valid while exiting
- disappears immediately
- can be tracked while clipped

The camera program must not guess.

### Missing-anchor policy

Every shot chooses or inherits one of:

```ts
export type MissingAnchorPolicy =
  | { type: "error" }
  | { type: "hold-last-valid"; maxFrames: number }
  | { type: "use-explicit"; fallback: AnchorRef }
  | { type: "skip-shot" };
```

Defaults:

- explicit authored hero shot: error
- automatic optional coverage: skip-shot
- moving transient UI within an already active shot: hold-last-valid with a bounded frame count

Broad implicit fallback chains are prohibited.

### Framing metadata

App packages may provide semantic defaults, but those defaults must use real composer fields:

```ts
export interface AnchorFramingHint {
  preferredScreenPosition?: readonly [number, number];
  preferredFill?: number;
  minimumPaddingPx?: number;
  emphasis?: "low" | "normal" | "hero";
  aspectBias?: "width" | "height" | "balanced";
}
```

Hints do not override episode or rig direction.

## Virtual Camera Rigs

### Rig contract

```ts
export interface CameraRigDefinition {
  id: string;
  outputId: string;
  subject: AnchorRef;
  composer: Composer2DDefinition;
  tracking?: TrackingDefinition;
  constraints?: readonly CameraConstraintDefinition[];
  modifiers?: readonly ModifierBinding[];
  metadata?: {
    purpose?: string;
    tags?: readonly string[];
  };
}
```

Rigs are reusable and immutable after preparation.

### Rig categories

Tokovo should ship a small curated set of compositional patterns, not dozens of effect presets:

- stage establishing
- single-device full
- two-device group
- app-surface medium
- semantic close-up
- notification interrupt
- composer detail
- media reveal
- device reaction

These are defaults, not hardcoded app logic.

### No mood names without geometry

Names such as cinematic, dramatic, calm, energetic, and documentary are too ambiguous as primary
camera contracts. A style may choose concrete rig and blend parameters, but the resulting camera
program must contain explicit geometry and timing.

## Camera Outputs

### Output definition

```ts
export interface CameraOutputDefinition {
  id: string;
  viewport: Rect;
  safeArea: Insets;
  clip: boolean;
  background?: string;
  parentOutputId?: string;
}
```

Initial standard outputs:

- main
- split.left
- split.right
- pip

### Output independence

Each output has:

- its own shot track
- its own active rig
- its own blend
- its own final pose
- its own modifier evaluation

Stage nodes can be visible in more than one output without sharing camera state.

### Nested outputs

PIP may be modeled as either:

1. a stage node containing a separately rendered output, or
2. a normal stage node showing a device while the main output camera frames it

The episode must choose the intended behavior. PIP targeting must never implicitly promote a device
to the primary stage role.

## Shot Clips and Camera Program

### Shot clip

```ts
export interface CameraShotClip {
  id: string;
  outputId: string;
  startFrame: number;
  endFrame: number;
  rigId: string;
  priority: number;
  blendIn?: CameraBlendDefinition;
  missingAnchorPolicy?: MissingAnchorPolicy;
  activation?: ShotActivationRule;
  source: "authored" | "automatic";
}
```

### Interval semantics

- startFrame is inclusive
- endFrame is exclusive
- a shot remains active for the complete interval
- a shot does not depend on cleanup buffers
- gaps use an explicit output default or are validation errors
- overlaps require deterministic priority or an explicit blend relationship

### Camera program

```ts
export interface CameraProgram {
  version: number;
  outputs: readonly CameraOutputDefinition[];
  rigs: readonly CameraRigDefinition[];
  shotsByOutput: Readonly<Record<string, readonly CameraShotClip[]>>;
  modifiers: readonly CameraModifierDefinition[];
  diagnostics: readonly CameraCompileDiagnostic[];
}
```

Serialized program contracts use sorted arrays and records, not Maps. Preparation may build private
in-memory maps and interval indexes. The prepared episode owns the program; it is never reconstructed
from runtime effects during rendering.

### Shot selection

The camera brain selects the active shot using:

1. output ID
2. frame interval
3. activation validity
4. explicit priority
5. stable declaration order as the final tie-breaker

Ambiguous equal-priority overlaps should fail compilation unless explicitly permitted.

## Camera Pose

### Pose contract

```ts
export interface CameraPose2D {
  outputId: string;
  centerX: number;
  centerY: number;
  scale: number;
  rotationDeg: number;
  opacity: number;
  clipRect: Rect;
}
```

Optional evaluated metadata may include:

- activeShotId
- activeRigId
- resolved subjects
- basePose
- blendedPose
- modifier deltas
- constraint diagnostics

The metadata must not alter output.

### Pose authority

The final pose is the only camera transform the renderer consumes.

Core will not maintain an unrelated CameraTransform. The renderer will not replay active effects.

## Composer2D

### Composer definition

```ts
export interface Composer2DDefinition {
  screenPosition: readonly [number, number];
  targetFill: number;
  fillMode: "contain" | "cover" | "width" | "height";
  paddingPx?: number;
  minScale?: number;
  maxScale?: number;
  deadZone?: readonly [number, number];
  softZone?: readonly [number, number];
  hardZone?: readonly [number, number];
  safeArea?: string;
  bias?: readonly [number, number];
}
```

### Coordinate convention

- screenPosition uses normalized output coordinates
- 0, 0 is top-left
- 1, 1 is bottom-right
- camera center and subject rectangles are expressed in stage/world pixels
- output viewport and safe areas are expressed in output pixels
- scale is positive and finite
- rotation is clockwise degrees unless the matrix contract defines otherwise

### Base scale calculation

Given:

- subject world rectangle S
- output safe rectangle O
- requested targetFill F
- padding P

The padded subject is expanded by P before scale calculation.

For contain mode:

```text
availableWidth  = O.width  * F
availableHeight = O.height * F

scaleX = availableWidth  / paddedSubject.width
scaleY = availableHeight / paddedSubject.height

scale = min(scaleX, scaleY)
```

For cover mode, use max. Width and height modes use the respective axis.

The result is clamped to minScale and maxScale. Clamping must produce a diagnostic when it prevents
the requested framing.

### Base center calculation

Let:

- C be the subject center in world space
- Q be the desired screenPosition converted into output pixels
- V be the output viewport center
- Z be the solved scale

Then:

```text
cameraCenterX = C.x - (Q.x - V.x) / Z
cameraCenterY = C.y - (Q.y - V.y) / Z
```

This explicitly places the subject at the desired screen position. Transform origin is not part of
the authoring model.

### Group framing

For multiple subjects, the composer builds a world-space union or weighted group bounds.

```ts
export interface CameraTargetGroup {
  members: readonly {
    ref: AnchorRef;
    weight?: number;
    radiusPx?: number;
  }[];
  mode: "bounds" | "weighted-center";
}
```

Group framing supports:

- two-device establishing shots
- message plus reply composer
- notification plus originating device
- speaker and reaction surface

### Safe areas

Named safe areas may include:

- vertical-social
- subtitle-safe
- title-safe
- platform-controls-safe
- custom episode safe area

Safe-area definitions are output data and must be included in the prepared render configuration.

### Constraints

Initial constraints:

- finite pose
- min and max scale
- stage bounds
- output safe area
- maximum rotation
- maximum translation velocity
- maximum scale velocity
- optional horizon lock

Constraint order must be fixed and documented.

## Tracking and Deterministic Damping

### Tracking modes

```ts
export type TrackingDefinition =
  | { mode: "static" }
  | {
      mode: "damped";
      positionFrames: number;
      scaleFrames: number;
      deadZone?: readonly [number, number];
    }
  | {
      mode: "predictive";
      positionFrames: number;
      scaleFrames: number;
      lookaheadFrames: number;
      maxVelocityPxPerSecond: number;
    };
```

### No mutable previous-frame dependency

Two valid deterministic strategies exist:

#### Analytic evaluation

Calculate the damped response as a closed-form function of:

- shot activation frame
- frame being rendered
- starting pose captured at the shot boundary
- target trajectory
- damping parameters

#### Compile-time baking

Evaluate camera poses sequentially during preparation and store a compact per-frame pose track or
piecewise curve. Rendering then samples the prepared curve randomly.

Recommended default:

- analytic evaluation for static targets and simple rig transitions
- compile-time baked curves for moving anchors, predictive tracking, and automatic direction

### Future-aware tracking

Because Tokovo knows the episode:

- target velocity can be calculated from future frames
- lookahead can be exact
- sudden layout changes can be anticipated
- camera movement can begin before an entity crosses a hard zone
- maximum acceleration can be validated

## Cuts and Blends

### Cut

A cut changes from one complete pose to another on one exact frame. It does not clear an effect
array.

### Blend definition

```ts
export interface CameraBlendDefinition {
  durationFrames: number;
  curve:
    | "linear"
    | "ease-in"
    | "ease-out"
    | "ease-in-out"
    | "smoothstep"
    | { type: "bezier"; values: readonly [number, number, number, number] };
  subjectMode?: "live-both" | "freeze-outgoing" | "freeze-both";
  rotationMode?: "shortest" | "clockwise" | "counter-clockwise";
}
```

### Blend evaluation

1. Evaluate the outgoing shot pose.
2. Evaluate the incoming shot pose.
3. Apply the chosen subject freeze policy.
4. Evaluate the blend curve.
5. Interpolate complete pose fields.
6. Apply constraints.
7. Apply post-blend modifiers.

### Continuity requirements

For every non-cut blend:

- the first blended pose equals the outgoing pose at the boundary
- the final blended pose equals the incoming pose
- no NaN or infinite matrices are permitted
- position, scale, and rotation discontinuity must remain below configured thresholds

## Modifiers and Transitions

### Pipeline order

```text
base rig pose
  -> composer constraints
  -> shot blend
  -> camera-space modifiers
  -> visual transition parameters
  -> final pose and render effects
```

### Modifier contract

```ts
export interface EvaluatedCameraModifier {
  translateX: number;
  translateY: number;
  scaleMultiplier: number;
  rotationDeltaDeg: number;
  blurPx?: number;
  flash?: {
    color: string;
    opacity: number;
  };
}
```

### Initial modifiers

- deterministic handheld noise
- directional impulse
- screen shake
- dutch tilt
- punch
- optional slow drift

### Transition-only effects

- whip pan with actual blur output
- flash
- cross-dissolve
- motion smear if supported by the renderer

No modifier exists publicly until its complete headless evaluation and renderer application are both
implemented and visually tested.

### Deterministic noise

Noise must use:

- episode seed
- shot or modifier ID
- current frame
- fixed algorithm version

Changing the algorithm requires a version bump because it changes pixels.

## Authoring API

The final syntax can evolve, but it should express intent at the shot level.

```ts
episode("two-device-story", {
  fps: 30,
  duration: "20s",
})
  .stage((stage) => {
    stage.layout("two-up", {
      primaryDeviceId: "creator-ios",
      secondaryDeviceId: "friend-android",
    });
  })
  .camera((camera) => {
    camera.output("main", {
      safeArea: "vertical-social",
    });

    camera.rig("establishing", {
      outputId: "main",
      subject: camera.group([
        camera.device("creator-ios"),
        camera.device("friend-android"),
      ]),
      composer: {
        screenPosition: [0.5, 0.5],
        targetFill: 0.82,
        fillMode: "contain",
      },
    });

    camera.rig("message-close", {
      outputId: "main",
      subject: camera.anchor({
        deviceId: "creator-ios",
        appId: "app_whatsapp",
        entityType: "message",
        entityId: "velocity",
      }),
      composer: {
        screenPosition: [0.5, 0.58],
        targetFill: 0.3,
        fillMode: "contain",
        paddingPx: 24,
      },
      tracking: {
        mode: "predictive",
        positionFrames: 9,
        scaleFrames: 12,
        lookaheadFrames: 3,
        maxVelocityPxPerSecond: 900,
      },
    });

    camera.shot("0s", "2s", "establishing");
    camera.shot("2s", "5s", "message-close", {
      blendIn: {
        duration: "10f",
        curve: "ease-out",
      },
    });
  });
```

### Handles over repeated strings

App DSL operations should return stable entity handles.

```ts
const received = whatsapp.at("2.4s").receive("Studio Ops", "Render is ready.");

camera.shot("2.4s", "4.8s", {
  subject: received.anchor("bubble"),
  framing: "semantic-close",
});
```

The handle carries device, app, entity, and anchor identity.

### Convenience helpers

Convenience methods may compile into rigs and shots:

- camera.establish
- camera.closeUp
- camera.follow
- camera.cutTo
- camera.blendTo

They must not introduce a second runtime model.

## Camera Compiler

### Compiler inputs

- camera IR
- stage layout declarations
- device profiles
- app and device anchor schemas
- prepared event timeline
- render configuration
- automatic-direction semantics

### Compiler outputs

- validated CameraProgram
- interval index per output
- stable rig and shot IDs
- camera diagnostics
- optional baked camera curves
- camera manifest for debugging and documentation

### Validation passes

1. output registration
2. rig ID uniqueness
3. shot ID uniqueness
4. shot interval validity
5. rig reference validity
6. modifier reference validity
7. anchor schema validation
8. device and app reference validation
9. overlap and priority validation
10. output coverage validation
11. missing-anchor policy validation
12. pose finiteness checks
13. velocity and acceleration limits
14. safe-area coverage
15. deterministic serialization

### Runtime relationship

Camera selection should primarily be derived from CameraProgram and frame, not replayed into mutable
WorldState.

WorldState remains an input because anchors and scene nodes depend on app and device state at frame
t. The camera result is a render-time deterministic projection:

```text
evaluateCamera(cameraProgram, sceneGraph, anchorTree, worldAtT, t)
  -> EvaluatedCameraFrame
```

## Automatic Direction

### App semantic events

Apps should describe meaning rather than camera effects.

```ts
export interface CinematicSemanticEvent {
  id: string;
  deviceId: string;
  appId?: string;
  frame: number;
  category:
    | "message-arrival"
    | "message-send"
    | "typing"
    | "notification"
    | "navigation"
    | "media-reveal"
    | "reaction"
    | "call"
    | "custom";
  subject?: AnchorRef;
  importance: number;
  durationHintFrames?: number;
}
```

The compiler must not maintain app-specific event-name sets.

### Shot planner

The planner:

1. reads semantic events
2. generates candidate shots
3. scores composition validity and narrative importance
4. enforces minimum shot duration
5. avoids rapid focus oscillation
6. preserves authored hero shots
7. selects output-specific coverage
8. emits explicit shot clips
9. validates the final program

### Authored direction wins

Priority order:

1. explicit authored shot
2. explicit authored hold or exclusion interval
3. automatic shot
4. output default

### Global optimization opportunities

The offline planner may consider:

- future event timing
- anchor trajectory
- cut-on-action opportunities
- repeated subjects
- jump-cut similarity
- device handoffs
- caption safe areas
- minimum visual hold
- maximum camera motion per second

### Inspectability

Automatic direction must produce the same CameraProgram format as manual direction. It must be
possible to print, diff, test, and override every generated shot.

## Renderer Integration

### Stage-first rendering

The renderer should construct the stage, evaluate an output camera, and apply the final view matrix
at the output root.

```text
StageRoot
  BackgroundNode
  DeviceNode creator-ios
    ScreenNode
    ChromeNode
    NotificationNode
  DeviceNode friend-android
    ScreenNode
    ChromeNode
  OverlayNodes
```

### Output rendering

For each output:

1. resolve output viewport
2. build or reuse the scene graph
3. resolve anchor tree
4. evaluate camera frame
5. apply output clip
6. apply camera view matrix
7. render eligible scene nodes
8. render visual transition layers
9. render debug guides when enabled

### Projection backends

Affine pose remains on the composited CSS matrix path and must be generated from CameraPose2D.
Projective tilt may use that path for an affine-only output. When a texture plan is selected, the
offline compositor owns projective homography together with the nonlinear passes; applying CSS 3D
projection to an SVG `foreignObject` plate leaks rectangular planes through rounded device chrome
in Chromium. The renderer uses one stable matrix representation rather than independently composing
translate, scale, origin, and rotation strings in multiple wrappers.

Non-linear optics require a raster texture. Release rendering therefore uses a two-stage path:

```text
deterministic story + stage projection
            |
            v
layer-attached raster plates at frame t
            |
            v
offline texture compositor
  - radial/fisheye displacement
  - anamorphic edge displacement
  - velocity smear
  - output clip/crop
            |
            v
final encoded output
```

SVG `foreignObject` filters are a preview and reference backend only. The 1080x1920 feasibility
probe measured 60 neutral frames at 4.59 seconds, the original eight-sample SVG smear at 16.18
seconds, and the optimized single-convolution SVG smear at 12.19 seconds on the development machine.
Both optical implementations failed the performance gate despite producing the intended pixels.
Release mode must route a non-linear pass to the texture compositor or fail with
`CAM_TEXTURE_COMPOSITOR_REQUIRED`; it may not silently use the SVG path.

The initial microbenchmark used a crisp source plus horizontal Gaussian trail and took 0.83 seconds
for the same 60 frames. The integrated compositor now supplies dynamic per-frame commands,
projective/radial/fisheye/anamorphic maps, independent RGB/alpha warping, and explicit underlay,
camera, and foreground attachment. A real 51-frame WhatsApp span took 95.45 seconds end to end under
deterministic software GL, including three browser plate renders; map generation itself took 466ms.
The backend is pixel-feasible and release-connected, but plan-independent plate reuse, chunked
scheduling, multi-output composition, and the full performance budget remain required work.

Plate identity includes story signature, stage signature, frame, output/layer attachment, dimensions,
pixel format, and renderer version. CameraPlan identity is deliberately excluded from reusable stage
plates so restrained and kinetic CameraPlans can share the same story render. Final-output cache keys
include the selected camera signature and texture-compositor version.

The first integrated vertical slice still paints affine framing and crop scale into its camera
plate, so those plates are plan-attached and are not yet eligible for the target cross-plan cache.
This is an explicit incomplete optimization seam, not a relaxation of the cache identity above.

### Camera spaces

The renderer may eventually support:

- stage camera: observes the whole composed stage
- nested output camera: controls a PIP or split output
- local surface camera: intentionally crops inside one device screen

These spaces must be explicit. The system must not infer them from activeDeviceId.

## Debugging and Authoring Tools

### Required visual guides

Debug rendering should show:

- output viewport
- safe area
- active shot and rig
- outgoing and incoming shot during a blend
- requested subject bounds
- resolved world-space subject bounds
- projected screen-space bounds
- desired screen position
- target-fill box
- dead, soft, and hard zones
- camera center
- current scale and rotation
- modifier deltas
- fallback or missing-anchor status
- pose velocity and acceleration

### Camera program inspector

The runner should provide:

- output track timeline
- shot interval list
- rig details
- blend details
- anchor resolution status
- generated-versus-authored origin
- direct navigation to a shot frame
- JSON manifest export

### Linting

Camera linting must consume registered schemas and compiled programs. It must not maintain a
hardcoded global anchor allowlist.

Lint rules should include:

- unresolved anchor reference
- implicit output gap
- ambiguous shot overlap
- shot shorter than configured minimum
- excessive camera velocity
- unsafe framing
- repeated near-identical cut
- unsupported modifier
- old effect-oriented camera API remaining anywhere in repository episodes

## Diagnostics and Error Policy

### Diagnostic shape

```ts
export interface CameraDiagnostic {
  code: string;
  severity: "info" | "warning" | "error";
  frame?: number;
  outputId?: string;
  shotId?: string;
  rigId?: string;
  anchorRef?: AnchorRef;
  message: string;
  details?: Record<string, unknown>;
}
```

### Production render policy

Production rendering must fail for:

- missing required camera package registration
- unknown output
- unknown rig
- invalid shot interval
- ambiguous active shots
- unresolved anchor with error policy
- non-finite pose
- invalid matrix
- missing required modifier renderer
- geometry version mismatch

### Preview policy

Preview may continue with a visible diagnostic overlay only when:

- graceful preview is explicitly enabled
- the diagnostic is recoverable
- the fallback behavior is deterministic

Preview fallback must never silently become production behavior.

## Determinism and Pixel-Level Enforcement

### Determinism contract

For a fixed:

- repository revision
- episode source
- prepared CameraProgram
- asset set
- font set
- renderer version
- platform runtime
- render configuration
- frame

the evaluated scene, camera pose, and pixels must be identical.

### Pose determinism tests

For representative frames:

- evaluate directly
- evaluate after arbitrary earlier-frame queries
- evaluate in ascending order
- evaluate in descending order
- evaluate in randomized order

Every result must be deeply equal.

### Render determinism tests

Render the same frame and episode multiple times and compare:

- raw pixel hash where the rendering stack is controlled
- exact PNG bytes when metadata is normalized
- decoded RGBA buffers otherwise

No tolerance should be used for deterministic camera movement in the controlled CI environment.

### Anchor-to-render alignment tests

For each camera-critical component:

1. render a debug frame containing a deterministic anchor mask
2. render the corresponding component mask
3. compare their bounds
4. fail if edge deltas exceed the allowed contract

Target:

- exact alignment for explicit solved rectangles
- at most one physical pixel only where rasterization rules require it

This test must cover:

- message bubble
- composer
- header/profile
- notification
- keyboard
- media viewer
- PIP device bounds
- device screen

### Shot-boundary tests

For every shot:

- frame start minus one
- frame start
- middle
- end minus one
- end

Validate active shot identity, pose, anchor, and blend progress.

### Blend continuity tests

For non-cut blends:

- first blend pose equals outgoing boundary pose
- last blend pose equals incoming boundary pose
- frame-to-frame deltas remain finite
- configured velocity limits are respected

### Golden-frame tests

Curated golden frames should include:

- one-device establishing shot
- message close-up
- moving-message tracking
- notification interrupt
- keyboard/composer framing
- two-device group shot
- handoff between devices
- split-screen independent outputs
- PIP independent output
- RTL chat
- media viewer
- missing-anchor failure fixture

### Full-video determinism

At least one release-gate episode must be rendered twice and compared after deterministic container
normalization. Frame-level hashes should be compared even when MP4 container bytes differ.

## Test Matrix

### Unit tests

- matrix composition and inversion
- local-to-world anchor projection
- composer scale and center equations
- padding and safe areas
- group bounds
- scale limits
- missing-anchor policies
- shot interval selection
- priority tie-breaking
- curve evaluation
- pose blending
- deterministic noise
- each constraint
- each modifier

### Contract tests

- app anchor schema registration
- device anchor schema registration
- solved layout schema/version validation
- rig and modifier registration
- camera-program serialization

### Integration tests

- DSL to CameraProgram
- compiler to scene graph
- world state to anchor tree
- anchor tree to pose
- pose to renderer matrix
- multi-output isolation
- automatic planner output
- debug manifest correspondence

### Visual tests

- anchor masks
- safe-area guides
- stage-wide framing
- transitions
- modifiers
- PIP
- split screen
- multiple device profiles
- RTL and localization

### Performance tests

- long episode shot lookup
- large anchor tree
- multi-device scene
- many moving messages
- automatic planner compile time
- per-frame camera evaluation
- memory usage for baked curves

## Performance Architecture

### Target complexity

Per output, per frame:

- active shot lookup: O(log n) or O(1) with interval cursor/index
- rig lookup: O(1)
- anchor lookup: O(1)
- local-to-world projection: O(scene depth), normally small
- composer and blend: O(1)
- modifiers: O(m), with a small bounded modifier count

### Caching

Safe caches:

- immutable prepared CameraProgram
- scene-node world matrices keyed by frame and scene version
- anchor projections keyed by frame, node transform, and layout version
- baked pose curves

Unsafe caches:

- process-global state dependent on episode evaluation order
- mutable last-frame pose in React
- DOM measurement caches
- non-versioned app geometry

### Baked curve storage

If every-frame poses are baked, storage should be measured. Piecewise polynomial or sampled curves
may be used when they reproduce exact values and retain random access.

### Parallel rendering

Camera evaluation must remain safe when Remotion requests frames:

- in parallel
- out of order
- more than once
- in separate processes

## Observability

Structured camera logs should include:

- camera.compile.started
- camera.compile.completed
- camera.compile.failed
- camera.shot.selected
- camera.anchor.unresolved
- camera.anchor.held
- camera.pose.invalid
- camera.constraint.clamped
- camera.modifier.unsupported
- camera.render.determinism_failed

High-volume per-frame logs must be opt-in.

Render-service failure output should include:

- episode ID
- frame
- output ID
- shot ID
- rig ID
- anchor reference
- geometry version
- diagnostic code

## Public API and Versioning

### Version the camera program

CameraProgram includes an explicit version. Preparation rejects unsupported versions.

### Version geometry

App solved layout and anchor schemas include versions. A camera manifest records the versions used by
the render.

### Breaking-change policy

Deleting the old effect APIs is an intentional hard breaking change. Repository episodes migrate
directly to CameraPlan authoring on an isolated branch. The completed tree does not ship a
compatibility compiler, compatibility runtime, deprecated export layer, or dual authoring surface.

## Legacy Keep, Replace, and Delete Map

### Keep conceptually

- semantic anchors
- deterministic frame evaluation
- seeded noise
- declarative episode direction
- explicit plugin registration
- app-owned semantic geometry
- debug telemetry
- real render verification

### Replace

| Current concept                 | Replacement                               |
| ------------------------------- | ----------------------------------------- |
| CameraTransform state           | CameraPose2D evaluated from CameraProgram |
| activeEffects                   | shot clips and modifiers                  |
| activeDeviceId camera ownership | camera output and scene-node targets      |
| focus                           | rig plus shot                             |
| track                           | tracked rig plus deterministic trajectory |
| reset                           | explicit shot to default/establishing rig |
| CUT event clearing effects      | shot boundary with zero-duration blend    |
| layout camera event             | stage-layout track                        |
| transform origin framing        | Composer2D position and scale solution    |
| behavior preset                 | explicit rig and blend parameters         |
| effect priority                 | shot-candidate arbitration                |
| fallback chain                  | shot MissingAnchorPolicy                  |
| hardcoded anchor linter list    | registered anchor schemas                 |
| automatic raw effects           | generated CameraProgram shots             |

### Delete after migration

- BaseCameraState.transform
- BaseCameraState.deviceTransforms
- effectCleanupBuffer as camera-shot lifecycle
- CameraEffect persistent state model
- processActiveEffects
- current camera reducer
- duplicate runtime CameraEvent union
- generic string camera reducer events
- current camera lowering handler
- current CameraDirector and fluid-tennis behavior implementation
- overlapping core and device-camera behavior registries
- hardcoded app event lists in CameraDirectorPlugin
- hardcoded CLI anchor allowlist
- renderer useCameraEngine effect replay
- active-device camera enable/disable branching
- implicit target-device layout promotion

### Delete rather than migrate as public features

Unless a real VNext implementation is independently justified:

- set
- raw animate
- raw pan
- current flash
- current whip pan
- current dolly
- current Ken Burns
- punch zoom as persistent camera state
- dutch tilt as persistent camera state

Equivalent visible behavior may return later as complete shots, modifiers, or transitions.

## Migration Plan

### Phase 0: freeze and document

- declare Camera VNext proposed
- freeze new legacy effect APIs and presets
- mark current incomplete helpers deprecated
- add regression tests documenting current failure cases
- identify every repository episode using camera DSL
- record representative baseline renders

Exit criteria:

- no new legacy surface is accepted
- migration inventory is complete

### Phase 1: contracts and pure math

- introduce Matrix2D utilities
- introduce coordinate-space contracts
- introduce CameraPose2D
- implement Composer2D
- implement constraints
- implement pose blending
- add unit and determinism tests

Exit criteria:

- complete poses can be evaluated without React
- all math tests pass under randomized frame access

### Phase 2: scene graph and anchors

- introduce deterministic scene nodes
- project device and app anchors into world space
- add explicit missing-anchor policies
- add anchor masks and geometry alignment tests
- migrate device, notification, keyboard, and WhatsApp geometry

Exit criteria:

- flagship camera anchors match rendered pixels
- stage-wide group framing works

### Phase 3: camera program and brain

- introduce outputs, rigs, shots, and CameraProgram
- implement shot interval selection
- implement one brain per output
- implement cuts and blends
- add program manifest and debug guides

Exit criteria:

- one-device, multi-device, split, and PIP fixtures render through VNext

### Phase 4: renderer cutover

- move camera application to output/stage roots
- remove effect evaluation from useCameraEngine
- implement visual modifier output
- verify render determinism
- run pixel comparisons against approved new goldens

Exit criteria:

- renderer consumes only CameraPose2D
- no camera semantics are reconstructed in React

### Phase 5: direct episode migration

- migrate flagship and system camera showcases first
- migrate stories and remaining curated episodes
- migrate retained test catalogs directly
- replace effect calls with shots, rigs, subjects, and stage declarations

Exit criteria:

- repository camera calls use shot-level authoring
- no old camera authoring or translation fixture remains

### Phase 6: automatic director

- replace app effect mappings with cinematic semantic events
- implement candidate generation and shot planning
- emit normal CameraProgram clips
- add inspectable planner diagnostics
- validate long-thread and rapid-event pacing

Exit criteria:

- automatic and manual direction share one runtime model

### Phase 7: deletion

- remove legacy reducer
- remove effect processors
- remove duplicate camera state
- remove old lowering
- remove old director
- remove hardcoded camera CLI behavior
- rename package if approved
- update public docs and examples

Exit criteria:

- no runtime legacy camera path remains
- release gate and deterministic render gate pass

## File-Level Migration Guide

| Current path                                            | Planned action                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------------- |
| packages/dsl/src/v2/camera-track.ts                     | replace with shot/rig/output CameraPlan builder; delete old exports          |
| packages/ir/src/v2/payloads.ts                          | replace effect payloads with camera-program IR                              |
| packages/core/src/types/camera.ts                       | remove mutable render transform; retain or move stage-layout contracts      |
| packages/core/src/types/runtime-event.ts                | remove duplicate camera effect runtime events                               |
| packages/core/src/engine/handlers/camera.ts             | remove effect dispatch; stage layout gets separate ownership                |
| packages/core/src/engine.ts                             | remove camera effect cleanup and identity deviceTransforms                  |
| packages/device-camera/src/types                        | replace effect union with program, pose, composer, and modifier contracts   |
| packages/device-camera/src/reducer                      | delete after cutover                                                        |
| packages/device-camera/src/processors                   | replace with composer, blend, tracking, constraint, and modifier evaluators |
| packages/device-camera/src/lowering                     | replace with camera-program compiler integration                            |
| packages/device-camera/src/director                     | replace with shot planner                                                   |
| packages/device-camera/src/anchors                      | replace fallback resolver with strict scene-anchor projection               |
| packages/device-camera/src/cli.ts                       | rebuild from registered schemas and CameraProgram diagnostics               |
| packages/compiler/src/plugins/camera-director.plugin.ts | replace hardcoded mappings with semantic shot planning                      |
| packages/renderer/src/engines/useCameraEngine.ts        | replace effect replay with CameraPose2D evaluation/application              |
| packages/renderer/src/MultiDeviceRenderer.tsx           | separate stage layout from output cameras                                   |
| packages/renderer/src/TokovoRenderer.tsx                | expose deterministic scene nodes; stop owning global camera semantics       |
| packages/apps-\*/src/anchors                            | emit typed local anchors from shared solved layout                          |
| packages/apps-\*/src/camera/behaviors.ts                | replace raw camera intents with semantic cinematic events                   |

## Acceptance Criteria

Camera VNext is not complete until all of the following are true.

### Architecture

- one CameraProgram model exists
- renderer consumes one final pose per output
- camera does not mutate stage layout
- core does not expose a misleading identity transform as the rendered camera
- automatic and manual direction share the same program

### Geometry

- camera-critical anchors are derived from rendered solved geometry
- every anchor has an explicit coordinate space and scene node
- entity handles resolve without raw global strings
- implicit broad fallback boxes are gone

### Cinematography

- establishing, medium, close-up, tracking, group, notification, and multi-device handoff shots exist
- a looser shot can follow a tighter shot
- a shot holds until another shot replaces it
- reset cannot reveal an old shot
- blends are continuous
- safe areas affect actual composition

### Multi-device

- main and PIP cameras can operate independently
- split-left and split-right can use separate outputs
- focusing a secondary device never changes stage roles
- a stage camera can frame multiple devices

### Determinism

- random-access pose evaluation is exact
- repeated frame renders are pixel-identical in controlled CI
- at least one full episode passes frame-hash comparison
- noise and modifiers are versioned and seeded

### Quality

- no public camera feature is a visual no-op
- diagnostics identify output, shot, rig, anchor, and frame
- program inspector and visual guides exist
- long-thread and rapid-event benchmarks pass
- public docs match the shipped architecture

## Performance Budgets

Initial budgets should be measured and then frozen. Proposed starting targets on repository CI
hardware:

- camera program compilation for a 60-second episode: under 250 ms excluding app-state preparation
- camera evaluation per output per frame: under 0.2 ms at p95
- scene-anchor projection for a two-device scene: under 0.3 ms at p95
- debug-disabled camera allocations: bounded and near zero after prepared caches
- baked curve memory for a 60-second, 30 fps, four-output episode: under 2 MB before general
  serialization overhead

These numbers are proposed targets, not current claims. CI should record distributions before
turning them into hard release gates.

## Risks and Mitigations

### Migration size

Risk: existing episodes contain many focus and tracking calls.

Mitigation:

- migrate repository episodes directly on the isolated implementation branch
- use automated inventory and mechanical rewrites where semantics are unambiguous
- require explicit shot review where old effect accumulation hid intent
- keep the branch unmergeable until old authoring usage reaches zero

### Scene graph complexity

Risk: scene-node modeling expands renderer scope.

Mitigation:

- begin with device, screen, and output nodes
- keep matrices headless and small
- do not introduce general-purpose 3D features

### Geometry migration

Risk: apps currently use independent React layout.

Mitigation:

- migrate camera-critical regions first
- add component/anchor mask tests
- use shared layout tokens and primitives

### Render performance

Risk: resolving scene and anchor geometry for multiple outputs increases work.

Mitigation:

- reuse one scene graph per frame
- cache world matrices
- share anchor projection across outputs
- index shots and rigs

### Visual baseline changes

Risk: correct composition will intentionally change many golden frames.

Mitigation:

- approve new VNext goldens intentionally
- retain baseline artifacts for review
- distinguish expected art-direction changes from nondeterminism

### Over-designed authoring API

Risk: rig and shot definitions become verbose.

Mitigation:

- keep the core model explicit
- add handles and curated compositional helpers
- ensure convenience APIs compile into the same program

## Rejected Alternatives

### Continue adding effect presets

Rejected because presets do not fix shot ownership, composition, lifecycle, coordinate spaces, or
multi-output behavior.

### Keep activeEffects but improve cleanup

Rejected because cleanup is not the only problem. Effect accumulation remains an indirect and
order-dependent representation of shots.

### Measure DOM anchors at render time

Rejected because it breaks headless evaluation, parallel frame rendering, and deterministic random
access.

### Store mutable previous-frame camera state

Rejected because Remotion may render frames out of order and in parallel.

### Put all camera planning in the renderer

Rejected because the renderer should apply prepared intent, not invent app semantics or shot
selection.

### Let every device retain an independent legacy effect stack

Rejected because it multiplies the old model and still cannot represent a stage-wide camera.

### Delete semantic anchors

Rejected because semantic targeting is essential. The solution is trustworthy geometry and explicit
projection, not raw episode pixel coordinates.

### Copy a 3D game-camera engine directly

Rejected because Tokovo needs deterministic 2D composition, semantic UI subjects, offline planning,
and social-output safe areas rather than physical 3D camera simulation.

## Open Questions and Recommended Defaults

### Package name

Question: retain @tokovo/device-camera or introduce @tokovo/camera?

Recommendation: introduce @tokovo/camera. The camera observes the stage; it is not a device-owned OS
surface.

### Analytic versus baked tracking

Recommendation: support both, using analytic evaluation for static/simple shots and baked curves for
moving or automatically directed subjects.

### Camera program storage

Recommendation: attach CameraProgram to prepared episode output, not mutable WorldState.

### Local device-surface camera

Recommendation: defer as a named camera space. Implement stage and nested output cameras first.

### Default missing-anchor policy

Recommendation: error for explicit shots, skip-shot for optional automatic coverage.

### Default output coverage

Recommendation: every output must have a default rig or complete shot coverage.

### Rig priorities

Recommendation: authored shot intervals are primary. Priority exists for generated candidates and
explicit overlaps, not as the normal authoring mechanism.

### Visual effect ownership

Recommendation: headless camera package evaluates effect parameters; renderer owns visual layers.

### Program serialization

Recommendation: use stable JSON-compatible data with sorted IDs and an explicit version for debug
manifests and cache keys.

## Reference Scenarios

### Single-device message close-up

- Stage contains one device.
- Shot targets a stable message entity anchor.
- Composer places the message slightly below center.
- Target fill and padding determine scale.
- Shot holds until the next clip.

### Moving message thread

- Tracked rig targets latest visible message or a stable authored message handle.
- Compiler calculates anchor trajectory.
- Predictive tracking begins before the message crosses the soft zone.
- Pose remains random-access deterministic.

### Notification interrupt

- Notification semantic event produces a candidate shot.
- Planner validates minimum previous-shot hold.
- Notification shot targets the device notification node.
- After dismissal, an explicit shot returns to the prior subject or establishing rig.
- No previous effect can reappear accidentally.

### Two-device establishing shot

- Target group contains both device nodes.
- Composer calculates union bounds.
- Safe area leaves room for captions.
- One stage camera frames both devices without changing their layout.

### Device handoff

- Outgoing rig targets a message on device A.
- Incoming rig targets a message or notification on device B.
- Blend interpolates complete poses.
- Stage roles remain unchanged.

### Independent PIP tracking

- Main output holds a stage or primary-device shot.
- PIP output uses its own tracked rig.
- PIP camera movement does not affect the main output.

### RTL conversation

- Solved app layout emits RTL-correct message bounds.
- Anchor projection uses those same bounds.
- Composer is direction-agnostic unless a rig explicitly uses directional bias.

### Missing optional automatic target

- Candidate shot uses skip-shot policy.
- Planner discards it and maintains valid output coverage.
- A structured diagnostic records the skipped candidate.

## Documentation Migration

When VNext becomes the current implementation:

- delete docs/CAMERA_V1_REFERENCE.md
- update docs/ARCHITECTURE.md
- update docs/V1_STABILITY.md
- update apps/docs/app/guides/cinematic-camera/page.mdx
- update apps/docs/app/concepts/anchors/page.mdx
- replace apps/docs/app/packages/device-camera/page.mdx with the @tokovo/camera package reference
- update DSL examples and first-episode documentation
- update README package and feature descriptions
- remove claims about current CLI or director behavior that no longer apply

Documentation must change in the same release as public authoring syntax and package boundaries.

## Implementation Checklist

### Contracts

- [ ] CameraPose2D
- [ ] CameraOutputDefinition
- [ ] CameraRigDefinition
- [ ] CameraShotClip
- [ ] CameraBlendDefinition
- [ ] CameraModifierDefinition
- [ ] CameraProgram
- [ ] AnchorRef
- [ ] ResolvedAnchor
- [ ] MissingAnchorPolicy
- [ ] SceneNode and SceneGraph

### Pure engine

- [ ] matrix utilities
- [ ] local-to-world projection
- [ ] Composer2D
- [ ] group framing
- [ ] constraints
- [ ] shot selection
- [ ] cuts
- [ ] blends
- [ ] analytic tracking
- [ ] baked-curve sampling
- [ ] deterministic modifiers

### Compiler

- [ ] camera IR validation
- [ ] output coverage
- [ ] interval index
- [ ] program manifest
- [ ] semantic event contract
- [ ] shot planner

### Renderer

- [ ] stage root
- [ ] scene-node transforms
- [ ] one camera pose per output
- [ ] PIP nested output
- [ ] transition visual layers
- [ ] debug guides
- [ ] anchor masks

### App and device packages

- [ ] typed anchor schemas
- [ ] shared solved geometry
- [ ] semantic cinematic events
- [ ] notification geometry
- [ ] keyboard geometry
- [ ] device screen and chrome geometry
- [ ] WhatsApp camera-critical geometry

### Verification

- [ ] unit math suite
- [ ] random-access determinism suite
- [ ] anchor alignment suite
- [ ] shot-boundary suite
- [ ] blend continuity suite
- [ ] multi-output isolation suite
- [ ] repeated render pixel hashes
- [ ] full-video frame hashes
- [ ] long-thread performance benchmark
- [ ] public docs verification

### Deletion

- [ ] legacy effect DSL removed
- [ ] old camera reducer removed
- [ ] processActiveEffects removed
- [ ] activeEffects removed from camera state
- [ ] transform and deviceTransforms removed
- [ ] old director removed
- [ ] duplicate behavior registries removed
- [ ] old lowering removed
- [ ] hardcoded anchor CLI list removed

## Definition of Done

Camera VNext is done when a creator can author and inspect a sequence of intentional shots across
multiple devices; every shot resolves through trustworthy semantic geometry; every output receives
one complete deterministic pose; blends are continuous; automatic direction emits the same
inspectable program as manual direction; pixel-level tests enforce alignment and replay; and no
legacy effect accumulator remains in the runtime or renderer.

## Inspirations

The architecture borrows high-level concepts from virtual-camera systems, especially:

- virtual cameras or rigs
- a brain that selects the active camera
- screen-space composition
- shot timelines
- independent channels
- post-composition modifiers

Relevant conceptual references:

- Unity Cinemachine overview:
  https://docs.unity3d.com/Packages/com.unity.cinemachine@3.1/manual/index.html
- Cinemachine Brain:
  https://docs.unity3d.com/Packages/com.unity.cinemachine@3.1/manual/CinemachineBrain.html
- Cinemachine Camera:
  https://docs.unity3d.com/Packages/com.unity.cinemachine@3.1/manual/CinemachineCamera.html
- Position Composer:
  https://docs.unity3d.com/Packages/com.unity.cinemachine@3.1/manual/CinemachinePositionComposer.html

Tokovo's implementation must remain purpose-built for deterministic 2D phone-native storytelling.
