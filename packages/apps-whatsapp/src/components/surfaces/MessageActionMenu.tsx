import type { ReactNode } from "react";
import { useLayout } from "@tokovo/react";
import type { ChatLayoutState } from "@tokovo/core";
import type { WhatsAppMessage } from "../../types/index.js";
import { messageActionKeys, QUICK_REACTIONS } from "../../presentation/message-actions.js";
import { WHATSAPP_INTERACTION_TOKENS as tokens } from "../../theme/index.js";
import { Copy, Forward, Info, Reply, Star, Trash2 } from "lucide-react";
import {
  useTheme,
  useWhatsAppLocale,
} from "../../experience/ExperienceContext.js";
import type { WhatsAppMessageKey } from "../../localization/index.js";

const ACTIONS: ReadonlyArray<{
  key: WhatsAppMessageKey;
  icon: ReactNode;
  destructive?: boolean;
}> = [
  { key: "action.reply", icon: <Reply size={19} aria-hidden="true" /> },
  { key: "action.forward", icon: <Forward size={19} aria-hidden="true" /> },
  { key: "action.copy", icon: <Copy size={19} aria-hidden="true" /> },
  { key: "action.star", icon: <Star size={19} aria-hidden="true" /> },
  { key: "action.info", icon: <Info size={19} aria-hidden="true" /> },
  {
    key: "action.delete",
    icon: <Trash2 size={19} aria-hidden="true" />,
    destructive: true,
  },
];

export function MessageActionMenu({ message }: { message: WhatsAppMessage }) {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  const layout = useLayout<ChatLayoutState>();
  const rect = layout?.semantic?.regions.message_actions?.rect;
  if (!rect) return null;
  const available = new Set<string>(messageActionKeys(message));
  return (
    <div
      data-cinematic-subject="message_actions"
      data-message-id={message.id}
      role="menu"
      aria-label={t("a11y.messageActions")}
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        overflow: "hidden",
        zIndex: 30,
        display: "grid",
        gridAutoRows: "1fr",
        border: `0.5px solid ${theme.colors.divider}`,
        borderRadius: tokens.menuRadius,
        color: theme.colors.receivedBubbleText,
        backgroundColor: theme.colors.background,
        boxShadow: theme.colors.reactionShadow,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      {available.size > 1 && (
        <div role="group" aria-label={t("a11y.messageActions")} style={{
          display: "flex", alignItems: "center", justifyContent: "space-evenly",
          borderBottom: `0.5px solid ${theme.colors.divider}`,
        }}>
          {QUICK_REACTIONS.map((emoji) => (
            <span key={emoji} style={{ fontSize: 24, lineHeight: 1 }}>{emoji}</span>
          ))}
        </div>
      )}
      {ACTIONS.filter((action) => available.has(action.key)).map((action) => (
        <button
          key={action.key}
          type="button"
          role="menuitem"
          aria-label={t(action.key)}
          style={{
            minHeight: 0,
            paddingInline: tokens.surfaceMargin,
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 5,
            color: action.destructive
              ? theme.colors.callCardMissed
              : theme.colors.receivedBubbleText,
            backgroundColor: theme.colors.background,
            ...theme.uiTypography.body,
            border: 0,
            borderBottom: `0.5px solid ${theme.colors.divider}`,
            fontFamily: "inherit",
          }}
        >
          {action.icon}
          <span>{t(action.key)}</span>
        </button>
      ))}
    </div>
  );
}
