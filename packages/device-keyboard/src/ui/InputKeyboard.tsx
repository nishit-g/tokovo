import React from "react";
import type { InputProjection, InputReturnKey } from "../contract/index.js";
import { resolveInputKeyboardRows } from "./input-layouts.js";

export interface InputKeyboardProps {
  projection: InputProjection;
  scale?: number;
}

const RETURN_LABELS: Partial<
  Record<string, Partial<Record<InputReturnKey, string>>>
> = {
  ar: {
    return: "رجوع",
    send: "إرسال",
    search: "بحث",
    done: "تم",
    go: "انتقال",
    next: "التالي",
  },
  hi: {
    return: "रिटर्न",
    send: "भेजें",
    search: "खोजें",
    done: "पूर्ण",
    go: "जाएँ",
    next: "अगला",
  },
  ja: {
    return: "改行",
    send: "送信",
    search: "検索",
    done: "完了",
    go: "開く",
    next: "次へ",
  },
  ko: {
    return: "리턴",
    send: "전송",
    search: "검색",
    done: "완료",
    go: "이동",
    next: "다음",
  },
  zh: {
    return: "换行",
    send: "发送",
    search: "搜索",
    done: "完成",
    go: "前往",
    next: "下一项",
  },
};

const ENGLISH_RETURN_LABELS: Record<InputReturnKey, string> = {
  return: "return",
  send: "Send",
  search: "Search",
  done: "Done",
  go: "Go",
  next: "Next",
};

function normalizeKey(value: string): string {
  return value.normalize("NFD").toLocaleLowerCase("und");
}

function KeyboardGlyph({
  kind,
  size,
}: {
  kind: "shift" | "delete" | "globe" | "dictation";
  size: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (kind === "shift") {
    return (
      <svg {...common}>
        <path d="M4.25 11.25 12 3.5l7.75 7.75h-4.1v8.25h-7.3v-8.25z" />
      </svg>
    );
  }
  if (kind === "delete") {
    return (
      <svg {...common}>
        <path d="M9.2 5.25h9.1a2 2 0 0 1 2 2v9.5a2 2 0 0 1-2 2H9.2L3.5 12z" />
        <path d="m11 9 6 6m0-6-6 6" />
      </svg>
    );
  }
  if (kind === "globe") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.8 12h16.4M12 3.5c2.2 2.35 3.35 5.18 3.35 8.5S14.2 18.15 12 20.5C9.8 18.15 8.65 15.32 8.65 12S9.8 5.85 12 3.5Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="8.5" y="3.5" width="7" height="11" rx="3.5" />
      <path d="M5.75 11.5a6.25 6.25 0 0 0 12.5 0M12 17.75v2.75M8.75 20.5h6.5" />
    </svg>
  );
}

