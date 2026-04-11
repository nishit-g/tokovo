// Config and Logger
export { EngineConfig } from "./config.js";
export { registerRuntimeObservability } from "./observability.js";

// Registry
export { createReducerRegistry } from "./registry.js";
export type {
  DeviceReducer,
  AppReducer,
  FeatureReducer,
  ReducerRegistryClass,
} from "./registry.js";

// Event Handler Registry
export { registerEventHandler, defineEventHandler, createEventHandlerRegistry } from "./event-handlers.js";
export type {
  EventHandler,
  EventHandlerContext,
  EventHandlerDefinition,
  EventHandlerRegistryClass,
} from "./event-handlers.js";

// Middleware
export { useMiddleware, defineMiddleware, builtInMiddlewares, createMiddlewareRegistry } from "./middleware.js";
export type {
  Middleware,
  MiddlewareContext,
  MiddlewareDefinition,
  NextFunction,
  MiddlewareRegistryClass,
} from "./middleware.js";

// Lifecycle
export { defineLifecycle, createLifecycleManager } from "./lifecycle.js";
export type {
  PluginLifecycleHooks,
  LifecycleContext,
  LifecycleManagerClass,
} from "./lifecycle.js";

export { createEngineRegistries, type EngineRegistries } from "./registries.js";

// Handlers
export * from "./handlers/index.js";

// Engine Facade - unified API for engine initialization and control
import { builtInMiddlewares } from "./middleware.js";
import type { EngineRegistries } from "./registries.js";
import { createConfig, TokovoConfig } from "../config/index.js";

export interface EngineInitOptions {
  config?: Partial<typeof TokovoConfig>;
  enableBuiltInMiddlewares?: boolean;
  debug?: boolean;
}

class TokovoEngineFacade {
  private initialized = false;
  private initializing = false;
  private config = TokovoConfig;

  constructor(private registries: EngineRegistries) {}

  async init(options: EngineInitOptions = {}): Promise<void> {
    if (this.initialized || this.initializing) return;
    this.initializing = true;

    try {
      if (options.config) {
        this.config = createConfig(options.config);
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
    this.initialized = false;
  }

  getConfig(): typeof TokovoConfig {
    return this.config;
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
