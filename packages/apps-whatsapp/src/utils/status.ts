import type { WhatsAppMessage } from "../types/index.js";

export type DeliveryStage = "sent" | "delivered" | "read";

const DELIVERY_DELAY_FRAMES = 18;

export function resolveDeliveryStage(
  message: Pick<
    WhatsAppMessage,
    "from" | "status" | "at" | "deliveredAt" | "readAt"
  >,
  currentFrame: number,
): DeliveryStage | undefined {
  if (message.from !== "me") return undefined;

  if (
    message.status === "read" ||
    (typeof message.readAt === "number" && currentFrame >= message.readAt)
  ) {
    return "read";
  }

  if (
    message.status === "delivered" ||
    (typeof message.deliveredAt === "number" &&
      currentFrame >= message.deliveredAt)
  ) {
    return "delivered";
  }

  const sentAt = message.at ?? currentFrame;
  if (currentFrame - sentAt >= DELIVERY_DELAY_FRAMES) {
    return "delivered";
  }

  return "sent";
}
