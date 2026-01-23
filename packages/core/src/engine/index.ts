// Config and Logger
export { EngineConfig } from "./config";
export { EngineLogger } from "./logger";

// Registry
export { ReducerRegistry } from "./registry";
export type { DeviceReducer, AppReducer, FeatureReducer } from "./registry";

// Event Handler Registry
export {
  EventHandlerRegistry,
  registerEventHandler,
  defineEventHandler,
} from "./event-handlers";
export type {
  EventHandler,
  EventHandlerContext,
  EventHandlerDefinition,
} from "./event-handlers";

// Middleware
export {
  MiddlewareRegistry,
  useMiddleware,
  defineMiddleware,
  builtInMiddlewares,
} from "./middleware";
export type {
  Middleware,
  MiddlewareContext,
  MiddlewareDefinition,
  NextFunction,
} from "./middleware";

// Lifecycle
export { LifecycleManager, defineLifecycle } from "./lifecycle";
export type { PluginLifecycleHooks, LifecycleContext } from "./lifecycle";

// Handlers
export * from "./handlers";

// Engine Facade - unified API for engine initialization and control
import { EngineConfig } from "./config";
import { EventHandlerRegistry } from "./event-handlers";
import { MiddlewareRegistry, builtInMiddlewares } from "./middleware";
import { LifecycleManager } from "./lifecycle";
import { configureEngine, resetConfig, TokovoConfig } from "../config";

export interface EngineInitOptions {
  config?: Partial<typeof TokovoConfig>;
  enableBuiltInMiddlewares?: boolean;
  debug?: boolean;
}

class TokovoEngineFacade {
  private initialized = false;
  private initializing = false;

  async init(options: EngineInitOptions = {}): Promise<void> {
    if (this.initialized || this.initializing) return;
    this.initializing = true;

    try {
      if (options.config) {
        configureEngine(options.config);
      }

      if (options.enableBuiltInMiddlewares !== false) {
        MiddlewareRegistry.use(builtInMiddlewares.errorRecovery);
        if (options.debug) {
          MiddlewareRegistry.use(builtInMiddlewares.logging);
        }
      }

      await LifecycleManager.initializeAll();
      this.initialized = true;
    } finally {
      this.initializing = false;
    }
  }

  destroy(): void {
    if (!this.initialized) return;

    LifecycleManager.destroyAll();
    EventHandlerRegistry.clear();
    MiddlewareRegistry.clear();
    resetConfig();
    this.initialized = false;
  }

  get isInitialized(): boolean {
    return this.initialized;
  }

  get eventHandlers(): typeof EventHandlerRegistry {
    return EventHandlerRegistry;
  }

  get middleware(): typeof MiddlewareRegistry {
    return MiddlewareRegistry;
  }

  get lifecycle(): typeof LifecycleManager {
    return LifecycleManager;
  }
}

export const Engine = new TokovoEngineFacade();
