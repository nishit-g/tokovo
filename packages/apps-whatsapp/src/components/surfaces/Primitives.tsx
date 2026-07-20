import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { useTheme } from "../../experience/ExperienceContext.js";

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: string;
}) {
  const theme = useTheme();
  const { uiSpacing: spacing, uiTypography: typography } = theme;
  return (
    <div
      style={{
        minHeight: 34,
        padding: `10px ${spacing.pagePaddingX}px 6px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span
        style={{
          ...typography.caption,
          color: theme.colors.timestamp,
          fontWeight: 600,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {title}
      </span>
      {action && (
        <span
          style={{
            ...typography.caption,
            color: theme.colors.accent,
            fontWeight: 600,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {action}
        </span>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  const theme = useTheme();
  const { uiSpacing: spacing, uiTypography: typography } = theme;
  return (
    <div
      style={{
        margin: `12px ${spacing.pagePaddingWide}px`,
        padding: "24px 22px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 7,
        textAlign: "center",
        border: `1px solid ${theme.colors.divider}`,
        borderRadius: 18,
        backgroundColor: theme.colors.surfaceMuted,
      }}
    >
      <div style={{ color: theme.colors.accent }}>{icon}</div>
      <div
        style={{
          ...typography.headline,
          color: theme.colors.receivedBubbleText,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {title}
      </div>
      <div
        style={{
          ...typography.body,
          maxWidth: 290,
          color: theme.colors.timestamp,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {body}
      </div>
    </div>
  );
}

export function SettingsGroup({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <div
      style={{
        margin: "0 16px 16px",
        overflow: "hidden",
        border: `1px solid ${theme.colors.divider}`,
        borderRadius: 14,
        backgroundColor: theme.colors.background,
      }}
    >
      {children}
    </div>
  );
}

export function SettingsRow({
  icon,
  iconColor,
  iconBackground,
  title,
  subtitle,
  trailing,
  danger,
  isLast,
}: {
  icon?: ReactNode;
  iconColor?: string;
  iconBackground?: string;
  title: string;
  subtitle?: string;
  trailing?: string;
  danger?: boolean;
  isLast?: boolean;
}) {
  const theme = useTheme();
  const { uiTypography: typography } = theme;
  return (
    <div
      style={{
        minHeight: subtitle ? 62 : 50,
        padding: "7px 12px",
        display: "flex",
        alignItems: "center",
        gap: 11,
        borderBottom: isLast ? undefined : `0.5px solid ${theme.colors.divider}`,
      }}
    >
      {icon && (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor ?? "#FFFFFF",
            backgroundColor: iconBackground ?? theme.colors.accent,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            ...typography.body,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: danger
              ? theme.colors.callCardMissed
              : theme.colors.receivedBubbleText,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              ...typography.caption,
              marginTop: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: theme.colors.timestamp,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {trailing && (
        <span
          style={{
            ...typography.caption,
            maxWidth: "42%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flexShrink: 1,
            color: theme.colors.timestamp,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {trailing}
        </span>
      )}
      <ChevronRight size={16} color={theme.colors.timestamp} />
    </div>
  );
}
