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

## Movement vocabulary

Shots expose typed movement verbs: `dollyIn`, `dollyOut`, `truckLeft`, `truckRight`, `pedestalUp`,
`pedestalDown`, `panLeft`, `panRight`, `tiltUp`, `tiltDown`, `roll`, `craneUp`, `craneDown`, and
`orbit`. Cuts, critically damped settles, and editorial whips are also explicit.

These verbs compile to complete deterministic poses and carry a movement intent in trace data.
`orbit` currently means a projective 2.5D plate move using perspective tilt; it is not true
multi-plane 3D parallax. A future 3D renderer can implement that intent without changing episode
story code.

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

Verify hero work with a real render:

```bash
EPISODE_ID=camera-vnext-cinematic-flagship \
CAMERA_PLAN_ID=kinetic \
pnpm --filter video-runner render:fast
```

Inspect the opening, peak distortion, transition, notification, close-up, and final neutral frames.
Tests alone cannot prove clipping, typography, physical screen inset, or clean optical settlement.
