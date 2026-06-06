import { createScopedLogger } from "../logger/index.js";
import type { EngineRegistries } from "./registries.js";
import { defineMiddleware } from "./middleware.js";
import { defineLifecycle } from "./lifecycle.js";
import { EngineConfig } from "./config.js";

const log = createScopedLogger("engine").withContext({
  event: "engine.observability",
});

function now(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}

function getEventType(event: Record<string, unknown>): string | undefined {
  return typeof event.type === "string" ? event.type : undefined;
}

export function registerRuntimeObservability(registries: EngineRegistries): void {
  log.debug("Registering runtime observability hooks", {
    logEvents: EngineConfig.logEvents,
    logPerformance: EngineConfig.logPerformance,
    logAudio: EngineConfig.logAudio,
    timingThresholdMs: EngineConfig.timingThresholdMs,
  });

  registries.middleware.use(
    defineMiddleware(
      "tokovo-observability",
      (event, _draft, ctx, next) => {
        const eventType = getEventType(event as Record<string, unknown>);
        if (EngineConfig.logEvents) {
          log.debug(`Processing ${event.kind}${eventType ? `:${eventType}` : ""}`, {
            event: "engine.event",
            kind: event.kind,
            type: eventType,
            frame: ctx.frame,
            eventIndex: ctx.eventIndex,
            mode: ctx.mode,
          });
        }

        if (!EngineConfig.logPerformance) {
          next();
          return;
        }

        const startedAt = now();
        next();
        const durationMs = now() - startedAt;

        if (durationMs >= EngineConfig.timingThresholdMs) {
          log.debug(
            `Processed ${event.kind}${eventType ? `:${eventType}` : ""} in ${durationMs.toFixed(2)}ms`,
            {
              event: "engine.event.perf",
              kind: event.kind,
              type: eventType,
              frame: ctx.frame,
              eventIndex: ctx.eventIndex,
              durationMs,
              mode: ctx.mode,
            },
          );
        }
      },
      { order: -200 },
    ),
  );

  registries.lifecycle.register(
    "tokovo-observability",
    defineLifecycle({
      onBeforeReplay(ctx) {
        if (!EngineConfig.logEvents) {
          return;
        }

        log.debug("Starting replay", {
          event: "engine.replay.start",
          frame: ctx.frame,
          mode: ctx.mode,
        });
      },

      onAfterReplay(_state, ctx) {
        if (!EngineConfig.logEvents) {
          return;
        }

        log.debug("Completed replay", {
          event: "engine.replay.done",
          frame: ctx.frame,
          mode: ctx.mode,
        });
      },

      onError(error, event) {
        const eventType = event ? getEventType(event as Record<string, unknown>) : undefined;
        log.error("Replay hook reported an error", error, {
          event: "engine.replay.error",
          kind: event?.kind,
          type: eventType,
          frame: event?.at,
        });
      },
    }),
  );

  log.debug("Runtime observability hooks registered");
}
