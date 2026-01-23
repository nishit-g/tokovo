export { registerHandler, getHandler, type HandlerContext } from "./registry";

import { registerMessageHandlers } from "./message";
import { registerTypingHandlers } from "./typing";
import { registerMediaHandlers } from "./media";
import { registerGroupHandlers } from "./group";
import { registerConversationHandlers } from "./conversation";

export { registerMessageHandlers } from "./message";
export { registerTypingHandlers } from "./typing";
export { registerMediaHandlers } from "./media";
export { registerGroupHandlers } from "./group";
export { registerConversationHandlers } from "./conversation";

export function registerAllWhatsAppHandlers(): void {
  registerMessageHandlers();
  registerTypingHandlers();
  registerMediaHandlers();
  registerGroupHandlers();
  registerConversationHandlers();
}
