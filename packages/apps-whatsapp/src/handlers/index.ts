export type { HandlerContext } from "./registry.js";

import { registerMessageHandlers } from "./message.js";
import { registerTypingHandlers } from "./typing.js";
import { registerMediaHandlers } from "./media.js";
import { registerGroupHandlers } from "./group.js";
import { registerConversationHandlers } from "./conversation.js";
import {
  createWhatsAppHandlerRegistry,
  type HandlerMap,
  type MutableHandlerRegistry,
} from "./registry.js";

export { registerMessageHandlers } from "./message.js";
export { registerTypingHandlers } from "./typing.js";
export { registerMediaHandlers } from "./media.js";
export { registerGroupHandlers } from "./group.js";
export { registerConversationHandlers } from "./conversation.js";

export function registerAllWhatsAppHandlers(
  registry: MutableHandlerRegistry,
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
