import type {
  CameraBakedTrajectoryIR,
  CameraRectIR,
  CameraFillModeIR,
  CameraMountIR,
  CameraMotionProfileIR,
  CameraTravelIR,
  CameraShotDirectionIR,
  CinematicSubjectRefIR,
  JsonObject,
} from "@tokovo/ir";
import type {
  CameraOutputOptions,
  CameraRigOptions,
  CinematicPlanBuilder,
  CinematicShotBuilder,
  CinematicTime,
} from "./cinematics.js";
import { CinematicAuthoringError } from "./cinematic-errors.js";
import { parseDurationToFrames, parseTimeToFrames } from "./utils/time.js";

export type CameraLookModelDefinition = JsonObject & {
  model: string;
  version?: number;
};

/**
 * Pure authored data for the optical models shared by every plan in a family.
 * Authored IDs are the record keys. Model IDs remain registry-driven, so custom
 * lenses, modifiers, and filters do not require a DSL release.
 */
export interface CameraLookDefinition {
  lenses?: Readonly<Record<string, CameraLookModelDefinition>>;
  modifiers?: Readonly<Record<string, CameraLookModelDefinition>>;
  filters?: Readonly<Record<string, CameraLookModelDefinition>>;
}

export interface CameraSequenceFrame {
  position?: readonly [number, number];
  fill?: number;
  mode?: CameraFillModeIR;
  padding?: number;
  min?: number;
  max?: number;
  bias?: readonly [number, number];
}

export interface CameraSequenceFramePreset extends CameraSequenceFrame {
  preset: string;
}

/**
 * A shot can use one named framing recipe, refine that recipe locally, or
 * author a completely bespoke frame. Recipes are plain data on the same plan
 * family; there is no implicit runtime lookup.
 */
export type CameraSequenceFrameInput = CameraSequenceFrame | CameraSequenceFramePreset | string;

export interface CameraSequenceGuard {
  subject: CinematicSubjectRefIR;
  padding?: number;
  position?: readonly [number, number];
}

export type CameraSequenceTravel =
  | {
      mode: "stabilized";
      subject: CinematicSubjectRefIR;
      position?: readonly [number, number];
      maxDriftPx?: readonly [number, number];
    }
  | {
      mode: "intentional";
      reason: string;
    };

export interface CameraSequenceBlend {
  duration: CinematicTime;
  curve?: "linear" | "smoothstep" | "minimum-jerk";
}

export type CameraSequenceMissingPolicy = CinematicSubjectRefIR | "error" | "skip";

export type CameraSequenceMotion =
  | { kind: "cut" }
  | { kind: "ease"; duration: CinematicTime }
  | { kind: "settle"; duration: CinematicTime }
  | {
      kind: "whip";
      direction: "left" | "right" | "up" | "down" | "travel";
      duration: CinematicTime;
    }
  | {
      kind:
        | "truck-left"
        | "truck-right"
        | "pedestal-up"
        | "pedestal-down"
        | "pan-left"
        | "pan-right"
        | "tilt-up"
        | "tilt-down";
      duration: CinematicTime;
      amount?: number;
    }
  | {
      kind: "dolly-in" | "dolly-out" | "crane-up" | "crane-down";
      duration: CinematicTime;
      amount?: number;
      toFill?: number;
    }
  | {
      kind: "roll";
      duration: CinematicTime;
      amount?: number;
      angleDeg: number;
    }
  | {
      kind: "orbit";
      duration: CinematicTime;
      amount?: number;
      yawDeg: number;
      pitchDeg?: number;
      perspectivePx?: number;
      cropCompensation?: number;
    }
  | { kind: "custom"; profile: CameraMotionProfileIR };

export interface CameraSequenceShotStyle {
  frame?: CameraSequenceFrameInput;
  guard?: CameraSequenceGuard | null;
  travel?: CameraSequenceTravel | null;
  missing?: CameraSequenceMissingPolicy | null;
  lens?: string | null;
  modifiers?: readonly string[] | null;
  filters?: readonly string[] | null;
  blend?: CameraSequenceBlend | null;
  motion?: CameraSequenceMotion | null;
  trajectory?: CameraBakedTrajectoryIR | null;
  direction?: CameraShotDirectionIR | null;
  rotationDeg?: number | null;
  opacity?: number | null;
  priority?: number;
  source?: "authored" | "automatic";
}

