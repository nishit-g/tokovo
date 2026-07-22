# Tokovo Camera Authoring Reference

Tokovo camera direction is authored as deterministic data beside the story. It is not a sequence of
runtime effects. A story can ship several camera plans, and changing the selected plan must not
change story replay or stage pixels.

## Mental model

```text
story events ---> world at frame t -----------+
stage program -> device placement at frame t -+--> cinematic subjects --> camera plan --> outputs
app/device projection ------------------------+                         lenses/modifiers/filters
```

- Story owns what happens inside apps and devices.
- Stage owns where devices and scene nodes exist.
- Camera owns framing, movement, optics, grading, and output composition.
- Apps and devices expose typed subjects from the same geometry they paint.

Do not use camera direction to rearrange the stage, mutate runtime state, or guess DOM geometry.

## Authoring a program

Use `cinematicProgram` and structured subjects from `@tokovo/dsl`:

```ts
import { cameraSubject, cinematicProgram } from "@tokovo/dsl";

const phone = cameraSubject.device("hero-phone", "body");
const keyboard = cameraSubject.device("hero-phone", "keyboard");

export const cinematics = cinematicProgram(
  {
    fps: 60,
    duration: "8s",
    stage: {
      width: 1350,
      height: 2856,
      devices: [{ deviceId: "hero-phone", width: 1350, height: 2856 }],
    },
  },
  (program) => {
    program.plan(
      "kinetic",
      (camera) => {
        camera
          .output("main", {
            viewport: { x: 0, y: 0, width: 1080, height: 1920 },
            coveragePolicy: "require-shots",
            compositionProfileId: "hero-device",
            editorialInsets: { top: 48, right: 32, bottom: 48, left: 32 },
            defaultRigId: "neutral",
          })
          .rig("neutral", {
            outputId: "main",
            subject: phone,
            composer: {
              screenPosition: [0.5, 0.5],
              targetFill: 0.82,
              fillMode: "contain",
              paddingPx: 28,
            },
          })
          .lens("typing-fisheye", "fisheye", {
            center: [0.5, 0.72],
            strength: 0.1,
            radius: 1.15,
            cropCompensation: 1.04,
          })
          .filter("typing-grade", "color-grade", {
            contrast: 1.08,
            saturation: 0.94,
            temperature: -0.04,
          })
          .shot("keyboard-arrival", "main", "0s", "3s", (shot) =>
            shot
              .target(keyboard)
              .guard(phone, { paddingPx: 28 })
              .frame({ screenPosition: [0.5, 0.7], fillMode: "width" })
              .lens("typing-fisheye")
              .filters("typing-grade")
              .dollyIn({ duration: "420ms", toFill: 0.78, amount: 0.2 }),
          );
      },
      { default: true },
    );
  },
);
```

Attach the resulting value with `.cinematics(cinematics)`.

## Subjects and coordinate spaces

Prefer the narrowest stable subject:

- `cameraSubject.entity(...)` for an exact message, image, reaction, or other authored entity;
- `cameraSubject.semantic(...)` for a stable app-owned region such as a header or composer;
- `cameraSubject.device(...)` for body, screen, keyboard, notification, or OS surfaces;
- `cameraSubject.group(...)` when the composition must contain several subjects.

Device body and device display are distinct spaces. Screen/app/keyboard/notification geometry is
offset through the profile's physical display inset before stage projection; body geometry is not.
Never compensate for the hardware rail with episode-authored pixel offsets.

Missing-subject behavior must be explicit: fail, skip the shot, or use one explicit fallback
subject. There is no heuristic chain that invents a broader target.

## Output coverage and editorial insets

Every output declares a coverage policy. `require-shots` rejects any uncovered frame interval at
preparation; `allow-default` intentionally fills gaps with the output's default rig. This is a
compile-time contract, not a renderer guess.

`compositionProfileId` supplies the normal editorial insets and composition guidance.
`editorialInsets` is an intentional output-specific override. It reduces the effective composition viewport for every rig on that output. Composer
positioning and framing guards solve inside the editorial viewport, while final clipping still uses the
full output rectangle. Invalid or over-constrained insets fail with stable camera diagnostic codes.

Authoring fails immediately with `CinematicAuthoringError` when IDs collide, a shot leaves the
episode interval, a default rig belongs to the wrong output, or a rig references undeclared camera
data. Preparation performs the independent schema/registry validation required for raw IR and
non-DSL producers; release behavior never assumes the builder was used.

## Movement vocabulary

