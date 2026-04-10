import React from "react";
import { KeyRow } from "./KeyRow.js";
import { Key } from "./Key.js";
import type { KeyboardState } from "../runtime/state.js";
import { isKeyActive, getKeyboardSlideProgress } from "../runtime/selectors.js";
import { splitGraphemes } from "../runtime/graphemes.js";
import {
  keyboardTypography,
  keyboardSpacing,
  getKeyboardColors,
  createKeyboardShadows,
} from "./tokens.js";
import { getLayout, type KeyboardLayout } from "./layouts.js";

interface KeyboardProps {
  state: KeyboardState;
  currentFrame: number;
  fps: number;
  scale?: number;
  layout?: KeyboardLayout;
  theme?: "light" | "dark";
}

export const Keyboard: React.FC<KeyboardProps> = ({
  state,
  currentFrame,
  fps,
  scale = 3,
  layout: customLayout,
  theme = "light",
}) => {
  const slideProgress = getKeyboardSlideProgress(state, currentFrame, fps);

  if (slideProgress === 0) {
    return null;
  }

  const layout = customLayout || getLayout(state.keyboardType);
  const colors = getKeyboardColors(theme);
  const shadows = createKeyboardShadows(colors);
  const scaledHeight = keyboardSpacing.height * scale;
  const translateY = (1 - slideProgress) * scaledHeight;

  const getActiveKey = (): string | null => {
    for (const row of layout.rows) {
      for (const key of row) {
        if (isKeyActive(state, key, currentFrame)) {
          return key;
        }
      }
    }
    for (const specialKey of Object.keys(layout.specialKeys)) {
      if (isKeyActive(state, specialKey, currentFrame)) {
        return specialKey;
      }
    }
    return null;
  };

  const activeKey = getActiveKey();

  const getKeyPressState = (
    key: string,
  ): { startFrame: number; duration: number } | null => {
    const keyLower = key.toLowerCase();
    let best: { startFrame: number; duration: number } | null = null;

    for (const kp of state.activeKeyPresses) {
      if (kp.key.toLowerCase() !== keyLower) continue;
      const endFrame = kp.startFrame + kp.duration;
      if (currentFrame >= kp.startFrame && currentFrame < endFrame) {
        if (!best || kp.startFrame > best.startFrame) {
          best = { startFrame: kp.startFrame, duration: kp.duration };
        }
      }
    }

    if (state.typingAnimation) {
      const { text, startFrame, charDelay } = state.typingAnimation;
      const graphemes = splitGraphemes(text);
      const elapsed = currentFrame - startFrame;
      if (elapsed >= 0) {
        const charIndex = Math.floor(elapsed / charDelay);
        const frameInChar = elapsed % charDelay;
        const keyPressDuration = Math.min(charDelay, 6);

        if (charIndex < graphemes.length && frameInChar < keyPressDuration) {
          const activeChar = graphemes[charIndex];
          const matches =
            activeChar.toLowerCase() === keyLower ||
            (activeChar === " " && keyLower === "space");
          if (matches) {
            const pressStartFrame = startFrame + charIndex * charDelay;
            const press = {
              startFrame: pressStartFrame,
              duration: keyPressDuration,
            };
            if (!best || press.startFrame > best.startFrame) {
              best = press;
            }
          }
        }
      }
    }

    return best;
  };

  const displaySuggestions =
    state.suggestions.length > 0
      ? state.suggestions.slice(0, 3)
      : ["I'm", "I", "In"];

  const sp = keyboardSpacing;
  const typography = keyboardTypography;

  const isQwertyStyle = layout.id === "qwerty" || layout.id === "email";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: scaledHeight,
        background: colors.background,
        backdropFilter: colors.backgroundBlur,
        WebkitBackdropFilter: colors.backgroundBlur,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        flexDirection: "column",
        paddingTop: sp.padding.top * scale,
        paddingBottom: sp.padding.bottom * scale,
        gap: sp.gap.rows * scale,
        zIndex: 1000,
        boxShadow: shadows.keyboard(scale),
      }}
    >
      {isQwertyStyle && (
        <div
          style={{
            height: sp.suggestion.height * scale,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            marginBottom: sp.suggestion.marginBottom * scale,
            paddingLeft: sp.padding.horizontal * 3 * scale,
            paddingRight: sp.padding.horizontal * 3 * scale,
          }}
        >
          {displaySuggestions.map((suggestion, i) => {
            const isMiddle = i === 1;
            const isActive = state.activeSuggestionIndex === i;

            return (
              <React.Fragment key={i}>
                {i > 0 && (
                  <div
                    style={{
                      width: sp.suggestion.dividerWidth * scale,
                      height: sp.suggestion.dividerHeight * scale,
                      backgroundColor: colors.suggestion.divider,
                    }}
                  />
                )}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: `${sp.suggestion.padding.vertical * scale}px ${sp.suggestion.padding.horizontal * scale}px`,
                    backgroundColor: isActive
                      ? colors.suggestion.active
                      : colors.suggestion.background,
                    borderRadius: sp.suggestion.borderRadius * scale,
                    fontSize: typography.suggestion.normal.fontSize * scale,
                    fontWeight: isMiddle
                      ? typography.suggestion.emphasized.fontWeight
                      : typography.suggestion.normal.fontWeight,
                    color: colors.suggestion.text,
                    fontFamily: typography.fontFamily,
                    boxShadow: isActive
                      ? shadows.suggestionActive(scale)
                      : "none",
                    margin: `0 ${sp.suggestion.margin * scale}px`,
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  {suggestion}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      <KeyRow
        keys={layout.rows[0]}
        activeKey={activeKey}
        currentFrame={currentFrame}
        getKeyPressState={getKeyPressState}
        scale={scale}
        theme={theme}
      />

      {layout.rows[1] && (
        <div
          style={{
            paddingLeft: sp.row2Padding * scale,
            paddingRight: sp.row2Padding * scale,
          }}
        >
          <KeyRow
            keys={layout.rows[1]}
            activeKey={activeKey}
            currentFrame={currentFrame}
            getKeyPressState={getKeyPressState}
            scale={scale}
            theme={theme}
          />
        </div>
      )}

      {layout.rows[2] && isQwertyStyle && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: sp.gap.keys * scale,
            paddingLeft: sp.row3Padding * scale,
            paddingRight: sp.row3Padding * scale,
          }}
        >
          {layout.specialKeys.shift && (
            <Key
              label={layout.specialKeys.shift.label || "⇧"}
              width={layout.specialKeys.shift.width}
              variant="special"
              isActive={activeKey === "shift"}
              currentFrame={currentFrame}
              pressStartFrame={getKeyPressState("shift")?.startFrame ?? null}
              pressDuration={getKeyPressState("shift")?.duration}
              scale={scale}
              theme={theme}
            />
          )}
          <div style={{ display: "flex", gap: sp.gap.keys * scale }}>
            {layout.rows[2].map((key) => (
              <Key
                key={key}
                label={key}
                width={sp.key.defaultWidth}
                isActive={activeKey?.toLowerCase() === key.toLowerCase()}
                currentFrame={currentFrame}
                pressStartFrame={getKeyPressState(key)?.startFrame ?? null}
                pressDuration={getKeyPressState(key)?.duration}
                scale={scale}
                theme={theme}
              />
            ))}
          </div>
          {layout.specialKeys.backspace && (
            <Key
              label={layout.specialKeys.backspace.label || "⌫"}
              width={layout.specialKeys.backspace.width}
              variant="special"
              isActive={activeKey === "backspace"}
              currentFrame={currentFrame}
              pressStartFrame={
                getKeyPressState("backspace")?.startFrame ?? null
              }
              pressDuration={getKeyPressState("backspace")?.duration}
              scale={scale}
              theme={theme}
            />
          )}
        </div>
      )}

      {!isQwertyStyle && layout.rows[2] && (
        <KeyRow
          keys={layout.rows[2]}
          activeKey={activeKey}
          currentFrame={currentFrame}
          getKeyPressState={getKeyPressState}
          scale={scale}
          theme={theme}
        />
      )}

      {!isQwertyStyle && layout.rows[3] && (
        <KeyRow
          keys={layout.rows[3]}
          activeKey={activeKey}
          currentFrame={currentFrame}
          getKeyPressState={getKeyPressState}
          scale={scale}
          theme={theme}
        />
      )}

      {layout.bottomRow.showSpace && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: sp.gap.keys * scale,
            paddingLeft: sp.row4Padding * scale,
            paddingRight: sp.row4Padding * scale,
          }}
        >
          {layout.bottomRow.showNumberMode && layout.specialKeys.numberMode && (
            <Key
              label={layout.specialKeys.numberMode.label || "123"}
              width={layout.specialKeys.numberMode.width}
              variant="special"
              scale={scale}
              theme={theme}
            />
          )}
          {layout.bottomRow.showGlobe && layout.specialKeys.globe && (
            <Key
              label={layout.specialKeys.globe.label || "🌐"}
              width={layout.specialKeys.globe.width}
              variant="special"
              scale={scale}
              theme={theme}
            />
          )}
          {layout.specialKeys.space && (
            <Key
              label="space"
              width={layout.specialKeys.space.width}
              variant="space"
              isActive={activeKey === "space"}
              currentFrame={currentFrame}
              pressStartFrame={getKeyPressState("space")?.startFrame ?? null}
              pressDuration={getKeyPressState("space")?.duration}
              scale={scale}
              theme={theme}
            />
          )}
          {layout.bottomRow.showReturn && layout.specialKeys.return && (
            <Key
              label={
                state.returnKeyType === "send"
                  ? "Send"
                  : layout.specialKeys.return.label || "return"
              }
              width={layout.specialKeys.return.width}
              variant="return"
              isActive={activeKey === "return" || activeKey === "send"}
              currentFrame={currentFrame}
              pressStartFrame={
                getKeyPressState("return")?.startFrame ??
                getKeyPressState("send")?.startFrame ??
                null
              }
              pressDuration={
                getKeyPressState("return")?.duration ??
                getKeyPressState("send")?.duration
              }
              scale={scale}
              theme={theme}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Keyboard;
