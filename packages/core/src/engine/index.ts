// Config and Logger
export { EngineConfig } from "./config";
export { EngineLogger } from "./logger";

// Registry
export { createReducerRegistry } from "./registry";
export type {
  DeviceReducer,
  AppReducer,
  FeatureReducer,
  ReducerRegistryClass,
} from "./registry";

// Event Handler Registry
export { registerEventHandler, defineEventHandler, createEventHandlerRegistry } from "./event-handlers";
export type {
  EventHandler,
  EventHandlerContext,
  EventHandlerDefinition,
  EventHandlerRegistryClass,
} from "./event-handlers";

// Middleware
export { useMiddleware, defineMiddleware, builtInMiddlewares, createMiddlewareRegistry } from "./middleware";
export type {
  Middleware,
  MiddlewareContext,
  MiddlewareDefinition,
  NextFunction,
  MiddlewareRegistryClass,
} from "./middleware";

// Lifecycle
export { defineLifecycle, createLifecycleManager } from "./lifecycle";
export type {
  PluginLifecycleHooks,
  LifecycleContext,
  LifecycleManagerClass,
} from "./lifecycle";

export { createEngineRegistries, type EngineRegistries } from "./registries";

// Handlers
export * from "./handlers";

// Engine Facade - unified API for engine initialization and control
import { builtInMiddlewares } from "./middleware";
import type { EngineRegistries } from "./registries";
import { configureEngine, resetConfig, TokovoConfig } from "../config";

export interface EngineInitOptions {
  config?: Partial<typeof TokovoConfig>;
  enableBuiltInMiddlewares?: boolean;
  debug?: boolean;
}

class TokovoEngineFacade {
  private initialized = false;
  private initializing = false;

  constructor(private registries: EngineRegistries) {}

  async init(options: EngineInitOptions = {}): Promise<void> {
    if (this.initialized || this.initializing) return;
    this.initializing = true;

    try {
      if (options.config) {
        configureEngine(options.config);
      }

      if (options.enableBuiltInMiddlewares !== false) {
        this.registries.middleware.use(builtInMiddlewares.errorRecovery);
        if (options.debug) {
          this.registries.middleware.use(builtInMiddlewares.logging);
        }
      }

      await this.registries.lifecycle.initializeAll();
      this.initialized = true;
    } finally {
      this.initializing = false;
    }
  }

  destroy(): void {
    if (!this.initialized) return;

    this.registries.lifecycle.destroyAll();
    this.registries.eventHandlers.clear();
    this.registries.middleware.clear();
    resetConfig();
    this.initialized = false;
  }

  get isInitialized(): boolean {
    return this.initialized;
  }

  get eventHandlers(): EngineRegistries["eventHandlers"] {
    return this.registries.eventHandlers;
  }

  get middleware(): EngineRegistries["middleware"] {
    return this.registries.middleware;
  }

  get lifecycle(): EngineRegistries["lifecycle"] {
    return this.registries.lifecycle;
  }
}

export function createEngine(registries: EngineRegistries): TokovoEngineFacade {
  return new TokovoEngineFacade(registries);
}