export const InputKeyboard: React.FC<InputKeyboardProps> = React.memo(
  ({ projection, scale = 1 }) => {
    if (!projection.surface.visible) return null;

    const { surface, locale } = projection;
    const { theme, presentation } = surface;
    const geometry = theme.geometry;
    const colors = theme.colors;
    const rows = resolveInputKeyboardRows(projection);
    const activeKey = surface.activeKey
      ? normalizeKey(surface.activeKey)
      : null;
    const px = (value: number): number => value * scale;
    const height = px(geometry.height);
    const returnLabel =
      RETURN_LABELS[locale.language]?.[surface.returnKey] ??
      ENGLISH_RETURN_LABELS[surface.returnKey];
    const spaceLabel =
      surface.family === "arabic"
        ? "مسافة"
        : surface.family === "kana"
          ? "空白"
          : surface.family === "hangul"
            ? "스페이스"
            : "space";

    const keyStyle = (
      label: string,
      variant: "key" | "special" | "accent" = "key",
      flex = 1,
    ): React.CSSProperties => {
      const normalized = normalizeKey(label);
      const isActive =
        activeKey === normalized ||
        (label === "⌫" && activeKey === "backspace") ||
        (label === returnLabel && activeKey === surface.returnKey) ||
        (label === spaceLabel && activeKey === "space");
      const background =
        variant === "accent"
          ? isActive
            ? colors.accentKeyPressed
            : colors.accentKey
          : variant === "special"
            ? isActive
              ? colors.specialKeyPressed
              : colors.specialKey
            : isActive
              ? colors.keyPressed
              : colors.key;
      return {
        position: "relative",
        flex,
        height: px(geometry.keyHeight),
        minWidth: 0,
        borderRadius: px(geometry.keyRadius),
        background,
        color:
          variant === "accent"
            ? colors.accentKeyText
            : variant === "special"
              ? colors.specialKeyText
              : colors.keyText,
        border: `${Math.max(1, px(0.35))}px solid ${colors.border}`,
        boxShadow: colors.keyShadow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.typography.fontFamily,
        fontSize: px(
          label === returnLabel
            ? theme.typography.returnKeyFontSize
            : label === spaceLabel
              ? theme.typography.specialKeyFontSize
              : variant === "key"
                ? theme.typography.keyFontSize
                : theme.typography.specialKeyFontSize,
        ),
        fontWeight: variant === "accent" ? 600 : 400,
        lineHeight: 1,
        transform: isActive ? "translateY(1px) scale(0.98)" : "none",
        willChange: isActive ? "transform" : undefined,
      };
    };

    const renderKey = (key: string): React.ReactNode => {
      const isActive = activeKey === normalizeKey(key);
      return (
        <div key={key} style={keyStyle(key)}>
          {key}
          {isActive && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: px(geometry.keyHeight + 5),
                transform: "translateX(-50%)",
                minWidth: px(geometry.keyHeight * 1.15),
                height: px(geometry.keyHeight * 1.28),
                padding: `0 ${px(8)}px`,
                borderRadius:
                  presentation.keyPreview === "iosBubble"
                    ? `${px(8)}px ${px(8)}px ${px(5)}px ${px(5)}px`
                    : px(geometry.keyRadius * 1.5),
                background: colors.keyPreview,
                color: colors.keyText,
                boxShadow: colors.keyShadow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: px(theme.typography.keyFontSize * 1.35),
                zIndex: 3,
              }}
            >
              {key}
            </div>
          )}
        </div>
      );
    };

    return (
      <div
        data-input-session={projection.sessionId}
        data-platform={surface.platform}
        data-appearance={surface.appearance}
        style={{
          position: "absolute",
          zIndex: 1000,
          left: 0,
          right: 0,
          bottom: 0,
          height,
          boxSizing: "border-box",
          overflow: "visible",
          padding: `${px(geometry.topPadding)}px ${px(geometry.horizontalPadding)}px ${px(
            geometry.bottomPadding,
          )}px`,
          background: colors.surface,
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          borderTop: `${Math.max(1, px(0.35))}px solid ${colors.border}`,
          transform: `translate3d(0, ${(1 - surface.progress) * height}px, 0)`,
          display: "flex",
          flexDirection: "column",
          gap: px(geometry.rowGap),
          fontFamily: theme.typography.fontFamily,
          contain: "layout style",
          willChange: surface.progress < 1 ? "transform" : undefined,
        }}
      >
        <div
          dir={projection.direction}
          style={{
            height: px(geometry.suggestionHeight),
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            background:
              presentation.suggestionStyle === "strip"
                ? colors.surfaceRaised
                : "transparent",
            borderRadius:
              presentation.suggestionStyle === "strip"
                ? px(geometry.keyRadius)
                : 0,
          }}
        >
          {(surface.suggestions.length > 0 ? surface.suggestions : ["", "", ""])
            .slice(0, 3)
            .map((suggestion, index) => (
              <React.Fragment key={`${suggestion}:${index}`}>
                {index > 0 && presentation.suggestionStyle === "segmented" && (
                  <div
                    style={{
                      width: Math.max(1, px(0.5)),
                      height: "58%",
                      background: colors.suggestionDivider,
                    }}
                  />
                )}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: "center",
                    color: colors.suggestionText,
                    fontSize: px(theme.typography.suggestionFontSize),
                    fontWeight:
                      surface.activeSuggestionIndex === index ? 650 : 400,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {suggestion}
                </div>
              </React.Fragment>
            ))}
        </div>

        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: "flex",
              gap: px(geometry.keyGap),
              paddingInline:
                rowIndex === 1 ? px(surface.platform === "ios" ? 14 : 7) : 0,
            }}
          >
            {rowIndex === 2 && (
              <div style={keyStyle("shift", "special", 1.25)}>
                <KeyboardGlyph kind="shift" size={px(20)} />
              </div>
            )}
            {row.map(renderKey)}
            {rowIndex === 2 && (
              <div style={keyStyle("⌫", "special", 1.25)}>
                <KeyboardGlyph kind="delete" size={px(21)} />
              </div>
            )}
          </div>
        ))}

        <div style={{ display: "flex", gap: px(geometry.keyGap) }}>
          <div
            style={keyStyle(
              surface.layout === "letters" ? "123" : "ABC",
              "special",
              1.2,
            )}
          >
            {surface.layout === "letters" ? "123" : "ABC"}
          </div>
          <div style={keyStyle("language", "special", 0.85)}>
            <KeyboardGlyph kind="globe" size={px(19)} />
          </div>
          <div style={keyStyle(spaceLabel, "key", 4.2)}>{spaceLabel}</div>
          {surface.platform === "ios" && (
            <div style={keyStyle("dictation", "special", 0.85)}>
              <KeyboardGlyph kind="dictation" size={px(18)} />
            </div>
          )}
          <div
            style={keyStyle(
              returnLabel,
              presentation.returnKeyStyle === "accent" ? "accent" : "special",
              1.45,
            )}
          >
            {returnLabel}
          </div>
        </div>
      </div>
    );
  },
);

InputKeyboard.displayName = "InputKeyboard";
