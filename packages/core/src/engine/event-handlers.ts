import type { TimelineEvent, WorldState } from "../types";
import { createScopedLogger } from "../logger";

const log = createScopedLogger("event-handlers");

export interface EventHandlerContext {
  frame: number;
  eventIndex: number;
  mode: "preview" | "render";
  deviceId?: string;
}

export type EventHandler = (
  draft: WorldState,
  event: TimelineEvent,
  ctx: EventHandlerContext,
) => void;

export interface EventHandlerDefinition {
  kind: string;
  handler: EventHandler;
  priority?: number;
}

class EventHandlerRegistryClass {
  private handlers = new Map<string, EventHandler[]>();
  private kindPriorities = new Map<string, number>();

  register(definition: EventHandlerDefinition): () => void {
    const { kind, handler, priority = 0 } = definition;

    if (!this.handlers.has(kind)) {
      this.handlers.set(kind, []);
    }

    const handlers = this.handlers.get(kind)!;
    handlers.push(handler);

    if (priority > (this.kindPriorities.get(kind) || 0)) {
      this.kindPriorities.set(kind, priority);
    }

    handlers.sort((_a, _b) => {
      const aPriority = this.kindPriorities.get(kind) || 0;
      const bPriority = this.kindPriorities.get(kind) || 0;
      return bPriority - aPriority;
    });

    log.debug(`Registered handler for event kind: ${kind}`);

    return () => {
      const idx = handlers.indexOf(handler);
      if (idx > -1) {
        handlers.splice(idx, 1);
      }
    };
  }

  registerMany(definitions: EventHandlerDefinition[]): () => void {
    const unsubscribers = definitions.map((def) => this.register(def));
    return () => unsubscribers.forEach((unsub) => unsub());
  }

  handle(
    draft: WorldState,
    event: TimelineEvent,
    ctx: EventHandlerContext,
  ): boolean {
    const kind = event.kind as string;
    const handlers = this.handlers.get(kind);

    if (!handlers || handlers.length === 0) {
      return false;
    }

    for (const handler of handlers) {
      try {
        handler(draft, event, ctx);
      } catch (error) {
        log.error(`Handler for "${kind}" threw an error`, error, {
          eventKind: kind,
          frame: ctx.frame,
        });
      }
    }

    return true;
  }

  hasHandler(kind: string): boolean {
    const handlers = this.handlers.get(kind);
    return !!handlers && handlers.length > 0;
  }

  getRegisteredKinds(): string[] {
    return Array.from(this.handlers.keys());
  }

  clear(): void {
    this.handlers.clear();
    this.kindPriorities.clear();
  }
}

export const EventHandlerRegistry = new EventHandlerRegistryClass();

export function registerEventHandler(
  kind: string,
  handler: EventHandler,
  priority?: number,
): () => void {
  return EventHandlerRegistry.register({ kind, handler, priority });
}

export function defineEventHandler(
  kind: string,
  handler: EventHandler,
  options?: { priority?: number },
): EventHandlerDefinition {
  return {
    kind,
    handler,
    priority: options?.priority,
  };
}
