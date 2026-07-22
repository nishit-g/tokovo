import type {
  CameraComposerIR,
  CameraFilterIR,
  CameraFramingGuardIR,
  CameraLensIR,
  CameraMissingSubjectPolicyIR,
  CameraModifierIR,
  CameraMovementIntentIR,
  CameraMotionProfileIR,
  CameraOutputIR,
  CameraRigIR,
  CameraShotIR,
  CinematicSubjectRefIR,
  EpisodeCinematicsIR,
  JsonObject,
  StageNodeIR,
  StageProgramIR,
} from "@tokovo/ir";
import { CameraPlanSchema, StageProgramSchema } from "@tokovo/ir";
import { parseDurationToFrames, parseTimeToFrames } from "./utils/time.js";

type Time = string | number;

export class CinematicAuthoringError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "CinematicAuthoringError";
    this.code = code;
  }
}

function requireIdentifier(value: string, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new CinematicAuthoringError(
      "CINEMATIC_ID_INVALID",
      `${label} must be a non-empty string.`,
    );
  }
  return value;
}

function claimIdentifier(category: string, id: string, ids: Set<string>): void {
  requireIdentifier(id, `${category} id`);
  if (ids.has(id)) {
    throw new CinematicAuthoringError(
      "CINEMATIC_ID_DUPLICATE",
      `Duplicate ${category} id "${id}".`,
    );
  }
  ids.add(id);
}

function invalidContract(
  code: string,
  label: string,
  issues: readonly { path: PropertyKey[]; message: string }[],
): never {
  throw new CinematicAuthoringError(
    code,
    `${label} is invalid: ${issues
      .map((issue) => `${issue.path.join(".") || label}: ${issue.message}`)
      .join(" | ")}`,
  );
}

export const cameraSubject = {
  device(deviceId: string, subjectId: string): CinematicSubjectRefIR {
    return {
      kind: "device",
      deviceId: requireIdentifier(deviceId, "Device id"),
      subjectId: requireIdentifier(subjectId, "Subject id"),
    };
  },
  semantic(deviceId: string, appId: string, subjectId: string): CinematicSubjectRefIR {
    return {
      kind: "semantic",
      deviceId: requireIdentifier(deviceId, "Device id"),
      appId: requireIdentifier(appId, "App id"),
      subjectId: requireIdentifier(subjectId, "Subject id"),
    };
  },
  entity(
    deviceId: string,
    appId: string,
    entityType: string,
    entityId: string,
    region: string,
  ): CinematicSubjectRefIR {
    return {
      kind: "entity",
      deviceId: requireIdentifier(deviceId, "Device id"),
      appId: requireIdentifier(appId, "App id"),
      entityType: requireIdentifier(entityType, "Entity type"),
      entityId: requireIdentifier(entityId, "Entity id"),
      region: requireIdentifier(region, "Entity region"),
    };
  },
  group(...members: CinematicSubjectRefIR[]): CinematicSubjectRefIR {
    if (members.length === 0) {
      throw new CinematicAuthoringError(
        "CINEMATIC_SUBJECT_GROUP_EMPTY",
        "A cinematic subject group cannot be empty.",
      );
    }
    return { kind: "group", members };
  },
};

export interface CinematicStageDevice {
  deviceId: string;
  nodeId?: string;
  x?: number;
  y?: number;
  width: number;
  height: number;
  zIndex?: number;
}

export interface CinematicProgramOptions {
  fps: number;
  duration: Time;
  stage:
    | StageProgramIR
    | {
        width: number;
        height: number;
        devices: readonly CinematicStageDevice[];
      };
}

export interface CameraOutputOptions {
  viewport: CameraOutputIR["viewport"];
  defaultRigId: string;
  sourceStageNodeId?: string;
  zIndex?: number;
  clipRadiusPx?: number;
  shadow?: CameraOutputIR["shadow"];
}

export interface CameraRigOptions {
  outputId: string;
  subject: CinematicSubjectRefIR;
  composer: CameraComposerIR;
  framingGuard?: CameraFramingGuardIR;
  rotationDeg?: number;
  opacity?: number;
  lensId?: string;
  modifierIds?: readonly string[];
  filterIds?: readonly string[];
  motion?: CameraMotionProfileIR;
}

export interface CameraShotFrameOptions extends Partial<CameraComposerIR> {
  screenPosition?: readonly [number, number];
}

export interface CameraMovementOptions {
  duration: Time;
  amount?: number;
}

export interface CameraDollyOptions extends CameraMovementOptions {
  toFill: number;
}

