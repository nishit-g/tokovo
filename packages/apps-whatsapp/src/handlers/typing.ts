import { registerHandler } from "./registry";
import type { TypingStartEvent, TypingEndEvent } from "../schemas";

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
    delete ctx.conversation.typing[actor];
  }
});
