import type {
  ThreadMessageRun,
  WhatsAppThreadBlock,
  WhatsAppThreadProjection,
} from "./projector.js";

export const DEFAULT_THREAD_RENDER_LIMIT = 120;
export const DEFAULT_MESSAGES_BEFORE_ANCHOR = 18;

export interface WhatsAppThreadWindowOptions {
  anchorMessageId?: string;
  maxMessages?: number;
  messagesBeforeAnchor?: number;
}

export interface WhatsAppThreadWindow {
  blocks: WhatsAppThreadBlock[];
  renderedMessageCount: number;
  hiddenBefore: number;
  hiddenAfter: number;
  anchorMessageId?: string;
}

function blockOrders(block: WhatsAppThreadBlock): number[] {
  return block.kind === "system"
    ? [block.order]
    : block.items.map((item) => item.order);
}

function includesAnchor(block: WhatsAppThreadBlock, anchorMessageId: string): boolean {
  if (block.kind === "system") {
    return (
      block.message.id === anchorMessageId ||
      (block.message.systemType === "unread_divider" &&
        block.message.id.endsWith(`:${anchorMessageId}`))
    );
  }
  return block.items.some((item) => item.message.id === anchorMessageId);
}

function sliceRun(
  block: ThreadMessageRun,
  startOrder: number,
  endOrder: number,
): ThreadMessageRun | null {
  const items = block.items.filter(
    (item) => item.order >= startOrder && item.order < endOrder,
  );
  if (items.length === 0) return null;
  return items.length === block.items.length ? block : { ...block, items };
}

/**
 * Caps the mounted chat tree without changing authored ordering or message IDs.
 * The window can follow the latest message or an explicit semantic message ID,
 * such as the first unread message captured when a conversation is opened.
 */
export function createWhatsAppThreadWindow(
  thread: WhatsAppThreadProjection,
  options: WhatsAppThreadWindowOptions = {},
): WhatsAppThreadWindow {
  const maxMessages = Math.max(
    1,
    Math.floor(options.maxMessages ?? DEFAULT_THREAD_RENDER_LIMIT),
  );
  const total = thread.messageCount;
  const anchorMessageId = options.anchorMessageId;
  const anchorBlock = anchorMessageId
    ? thread.blocks.find((block) => includesAnchor(block, anchorMessageId))
    : undefined;
  if (anchorMessageId && !anchorBlock) {
    throw new Error(
      `WhatsApp thread window anchor "${anchorMessageId}" does not exist in conversation "${thread.conversationId}"`,
    );
  }
  if (total <= maxMessages) {
    return {
      blocks: thread.blocks,
      renderedMessageCount: total,
      hiddenBefore: 0,
      hiddenAfter: 0,
      anchorMessageId: options.anchorMessageId,
    };
  }

  let startOrder = total - maxMessages;
  if (anchorMessageId && anchorBlock) {
    const anchorOrder = Math.min(...blockOrders(anchorBlock));
    const before = Math.max(
      0,
      Math.min(
        maxMessages - 1,
        Math.floor(
          options.messagesBeforeAnchor ?? DEFAULT_MESSAGES_BEFORE_ANCHOR,
        ),
      ),
    );
    startOrder = Math.max(0, Math.min(anchorOrder - before, total - maxMessages));
  }
  const endOrder = Math.min(total, startOrder + maxMessages);
  const blocks = thread.blocks.flatMap((block): WhatsAppThreadBlock[] => {
    if (block.kind === "system") {
      return block.order >= startOrder && block.order < endOrder ? [block] : [];
    }
    const sliced = sliceRun(block, startOrder, endOrder);
    return sliced ? [sliced] : [];
  });

  return {
    blocks,
    renderedMessageCount: endOrder - startOrder,
    hiddenBefore: startOrder,
    hiddenAfter: total - endOrder,
    anchorMessageId,
  };
}
