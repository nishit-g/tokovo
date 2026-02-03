import { registerHandler } from "./registry";
import type { TypingStartEvent, TypingEndEvent } from "../schemas";

let registered = false;

export function registerTypingHandlers(): void {
  if (registered) return;
  registered = true;

  registerHandler<TypingStartEvent>("TypingStarted", (ctx, e) => {
    if (!ctx.conversation.typing) ctx.conversation.typing = {};
    const actor = e.payload?.actor ?? e.from;
    if (actor) {
      ctx.conversation.typing[actor] = true;
    }
  });

  registerHandler<TypingEndEvent>("TypingEnded", (ctx, e) => {
    const actor = e.payload?.actor ?? e.from;
    if (ctx.conversation.typing && actor) {
      Reflect.deleteProperty(ctx.conversation.typing, actor);
    }
  });
}