export interface CameraOrbitOptions extends CameraMovementOptions {
  yawDeg: number;
  pitchDeg?: number;
  perspectivePx?: number;
  cropCompensation?: number;
}

function stageProgram(input: CinematicProgramOptions["stage"]): StageProgramIR {
  if ("version" in input) {
    const parsed = StageProgramSchema.safeParse(input);
    if (!parsed.success) {
      invalidContract("CINEMATIC_STAGE_INVALID", "StageProgram", parsed.error.issues);
    }
    return parsed.data;
  }
  if (
    !Number.isFinite(input.width) ||
    input.width <= 0 ||
    !Number.isFinite(input.height) ||
    input.height <= 0
  ) {
    throw new CinematicAuthoringError(
      "CINEMATIC_STAGE_INVALID",
      "Stage width and height must be positive finite numbers.",
    );
  }
  if (input.devices.length === 0) {
    throw new CinematicAuthoringError(
      "CINEMATIC_STAGE_EMPTY",
      "Cinematic stage requires at least one device.",
    );
  }
  const rootNodeId = "stage.root";
  const identity = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 } as const;
  const deviceIds = new Set<string>();
  const nodeIds = new Set<string>([rootNodeId]);
  for (const device of input.devices) {
    claimIdentifier("stage device", device.deviceId, deviceIds);
    const nodeId = device.nodeId ?? `device.${device.deviceId}`;
    claimIdentifier("stage node", nodeId, nodeIds);
  }
  const nodes: StageNodeIR[] = [
    {
      id: rootNodeId,
      source: { kind: "group" },
      localBounds: { x: 0, y: 0, width: input.width, height: input.height },
      initialTransform: identity,
      zIndex: 0,
    },
    ...input.devices.map(
      (device): StageNodeIR => ({
        id: device.nodeId ?? `device.${device.deviceId}`,
        parentId: rootNodeId,
        source: { kind: "device", deviceId: device.deviceId },
        localBounds: {
          x: device.x ?? 0,
          y: device.y ?? 0,
          width: device.width,
          height: device.height,
        },
        initialTransform: identity,
        zIndex: device.zIndex ?? 10,
      }),
    ),
  ];
  const parsed = StageProgramSchema.safeParse({
    version: 1,
    rootNodeId,
    nodes,
    transformKeyframes: [],
  });
  if (!parsed.success) {
    invalidContract("CINEMATIC_STAGE_INVALID", "Generated StageProgram", parsed.error.issues);
  }
  return parsed.data;
}

function movement(
  fps: number,
  kind: CameraMovementIntentIR["kind"],
  options: CameraMovementOptions,
  extra: Omit<CameraMovementIntentIR, "kind" | "amount"> = {},
): CameraMotionProfileIR {
  return {
    type: "minimum-jerk",
    durationFrames: parseDurationToFrames(options.duration, fps),
    intent: {
      kind,
      ...(options.amount !== undefined ? { amount: options.amount } : {}),
      ...extra,
    },
  };
}

