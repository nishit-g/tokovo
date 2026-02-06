export { registerHandler, getHandler, type HandlerContext } from "./registry";

import { registerMessageHandlers } from "./message";
import { registerTypingHandlers } from "./typing";
import { registerMediaHandlers } from "./media";
import { registerGroupHandlers } from "./group";
import { registerConversationHandlers } from "./conversation";
import {
  createWhatsAppHandlerRegistry,
  type HandlerMap,
  type MutableHandlerRegistry,
} from "./registry";

export { registerMessageHandlers } from "./message";
export { registerTypingHandlers } from "./typing";
export { registerMediaHandlers } from "./media";
export { registerGroupHandlers } from "./group";
export { registerConversationHandlers } from "./conversation";

export function registerAllWhatsAppHandlers(
  registry?: MutableHandlerRegistry,
): void {
  registerMessageHandlers(registry);
  registerTypingHandlers(registry);
  registerMediaHandlers(registry);
  registerGroupHandlers(registry);
  registerConversationHandlers(registry);
}

export function createWhatsAppHandlers(): Readonly<HandlerMap> {
  const registry = createWhatsAppHandlerRegistry();
  registerAllWhatsAppHandlers(registry);
  return registry.getAllHandlers();
}
