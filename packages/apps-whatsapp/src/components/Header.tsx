import { ChevronLeft, Video, Phone, Lock, BadgeCheck, Briefcase } from "lucide-react";
import { DeterministicImage } from "@tokovo/react";
import { UI_CONSTANTS } from "../config/layout-config.js";
import {
  useTheme,
  useWhatsAppLocale,
  useWhatsAppPresentation,
} from "../experience/ExperienceContext.js";
import { resolveAvatarWithFallback } from "../utils/avatar.js";

export interface HeaderProps {
  contactName: string;
  avatarUrl?: string;
  status: string;
  contentInsetTop: number;
  locked?: boolean;
  contactLabel?: string;
  verifiedBusiness?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  contactName,
  avatarUrl,
  status,
  contentInsetTop,
  locked = false,
  contactLabel,
  verifiedBusiness = false,
}) => {
  const theme = useTheme();
  const { direction, t } = useWhatsAppLocale();
  const presentation = useWhatsAppPresentation();
  // Use fallback avatar when local paths don't exist
  const resolvedAvatarUrl = resolveAvatarWithFallback(avatarUrl, contactName);

  const contentHeight = UI_CONSTANTS.HEADER_CONTENT_HEIGHT;
  const totalHeight = contentInsetTop + contentHeight;
  const actionColor =
    presentation.conversation.headerActionColor === "accent"
      ? theme.colors.accent
      : theme.colors.headerText;

  return (
    <div
      data-cinematic-subject="header"
      style={{
        height: totalHeight,
        backgroundColor: theme.colors.headerBackground,
        paddingTop: contentInsetTop,
        display: "flex",
        alignItems: "center",
        paddingInline: UI_CONSTANTS.HEADER_PADDING_X,
        borderBottom: `0.5px solid ${theme.colors.divider}`,
        backdropFilter: "blur(20px)",
        position: "relative",
        zIndex: 100,
        boxSizing: "border-box",
      }}
    >
      <button
        type="button"
        aria-label={t("action.back")}
        style={{
          marginInlineEnd: 8,
          color: theme.colors.headerText,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          padding: 0,
          border: 0,
          background: "transparent",
          font: "inherit",
        }}
      >
        <ChevronLeft
          size={34}
          color={theme.colors.headerText}
          aria-hidden="true"
          style={{
            marginInlineStart: -8,
            transform: direction === "rtl" ? "scaleX(-1)" : undefined,
          }}
        />
      </button>

      <div
        data-cinematic-subject="profile"
        style={{
          width: UI_CONSTANTS.HEADER_AVATAR_SIZE,
          height: UI_CONSTANTS.HEADER_AVATAR_SIZE,
          borderRadius: "50%",
          backgroundColor: theme.colors.divider,
          marginInlineEnd: UI_CONSTANTS.HEADER_AVATAR_MARGIN_RIGHT,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <DeterministicImage
          src={resolvedAvatarUrl}
          alt={contactName}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: theme.typography.headerTitleFontSize,
            fontWeight: "600",
            color: theme.colors.headerText,
            lineHeight: "20px",
            fontFamily: theme.typography.fontFamily,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>{contactName}</span>
          {verifiedBusiness && (
            <BadgeCheck
              size={15}
              color={theme.colors.link}
              fill={theme.colors.link}
              strokeWidth={1.5}
            />
          )}
          {locked && <Lock size={13} color={theme.colors.timestamp} strokeWidth={1.8} />}
        </div>
        <div
          style={{
            fontSize: theme.typography.headerSubtitleFontSize,
            color: theme.colors.timestamp,
            lineHeight: "14px",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {contactLabel && <Briefcase size={12} color={theme.colors.timestamp} strokeWidth={1.8} />}
          {contactLabel ? `${contactLabel} • ${status}` : status}
        </div>
      </div>

      <div
        role="group"
        aria-label={t("nav.calls")}
        style={{ display: "flex", gap: 28, paddingInlineEnd: 4 }}
      >
        <button
          type="button"
          aria-label={t("action.video")}
          style={{
            padding: 0,
            border: 0,
            color: "inherit",
            background: "transparent",
          }}
        >
          <Video size={22} color={actionColor} strokeWidth={1.7} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={t("message.voiceCall")}
          style={{
            padding: 0,
            border: 0,
            color: "inherit",
            background: "transparent",
          }}
        >
          <Phone size={20} color={actionColor} strokeWidth={1.7} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
