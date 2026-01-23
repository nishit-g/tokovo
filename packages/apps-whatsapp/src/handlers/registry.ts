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

type HandlerMap = Record<string, EventHandler>;

const handlers: HandlerMap = {};

export function registerHandler<T extends AnyWhatsAppEvent>(
  kind: T["kind"],
  handler: EventHandler<T>,
): void {
  handlers[kind] = handler as EventHandler;
}

export function getHandler(kind: string): EventHandler | undefined {
  return handlers[kind];
}

export function getAllHandlers(): Readonly<HandlerMap> {
  return handlers;
}
