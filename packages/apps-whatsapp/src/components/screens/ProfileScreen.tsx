import { requireAppStateForDevice, type WorldState } from "@tokovo/core";
import { DeterministicImage } from "@tokovo/react";
import {
  Ban,
  Bell,
  ChevronLeft,
  FileImage,
  Flag,
  Lock,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Timer,
  Users,
  Video,
} from "lucide-react";
import { useTheme, useWhatsAppLocale } from "../../experience/ExperienceContext.js";
import type { WhatsAppMessage, WhatsAppState } from "../../types/index.js";
import { resolveAvatarWithFallback } from "../../utils/avatar.js";
import { formatWhatsAppNumber } from "../../localization/index.js";
import { AppScaffold, SettingsGroup, SettingsRow } from "../surfaces/index.js";
import { GroupInfoScreen } from "./GroupInfoScreen.js";

export interface ProfileScreenProps {
  world: WorldState;
  deviceId: string;
  contentInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  width: number;
  height: number;
}

function mediaSource(message: WhatsAppMessage): string | undefined {
  if (message.type === "image") return message.imageUrl;
  if (message.type === "video") return message.thumbnailUrl;
  if (message.type === "gif") return message.gifUrl;
  if (message.type === "sticker") return message.stickerUrl;
  return undefined;
}