export interface CameraSequenceShotDefinition extends CameraSequenceShotStyle {
  id: string;
  target: CinematicSubjectRefIR;
  duration: CinematicTime;
  /**
   * Optional absolute start. Omit it for normal sequential editing. Supplying
   * it intentionally moves the cursor and permits gaps or overlaps.
   */
  at?: CinematicTime;
  /**
   * Per-plan data override. `false` removes the shot from that plan while the
   * shared sequence cursor still advances by its authored duration.
   */
  variants?: Readonly<Record<string, CameraSequenceShotStyle | false | undefined>>;
}

export class CinematicSequenceShot {
  readonly #definition: CameraSequenceShotDefinition;

  constructor(id: string, duration: CinematicTime, target: CinematicSubjectRefIR) {
    this.#definition = { id, duration, target };
  }

  at(time: CinematicTime): this {
    this.#definition.at = time;
    return this;
  }

  /** Reuse a plain-data directing recipe. Later calls override it; nested fields replace, not merge. */
  style(style: CameraSequenceShotStyle): this {
    Object.assign(this.#definition, structuredClone(style));
    return this;
  }

  frame(frame: CameraSequenceFrameInput, overrides: CameraSequenceFrame = {}): this {
    if (typeof frame === "string") {
      this.#definition.frame = { preset: frame, ...overrides };
      return this;
    }
    this.#definition.frame = { ...frame, ...overrides };
    return this;
  }

  guard(subject: CinematicSubjectRefIR, options: Omit<CameraSequenceGuard, "subject"> = {}): this {
    this.#definition.guard = { subject, ...options };
    return this;
  }

  noGuard(): this {
    this.#definition.guard = null;
    return this;
  }

  mount(
    subject: CinematicSubjectRefIR,
    options: {
      position?: readonly [number, number];
      maxDriftPx?: readonly [number, number];
    } = {},
  ): this {
    this.#definition.travel = { mode: "stabilized", subject, ...options };
    return this;
  }

  allowDeviceTravel(reason: string): this {
    this.#definition.travel = { mode: "intentional", reason };
    return this;
  }

  fallback(subject: CinematicSubjectRefIR): this {
    this.#definition.missing = subject;
    return this;
  }

  skipWhenMissing(): this {
    this.#definition.missing = "skip";
    return this;
  }

  lens(lensId: string): this {
    this.#definition.lens = lensId;
    return this;
  }

  modifiers(...modifierIds: string[]): this {
    this.#definition.modifiers = modifierIds;
    return this;
  }

  filters(...filterIds: string[]): this {
    this.#definition.filters = filterIds;
    return this;
  }

  blend(duration: CinematicTime, curve: CameraSequenceBlend["curve"] = "minimum-jerk"): this {
    this.#definition.blend = { duration, curve };
    return this;
  }

  noBlend(): this {
    this.#definition.blend = null;
    return this;
  }

  trajectory(trajectory: CameraBakedTrajectoryIR): this {
    this.#definition.trajectory = trajectory;
    return this;
  }

  direct(direction: CameraShotDirectionIR): this {
    this.#definition.direction = direction;
    return this;
  }

  /** Shared magnification and a soft reading window; the target no longer controls shot fit. */
  readWithin(
    framingSubject: CinematicSubjectRefIR,
    options: {
      scale: number;
      region: CameraRectIR;
      halfLifeSeconds?: number;
      minimumReadingScale?: number;
      minimumTextPx?: number;
      avoidSubjects?: readonly CinematicSubjectRefIR[];
      panLimits?: { speedPxPerSecond: number; accelerationPxPerSecondSquared: number };
    },
  ): this {
    if (!Number.isFinite(options.scale) || options.scale <= 0)
      throw new CinematicAuthoringError(
        "CAM_READING_SCALE_INVALID",
        "Reading scale must be positive and finite.",
      );
    const frame = this.#definition.frame;
    this.#definition.frame = {
      ...(typeof frame === "string" ? { preset: frame } : frame),
      min: options.scale,
      max: options.scale,
    };
    this.#definition.direction = {
      entrance: { type: "cut" },
      ...this.#definition.direction,
      framing: "follow-position",
      framingSubject,
      tracking: {
        halfLifeSeconds: options.halfLifeSeconds ?? 0.18,
        readingRegion: options.region,
        ...(options.minimumReadingScale === undefined
          ? {}
          : { minimumReadingScale: options.minimumReadingScale }),
        ...(options.minimumTextPx === undefined ? {} : { minimumTextPx: options.minimumTextPx }),
        ...(options.avoidSubjects === undefined ? {} : { avoidSubjects: options.avoidSubjects }),
        ...(options.panLimits === undefined ? {} : { panLimits: options.panLimits }),
      },
    };
    return this;
  }

  /** Enter from the actual preceding camera pose, including interrupted moves. */
  handoff(
    durationFrames = 12,
    options: { continuity?: "velocity"; framing?: "hold" | "follow-position" } = {},
  ): this {
    if (!Number.isInteger(durationFrames) || durationFrames <= 0)
      throw new CinematicAuthoringError(
        "CAM_HANDOFF_DURATION_INVALID",
        "Camera handoff durationFrames must be a positive integer.",
      );
    this.#definition.direction = {
      ...this.#definition.direction,
      entrance: { type: "minimum-jerk", durationFrames },
      source: "freeze",
      ...(options.continuity
        ? { continuity: options.continuity, framing: options.framing ?? ("hold" as const) }
        : {}),
      ...(options.framing ? { framing: options.framing } : {}),
    };
    return this;
  }

  /** Hold, push relative to the composed shot, then hold the final scale. Times are shot-local. */
  pushIn(scale: number, startFrame: number, endFrame: number): this {
    if (
      !Number.isFinite(scale) ||
      scale <= 1 ||
      !Number.isInteger(startFrame) ||
      !Number.isInteger(endFrame) ||
      startFrame < 0 ||
      endFrame <= startFrame
    )
      throw new CinematicAuthoringError(
        "CAM_PUSH_TIMING_INVALID",
        "Camera pushIn requires scale > 1 and integer frames 0 <= start < end.",
      );
    const keyframe = (frame: number, scaleMultiplier: number) => ({
      frame,
      scaleMultiplier,
      offsetX: 0,
      offsetY: 0,
      rotationOffsetDeg: 0,
    });
    this.#definition.direction = {
      entrance: { type: "cut" },
      ...this.#definition.direction,
      movement: {
        interpolation: "minimum-jerk",
        keyframes: [
          keyframe(0, 1),
          ...(startFrame ? [keyframe(startFrame, 1)] : []),
          keyframe(endFrame, scale),
        ],
      },
    };
    return this;
  }

  rotation(rotationDeg: number): this {
    this.#definition.rotationDeg = rotationDeg;
    return this;
  }

  opacity(opacity: number): this {
    this.#definition.opacity = opacity;
    return this;
  }

  priority(priority: number): this {
    this.#definition.priority = priority;
    return this;
  }

  automatic(): this {
    this.#definition.source = "automatic";
    return this;
  }

  when(planId: string, style: CameraSequenceShotStyle | false): this {
    this.#definition.variants = {
      ...this.#definition.variants,
      [planId]: style,
    };
    return this;
  }

  motion(motion: CameraSequenceMotion): this {
    this.#definition.motion = motion;
    return this;
  }

  cut(): this {
    return this.motion({ kind: "cut" });
  }

  ease(duration: CinematicTime): this {
    return this.motion({ kind: "ease", duration });
  }

  settle(duration: CinematicTime): this {
    return this.motion({ kind: "settle", duration });
  }

  whip(direction: "left" | "right" | "up" | "down" | "travel", duration: CinematicTime): this {
    return this.motion({ kind: "whip", direction, duration });
  }

  dollyIn(duration: CinematicTime, options: { amount?: number; toFill?: number } = {}): this {
    return this.motion({ kind: "dolly-in", duration, ...options });
  }

  dollyOut(duration: CinematicTime, options: { amount?: number; toFill?: number } = {}): this {
    return this.motion({ kind: "dolly-out", duration, ...options });
  }

  truckLeft(duration: CinematicTime, amount?: number): this {
    return this.motion({
      kind: "truck-left",
      duration,
      ...(amount !== undefined ? { amount } : {}),
    });
  }

  truckRight(duration: CinematicTime, amount?: number): this {
    return this.motion({
      kind: "truck-right",
      duration,
      ...(amount !== undefined ? { amount } : {}),
    });
  }

  pedestalUp(duration: CinematicTime, amount?: number): this {
    return this.motion({
      kind: "pedestal-up",
      duration,
      ...(amount !== undefined ? { amount } : {}),
    });
  }

  pedestalDown(duration: CinematicTime, amount?: number): this {
    return this.motion({
      kind: "pedestal-down",
      duration,
      ...(amount !== undefined ? { amount } : {}),
    });
  }

  panLeft(duration: CinematicTime, amount?: number): this {
    return this.motion({
      kind: "pan-left",
      duration,
      ...(amount !== undefined ? { amount } : {}),
    });
  }

  panRight(duration: CinematicTime, amount?: number): this {
    return this.motion({
      kind: "pan-right",
      duration,
      ...(amount !== undefined ? { amount } : {}),
    });
  }

  tiltUp(duration: CinematicTime, amount?: number): this {
    return this.motion({
      kind: "tilt-up",
      duration,
      ...(amount !== undefined ? { amount } : {}),
    });
  }

  tiltDown(duration: CinematicTime, amount?: number): this {
    return this.motion({
      kind: "tilt-down",
      duration,
      ...(amount !== undefined ? { amount } : {}),
    });
  }

  roll(duration: CinematicTime, angleDeg: number, amount?: number): this {
    return this.motion({
      kind: "roll",
      duration,
      angleDeg,
      ...(amount !== undefined ? { amount } : {}),
    });
  }

  craneUp(duration: CinematicTime, options: { amount?: number; toFill?: number } = {}): this {
    return this.motion({ kind: "crane-up", duration, ...options });
  }

  craneDown(duration: CinematicTime, options: { amount?: number; toFill?: number } = {}): this {
    return this.motion({ kind: "crane-down", duration, ...options });
  }

  orbit(
    duration: CinematicTime,
    options: Omit<Extract<CameraSequenceMotion, { kind: "orbit" }>, "kind" | "duration">,
  ): this {
    return this.motion({ kind: "orbit", duration, ...options });
  }

  toDefinition(): CameraSequenceShotDefinition {
    const frame = this.#definition.frame;
    return {
      ...this.#definition,
      frame: typeof frame === "string" ? frame : frame ? { ...frame } : undefined,
      variants: this.#definition.variants ? { ...this.#definition.variants } : undefined,
    };
  }
}

