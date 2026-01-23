import { createPluginBuilder } from "../builder";
import {
  defineEventHandler,
  type EventHandlerContext,
} from "../../engine/event-handlers";
import {
  defineMiddleware,
  type MiddlewareContext,
  type NextFunction,
} from "../../engine/middleware";
import { defineLifecycle } from "../../engine/lifecycle";
import type { TimelineEvent, WorldState } from "../../types";

const analyticsState = {
  eventCounts: new Map<string, number>(),
  totalEvents: 0,
  lastEventTime: 0,
};

export const analyticsPlugin = createPluginBuilder({
  id: "com.tokovo.analytics",
  displayName: "Analytics",
  themeColor: "#6366f1",
})
  .withLifecycle(
    defineLifecycle({
      onInit: () => {
        analyticsState.eventCounts.clear();
        analyticsState.totalEvents = 0;
      },
      onDestroy: () => {
        const report = Array.from(analyticsState.eventCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);
        console.log("[Analytics] Top events:", report);
      },
      onBeforeReplay: () => {
        analyticsState.lastEventTime = performance.now();
      },
      onAfterReplay: () => {
        const duration = performance.now() - analyticsState.lastEventTime;
        if (duration > 16) {
          console.warn(`[Analytics] Slow replay: ${duration.toFixed(2)}ms`);
        }
      },
    }),
  )
  .withMiddleware([
    defineMiddleware(
      "analytics-counter",
      (
        event: TimelineEvent,
        _draft: WorldState,
        _ctx: MiddlewareContext,
        next: NextFunction,
      ) => {
        const kind = event.kind as string;
        const count = analyticsState.eventCounts.get(kind) || 0;
        analyticsState.eventCounts.set(kind, count + 1);
        analyticsState.totalEvents++;
        next();
      },
      { order: -200 },
    ),
  ])
  .withEventHandlers([
    defineEventHandler(
      "ANALYTICS_MARKER",
      (draft: WorldState, event: TimelineEvent, _ctx: EventHandlerContext) => {
        const marker = (event as { marker?: string }).marker;
        if (marker) {
          console.log(`[Analytics] Marker: ${marker} at frame ${event.at}`);
        }
      },
    ),
  ]);

export function getAnalyticsStats() {
  return {
    eventCounts: Object.fromEntries(analyticsState.eventCounts),
    totalEvents: analyticsState.totalEvents,
  };
}
