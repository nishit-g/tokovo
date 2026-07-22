import type { WorldState } from "@tokovo/core";
import type {
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppState,
} from "../types/index.js";
import type { AnyWhatsAppEvent } from "../schemas/index.js";

export type HandlerContext = {
  draft: WorldState;
  event: AnyWhatsAppEvent;
  state: WhatsAppState;
  conversation: WhatsAppConversation;
  addMessage: (msg: WhatsAppMessage) => void;
  getMessageById: (id: string) => WhatsAppMessage | undefined;
  requireMessageById: (id: string, operation: string) => WhatsAppMessage;
  generateTimestamp: (at: number) => string;
};

export type EventHandler<T extends AnyWhatsAppEvent = AnyWhatsAppEvent> = (
  ctx: HandlerContext,
  event: T,
) => void;

export type HandlerMap = Record<string, EventHandler>;

export type MutableHandlerRegistry = {
  registerHandler<T extends AnyWhatsAppEvent>(
    type: T["type"],
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
      type: T["type"],
      handler: EventHandler<T>,
    ): void {
      if (handlers[type]) {
        throw new Error(`WhatsApp handler "${type}" is already registered`);
      }
      handlers[type] = handler as EventHandler;
    },
    getHandler(kind: string): EventHandler | undefined {
      return handlers[kind];
    },
    getAllHandlers(): Readonly<HandlerMap> {
      return handlers;
    },
  };
}
