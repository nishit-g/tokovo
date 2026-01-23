import type { TimelineEvent, WorldState } from "../types";
import { createScopedLogger } from "../logger";

const log = createScopedLogger("middleware");

export interface MiddlewareContext {
  frame: number;
  mode: "preview" | "render";
  eventIndex: number;
}

export type NextFunction = () => void;

export type Middleware = (
  event: TimelineEvent,
  draft: WorldState,
  ctx: MiddlewareContext,
  next: NextFunction,
) => void;

export interface MiddlewareDefinition {
  name: string;
  middleware: Middleware;
  order?: number;
}

class MiddlewareRegistryClass {
  private middlewares: MiddlewareDefinition[] = [];

  use(definition: MiddlewareDefinition): () => void {
    this.middlewares.push(definition);
    this.middlewares.sort((a, b) => (a.order || 0) - (b.order || 0));

    log.debug(`Registered middleware: ${definition.name}`);

    return () => {
      const idx = this.middlewares.findIndex((m) => m.name === definition.name);
      if (idx > -1) {
        this.middlewares.splice(idx, 1);
      }
    };
  }

  execute(
    event: TimelineEvent,
    draft: WorldState,
    ctx: MiddlewareContext,
    coreHandler: () => void,
  ): void {
    let index = 0;

    const executeNext = (): void => {
      if (index < this.middlewares.length) {
        const current = this.middlewares[index];
        index++;
        try {
          current.middleware(event, draft, ctx, executeNext);
        } catch (error) {
          log.error(`Middleware ${current.name} failed`, error);
          executeNext();
        }
      } else {
        coreHandler();
      }
    };

    executeNext();
  }

  getMiddlewares(): readonly MiddlewareDefinition[] {
    return this.middlewares;
  }

  clear(): void {
    this.middlewares = [];
  }
}

export const MiddlewareRegistry = new MiddlewareRegistryClass();

export function useMiddleware(
  name: string,
  middleware: Middleware,
  order?: number,
): () => void {
  return MiddlewareRegistry.use({ name, middleware, order });
}

export function defineMiddleware(
  name: string,
  middleware: Middleware,
  options?: { order?: number },
): MiddlewareDefinition {
  return {
    name,
    middleware,
    order: options?.order,
  };
}

export const builtInMiddlewares = {
  logging: defineMiddleware(
    "logging",
    (event, _draft, ctx, next) => {
      const start = performance.now();
      next();
      const duration = performance.now() - start;
      if (duration > 1) {
        log.debug(
          `Event ${event.kind} at frame ${ctx.frame} took ${duration.toFixed(2)}ms`,
        );
      }
    },
    { order: -100 },
  ),

  errorRecovery: defineMiddleware(
    "errorRecovery",
    (event, draft, ctx, next) => {
      try {
        next();
      } catch (error) {
        log.error(`Event handler failed, attempting recovery`, error, {
          kind: event.kind,
          frame: ctx.frame,
        });
      }
    },
    { order: -50 },
  ),
};
