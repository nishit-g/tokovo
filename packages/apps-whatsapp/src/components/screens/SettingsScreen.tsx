import type { WorldState } from "@tokovo/core";
import { DeterministicImage } from "@tokovo/react";
import {
  Bell,
  HelpCircle,
  Database,
  KeyRound,
  Laptop,
  Lock,
  MessageCircle,
  QrCode,
  Search,
  Share2,
  Smile,
} from "lucide-react";
import {
  useTheme,
  useWhatsAppLocale,
} from "../../experience/ExperienceContext.js";
import type { WhatsAppSettings, WhatsAppState } from "../../types/index.js";
import { resolveAvatarWithFallback } from "../../utils/avatar.js";
import {
  formatWhatsAppNumber,
  type WhatsAppMessageKey,
} from "../../localization/index.js";
import { AppScaffold, SectionHeader, SettingsGroup, SettingsRow } from "../surfaces/index.js";

export interface SettingsScreenProps {
  world: WorldState;
  safeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  width: number;
  height: number;
}

type Translator = (
  key: WhatsAppMessageKey,
  parameters?: Record<string, string | number>,
) => string;

function privacySummary(
  settings: WhatsAppSettings,
  t: Translator,
): string {
  const privacy = settings.privacy;
  if (!privacy) return t("settings.privacyDefault");
  const readReceipts = t(
    privacy.readReceipts === false
      ? "settings.receiptsOff"
      : "settings.receiptsOn",
  );
  return t("settings.privacySummary", {
    lastSeen: privacy.lastSeen ?? t("settings.contacts"),
    receipts: readReceipts,
  });
}

function localizeTheme(
  theme: string | undefined,
  t: Translator,
): string {
  if (theme === "light") return t("settings.lightTheme");
  if (theme === "dark") return t("settings.darkTheme");
  return t("settings.systemTheme");
}

export function SettingsScreen({
  world,
  safeAreaInsets,
}: SettingsScreenProps) {
  const theme = useTheme();
  const { locale, t } = useWhatsAppLocale();
  const { uiTypography: typography } = theme;
  const safeAreaTop = safeAreaInsets?.top ?? theme.safeArea.top;
  const safeAreaBottom = safeAreaInsets?.bottom ?? theme.safeArea.bottom;
  const state = (world.appState?.app_whatsapp ?? {}) as Partial<WhatsAppState>;
  const profile = state.profile;
  const settings = state.settings ?? {};
  const deviceId = Object.keys(world.devices ?? {})[0];
  const ownerName = deviceId ? world.devices[deviceId]?.ownerName : undefined;
  const name = profile?.name ?? ownerName ?? t("chat.you");

  return (
    <AppScaffold
      title={t("nav.settings")}
      activeTab="settings"
      safeAreaTop={safeAreaTop}
      safeAreaBottom={safeAreaBottom}
    >
      <div
        style={{
          height: 34,
          margin: "10px 16px 8px",
          padding: "0 10px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: `1px solid ${theme.colors.divider}`,
          borderRadius: 11,
          color: theme.colors.timestamp,
          backgroundColor: theme.colors.headerBackground,
        }}
      >
        <Search size={16} />
        <span
          style={{
            ...typography.body,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {t("settings.search")}
        </span>
      </div>

      <div
        data-anchor="settings_profile"
        style={{
          minHeight: 78,
          margin: "0 16px 12px",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          border: `1px solid ${theme.colors.divider}`,
          borderRadius: 15,
          backgroundColor: theme.colors.background,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            overflow: "hidden",
            borderRadius: 28,
            backgroundColor: theme.colors.divider,
            flexShrink: 0,
          }}
        >
          <DeterministicImage
            src={resolveAvatarWithFallback(profile?.avatar, name)}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              ...typography.headline,
              color: theme.colors.receivedBubbleText,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {name}
          </div>
          <div
            style={{
              ...typography.caption,
              marginTop: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: theme.colors.timestamp,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {profile?.about ?? t("settings.defaultAbout")}
          </div>
        </div>
        <QrCode size={21} color={theme.colors.accent} />
      </div>

      <SectionHeader title={t("settings.accountSection")} />
      <SettingsGroup>
        <SettingsRow
          icon={<KeyRound size={17} />}
          iconBackground="#2F80ED"
          title={t("settings.account")}
          subtitle={t("settings.accountBody")}
        />
        <SettingsRow
          icon={<Lock size={17} />}
          iconBackground="#25A55F"
          title={t("settings.privacy")}
          subtitle={privacySummary(settings, t)}
        />
        <SettingsRow
          icon={<Smile size={18} />}
          iconBackground="#7B61FF"
          title={t("settings.avatar")}
          subtitle={t("settings.avatarBody")}
          isLast
        />
      </SettingsGroup>

      <SectionHeader title={t("settings.preferencesSection")} />
      <SettingsGroup>
        <SettingsRow
          icon={<MessageCircle size={18} />}
          iconBackground="#22A6B3"
          title={t("settings.chats")}
          subtitle={t("settings.chatsSummary", {
            theme: localizeTheme(settings.chats?.theme, t),
            backup:
              settings.chats?.backupLabel ?? t("settings.notConfigured"),
          })}
        />
        <SettingsRow
          icon={<Bell size={17} />}
          iconBackground="#F39C12"
          title={t("settings.notifications")}
          subtitle={`${settings.notifications?.messageTone ?? t("settings.defaultTone")}${
            settings.notifications?.mutedChats
              ? ` · ${t("settings.mutedCount", {
                  count: settings.notifications.mutedChats,
                })}`
              : ""
          }`}
        />
        <SettingsRow
          icon={<Database size={17} />}
          iconBackground="#4C6FFF"
          title={t("settings.storage")}
          subtitle={`${settings.storage?.usedLabel ?? t("settings.storageNotMeasured")} · ${
            settings.storage?.autoDownloadLabel ?? t("settings.wifiDownloads")
          }`}
          isLast
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          icon={<Laptop size={17} />}
          iconBackground="#607D8B"
          title={t("settings.linkedDevices")}
          trailing={formatWhatsAppNumber(
            locale,
            settings.linkedDevicesCount ?? 0,
          )}
        />
        <SettingsRow
          icon={<HelpCircle size={18} />}
          iconBackground="#15A085"
          title={t("settings.help")}
        />
        <SettingsRow
          icon={<Share2 size={17} />}
          iconBackground="#1ABC9C"
          title={t("settings.tellFriend")}
          isLast
        />
      </SettingsGroup>
    </AppScaffold>
  );
}

export default SettingsScreen;
