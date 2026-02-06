import type { TimelineEvent, WorldState } from "../types.js";
import { createScopedLogger } from "../logger/index.js";

const log = createScopedLogger("middleware");

export interface MiddlewareContext {
  frame: number;
  mode: "preview" | "render";
  eventIndex: number;
  gracefulDegradation?: boolean;
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

export class MiddlewareRegistryClass {
  private middlewares: MiddlewareDefinition[] = [];
  private needsSort = false;

  use(definition: MiddlewareDefinition): () => void {
    this.middlewares.push(definition);
    this.needsSort = true;

    log.debug(`Registered middleware: ${definition.name}`);

    return () => {
      const idx = this.middlewares.findIndex((m) => m.name === definition.name);
      if (idx > -1) {
        this.middlewares.splice(idx, 1);
      }
    };
  }

  private ensureSorted(): void {
    if (this.needsSort) {
      this.middlewares.sort((a, b) => (a.order || 0) - (b.order || 0));
      this.needsSort = false;
    }
  }

  execute(
    event: TimelineEvent,
    draft: WorldState,
    ctx: MiddlewareContext,
    coreHandler: () => void,
  ): void {
    this.ensureSorted();

    if (this.middlewares.length === 0) {
      coreHandler();
      return;
    }

    let index = 0;

    const executeNext = (): void => {
      if (index < this.middlewares.length) {
        const current = this.middlewares[index];
        index++;
        try {
          current.middleware(event, draft, ctx, executeNext);
        } catch (error) {
          log.error(`Middleware ${current.name} failed`, error);
          if (ctx.mode === "render" && !ctx.gracefulDegradation) {
            throw error;
          }
          executeNext();
        }
      } else {
        coreHandler();
      }
    };

    executeNext();
  }

  getMiddlewares(): readonly MiddlewareDefinition[] {
    this.ensureSorted();
    return this.middlewares;
  }

  clear(): void {
    this.middlewares = [];
    this.needsSort = false;
  }
}

export function createMiddlewareRegistry(): MiddlewareRegistryClass {
  return new MiddlewareRegistryClass();
}

export function useMiddleware(
  registry: MiddlewareRegistryClass,
  name: string,
  middleware: Middleware,
  order?: number,
): () => void {
  return registry.use({ name, middleware, order });
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
        if (ctx.mode === "render" && !ctx.gracefulDegradation) {
          throw error;
        }
      }
    },
    { order: -50 },
  ),
};
