import type { IMessageMessage } from "../types/index.js";

export const LAYOUT_CONFIG = {
  GAP_MINIMAL: 2,
  GAP_RUN_BREAK: 6,
  GAP_NORMAL: 12,
};

export function computeMessageGap(
  previous: IMessageMessage | undefined,
  current: IMessageMessage,
): number {
  if (!previous) return LAYOUT_CONFIG.GAP_NORMAL;
  if (previous.isSystem || current.isSystem) return LAYOUT_CONFIG.GAP_NORMAL;

  const sameSender = previous.fromMe === current.fromMe;
  const prevHasMeta =
    (previous.tapbacks?.length ?? 0) > 0 ||
    !!previous.replyTo ||
    (previous.attachments?.length ?? 0) > 0;
  const currHasMeta =
    (current.tapbacks?.length ?? 0) > 0 ||
    !!current.replyTo ||
    (current.attachments?.length ?? 0) > 0;

  const tapbackOffset = (current.tapbacks?.length ?? 0) > 0 ? 12 : 0;

  if (sameSender && !prevHasMeta && !currHasMeta) {
    return LAYOUT_CONFIG.GAP_MINIMAL + tapbackOffset;
  }

  if (sameSender) {
    return LAYOUT_CONFIG.GAP_RUN_BREAK + tapbackOffset;
  }

  return LAYOUT_CONFIG.GAP_NORMAL + tapbackOffset;
}
