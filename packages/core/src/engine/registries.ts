import {
  createReducerRegistry,
  type ReducerRegistryClass,
} from "./registry";
import {
  createEventHandlerRegistry,
  type EventHandlerRegistryClass,
} from "./event-handlers";
import {
  createMiddlewareRegistry,
  type MiddlewareRegistryClass,
} from "./middleware";
import {
  createLifecycleManager,
  type LifecycleManagerClass,
} from "./lifecycle";

export interface EngineRegistries {
  reducers: ReducerRegistryClass;
  eventHandlers: EventHandlerRegistryClass;
  middleware: MiddlewareRegistryClass;
  lifecycle: LifecycleManagerClass;
}

export function createEngineRegistries(
  overrides: Partial<EngineRegistries> = {},
): EngineRegistries {
  return {
    reducers: overrides.reducers ?? createReducerRegistry(),
    eventHandlers: overrides.eventHandlers ?? createEventHandlerRegistry(),
    middleware: overrides.middleware ?? createMiddlewareRegistry(),
    lifecycle: overrides.lifecycle ?? createLifecycleManager(),
  };
}