export function cinematicShot(
  id: string,
  duration: CinematicTime,
  target: CinematicSubjectRefIR,
): CinematicSequenceShot {
  return new CinematicSequenceShot(id, duration, target);
}

export type CameraSequenceShotInput = CameraSequenceShotDefinition | CinematicSequenceShot;

export interface CameraSequenceDefinition {
  outputId: string;
  start?: CinematicTime;
  /**
   * Optional compile-time assertion for the final cursor. Use this to make a
   * full-output edit fail when a duration change accidentally opens a gap.
   */
  end?: CinematicTime;
  defaults?: CameraSequenceShotStyle;
  shots: readonly CameraSequenceShotInput[];
}

export interface CameraFamilyOutputDefaultRig extends Omit<
  CameraRigOptions,
  "outputId" | "composer" | "travel"
> {
  id?: string;
  frame: CameraSequenceFrame;
}

export interface CameraFamilyOutputDefinition extends Omit<CameraOutputOptions, "defaultRigId"> {
  id: string;
  /** Output-wide physical composition policy inherited by every shot. */
  travel: CameraSequenceTravel;
  defaultRig: CameraFamilyOutputDefaultRig;
}

export interface CinematicPlanVariantDefinition {
  id: string;
  default?: boolean;
  /**
   * Plan-local optical registrations. They are merged with the shared look,
   * so a restrained plan need not carry unused release-only models.
   */
  look?: CameraLookDefinition;
  /**
   * Per-output default-rig deltas for plan-level behavior such as restrained
   * versus breathing neutral coverage.
   */
  defaultRigs?: Readonly<Record<string, Partial<CameraFamilyOutputDefaultRig>>>;
}

