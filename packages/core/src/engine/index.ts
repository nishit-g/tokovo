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