function ActionTile({ label, icon }: { label: string; icon: React.ReactNode }) {
  const theme = useTheme();
  const { uiTypography: typography } = theme;
  return (
    <div
      style={{
        flex: 1,
        height: 52,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        border: `1px solid ${theme.colors.divider}`,
        borderRadius: 13,
        color: theme.colors.accent,
        backgroundColor: theme.colors.background,
      }}
    >
      {icon}
      <span
        style={{
          ...typography.caption,
          fontSize: 12,
          color: theme.colors.receivedBubbleText,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function ProfileScreen({ world, deviceId, contentInsets, width, height }: ProfileScreenProps) {
  const theme = useTheme();
  const { direction, locale, t } = useWhatsAppLocale();
  const { uiTypography: typography } = theme;
  const contentInsetTop = contentInsets.top;
  const contentInsetBottom = contentInsets.bottom;
  const state = requireAppStateForDevice<WhatsAppState>(world, "app_whatsapp", deviceId);
  const conversations = state.conversations;
  const conversationId = state.conversationId;
  const conversation = conversationId ? conversations[conversationId] : undefined;

  if (!conversation) {
    throw new Error("WhatsApp profile screen requires a current conversation");
  }

  if (conversation.type === "group") {
    return (
      <GroupInfoScreen
        world={world}
        deviceId={deviceId}
        conversationId={conversation.id}
        contentInsets={contentInsets}
        width={width}
        height={height}
      />
    );
  }

  const messages = conversation.messages;
  const media = messages
    .map((message) => ({ message, src: mediaSource(message) }))
    .filter((item): item is { message: WhatsAppMessage; src: string } => Boolean(item.src));
  const remoteMember = conversation.members?.find((member) => member.id.toLowerCase() !== "me");
  const phone = conversation.contact?.phone ?? remoteMember?.phone;
  const about = conversation.contact?.about ?? conversation.description;
  const detail =
    conversation.contact?.lastSeenLabel ?? conversation.contact?.businessCategory ?? phone;
  const fallbackContactName = t("profile.contact");
  const contactName = conversation.name ?? fallbackContactName;

  return (
    <AppScaffold
      title={t("screen.contactInfo")}
      contentInsetTop={contentInsetTop}
      contentInsetBottom={contentInsetBottom}
      showTabs={false}
      leading={
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ChevronLeft
            size={21}
            style={{
              transform: direction === "rtl" ? "scaleX(-1)" : undefined,
            }}
          />
          <span style={{ fontSize: 15 }}>{t("action.back")}</span>
        </div>
      }
      actions={<span style={{ fontSize: 15, fontWeight: 600 }}>{t("action.edit")}</span>}
    >
      <div data-cinematic-subject="profile_hero" style={{ padding: "16px 16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 82,
              height: 82,
              overflow: "hidden",
              borderRadius: 41,
              backgroundColor: theme.colors.divider,
              flexShrink: 0,
            }}
          >
            <DeterministicImage
              src={resolveAvatarWithFallback(conversation.avatar, contactName)}
              alt={contactName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 23,
                fontWeight: 650,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: theme.colors.receivedBubbleText,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {contactName}
            </div>
            {detail && (
              <div
                style={{
                  ...typography.caption,
                  marginTop: 4,
                  color: theme.colors.timestamp,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                {detail}
              </div>
            )}
            {conversation.contact?.verifiedBusiness && (
              <div
                style={{
                  ...typography.caption,
                  marginTop: 5,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: theme.colors.link,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                <ShieldCheck size={14} /> {t("profile.verifiedBusiness")}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 13 }}>
          <ActionTile label={t("action.audio")} icon={<Phone size={18} />} />
          <ActionTile label={t("action.video")} icon={<Video size={19} />} />
          <ActionTile label={t("action.search")} icon={<Search size={18} />} />
        </div>
      </div>

      {(about || phone) && (
        <div
          style={{
            margin: "0 16px 12px",
            padding: "10px 12px",
            border: `1px solid ${theme.colors.divider}`,
            borderRadius: 13,
            backgroundColor: theme.colors.background,
          }}
        >
          {about && (
            <div
              style={{
                ...typography.body,
                color: theme.colors.receivedBubbleText,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {about}
            </div>
          )}
          {phone && (
            <div
              style={{
                ...typography.caption,
                marginTop: about ? 4 : 0,
                color: theme.colors.timestamp,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {phone}
            </div>
          )}
        </div>
      )}

      <div
        data-cinematic-subject="profile_media"
        style={{
          minHeight: 88,
          margin: "0 16px 12px",
          padding: "9px 11px",
          border: `1px solid ${theme.colors.divider}`,
          borderRadius: 13,
          backgroundColor: theme.colors.background,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              ...typography.caption,
              fontWeight: 600,
              color: theme.colors.receivedBubbleText,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {t("profile.mediaLinksDocs")}
          </span>
          <span
            style={{
              ...typography.caption,
              color: theme.colors.timestamp,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {formatWhatsAppNumber(locale, media.length)} {direction === "rtl" ? "‹" : "›"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {media.slice(0, 4).map(({ message, src }) => (
            <div
              key={message.id}
              style={{
                width: 55,
                height: 48,
                overflow: "hidden",
                borderRadius: 7,
                backgroundColor: theme.colors.divider,
              }}
            >
              <DeterministicImage
                src={src}
                alt={t("profile.sharedMedia")}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ))}
          {media.length === 0 && (
            <div
              style={{
                height: 48,
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: theme.colors.timestamp,
              }}
            >
              <FileImage size={19} />
              <span style={{ ...typography.caption }}>{t("profile.nothingShared")}</span>
            </div>
          )}
        </div>
      </div>

      <SettingsGroup>
        <SettingsRow
          icon={<Star size={17} />}
          iconBackground="#F4B400"
          title={t("profile.starredMessages")}
        />
        <SettingsRow
          icon={<Bell size={17} />}
          iconBackground="#F39C12"
          title={t("profile.notifications")}
          trailing={
            conversation.preferences?.notifications ??
            t(conversation.isMuted ? "profile.muted" : "profile.on")
          }
        />
        <SettingsRow
          icon={<Timer size={17} />}
          iconBackground="#15A085"
          title={t("profile.disappearingMessages")}
          trailing={conversation.preferences?.disappearingMessages ?? t("profile.off")}
        />
        <SettingsRow
          icon={<Lock size={17} />}
          iconBackground="#607D8B"
          title={t("profile.encryption")}
          subtitle={t("profile.encryptionBody")}
          isLast
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          icon={<Users size={17} />}
          iconBackground="#4C6FFF"
          title={t("profile.groupsInCommon")}
          trailing={formatWhatsAppNumber(locale, 0)}
        />
        <SettingsRow
          icon={<Ban size={17} />}
          iconBackground="#D64545"
          title={t("profile.block", { name: contactName })}
          danger
        />
        <SettingsRow
          icon={<Flag size={17} />}
          iconBackground="#D64545"
          title={t("profile.report", { name: contactName })}
          danger
          isLast
        />
      </SettingsGroup>
    </AppScaffold>
  );
}

export default ProfileScreen;