export interface CinematicPlanFamilyDefinition {
  plans: readonly CinematicPlanVariantDefinition[];
  look?: CameraLookDefinition;
  /**
   * Named, inspectable framing recipes shared by shots in this family. A
   * recipe can be refined per shot without mutating the source recipe.
   */
  framings?: Readonly<Record<string, CameraSequenceFrame>>;
  outputs: readonly CameraFamilyOutputDefinition[];
  sequences: readonly CameraSequenceDefinition[];
}

interface ResolvedCameraSequenceShotStyle extends Omit<CameraSequenceShotStyle, "frame"> {
  frame?: CameraSequenceFrame;
}

function isFramePreset(input: CameraSequenceFrameInput): input is CameraSequenceFramePreset {
  return typeof input !== "string" && "preset" in input;
}

function resolveFrame(
  input: CameraSequenceFrameInput | undefined,
  framings: Readonly<Record<string, CameraSequenceFrame>>,
): CameraSequenceFrame | undefined {
  if (input === undefined) return undefined;
  if (typeof input !== "string" && !isFramePreset(input)) return input;
  const presetId = typeof input === "string" ? input : input.preset;
  const preset = framings[presetId];
  if (!preset) {
    throw new CinematicAuthoringError(
      "CINEMATIC_FRAMING_UNKNOWN",
      `Unknown framing recipe "${presetId}".`,
    );
  }
  if (typeof input === "string") return preset;
  const { preset: _preset, ...overrides } = input;
  return { ...preset, ...overrides };
}

