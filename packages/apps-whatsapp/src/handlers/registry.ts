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
