import { ArrowDownLeft, ArrowUpRight, Link, Phone, PhoneMissed, Plus, Video } from "lucide-react";
import { requireAppStateForDevice, type WorldState } from "@tokovo/core";
import { DeterministicImage } from "@tokovo/react";
import { useTheme, useWhatsAppLocale } from "../../experience/ExperienceContext.js";
import type { WhatsAppCallLogEntry, WhatsAppState } from "../../types/index.js";
import { formatConversationListTimestamp, getBaseTime } from "../../utils/messages.js";
import { resolveAvatarWithFallback } from "../../utils/avatar.js";
import type { WhatsAppMessageKey } from "../../localization/index.js";
import { AppScaffold, EmptyState, SectionHeader } from "../surfaces/index.js";

export interface CallsScreenProps {
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

type Translator = (key: WhatsAppMessageKey, parameters?: Record<string, string | number>) => string;

function formatCallDuration(seconds: number | undefined, t: Translator): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  if (seconds < 60) return t("calls.durationSeconds", { count: seconds });
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder > 0
    ? t("calls.durationMinutesSeconds", { minutes, seconds: remainder })
    : t("calls.durationMinutes", { count: minutes });
}

function CallRow({ entry, baseTime }: { entry: WhatsAppCallLogEntry; baseTime: Date }) {
  const theme = useTheme();
  const { locale, t } = useWhatsAppLocale();
  const { uiTypography: typography } = theme;
  const DirectionIcon =
    entry.direction === "missed"
      ? PhoneMissed
      : entry.direction === "outgoing"
        ? ArrowUpRight
        : ArrowDownLeft;
  const modeLabel = t(entry.mode === "video" ? "calls.video" : "calls.voice");
  const duration = formatCallDuration(entry.durationSeconds, t);
  const meta = [
    t(
      entry.direction === "missed"
        ? "calls.missed"
        : entry.direction === "outgoing"
          ? "calls.outgoing"
          : "calls.incoming",
      { mode: modeLabel },
    ),
    duration,
    formatConversationListTimestamp(entry.startedAt, baseTime, locale),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      data-call-id={entry.id}
      style={{
        minHeight: 70,
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        gap: 11,
        borderBottom: `0.5px solid ${theme.colors.divider}`,
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          overflow: "hidden",
          borderRadius: 25,
          flexShrink: 0,
          backgroundColor: theme.colors.divider,
        }}
      >
        <DeterministicImage
          src={resolveAvatarWithFallback(entry.avatar, entry.name)}
          alt={entry.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            ...typography.headline,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color:
              entry.direction === "missed"
                ? theme.colors.callCardMissed
                : theme.colors.receivedBubbleText,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {entry.name}
        </div>
        <div
          style={{
            ...typography.caption,
            marginTop: 3,
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: theme.colors.timestamp,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          <DirectionIcon size={13} />
          <span>{meta}</span>
        </div>
      </div>
      <div
        style={{
          width: 34,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 17,
          color: theme.colors.accent,
          backgroundColor: `${theme.colors.accent}12`,
        }}
      >
        {entry.mode === "video" ? <Video size={18} /> : <Phone size={18} />}
      </div>
    </div>
  );
}

export function CallsScreen({ world, deviceId, contentInsets }: CallsScreenProps) {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  const { uiTypography: typography } = theme;
  const contentInsetTop = contentInsets.top;
  const contentInsetBottom = contentInsets.bottom;
  const state = requireAppStateForDevice<WhatsAppState>(world, "app_whatsapp", deviceId);
  const baseTime = getBaseTime(world, deviceId);
  const callLog = [...(state.callLog ?? [])].sort(
    (left, right) => right.startedAt - left.startedAt,
  );
  const favorites = [
    ...new Map(
      callLog
        .filter((entry) => entry.direction !== "missed")
        .map((entry) => [entry.name, entry] as const),
    ).values(),
  ].slice(0, 3);
  const missedCount = callLog.filter((entry) => entry.direction === "missed").length;

  return (
    <AppScaffold
      title={t("nav.calls")}
      activeTab="calls"
      contentInsetTop={contentInsetTop}
      contentInsetBottom={contentInsetBottom}
      missedCallsCount={missedCount}
      actions={
        <>
          <Link size={19} />
          <Plus size={20} />
        </>
      }
    >
      <div
        style={{
          margin: "14px 16px 8px",
          padding: "10px 12px",
          minHeight: 58,
          display: "flex",
          alignItems: "center",
          gap: 11,
          border: `1px solid ${theme.colors.divider}`,
          borderRadius: 14,
          backgroundColor: theme.colors.headerBackground,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            color: theme.colors.accent,
            backgroundColor: `${theme.colors.accent}16`,
          }}
        >
          <Link size={19} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              ...typography.headline,
              color: theme.colors.receivedBubbleText,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {t("calls.createLink")}
          </div>
          <div
            style={{
              ...typography.caption,
              marginTop: 2,
              color: theme.colors.timestamp,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {t("calls.createLinkBody")}
          </div>
        </div>
      </div>

      {favorites.length > 0 && (
        <>
          <SectionHeader title={t("calls.favorites")} action={t("action.edit")} />
          <div
            style={{
              height: 88,
              padding: "0 16px 8px",
              display: "flex",
              gap: 18,
              overflow: "hidden",
            }}
          >
            {favorites.map((entry) => (
              <div
                key={entry.name}
                style={{
                  width: 66,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    overflow: "hidden",
                    borderRadius: 28,
                    backgroundColor: theme.colors.divider,
                  }}
                >
                  <DeterministicImage
                    src={resolveAvatarWithFallback(entry.avatar, entry.name)}
                    alt={entry.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <span
                  style={{
                    ...typography.caption,
                    width: 72,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                    color: theme.colors.receivedBubbleText,
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionHeader
        title={t("calls.recent")}
        action={callLog.length ? t("action.edit") : undefined}
      />
      <div data-cinematic-subject="calls_list">
        {callLog.length > 0 ? (
          callLog
            .slice(0, 6)
            .map((entry) => <CallRow key={entry.id} entry={entry} baseTime={baseTime} />)
        ) : (
          <EmptyState
            icon={<Phone size={28} />}
            title={t("calls.emptyTitle")}
            body={t("calls.emptyBody")}
          />
        )}
      </div>
    </AppScaffold>
  );
}

export default CallsScreen;