function mergeFrame(
  base: CameraSequenceFrameInput | undefined,
  next: CameraSequenceFrameInput | undefined,
  framings: Readonly<Record<string, CameraSequenceFrame>>,
): CameraSequenceFrame | undefined {
  const resolvedBase = resolveFrame(base, framings);
  const resolvedNext = resolveFrame(next, framings);
  if (!resolvedBase) return resolvedNext;
  if (!resolvedNext) return resolvedBase;
  return { ...resolvedBase, ...resolvedNext };
}

function mergeStyle(
  base: CameraSequenceShotStyle | undefined,
  next: CameraSequenceShotStyle | undefined,
  framings: Readonly<Record<string, CameraSequenceFrame>>,
): ResolvedCameraSequenceShotStyle {
  return {
    ...(base ?? {}),
    ...(next ?? {}),
    frame: mergeFrame(base?.frame, next?.frame, framings),
  };
}

function shotDefinition(input: CameraSequenceShotInput): CameraSequenceShotDefinition {
  return input instanceof CinematicSequenceShot ? input.toDefinition() : input;
}

function styleDefinition(input: CameraSequenceShotDefinition): CameraSequenceShotStyle {
  const {
    id: _id,
    target: _target,
    duration: _duration,
    at: _at,
    variants: _variants,
    ...style
  } = input;
  return style;
}

export function toCameraFrame(frame: CameraSequenceFrame): import("@tokovo/ir").CameraComposerIR {
  return {
    screenPosition: frame.position ?? [0.5, 0.5],
    targetFill: frame.fill ?? 0.8,
    fillMode: frame.mode ?? "contain",
    ...(frame.padding !== undefined ? { paddingPx: frame.padding } : {}),
    ...(frame.min !== undefined ? { minScale: frame.min } : {}),
    ...(frame.max !== undefined ? { maxScale: frame.max } : {}),
    ...(frame.bias !== undefined ? { bias: frame.bias } : {}),
  };
}

function toCameraTravel(travel: CameraSequenceTravel): CameraTravelIR {
  if (travel.mode === "intentional") {
    if (!travel.reason.trim()) {
      throw new CinematicAuthoringError(
        "CINEMATIC_TRAVEL_REASON_MISSING",
        "Intentional device travel requires a non-empty reason.",
      );
    }
    return travel;
  }
  const mount: CameraMountIR = {
    subject: travel.subject,
    screenPosition: travel.position ?? [0.5, 0.5],
    maxDriftPx: travel.maxDriftPx ?? [54, 72],
  };
  return { mode: "stabilized", mount };
}

