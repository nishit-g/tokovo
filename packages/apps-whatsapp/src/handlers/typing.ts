import { getGlobalWhatsAppHandlerRegistry } from "./registry";
import type { MutableHandlerRegistry } from "./registry";
import type { TypingStartEvent, TypingEndEvent } from "../schemas";

export function registerTypingHandlers(
  registry: MutableHandlerRegistry = getGlobalWhatsAppHandlerRegistry(),
): void {
  registry.registerHandler<TypingStartEvent>("TypingStarted", (ctx, e) => {
    if (!ctx.conversation.typing) ctx.conversation.typing = {};
    const actor = e.payload?.actor ?? e.from;
    if (actor) {
      ctx.conversation.typing[actor] = true;
    }
  });

  registry.registerHandler<TypingEndEvent>("TypingEnded", (ctx, e) => {
    const actor = e.payload?.actor ?? e.from;
    if (ctx.conversation.typing && actor) {
      Reflect.deleteProperty(ctx.conversation.typing, actor);
    }
  });
}
