import type { WorldState } from "@tokovo/core";
import type { WhatsAppConversation, WhatsAppMessage } from "../types";
import type { AnyWhatsAppEvent } from "../schemas";

export type HandlerContext = {
  draft: WorldState;
  event: AnyWhatsAppEvent;
  conversation: WhatsAppConversation;
  addMessage: (msg: WhatsAppMessage) => void;
  getMessageById: (id: string) => WhatsAppMessage | undefined;
  generateTimestamp: (at: number) => string;
};

export type EventHandler<T extends AnyWhatsAppEvent = AnyWhatsAppEvent> = (
  ctx: HandlerContext,
  event: T,
) => void;

export type HandlerMap = Record<string, EventHandler>;

export type MutableHandlerRegistry = {
  registerHandler<T extends AnyWhatsAppEvent>(
    kind: T["kind"],
    handler: EventHandler<T>,
  ): void;
};

export type HandlerRegistry = MutableHandlerRegistry & {
  getHandler(kind: string): EventHandler | undefined;
  getAllHandlers(): Readonly<HandlerMap>;
};

export function createWhatsAppHandlerRegistry(): HandlerRegistry {
  const handlers: HandlerMap = {};

  return {
    registerHandler<T extends AnyWhatsAppEvent>(
      kind: T["kind"],
      handler: EventHandler<T>,
    ): void {
      handlers[kind] = handler as EventHandler;
    },
    getHandler(kind: string): EventHandler | undefined {
      return handlers[kind];
    },
    getAllHandlers(): Readonly<HandlerMap> {
      return handlers;
    },
  };
}

const GLOBAL_HANDLER_REGISTRY_KEY = Symbol.for(
  "tokovo.apps-whatsapp.handler-registry",
);

function getGlobalRegistryStore(): { registry: HandlerRegistry } {
  const tokovoGlobal = globalThis as typeof globalThis & {
    [GLOBAL_HANDLER_REGISTRY_KEY]?: { registry: HandlerRegistry };
  };

  if (!tokovoGlobal[GLOBAL_HANDLER_REGISTRY_KEY]) {
    tokovoGlobal[GLOBAL_HANDLER_REGISTRY_KEY] = {
      registry: createWhatsAppHandlerRegistry(),
    };
  }

  return tokovoGlobal[GLOBAL_HANDLER_REGISTRY_KEY];
}

export function getGlobalWhatsAppHandlerRegistry(): HandlerRegistry {
  return getGlobalRegistryStore().registry;
}

export function registerHandler<T extends AnyWhatsAppEvent>(
  kind: T["kind"],
  handler: EventHandler<T>,
): void {
  getGlobalWhatsAppHandlerRegistry().registerHandler(kind, handler);
}

export function getHandler(kind: string): EventHandler | undefined {
  return getGlobalWhatsAppHandlerRegistry().getHandler(kind);
}

export function getAllHandlers(): Readonly<HandlerMap> {
  return getGlobalWhatsAppHandlerRegistry().getAllHandlers();
}