function applyMotion(
  shot: CinematicShotBuilder,
  motion: CameraSequenceMotion | null | undefined,
  targetFill: number,
): void {
  if (!motion) return;
  switch (motion.kind) {
    case "cut":
      shot.cut();
      return;
    case "ease":
      shot.ease(motion.duration);
      return;
    case "settle":
      shot.settle(motion.duration);
      return;
    case "whip":
      shot.whip(motion.direction, motion.duration);
      return;
    case "dolly-in":
      shot.dollyIn({
        duration: motion.duration,
        toFill: motion.toFill ?? targetFill,
        ...(motion.amount !== undefined ? { amount: motion.amount } : {}),
      });
      return;
    case "dolly-out":
      shot.dollyOut({
        duration: motion.duration,
        toFill: motion.toFill ?? targetFill,
        ...(motion.amount !== undefined ? { amount: motion.amount } : {}),
      });
      return;
    case "truck-left":
      shot.truckLeft({
        duration: motion.duration,
        ...(motion.amount !== undefined ? { amount: motion.amount } : {}),
      });
      return;
    case "truck-right":
      shot.truckRight({
        duration: motion.duration,
        ...(motion.amount !== undefined ? { amount: motion.amount } : {}),
      });
      return;
    case "pedestal-up":
      shot.pedestalUp({
        duration: motion.duration,
        ...(motion.amount !== undefined ? { amount: motion.amount } : {}),
      });
      return;
    case "pedestal-down":
      shot.pedestalDown({
        duration: motion.duration,
        ...(motion.amount !== undefined ? { amount: motion.amount } : {}),
      });
      return;
    case "pan-left":
      shot.panLeft({
        duration: motion.duration,
        ...(motion.amount !== undefined ? { amount: motion.amount } : {}),
      });
      return;
    case "pan-right":
      shot.panRight({
        duration: motion.duration,
        ...(motion.amount !== undefined ? { amount: motion.amount } : {}),
      });
      return;
    case "tilt-up":
      shot.tiltUp({
        duration: motion.duration,
        ...(motion.amount !== undefined ? { amount: motion.amount } : {}),
      });
      return;
    case "tilt-down":
      shot.tiltDown({
        duration: motion.duration,
        ...(motion.amount !== undefined ? { amount: motion.amount } : {}),
      });
      return;
    case "roll":
      shot.roll({
        duration: motion.duration,
        angleDeg: motion.angleDeg,
        ...(motion.amount !== undefined ? { amount: motion.amount } : {}),
      });
      return;
    case "crane-up":
      shot.craneUp({
        duration: motion.duration,
        toFill: motion.toFill ?? targetFill,
        ...(motion.amount !== undefined ? { amount: motion.amount } : {}),
      });
      return;
    case "crane-down":
      shot.craneDown({
        duration: motion.duration,
        toFill: motion.toFill ?? targetFill,
        ...(motion.amount !== undefined ? { amount: motion.amount } : {}),
      });
      return;
    case "orbit":
      shot.orbit({
        duration: motion.duration,
        yawDeg: motion.yawDeg,
        ...(motion.amount !== undefined ? { amount: motion.amount } : {}),
        ...(motion.pitchDeg !== undefined ? { pitchDeg: motion.pitchDeg } : {}),
        ...(motion.perspectivePx !== undefined ? { perspectivePx: motion.perspectivePx } : {}),
        ...(motion.cropCompensation !== undefined
          ? { cropCompensation: motion.cropCompensation }
          : {}),
      });
      return;
    case "custom":
      shot.motion(motion.profile);
  }
}

function applyStyle(
  builder: CinematicShotBuilder,
  style: ResolvedCameraSequenceShotStyle,
  target: CinematicSubjectRefIR,
): void {
  builder.target(target);
  const frame = toCameraFrame(style.frame ?? {});
  builder.frame(frame);

  if (style.guard) {
    builder.guard(style.guard.subject, {
      ...(style.guard.padding !== undefined ? { paddingPx: style.guard.padding } : {}),
      ...(style.guard.position !== undefined ? { screenPosition: style.guard.position } : {}),
    });
  }
  if (style.travel) {
    if (style.travel.mode === "stabilized") {
      builder.mount(style.travel.subject, {
        screenPosition: style.travel.position ?? [0.5, 0.5],
        maxDriftPx: style.travel.maxDriftPx ?? [54, 72],
      });
    } else {
      builder.allowDeviceTravel(style.travel.reason);
    }
  }
  if (style.missing && style.missing !== "error") {
    if (style.missing === "skip") builder.skipWhenMissing();
    else builder.fallback(style.missing);
  }
  if (style.lens) builder.lens(style.lens);
  if (style.modifiers?.length) builder.modifiers(...style.modifiers);
  if (style.filters?.length) builder.filters(...style.filters);
  if (style.blend) {
    builder.blend(style.blend.duration, style.blend.curve);
  } else if (style.blend === null) {
    builder.noBlend();
  }
  if (style.trajectory) builder.trajectory(style.trajectory);
  if (style.rotationDeg !== null && style.rotationDeg !== undefined) {
    builder.rotation(style.rotationDeg);
  }
  if (style.opacity !== null && style.opacity !== undefined) {
    builder.opacity(style.opacity);
  }
  if (style.priority !== undefined) builder.priority(style.priority);
  if (style.source === "automatic") builder.automatic();
  applyMotion(builder, style.motion, frame.targetFill);
  if (style.direction) builder.direct(style.direction);
}

