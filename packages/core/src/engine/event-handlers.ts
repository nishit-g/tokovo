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

interface RegisteredHandler {
  handler: EventHandler;
  priority: number;
}

export class EventHandlerRegistryClass {
  private handlers = new Map<string, RegisteredHandler[]>();

  register(definition: EventHandlerDefinition): () => void {
    const { kind, handler, priority = 0 } = definition;

    let handlers = this.handlers.get(kind);
    if (!handlers) {
      handlers = [];
      this.handlers.set(kind, handlers);
    }
    const registered: RegisteredHandler = { handler, priority };
    handlers.push(registered);

    handlers.sort((a, b) => b.priority - a.priority);

    log.debug(`Registered handler for event kind: ${kind}`);

    return () => {
      const idx = handlers.findIndex((h) => h.handler === handler);
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

    for (const { handler } of handlers) {
      handler(draft, event, ctx);
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
  }
}

export function createEventHandlerRegistry(): EventHandlerRegistryClass {
  return new EventHandlerRegistryClass();
}

export function registerEventHandler(
  registry: EventHandlerRegistryClass,
  kind: string,
  handler: EventHandler,
  priority?: number,
): () => void {
  return registry.register({ kind, handler, priority });
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
