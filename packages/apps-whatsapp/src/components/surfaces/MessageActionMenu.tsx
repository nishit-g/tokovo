import type { ReactNode } from "react";
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

export function MessageActionMenu({ messageId }: { messageId: string }) {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  return (
    <div
      data-anchor="message_actions"
      data-message-id={messageId}
      role="menu"
      aria-label={t("a11y.messageActions")}
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: theme.spacing.inputAreaHeight + 46,
        zIndex: 30,
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 1,
        padding: 8,
        border: `0.5px solid ${theme.colors.divider}`,
        borderRadius: 16,
        color: theme.colors.receivedBubbleText,
        backgroundColor: theme.colors.background,
        boxShadow: "0 12px 36px rgba(0,0,0,0.24)",
        fontFamily: theme.typography.fontFamily,
      }}
    >
      {ACTIONS.map((action) => (
        <button
          key={action.key}
          type="button"
          role="menuitem"
          aria-label={t(action.key)}
          style={{
            minHeight: 52,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            borderRadius: 10,
            color: action.destructive ? "#D92D20" : theme.colors.receivedBubbleText,
            backgroundColor: theme.colors.surfaceMuted,
            fontSize: 11,
            fontWeight: 600,
            border: 0,
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