function applyLook(plan: CinematicPlanBuilder, look: CameraLookDefinition | undefined): void {
  for (const [id, lens] of Object.entries(look?.lenses ?? {})) {
    const { model, version = 1, ...parameters } = lens;
    plan.lens(id, model, parameters, version);
  }
  for (const [id, modifier] of Object.entries(look?.modifiers ?? {})) {
    const { model, version = 1, ...parameters } = modifier;
    plan.modifier(id, model, parameters, version);
  }
  for (const [id, filter] of Object.entries(look?.filters ?? {})) {
    const { model, version = 1, ...parameters } = filter;
    plan.filter(id, model, parameters, version);
  }
}

function mergeLook(
  shared: CameraLookDefinition | undefined,
  variant: CameraLookDefinition | undefined,
): CameraLookDefinition | undefined {
  if (!shared) return variant;
  if (!variant) return shared;
  return {
    lenses: { ...shared.lenses, ...variant.lenses },
    modifiers: { ...shared.modifiers, ...variant.modifiers },
    filters: { ...shared.filters, ...variant.filters },
  };
}

function applyOutput(
  plan: CinematicPlanBuilder,
  output: CameraFamilyOutputDefinition,
  override: Partial<CameraFamilyOutputDefaultRig> | undefined,
): void {
  const defaultRig = {
    ...output.defaultRig,
    ...override,
    frame: {
      ...output.defaultRig.frame,
      ...override?.frame,
    },
  };
  const defaultRigId = defaultRig.id ?? `${output.id}.default`;
  plan
    .output(output.id, {
      viewport: output.viewport,
      defaultRigId,
      compositionProfileId: output.compositionProfileId,
      ...(output.coveragePolicy ? { coveragePolicy: output.coveragePolicy } : {}),
      ...(output.editorialInsets ? { editorialInsets: output.editorialInsets } : {}),
      ...(output.sourceStageNodeId ? { sourceStageNodeId: output.sourceStageNodeId } : {}),
      ...(output.zIndex !== undefined ? { zIndex: output.zIndex } : {}),
      ...(output.clipRadiusPx !== undefined ? { clipRadiusPx: output.clipRadiusPx } : {}),
      ...(output.shadow ? { shadow: output.shadow } : {}),
    })
    .rig(defaultRigId, {
      outputId: output.id,
      subject: defaultRig.subject,
      composer: toCameraFrame(defaultRig.frame),
      travel: toCameraTravel(output.travel),
      ...(defaultRig.framingGuard ? { framingGuard: defaultRig.framingGuard } : {}),
      ...(defaultRig.tracking ? { tracking: defaultRig.tracking } : {}),
      ...(defaultRig.bakedTrajectory ? { bakedTrajectory: defaultRig.bakedTrajectory } : {}),
      ...(defaultRig.rotationDeg !== undefined ? { rotationDeg: defaultRig.rotationDeg } : {}),
      ...(defaultRig.opacity !== undefined ? { opacity: defaultRig.opacity } : {}),
      ...(defaultRig.lensId ? { lensId: defaultRig.lensId } : {}),
      ...(defaultRig.modifierIds ? { modifierIds: defaultRig.modifierIds } : {}),
      ...(defaultRig.filterIds ? { filterIds: defaultRig.filterIds } : {}),
      ...(defaultRig.motion ? { motion: defaultRig.motion } : {}),
    });
}

function applySequence(
  plan: CinematicPlanBuilder,
  sequence: CameraSequenceDefinition,
  planId: string,
  framings: Readonly<Record<string, CameraSequenceFrame>>,
  fps: number,
  outputTravel: CameraSequenceTravel,
): void {
  let cursor = parseTimeToFrames(sequence.start ?? 0, fps);
  for (const input of sequence.shots) {
    const shot = shotDefinition(input);
    const start = shot.at === undefined ? cursor : parseTimeToFrames(shot.at, fps);
    const duration = parseDurationToFrames(shot.duration, fps);
    if (duration <= 0) {
      throw new CinematicAuthoringError(
        "CINEMATIC_SEQUENCE_DURATION_INVALID",
        `Shot "${shot.id}" must have a positive duration.`,
      );
    }
    const end = start + duration;
    cursor = end;

    const variant = shot.variants?.[planId];
    if (variant === false) continue;
    const style = mergeStyle(
      mergeStyle(
        mergeStyle({ travel: outputTravel }, sequence.defaults, framings),
        styleDefinition(shot),
        framings,
      ),
      variant,
      framings,
    );
    plan.shot(shot.id, sequence.outputId, start, end, (builder) => {
      applyStyle(builder, style, shot.target);
    });
  }

  if (sequence.end !== undefined) {
    const expectedEnd = parseTimeToFrames(sequence.end, fps);
    if (cursor !== expectedEnd) {
      throw new CinematicAuthoringError(
        "CINEMATIC_SEQUENCE_END_MISMATCH",
        `Output "${sequence.outputId}" ends at frame ${cursor}; expected ${expectedEnd}.`,
      );
    }
  }
}