export class CinematicShotBuilder {
  readonly #fps: number;
  readonly #id: string;
  readonly #outputId: string;
  readonly #registerLens: (lens: CameraLensIR) => void;
  #subject?: CinematicSubjectRefIR;
  #composer: CameraComposerIR = {
    screenPosition: [0.5, 0.5],
    targetFill: 0.8,
    fillMode: "contain",
    paddingPx: 24,
  };
  #framingGuard?: CameraFramingGuardIR;
  #rotationDeg?: number;
  #opacity?: number;
  #lensId?: string;
  #modifierIds: string[] = [];
  #filterIds: string[] = [];
  #motion: CameraMotionProfileIR;
  #priority = 10;
  #missingSubjectPolicy: CameraMissingSubjectPolicyIR = { type: "error" };
  #source: CameraShotIR["source"] = "authored";

  constructor(input: {
    fps: number;
    id: string;
    outputId: string;
    defaultDurationFrames: number;
    registerLens: (lens: CameraLensIR) => void;
  }) {
    this.#fps = input.fps;
    this.#id = input.id;
    this.#outputId = input.outputId;
    this.#registerLens = input.registerLens;
    this.#motion = {
      type: "minimum-jerk",
      durationFrames: Math.max(1, input.defaultDurationFrames),
    };
  }

  target(subject: CinematicSubjectRefIR): this {
    this.#subject = subject;
    return this;
  }

  frame(options: CameraShotFrameOptions): this {
    this.#composer = { ...this.#composer, ...options };
    return this;
  }

  guard(subject: CinematicSubjectRefIR, options: Omit<CameraFramingGuardIR, "subject"> = {}): this {
    this.#framingGuard = { subject, ...options };
    return this;
  }

  lens(lensId: string): this {
    this.#lensId = lensId;
    return this;
  }

  modifiers(...modifierIds: string[]): this {
    this.#modifierIds = [...modifierIds];
    return this;
  }

  filters(...filterIds: string[]): this {
    this.#filterIds = [...filterIds];
    return this;
  }

  rotation(rotationDeg: number): this {
    this.#rotationDeg = rotationDeg;
    return this;
  }

  opacity(opacity: number): this {
    this.#opacity = opacity;
    return this;
  }

  priority(priority: number): this {
    this.#priority = priority;
    return this;
  }

  fallback(subject: CinematicSubjectRefIR): this {
    this.#missingSubjectPolicy = { type: "use-explicit", fallback: subject };
    return this;
  }

  skipWhenMissing(): this {
    this.#missingSubjectPolicy = { type: "skip-shot" };
    return this;
  }

  automatic(): this {
    this.#source = "automatic";
    return this;
  }

  cut(): this {
    this.#motion = { type: "cut" };
    return this;
  }

  settle(duration: Time): this {
    this.#motion = {
      type: "critically-damped",
      responseFrames: parseDurationToFrames(duration, this.#fps),
    };
    return this;
  }

  whip(direction: "left" | "right" | "up" | "down", duration: Time): this {
    this.#motion = {
      type: "whip",
      durationFrames: parseDurationToFrames(duration, this.#fps),
      direction,
    };
    return this;
  }

  dollyIn(options: CameraDollyOptions): this {
    this.#composer = { ...this.#composer, targetFill: options.toFill };
    this.#motion = movement(this.#fps, "dolly-in", options);
    return this;
  }

  dollyOut(options: CameraDollyOptions): this {
    this.#composer = { ...this.#composer, targetFill: options.toFill };
    this.#motion = movement(this.#fps, "dolly-out", options);
    return this;
  }

  truckLeft(options: CameraMovementOptions): this {
    const amount = options.amount ?? 0.08;
    this.#composer = {
      ...this.#composer,
      screenPosition: [this.#composer.screenPosition[0] + amount, this.#composer.screenPosition[1]],
    };
    this.#motion = movement(this.#fps, "truck-left", { ...options, amount });
    return this;
  }

  truckRight(options: CameraMovementOptions): this {
    const amount = options.amount ?? 0.08;
    this.#composer = {
      ...this.#composer,
      screenPosition: [this.#composer.screenPosition[0] - amount, this.#composer.screenPosition[1]],
    };
    this.#motion = movement(this.#fps, "truck-right", { ...options, amount });
    return this;
  }

  pedestalUp(options: CameraMovementOptions): this {
    const amount = options.amount ?? 0.08;
    this.#composer = {
      ...this.#composer,
      screenPosition: [this.#composer.screenPosition[0], this.#composer.screenPosition[1] + amount],
    };
    this.#motion = movement(this.#fps, "pedestal-up", { ...options, amount });
    return this;
  }

  pedestalDown(options: CameraMovementOptions): this {
    const amount = options.amount ?? 0.08;
    this.#composer = {
      ...this.#composer,
      screenPosition: [this.#composer.screenPosition[0], this.#composer.screenPosition[1] - amount],
    };
    this.#motion = movement(this.#fps, "pedestal-down", { ...options, amount });
    return this;
  }

  panLeft(options: CameraMovementOptions): this {
    const amount = (options.amount ?? 0.08) * 0.55;
    this.#composer = {
      ...this.#composer,
      screenPosition: [this.#composer.screenPosition[0] + amount, this.#composer.screenPosition[1]],
    };
    this.#motion = movement(this.#fps, "pan-left", { ...options, amount });
    return this;
  }

  panRight(options: CameraMovementOptions): this {
    const amount = (options.amount ?? 0.08) * 0.55;
    this.#composer = {
      ...this.#composer,
      screenPosition: [this.#composer.screenPosition[0] - amount, this.#composer.screenPosition[1]],
    };
    this.#motion = movement(this.#fps, "pan-right", { ...options, amount });
    return this;
  }

  tiltUp(options: CameraMovementOptions): this {
    const amount = (options.amount ?? 0.08) * 0.55;
    this.#composer = {
      ...this.#composer,
      screenPosition: [this.#composer.screenPosition[0], this.#composer.screenPosition[1] + amount],
    };
    this.#motion = movement(this.#fps, "tilt-up", { ...options, amount });
    return this;
  }

  tiltDown(options: CameraMovementOptions): this {
    const amount = (options.amount ?? 0.08) * 0.55;
    this.#composer = {
      ...this.#composer,
      screenPosition: [this.#composer.screenPosition[0], this.#composer.screenPosition[1] - amount],
    };
    this.#motion = movement(this.#fps, "tilt-down", { ...options, amount });
    return this;
  }

  roll(options: CameraMovementOptions & { angleDeg: number }): this {
    this.#rotationDeg = options.angleDeg;
    this.#motion = movement(this.#fps, "roll", options);
    return this;
  }

  craneUp(options: CameraDollyOptions): this {
    this.pedestalUp(options);
    this.#composer = { ...this.#composer, targetFill: options.toFill };
    this.#motion = movement(this.#fps, "crane-up", options);
    return this;
  }

  craneDown(options: CameraDollyOptions): this {
    this.pedestalDown(options);
    this.#composer = { ...this.#composer, targetFill: options.toFill };
    this.#motion = movement(this.#fps, "crane-down", options);
    return this;
  }

  orbit(options: CameraOrbitOptions): this {
    const lensId = `${this.#id}.orbit`;
    this.#registerLens({
      id: lensId,
      modelId: "perspective-tilt",
      modelVersion: 1,
      parameters: {
        tiltXDeg: options.pitchDeg ?? 0,
        tiltYDeg: options.yawDeg,
        perspectivePx: options.perspectivePx ?? 1800,
        cropCompensation: options.cropCompensation ?? 1.035,
      },
    });
    this.#lensId = lensId;
    this.#motion = movement(this.#fps, "orbit", options, {
      yawDeg: options.yawDeg,
      ...(options.pitchDeg !== undefined ? { pitchDeg: options.pitchDeg } : {}),
    });
    return this;
  }

  build(input: { startFrame: number; endFrame: number; declarationOrder: number }): {
    rig: CameraRigIR;
    shot: CameraShotIR;
  } {
    if (!this.#subject) {
      throw new CinematicAuthoringError(
        "CINEMATIC_SHOT_TARGET_MISSING",
        `Camera shot "${this.#id}" is missing a target.`,
      );
    }
    const rigId = `${this.#id}.rig`;
    const durationFrames = input.endFrame - input.startFrame;
    const blendDuration =
      this.#motion.type === "cut"
        ? undefined
        : Math.min(
            durationFrames,
            this.#motion.type === "critically-damped"
              ? this.#motion.responseFrames
              : this.#motion.durationFrames,
          );
    return {
      rig: {
        id: rigId,
        outputId: this.#outputId,
        subject: this.#subject,
        composer: this.#composer,
        ...(this.#framingGuard ? { framingGuard: this.#framingGuard } : {}),
        ...(this.#rotationDeg !== undefined ? { rotationDeg: this.#rotationDeg } : {}),
        ...(this.#opacity !== undefined ? { opacity: this.#opacity } : {}),
        ...(this.#lensId ? { lensId: this.#lensId } : {}),
        ...(this.#modifierIds.length ? { modifierIds: this.#modifierIds } : {}),
        ...(this.#filterIds.length ? { filterIds: this.#filterIds } : {}),
        motion: this.#motion,
      },
      shot: {
        id: this.#id,
        outputId: this.#outputId,
        startFrame: input.startFrame,
        endFrame: input.endFrame,
        rigId,
        priority: this.#priority,
        declarationOrder: input.declarationOrder,
        ...(blendDuration
          ? { blendIn: { durationFrames: blendDuration, curve: "minimum-jerk" as const } }
          : {}),
        missingSubjectPolicy: this.#missingSubjectPolicy,
        source: this.#source,
      },
    };
  }
}

export class CinematicPlanBuilder {
  readonly #fps: number;
  readonly #durationInFrames: number;
  readonly #id: string;
  readonly #outputs: CameraOutputIR[] = [];
  readonly #rigs: CameraRigIR[] = [];
  readonly #shots: CameraShotIR[] = [];
  readonly #lenses: CameraLensIR[] = [];
  readonly #modifiers: CameraModifierIR[] = [];
  readonly #filters: CameraFilterIR[] = [];
  readonly #outputIds = new Set<string>();
  readonly #rigIds = new Set<string>();
  readonly #shotIds = new Set<string>();
  readonly #lensIds = new Set<string>();
  readonly #modifierIds = new Set<string>();
  readonly #filterIds = new Set<string>();
  #declarationOrder = 0;

  constructor(id: string, fps: number, durationInFrames: number) {
    this.#id = requireIdentifier(id, "CameraPlan id");
    this.#fps = fps;
    this.#durationInFrames = durationInFrames;
  }

  output(id: string, options: CameraOutputOptions): this {
    claimIdentifier("camera output", id, this.#outputIds);
    this.#outputs.push({
      id,
      viewport: options.viewport,
      sourceStageNodeId: options.sourceStageNodeId ?? "stage.root",
      zIndex: options.zIndex ?? 0,
      ...(options.clipRadiusPx !== undefined ? { clipRadiusPx: options.clipRadiusPx } : {}),
      ...(options.shadow ? { shadow: options.shadow } : {}),
      defaultRigId: options.defaultRigId,
    });
    return this;
  }

  lens(id: string, modelId: string, parameters: JsonObject, modelVersion = 1): this {
    this.registerLens({ id, modelId, modelVersion, parameters });
    return this;
  }

  private registerLens(lens: CameraLensIR): void {
    claimIdentifier("camera lens", lens.id, this.#lensIds);
    this.#lenses.push(lens);
  }

  modifier(id: string, modelId: string, parameters: JsonObject, modelVersion = 1): this {
    claimIdentifier("camera modifier", id, this.#modifierIds);
    this.#modifiers.push({ id, modelId, modelVersion, parameters });
    return this;
  }

  filter(id: string, modelId: string, parameters: JsonObject, modelVersion = 1): this {
    claimIdentifier("camera filter", id, this.#filterIds);
    this.#filters.push({ id, modelId, modelVersion, parameters });
    return this;
  }

  rig(id: string, options: CameraRigOptions): this {
    claimIdentifier("camera rig", id, this.#rigIds);
    this.#rigs.push({ id, ...options });
    return this;
  }

  shot(
    id: string,
    outputId: string,
    start: Time,
    end: Time,
    configure: (shot: CinematicShotBuilder) => void,
  ): this {
    claimIdentifier("camera shot", id, this.#shotIds);
    const startFrame = parseTimeToFrames(start, this.#fps);
    const endFrame = parseTimeToFrames(end, this.#fps);
    if (endFrame <= startFrame) {
      throw new CinematicAuthoringError(
        "CINEMATIC_SHOT_INTERVAL_INVALID",
        `Camera shot "${id}" must end after it starts.`,
      );
    }
    if (startFrame < 0 || endFrame > this.#durationInFrames) {
      throw new CinematicAuthoringError(
        "CINEMATIC_SHOT_INTERVAL_INVALID",
        `Camera shot "${id}" must stay within [0, ${this.#durationInFrames}).`,
      );
    }
    const builder = new CinematicShotBuilder({
      fps: this.#fps,
      id,
      outputId,
      defaultDurationFrames: Math.min(endFrame - startFrame, Math.round(this.#fps * 0.5)),
      registerLens: (lens) => this.registerLens(lens),
    });
    configure(builder);
    const built = builder.build({
      startFrame,
      endFrame,
      declarationOrder: this.#declarationOrder++,
    });
    claimIdentifier("camera rig", built.rig.id, this.#rigIds);
    this.#rigs.push(built.rig);
    this.#shots.push(built.shot);
    return this;
  }

  build(): import("@tokovo/ir").CameraPlanIR {
    if (this.#outputs.length === 0) {
      throw new CinematicAuthoringError(
        "CINEMATIC_OUTPUTS_EMPTY",
        `CameraPlan "${this.#id}" requires at least one output.`,
      );
    }
    const rigsById = new Map(this.#rigs.map((rig) => [rig.id, rig] as const));
    for (const output of this.#outputs) {
      const rig = rigsById.get(output.defaultRigId);
      if (!rig || rig.outputId !== output.id) {
        throw new CinematicAuthoringError(
          "CINEMATIC_DEFAULT_RIG_INVALID",
          `Output "${output.id}" requires default rig "${output.defaultRigId}" owned by that output.`,
        );
      }
    }
    for (const rig of this.#rigs) {
      if (!this.#outputIds.has(rig.outputId)) {
        throw new CinematicAuthoringError(
          "CINEMATIC_RIG_OUTPUT_MISSING",
          `Rig "${rig.id}" references missing output "${rig.outputId}".`,
        );
      }
      if (rig.lensId && !this.#lensIds.has(rig.lensId)) {
        throw new CinematicAuthoringError(
          "CINEMATIC_RIG_LENS_MISSING",
          `Rig "${rig.id}" references missing lens "${rig.lensId}".`,
        );
      }
      for (const modifierId of rig.modifierIds ?? []) {
        if (!this.#modifierIds.has(modifierId)) {
          throw new CinematicAuthoringError(
            "CINEMATIC_RIG_MODIFIER_MISSING",
            `Rig "${rig.id}" references missing modifier "${modifierId}".`,
          );
        }
      }
      for (const filterId of rig.filterIds ?? []) {
        if (!this.#filterIds.has(filterId)) {
          throw new CinematicAuthoringError(
            "CINEMATIC_RIG_FILTER_MISSING",
            `Rig "${rig.id}" references missing filter "${filterId}".`,
          );
        }
      }
    }
    for (const shot of this.#shots) {
      if (!this.#outputIds.has(shot.outputId) || !rigsById.has(shot.rigId)) {
        throw new CinematicAuthoringError(
          "CINEMATIC_SHOT_REFERENCE_MISSING",
          `Shot "${shot.id}" references an undeclared output or rig.`,
        );
      }
    }
    const plan = {
      version: 1,
      id: this.#id,
      fps: this.#fps,
      durationInFrames: this.#durationInFrames,
      outputs: this.#outputs,
      rigs: this.#rigs,
      shots: this.#shots,
      lenses: this.#lenses,
      modifiers: this.#modifiers,
      filters: this.#filters,
    } as const;
    const parsed = CameraPlanSchema.safeParse(plan);
    if (!parsed.success) {
      invalidContract(
        "CINEMATIC_CAMERA_PLAN_INVALID",
        `CameraPlan "${this.#id}"`,
        parsed.error.issues,
      );
    }
    return parsed.data;
  }
}

export class CinematicProgramBuilder {
  readonly #fps: number;
  readonly #durationInFrames: number;
  readonly #stageProgram: StageProgramIR;
  readonly #plans: import("@tokovo/ir").CameraPlanIR[] = [];
  readonly #planIds = new Set<string>();
  #defaultPlanId?: string;

  constructor(options: CinematicProgramOptions) {
    if (!Number.isInteger(options.fps) || options.fps <= 0) {
      throw new CinematicAuthoringError(
        "CINEMATIC_FPS_INVALID",
        "Cinematic fps must be a positive integer.",
      );
    }
    this.#fps = options.fps;
    this.#durationInFrames = parseTimeToFrames(options.duration, options.fps);
    if (!Number.isInteger(this.#durationInFrames) || this.#durationInFrames <= 0) {
      throw new CinematicAuthoringError(
        "CINEMATIC_DURATION_INVALID",
        "Cinematic duration must resolve to a positive frame count.",
      );
    }
    this.#stageProgram = stageProgram(options.stage);
  }

  plan(
    id: string,
    configure: (plan: CinematicPlanBuilder) => void,
    options: { default?: boolean } = {},
  ): this {
    claimIdentifier("CameraPlan", id, this.#planIds);
    const builder = new CinematicPlanBuilder(id, this.#fps, this.#durationInFrames);
    configure(builder);
    this.#plans.push(builder.build());
    if (options.default || !this.#defaultPlanId) this.#defaultPlanId = id;
    return this;
  }

  defaultPlan(id: string): this {
    this.#defaultPlanId = requireIdentifier(id, "Default CameraPlan id");
    return this;
  }

  build(): EpisodeCinematicsIR {
    if (this.#plans.length === 0) {
      throw new CinematicAuthoringError(
        "CINEMATIC_CAMERA_PLANS_EMPTY",
        "Cinematics requires at least one camera plan.",
      );
    }
    if (!this.#defaultPlanId || !this.#plans.some((plan) => plan.id === this.#defaultPlanId)) {
      throw new CinematicAuthoringError(
        "CINEMATIC_DEFAULT_PLAN_MISSING",
        `Default camera plan "${this.#defaultPlanId ?? ""}" is not declared.`,
      );
    }
    return {
      stageProgram: this.#stageProgram,
      cameraPlans: this.#plans,
      defaultCameraPlanId: this.#defaultPlanId,
    };
  }
}

export function cinematicProgram(
  options: CinematicProgramOptions,
  configure: (program: CinematicProgramBuilder) => void,
): EpisodeCinematicsIR {
  const builder = new CinematicProgramBuilder(options);
  configure(builder);
  return builder.build();
}