Shots expose typed movement verbs: `dollyIn`, `dollyOut`, `truckLeft`, `truckRight`, `pedestalUp`,
`pedestalDown`, `panLeft`, `panRight`, `tiltUp`, `tiltDown`, `roll`, `craneUp`, `craneDown`, and
`orbit`. Cuts, critically damped settles, and editorial whips are also explicit.

These verbs compile to complete deterministic poses and carry a movement intent in trace data.
`orbit` currently means a projective 2.5D plate move using perspective tilt; it is not true
multi-plane 3D parallax. A future 3D renderer can implement that intent without changing episode
story code.

## Tracking and baked trajectories

Rigs use deterministic direct tracking by default: each requested frame resolves the current
subject projection and recomputes the complete desired pose without consulting an earlier frame.
This preserves random access and makes sequential and shuffled evaluation identical.

For reviewed editorial paths, a rig may declare absolute baked offsets:

```ts
camera.rig("reviewed-path", {
  outputId: "main",
  subject: phone,
  composer: {
    screenPosition: [0.5, 0.5],
    targetFill: 0.82,
    fillMode: "contain",
  },
  tracking: { mode: "direct" },
  bakedTrajectory: {
    interpolation: "minimum-jerk",
    keyframes: [
      {
        frame: 0,
        offsetX: 0,
        offsetY: 0,
        scaleMultiplier: 1,
        rotationOffsetDeg: 0,
      },
      {
        frame: 120,
        offsetX: -24,
        offsetY: 18,
        scaleMultiplier: 1.08,
        rotationOffsetDeg: -1.5,
      },
    ],
  },
});
```

Keyframes are compact, absolute-frame data. Preparation rejects duplicates and out-of-range
frames; evaluation interpolates scale in log space and never integrates frame-to-frame velocity.

## Lenses, modifiers, and filters

- A lens changes projection geometry: barrel, fisheye, perspective tilt, or anamorphic edge stretch.
- A modifier changes pose/optical behavior, such as lens breathing or directional smear.
- A filter changes the image without changing geometry. The built-in deterministic color grade
  controls brightness, contrast, saturation, gamma, temperature, and tint.

Reference registrations by ID from rigs or shots. Unknown IDs fail preparation. Non-linear release
passes use the offline texture compositor; release rendering does not silently fall back to a lower
quality browser approximation.

## Recutting and debugging

Give a program several named plans and select one with `CAMERA_PLAN_ID=<plan-id>`. The story and
stage signatures must remain stable while the camera signature changes. Evaluation trace records
the selected plan, output, shot, rig, movement intent, resolved subject provenance, framing guard,
and ordered projection passes.

Preparation compiles definitions into JSON-safe integer indexes and non-overlapping shot intervals.
Runtime selection uses those indexes and does not scan or sort the authored plan per frame.

Inspect prepared programs without opening Remotion:

```bash
mise exec -- pnpm camera programs --episode whatsapp-cinematic-flagship
mise exec -- pnpm camera explain --episode whatsapp-cinematic-flagship \
  --camera-plan kinetic --output main --frame 420
mise exec -- pnpm camera diff --episode whatsapp-cinematic-flagship \
  --left restrained --right kinetic
mise exec -- pnpm camera subjects
```

Render metadata embeds the complete selected camera artifact: independent story/stage signatures,
plan signature, coverage map, required projection backend, stable IDs, preparation diagnostics, and
the immutable plan. Preview debug mode additionally draws editorial insets, projected subjects, framing
guards, desired/final pose, tracking/trajectory state, and ordered projection passes.

Verify hero work with a real render:

```bash
EPISODE_ID=whatsapp-cinematic-flagship \
CAMERA_PLAN_ID=kinetic \
mise exec -- pnpm --filter video-runner render:fast
```

`render:fast` is a watchable preview and may use the deterministic reference painter. A review or
release artifact with texture-only passes must use `mise exec -- pnpm render:episode`; the direct
Remotion path fails closed instead of silently approximating release pixels. Inspect the opening,
peak distortion, transition, notification, close-up, and final neutral frames. Tests alone cannot
prove clipping, typography, physical screen inset, or clean optical settlement.

For a deterministic release probe or distributed render chunk, provide an inclusive source range:

```bash
mise exec -- pnpm --filter @tokovo/render-service render \
  --episode whatsapp-cinematic-flagship \
  --profile release \
  --camera-plan kinetic \
  --start-frame 180 \
  --end-frame 191 \
  --job camera-probe
```

Both frame flags are required together. Metadata and projection hashes record the exact source
range; all three camera-independent layer-plate caches key it independently from CameraPlan
identity.
