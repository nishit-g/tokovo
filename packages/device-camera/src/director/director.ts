import { CameraContextBuilder } from "./context";
import { BehaviorRegistry } from "./behaviors";
import type {
  BehaviorConfig,
  BehaviorFunction,
  CameraDirectorOptions,
  CameraDirectorResult,
  CameraEffect,
  CameraEvent,
} from "./types";

export class CameraDirector {
  private readonly _registry: BehaviorRegistry;
  private readonly _fps: number;
  private readonly _debug: boolean;

  constructor(options: CameraDirectorOptions = {}) {
    this._registry = new BehaviorRegistry();
    this._fps = options.fps || 30;
    this._debug = options.debug || false;

    if (options.behaviors) {
      Object.entries(options.behaviors).forEach(([eventType, behavior]) => {
        if (typeof behavior === "string") {
          if (!this._registry.has(behavior)) {
            throw new Error(`Unknown behavior preset: "${behavior}"`);
          }
        } else {
          this._registry.register(`custom_${eventType}`, behavior);
        }
      });
    }
  }

  registerBehavior(name: string, behavior: BehaviorFunction): void {
    this._registry.register(name, behavior);
  }

  choreograph(
    events: readonly CameraEvent[],
    behaviorConfig?: BehaviorConfig,
  ): CameraDirectorResult {
    if (events.length === 0) {
      return {
        effects: [],
        eventCount: 0,
        behaviorStats: new Map(),
      };
    }

    const context = new CameraContextBuilder(events, this._fps);
    const effects: CameraEffect[] = [];
    const behaviorStats = new Map<string, number>();

    for (const event of events) {
      const behaviorName =
        behaviorConfig?.[event.type] || this._getDefaultBehavior(event.type);

      if (!behaviorName) {
        if (this._debug) {
          console.log(
            `[CameraDirector] No behavior configured for event type: ${event.type}`,
          );
        }
        continue;
      }

      const behavior = this._registry.resolve(behaviorName);
      const result = behavior(event, context);

      if (result) {
        const eventEffects = Array.isArray(result) ? result : [result];
        effects.push(...eventEffects);

        const statKey =
          typeof behaviorName === "string" ? behaviorName : "custom";
        behaviorStats.set(statKey, (behaviorStats.get(statKey) || 0) + 1);

        if (this._debug) {
          console.log(
            `[CameraDirector] Event ${event.id} (${event.type}) → ${eventEffects.length} effects via "${statKey}"`,
          );
        }
      }
    }

    const sortedEffects = this._sortEffects(effects);
    const deduped = this._deduplicateEffects(sortedEffects);

    if (this._debug) {
      console.log(
        `[CameraDirector] Total: ${events.length} events → ${deduped.length} effects (${effects.length - deduped.length} duplicates removed)`,
      );
    }

    return {
      effects: deduped,
      eventCount: events.length,
      behaviorStats,
    };
  }

  private _getDefaultBehavior(eventType: string): string | null {
    const defaults: Record<string, string> = {
      MESSAGE_RECEIVED: "fluid-tennis-energetic",
      MESSAGE_SENT: "fluid-tennis-energetic",
      NOTIFICATION_SHOWN: "interrupt-focus",
      TYPING_START: "drift-anticipation",
    };

    return defaults[eventType] || null;
  }

  private _sortEffects(effects: CameraEffect[]): CameraEffect[] {
    return [...effects].sort((a, b) => {
      if (a.timestamp !== b.timestamp) {
        return a.timestamp - b.timestamp;
      }

      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;

      return priorityB - priorityA;
    });
  }

  private _deduplicateEffects(effects: CameraEffect[]): CameraEffect[] {
    const seen = new Set<string>();
    const deduped: CameraEffect[] = [];

    for (const effect of effects) {
      const key = `${effect.timestamp}-${effect.type}-${JSON.stringify(
        effect.params,
      )}`;

      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(effect);
      }
    }

    return deduped;
  }
}
