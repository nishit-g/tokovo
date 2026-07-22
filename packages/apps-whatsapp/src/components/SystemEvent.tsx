import { memo, type ReactNode } from "react";
import {
  Briefcase,
  Image,
  Lock,
  Phone,
  Pin,
  Shield,
  TimerReset,
  User,
} from "lucide-react";
import {
  useTheme,
  useWhatsAppLocale,
} from "../experience/ExperienceContext.js";
import type { ProjectedThreadMessage } from "../thread/projector.js";
import { DateSeparator } from "./DateSeparator.js";

export interface SystemEventProps {
  message: ProjectedThreadMessage;
  order?: number;
}

const SystemPill = memo(function SystemPill({
  text,
  icon,
}: {
  text: string;
  icon?: ReactNode;
}) {
  const theme = useTheme();
  return (
    <div
      style={{
        alignSelf: "center",
        maxWidth: "86%",
        padding: "6px 11px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        border: `0.5px solid ${theme.colors.systemMessageBorder}`,
        borderRadius: 10,
        color: theme.colors.systemMessage,
        backgroundColor: theme.colors.systemMessageBg,
        boxShadow: theme.colors.systemMessageShadow,
        textAlign: "center",
        fontSize: theme.typography.systemMessageFontSize,
        lineHeight: "17px",
        fontFamily: theme.typography.fontFamily,
      }}
    >
      {icon && <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>}
      <span>{text}</span>
    </div>
  );
});

const UnreadDivider = memo(function UnreadDivider({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 9,
        color: theme.colors.systemMessage,
        fontSize: theme.typography.systemMessageFontSize,
        fontWeight: 600,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div
        style={{
          flex: 1,
          height: 1,
          backgroundColor: `${theme.colors.divider}AA`,
        }}
      />
      <div
        style={{
          padding: "4px 10px",
          border: `0.5px solid ${theme.colors.systemMessageBorder}`,
          borderRadius: 12,
          backgroundColor: theme.colors.systemMessageBg,
          boxShadow: theme.colors.systemMessageShadow,
        }}
      >
        {text}
      </div>
      <div
        style={{
          flex: 1,
          height: 1,
          backgroundColor: `${theme.colors.divider}AA`,
        }}
      />
    </div>
  );
});

const TrustNotice = memo(function TrustNotice({
  title,
  text,
  icon,
  showLearnMore = true,
}: {
  title: string;
  text: string;
  icon: ReactNode;
  showLearnMore?: boolean;
}) {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  return (
    <div
      style={{
        alignSelf: "center",
        width: "88%",
        maxWidth: 330,
        display: "flex",
        alignItems: "flex-start",
        gap: 9,
        padding: "10px 12px",
        boxSizing: "border-box",
        border: `0.5px solid ${theme.colors.systemBannerBorder}`,
        borderRadius: 11,
        color: theme.colors.systemBannerText,
        backgroundColor: theme.colors.systemBannerBg,
        boxShadow: theme.colors.systemMessageShadow,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
          color: theme.colors.systemBannerIcon,
          backgroundColor: `${theme.colors.systemBannerIcon}12`,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, lineHeight: "16px", fontWeight: 700 }}>
          {title}
        </div>
        <div style={{ marginTop: 2, fontSize: 12, lineHeight: "16px" }}>
          {text}
          {showLearnMore && (
            <span
              style={{ color: theme.colors.systemBannerLink, fontWeight: 600 }}
            >
              {" "}
              {t("system.learnMore")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

function getPillIcon(message: ProjectedThreadMessage): ReactNode | undefined {
  const color = "currentColor";
  switch (message.systemType) {
    case "member_added":
    case "member_removed":
    case "admin_change":
      return <User size={13} color={color} />;
    case "pinned_message":
      return <Pin size={13} color={color} />;
    case "group_icon_changed":
      return <Image size={13} color={color} />;
    case "phone_number_changed":
      return <Phone size={13} color={color} />;
    default:
      return undefined;
  }
}

export const SystemEvent = memo(function SystemEvent({
  message,
  order,
}: SystemEventProps) {
  const { t } = useWhatsAppLocale();
  const text = message.text?.trim();
  const fallback =
    message.type === "screenshot_alert"
      ? t("system.screenshotTaken")
      : t("system.chatUpdated");
  const content = (() => {
    switch (message.systemType) {
      case "date_change":
        return <DateSeparator text={text || t("status.today")} />;
      case "unread_divider":
        return <UnreadDivider text={text || t("system.unreadMessages")} />;
      case "encryption_notice":
        return (
          <TrustNotice
            title={t("system.encryptionTitle")}
            text={text || t("system.encryptionBody")}
            icon={<Lock size={14} />}
          />
        );
      case "safety_code_changed":
        return (
          <TrustNotice
            title={t("system.safetyTitle")}
            text={text || t("system.safetyBody")}
            icon={<Shield size={14} />}
          />
        );
      case "business_notice":
        return (
          <TrustNotice
            title={t("system.businessTitle")}
            text={text || t("system.businessBody")}
            icon={<Briefcase size={14} />}
          />
        );
      case "disappearing_messages":
        return (
          <SystemPill
            text={text || t("system.disappearingOn")}
            icon={<TimerReset size={13} />}
          />
        );
      default:
        return (
          <SystemPill text={text || fallback} icon={getPillIcon(message)} />
        );
    }
  })();

  return (
    <div
      data-cinematic-subject="message"
      data-message-id={message.id}
      data-system-type={message.systemType ?? message.type}
      data-order={order}
      style={{ width: "100%", display: "flex", justifyContent: "center" }}
    >
      {content}
    </div>
  );
});
