import type {
  BehaviorFunction,
  BehaviorPreset,
  CameraContext,
  CameraEffect,
  CameraEvent,
  MessageEventPayload,
  NotificationEventPayload,
} from "./types";

export interface FluidTennisConfig {
  readonly baseScale: number;
  readonly shakeIntensity: number;
  readonly holdDuration: number;
  readonly panDistance: number;
  readonly spring: "smooth" | "bouncy" | "dramatic";
}

export const FLUID_TENNIS_CASUAL: FluidTennisConfig = {
  baseScale: 1.1,
  shakeIntensity: 2,
  holdDuration: 0.8,
  panDistance: 30,
  spring: "smooth",
};

export const FLUID_TENNIS_ENERGETIC: FluidTennisConfig = {
  baseScale: 1.2,
  shakeIntensity: 3,
  holdDuration: 0.5,
  panDistance: 40,
  spring: "bouncy",
};

export const FLUID_TENNIS_DRAMATIC: FluidTennisConfig = {
  baseScale: 1.25,
  shakeIntensity: 6,
  holdDuration: 0.6,
  panDistance: 50,
  spring: "dramatic",
};

function createFluidTennisBehavior(
  config: FluidTennisConfig,
): BehaviorFunction {
  return (event: CameraEvent, context: CameraContext): CameraEffect[] => {
    const payload = event.payload as MessageEventPayload;
    const effects: CameraEffect[] = [];

    if (context.isTurnStart(event)) {
      effects.push({
        type: "focus",
        timestamp: event.timestamp,
        params: {
          anchor: payload.anchor,
          scale: config.baseScale,
          duration: 0.5,
          easing: "easeOut",
        },
      });

      effects.push({
        type: "shake",
        timestamp: event.timestamp,
        params: {
          intensityX: config.shakeIntensity,
          intensityY: config.shakeIntensity * 0.7,
          frequency: 15,
          decay: 0.9,
          duration: 0.4,
        },
      });
    } else {
      const burstIndex = context.getBurstIndex(event);

      effects.push({
        type: "animate",
        timestamp: event.timestamp,
        params: {
          y: -(config.panDistance * burstIndex),
          duration: 0.3,
          easing: "easeOut",
        },
      });

      effects.push({
        type: "shake",
        timestamp: event.timestamp,
        params: {
          intensityX: config.shakeIntensity * 0.5,
          intensityY: config.shakeIntensity * 0.35,
          frequency: 12,
          decay: 0.9,
          duration: 0.3,
        },
      });
    }

    const nextEvent = context.getNextEvent(event);
    const shouldReset =
      nextEvent &&
      context.getSender(nextEvent) !== context.getSender(event) &&
      nextEvent.timestamp - event.timestamp > context.fps * 0.5;

    if (shouldReset) {
      effects.push({
        type: "reset",
        timestamp: event.timestamp + context.fps * config.holdDuration,
        params: {
          duration: 0.8,
          easing: "easeOut",
        },
      });
    }

    return effects;
  };
}

function createInterruptFocusBehavior(): BehaviorFunction {
  return (event: CameraEvent, context: CameraContext): CameraEffect[] => {
    const payload = event.payload as NotificationEventPayload;
    const effects: CameraEffect[] = [];

    effects.push({
      type: "focus",
      timestamp: event.timestamp,
      params: {
        anchor: payload.anchor,
        scale: 1.3,
        duration: 0.5,
        easing: "easeOut",
      },
      priority: 100,
    });

    const dismissTime =
      event.timestamp + (payload.duration || 1.5) * context.fps;

    effects.push({
      type: "reset",
      timestamp: dismissTime,
      params: {
        duration: 0.5,
        easing: "easeOut",
      },
      priority: 100,
    });

    return effects;
  };
}

function createDriftAnticipationBehavior(): BehaviorFunction {
  return (event: CameraEvent, _context: CameraContext): CameraEffect[] => {
    return [
      {
        type: "animate",
        timestamp: event.timestamp,
        params: {
          y: -50,
          scale: 1.05,
          duration: 1.0,
          easing: "easeOut",
        },
      },
    ];
  };
}

function createStaticBehavior(): BehaviorFunction {
  return () => null;
}

export const DEFAULT_BEHAVIORS: Record<string, BehaviorFunction> = {
  "fluid-tennis-casual": createFluidTennisBehavior(FLUID_TENNIS_CASUAL),
  "fluid-tennis-energetic": createFluidTennisBehavior(FLUID_TENNIS_ENERGETIC),
  "fluid-tennis-dramatic": createFluidTennisBehavior(FLUID_TENNIS_DRAMATIC),
  "interrupt-focus": createInterruptFocusBehavior(),
  "drift-anticipation": createDriftAnticipationBehavior(),
  static: createStaticBehavior(),
};

export class BehaviorRegistry {
  private readonly _behaviors: Map<string, BehaviorFunction>;

  constructor() {
    this._behaviors = new Map(Object.entries(DEFAULT_BEHAVIORS));
  }

  register(name: string, behavior: BehaviorFunction): void {
    this._behaviors.set(name, behavior);
  }

  get(name: string): BehaviorFunction | undefined {
    return this._behaviors.get(name);
  }

  resolve(preset: BehaviorPreset | BehaviorFunction): BehaviorFunction {
    if (typeof preset === "function") {
      return preset;
    }

    const behavior = this._behaviors.get(preset);
    if (!behavior) {
      throw new Error(
        `Unknown behavior preset: "${preset}". Available: ${Array.from(
          this._behaviors.keys(),
        ).join(", ")}`,
      );
    }

    return behavior;
  }

  has(name: string): boolean {
    return this._behaviors.has(name);
  }

  list(): string[] {
    return Array.from(this._behaviors.keys());
  }
}
