import type { MutableHandlerRegistry } from "./registry.js";
import type { TypingStartEvent, TypingEndEvent } from "../schemas/index.js";

export function registerTypingHandlers(
  registry: MutableHandlerRegistry,
): void {
  registry.registerHandler<TypingStartEvent>("TYPING_START", (ctx, e) => {
    if (!ctx.conversation.typing) ctx.conversation.typing = {};
    ctx.conversation.typing[e.payload.actor] = true;
  });

  registry.registerHandler<TypingEndEvent>("TYPING_END", (ctx, e) => {
    if (ctx.conversation.typing) {
      Reflect.deleteProperty(ctx.conversation.typing, e.payload.actor);
    }
  });
}
