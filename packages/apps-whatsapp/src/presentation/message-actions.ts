import type { LayoutRect } from "@tokovo/core";
import type { WhatsAppMessage } from "../types/index.js";
import { WHATSAPP_INTERACTION_TOKENS as tokens } from "../theme/index.js";

export const QUICK_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🙏"] as const;

export function messageActionKeys(message: WhatsAppMessage) {
  const actions = [
    "action.reply",
    "action.forward",
    "action.copy",
    "action.star",
    "action.info",
    "action.delete",
  ] as const;
  return actions.filter((key) => {
    if (message.type === "deleted" || message.deletedForEveryone)
      return key === "action.delete";
    if (key === "action.copy") return Boolean(message.text || message.caption);
    if (key === "action.info") return message.from === "me";
    return true;
  });
}

/** Shared by the camera anchor and the painted menu; clamp to the visible thread. */
export function messageActionRect(
  message: LayoutRect,
  bounds: LayoutRect,
  count: number,
): LayoutRect {
  const gap = tokens.surfaceMargin;
  const width = Math.min(tokens.menuWidth, Math.max(1, bounds.width - gap * 2));
  const height = Math.min(
    (count + (count > 1 ? 1 : 0)) * tokens.menuRowHeight,
    Math.max(1, bounds.height - gap * 2),
  );
  const below = message.y + message.height + gap;
  return {
    x: Math.max(
      bounds.x + gap,
      Math.min(message.x, bounds.x + bounds.width - width - gap),
    ),
    y: Math.max(
      bounds.y + gap,
      Math.min(
        below + height <= bounds.y + bounds.height - gap
          ? below
          : message.y - height - gap,
        bounds.y + bounds.height - height - gap,
      ),
    ),
    width,
    height,
  };
}
