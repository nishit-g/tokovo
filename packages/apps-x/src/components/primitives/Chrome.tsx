import React from "react";
import { useXExperience } from "../../experience/context.js";
import { XIcon, XLogo, type XIconName } from "./Icon.js";

export const IconButton: React.FC<{
  icon: XIconName;
  label: string;
  badge?: number;
  size?: number;
}> = ({ icon, label, badge = 0, size = 21 }) => {
  const experience = useXExperience();
  return (
    <div
      role="button"
      aria-label={label}
      style={{
        width: experience.metrics.touchTarget,
        height: experience.metrics.touchTarget,
        display: "grid",
        placeItems: "center",
        position: "relative",
        color: experience.colors.text,
        flex: "0 0 auto",
      }}
    >
      <XIcon name={icon} size={size} />
      {badge > 0 ? (
        <span
          style={{
            position: "absolute",
            top: 3,
            insetInlineEnd: 1,
            minWidth: 16,
            height: 16,
            paddingInline: 4,
            borderRadius: 9,
            display: "grid",
            placeItems: "center",
            background: experience.colors.accent,
            color: "#FFFFFF",
            border: `2px solid ${experience.colors.background}`,
            fontSize: 9,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </div>
  );
};

export const AppHeader: React.FC<{
  title?: string;
  onBack?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  centeredLogo?: boolean;
  subtitle?: string;
}> = ({ title, onBack = false, leading, trailing, centeredLogo = false, subtitle }) => {
  const experience = useXExperience();
  return (
    <header
      style={{
        height: experience.metrics.headerHeight,
        minHeight: experience.metrics.headerHeight,
        paddingInline: 8,
        display: "grid",
        gridTemplateColumns: "52px minmax(0,1fr) 52px",
        alignItems: "center",
        borderBottom: `1px solid ${experience.colors.border}`,
        background: experience.colors.background,
        position: "relative",
        zIndex: 5,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {leading ?? (onBack ? <IconButton icon="back" label="Back" size={22} /> : null)}
      </div>
      <div style={{ minWidth: 0, textAlign: centeredLogo ? "center" : "start" }}>
        {centeredLogo ? <XLogo size={24} color={experience.colors.text} /> : null}
        {title ? (
          <div style={{ fontSize: 20 * experience.type.scale, lineHeight: 1.08, fontWeight: 750, letterSpacing: "-.025em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </div>
        ) : null}
        {subtitle ? (
          <div style={{ marginTop: 1, color: experience.colors.textSecondary, fontSize: 12 * experience.type.scale, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>{trailing}</div>
    </header>
  );
};

type NavItem = "home" | "search" | "notifications" | "messages";

export const BottomNav: React.FC<{
  active: NavItem;
  notificationBadge?: number;
  messageBadge?: number;
}> = ({ active, notificationBadge = 0, messageBadge = 0 }) => {
  const experience = useXExperience();
  const items: Array<{ id: NavItem; icon: XIconName; label: string; badge: number }> = [
    { id: "home", icon: "home", label: experience.t("home"), badge: 0 },
    { id: "search", icon: "search", label: experience.t("search"), badge: 0 },
    { id: "notifications", icon: active === "notifications" ? "bellActive" : "bell", label: experience.t("notifications"), badge: notificationBadge },
    { id: "messages", icon: "mail", label: experience.t("messages"), badge: messageBadge },
  ];
  return (
    <nav
      aria-label="Primary"
      style={{
        height: experience.metrics.navHeight,
        minHeight: experience.metrics.navHeight,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        alignItems: "center",
        borderTop: `1px solid ${experience.colors.border}`,
        background: experience.colors.background,
        marginTop: "auto",
        position: "relative",
        zIndex: 6,
      }}
    >
      {items.map((item) => (
        <div key={item.id} style={{ display: "grid", placeItems: "center", color: active === item.id ? experience.colors.text : experience.colors.textSecondary }}>
          <IconButton icon={item.icon} label={item.label} badge={item.badge} size={active === item.id ? 25 : 24} />
        </div>
      ))}
    </nav>
  );
};

export const TabBar: React.FC<{
  tabs: Array<{ id: string; label: string }>;
  active: string;
}> = ({ tabs, active }) => {
  const experience = useXExperience();
  return (
    <div
      role="tablist"
      style={{
        height: 48,
        display: "grid",
        gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
        borderBottom: `1px solid ${experience.colors.border}`,
        background: experience.colors.background,
        flex: "0 0 auto",
      }}
    >
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={selected}
            style={{
              display: "grid",
              placeItems: "center",
              position: "relative",
              color: selected ? experience.colors.text : experience.colors.textSecondary,
              fontSize: 14 * experience.type.scale,
              fontWeight: selected ? 650 : 500,
              minWidth: 0,
            }}
          >
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "90%" }}>{tab.label}</span>
            {selected ? (
              <span style={{ position: "absolute", bottom: 0, width: 58, maxWidth: "68%", height: 4, borderRadius: 4, background: experience.colors.accent }} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export const EmptyState: React.FC<{
  icon: XIconName;
  title: string;
  body: string;
}> = ({ icon, title, body }) => {
  const experience = useXExperience();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "28px 38px 72px", maxWidth: 430, margin: "0 auto" }}>
      <div style={{ width: 58, height: 58, borderRadius: 20, display: "grid", placeItems: "center", background: experience.colors.accentSoft, color: experience.colors.accent, marginBottom: 22 }}>
        <XIcon name={icon} size={29} strokeWidth={1.65} />
      </div>
      <h2 style={{ margin: 0, fontFamily: experience.type.displayFamily, fontSize: 29 * experience.type.scale, lineHeight: 1.03, letterSpacing: "-.035em", fontWeight: 800 }}>{title}</h2>
      <p style={{ margin: "12px 0 0", color: experience.colors.textSecondary, fontSize: 15 * experience.type.scale, lineHeight: 1.42 }}>{body}</p>
    </div>
  );
};
