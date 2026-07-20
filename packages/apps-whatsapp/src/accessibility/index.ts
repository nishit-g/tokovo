import type { ProjectedThreadMessage } from "../thread/projector.js";
import type { WhatsAppLocale } from "../localization/index.js";
import {
  formatWhatsAppNumber,
  translateWhatsApp,
} from "../localization/index.js";

function messageContent(
  message: ProjectedThreadMessage,
  locale: WhatsAppLocale,
): string {
  if (message.text?.trim()) return message.text.trim();
  switch (message.type) {
    case "image":
      return translateWhatsApp(locale, "message.photo");
    case "video":
      return translateWhatsApp(locale, "message.video");
    case "voice":
      return translateWhatsApp(locale, "message.voice");
    case "document":
      return message.fileName ?? translateWhatsApp(locale, "message.document");
    case "location":
      return message.locationName ?? translateWhatsApp(locale, "message.location");
    case "contact":
      return message.contactName ?? translateWhatsApp(locale, "message.contact");
    case "deleted":
      return translateWhatsApp(locale, "message.deleted");
    default:
      return translateWhatsApp(locale, "message.unavailable");
  }
}

export function getMessageAccessibilityLabel(
  message: ProjectedThreadMessage,
  isMe: boolean,
  locale: WhatsAppLocale,
): string {
  const name = isMe
    ? locale === "ar"
      ? "أنت"
      : "You"
    : message.senderName ?? message.from;
  return translateWhatsApp(
    locale,
    isMe ? "message.sentBy" : "message.receivedFrom",
    { name, content: messageContent(message, locale) },
  );
}

export function getReactionAccessibilityLabel(
  message: ProjectedThreadMessage,
  locale: WhatsAppLocale,
): string | undefined {
  if (!message.reactions?.length) return undefined;
  const reactions = message.reactions
    .map(
      (reaction) =>
        `${reaction.emoji} ${formatWhatsAppNumber(locale, reaction.count)}`,
    )
    .join(", ");
  return translateWhatsApp(locale, "a11y.reactions", { reactions });
}