export function validatePlanFamilyDefinition(definition: CinematicPlanFamilyDefinition): void {
  if (definition.plans.length === 0) {
    throw new CinematicAuthoringError(
      "CINEMATIC_PLAN_FAMILY_EMPTY",
      "A plan family requires at least one plan.",
    );
  }
  if (definition.outputs.length === 0) {
    throw new CinematicAuthoringError(
      "CINEMATIC_PLAN_FAMILY_OUTPUTS_EMPTY",
      "A plan family requires at least one output.",
    );
  }
  if (definition.plans.filter((plan) => plan.default).length > 1) {
    throw new CinematicAuthoringError(
      "CINEMATIC_PLAN_FAMILY_DEFAULT_AMBIGUOUS",
      "A plan family can declare at most one default plan.",
    );
  }
  const planIds = new Set<string>();
  for (const plan of definition.plans) {
    if (planIds.has(plan.id)) {
      throw new CinematicAuthoringError(
        "CINEMATIC_PLAN_FAMILY_DUPLICATE",
        `Duplicate plan "${plan.id}".`,
      );
    }
    planIds.add(plan.id);
  }
  const outputIds = new Set<string>();
  for (const output of definition.outputs) {
    if (outputIds.has(output.id)) {
      throw new CinematicAuthoringError(
        "CINEMATIC_PLAN_FAMILY_DUPLICATE",
        `Duplicate output "${output.id}".`,
      );
    }
    outputIds.add(output.id);
  }
  for (const sequence of definition.sequences) {
    if (!outputIds.has(sequence.outputId)) {
      throw new CinematicAuthoringError(
        "CINEMATIC_SEQUENCE_OUTPUT_UNKNOWN",
        `Sequence references undeclared output "${sequence.outputId}".`,
      );
    }
    for (const input of sequence.shots) {
      const shot = shotDefinition(input);
      for (const variantId of Object.keys(shot.variants ?? {})) {
        if (!planIds.has(variantId)) {
          throw new CinematicAuthoringError(
            "CINEMATIC_VARIANT_UNKNOWN",
            `Shot "${shot.id}" references undeclared plan "${variantId}".`,
          );
        }
      }
      mergeStyle(sequence.defaults, styleDefinition(shot), definition.framings ?? {});
      for (const variant of Object.values(shot.variants ?? {})) {
        if (variant) {
          mergeStyle(sequence.defaults, variant, definition.framings ?? {});
        }
      }
    }
  }
  for (const plan of definition.plans) {
    for (const outputId of Object.keys(plan.defaultRigs ?? {})) {
      if (!outputIds.has(outputId)) {
        throw new CinematicAuthoringError(
          "CINEMATIC_PLAN_DEFAULT_RIG_OUTPUT_UNKNOWN",
          `Plan "${plan.id}" overrides undeclared output "${outputId}".`,
        );
      }
    }
  }
}

export function applyPlanFamilyVariant(
  plan: CinematicPlanBuilder,
  definition: CinematicPlanFamilyDefinition,
  planId: string,
  fps: number,
): void {
  const variant = definition.plans.find((candidate) => candidate.id === planId);
  if (!variant) {
    throw new CinematicAuthoringError(
      "CINEMATIC_PLAN_FAMILY_VARIANT_UNKNOWN",
      `Plan family does not declare plan "${planId}".`,
    );
  }
  for (const output of definition.outputs) {
    applyOutput(plan, output, variant.defaultRigs?.[output.id]);
  }
  applyLook(plan, mergeLook(definition.look, variant.look));
  for (const sequence of definition.sequences) {
    const output = definition.outputs.find((candidate) => candidate.id === sequence.outputId);
    if (!output) {
      throw new CinematicAuthoringError(
        "CINEMATIC_SEQUENCE_OUTPUT_UNKNOWN",
        `Sequence references undeclared output "${sequence.outputId}".`,
      );
    }
    applySequence(plan, sequence, planId, definition.framings ?? {}, fps, output.travel);
  }
}
