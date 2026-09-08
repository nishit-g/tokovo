import type { WhatsAppMessage } from "../types/index.js";

export type DeliveryStage = "sending" | "sent" | "delivered" | "read" | "failed";

const DELIVERY_DELAY_FRAMES = 18;

export function resolveDeliveryStage(
  message: Pick<
    WhatsAppMessage,
    "from" | "status" | "at" | "deliveredAt" | "readAt"
  >,
  currentFrame: number,
): DeliveryStage | undefined {
  if (message.from !== "me") return undefined;

  if (message.status === "failed") {
    return "failed";
  }

  if (message.status === "sending") {
    return "sending";
  }

  if (
    (message.status === "read" && message.readAt === undefined) ||
    (typeof message.readAt === "number" && currentFrame >= message.readAt)
  ) {
    return "read";
  }

  if (
    (message.status === "delivered" && message.deliveredAt === undefined) ||
    (typeof message.deliveredAt === "number" &&
      currentFrame >= message.deliveredAt)
  ) {
    return "delivered";
  }

  const sentAt = message.at ?? currentFrame;
  if (message.deliveredAt === undefined && currentFrame - sentAt >= DELIVERY_DELAY_FRAMES) {
    return "delivered";
  }

  return "sent";
}
