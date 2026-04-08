import type {
  TokovoPluginContract,
  PluginViews,
  PluginReducer,
  EngineRegistries,
} from "@tokovo/core";
import { PluginManagerClass } from "./plugin.js";
import { createScopedLogger } from "@tokovo/core";

// Define types locally that aren't exported from core
export interface PluginLifecycleHooks {
  onInit?: () => void;
  onDestroy?: () => void;
}

export interface EventHandlerDefinition {
  kind: string;
  handler: (draft: unknown, event: unknown) => void;
}

export interface MiddlewareDefinition {
  id?: string;
  handler: (event: unknown, draft: unknown, ctx: unknown, next: () => void) => void;
}

const log = createScopedLogger("plugin-builder");

export interface PluginBuilderConfig {
  id: string;
  displayName: string;
  themeColor?: string;
  icon?: string;
}

export interface BuiltPlugin {
  contract: TokovoPluginContract<string>;
  lifecycle?: PluginLifecycleHooks;
  eventHandlers: EventHandlerDefinition[];
  middlewares: MiddlewareDefinition[];
}

export interface PluginBuilder {
  withReducer(
    reducer: PluginReducer<string>,
    eventKinds?: readonly string[],
  ): PluginBuilder;
  withViews(views: PluginViews): PluginBuilder;
  withLifecycle(hooks: PluginLifecycleHooks): PluginBuilder;
  withEventHandlers(handlers: EventHandlerDefinition[]): PluginBuilder;
  withMiddleware(middleware: MiddlewareDefinition[]): PluginBuilder;
  withAssets(assets: {
    sounds?: Record<string, string>;
    designWidth?: number;
  }): PluginBuilder;
  build(): BuiltPlugin;
  register(pm: PluginManagerClass, registries: EngineRegistries): () => void;
}

export function createPluginBuilder(
  config: PluginBuilderConfig,
): PluginBuilder {
  let reducer: PluginReducer<string> | undefined;
  let eventKinds: readonly string[] | undefined;
  let views: PluginViews | undefined;
  let lifecycleHooks: PluginLifecycleHooks | undefined;
  let eventHandlers: EventHandlerDefinition[] = [];
  let middlewares: MiddlewareDefinition[] = [];
  let assets: { sounds?: Record<string, string>; designWidth?: number } = {};

  const builder: PluginBuilder = {
    withReducer(r, kinds) {
      reducer = r;
      eventKinds = kinds;
      return builder;
    },

    withViews(v) {
      views = v;
      return builder;
    },

    withLifecycle(hooks) {
      lifecycleHooks = hooks;
      return builder;
    },

    withEventHandlers(handlers) {
      eventHandlers = handlers;
      return builder;
    },

    withMiddleware(mw) {
      middlewares = mw;
      return builder;
    },

    withAssets(a) {
      assets = a;
      return builder;
    },

    build(): BuiltPlugin {
      const contract = {
        id: config.id,
        displayName: config.displayName,
        version: "1.0.0",
        themeColor: config.themeColor,
        icon: config.icon,
        reducer,
        eventKinds,
        views,
        assets,
      } as unknown as TokovoPluginContract<string>;

      return {
        contract,
        lifecycle: lifecycleHooks,
        eventHandlers,
        middlewares,
      };
    },

    register(pm, registries): () => void {
      const built = builder.build();
      const unsubscribers: Array<() => void> = [];

      unsubscribers.push(pm.register(built.contract));

      if (built.lifecycle) {
        unsubscribers.push(
          registries.lifecycle.register(config.id, built.lifecycle),
        );
      }

      if (built.eventHandlers.length > 0) {
        unsubscribers.push(
          registries.eventHandlers.registerMany(built.eventHandlers),
        );
      }

      for (const mw of built.middlewares) {
        unsubscribers.push(registries.middleware.use(mw as any));
      }

      log.info(`Plugin registered: ${config.displayName} (${config.id})`);

      return () => {
        unsubscribers.forEach((unsub) => unsub());
        log.debug(`Plugin unregistered: ${config.id}`);
      };
    },
  };

  return builder;
}

export function definePlugin(config: PluginBuilderConfig): PluginBuilder {
  return createPluginBuilder(config);
}
