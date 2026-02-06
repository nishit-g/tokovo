import React from "react";
import { Key } from "./Key.js";
import { keyboardSpacing, type KeyboardTheme } from "./tokens.js";

interface KeyRowProps {
  keys: readonly string[];
  activeKey?: string | null;
  currentFrame?: number;
  getKeyPressState?: (key: string) => { startFrame: number; duration: number } | null;
  keyWidth?: number;
  gap?: number;
  scale?: number;
  theme?: KeyboardTheme;
}

export const KeyRow: React.FC<KeyRowProps> = ({
  keys,
  activeKey,
  currentFrame,
  getKeyPressState,
  keyWidth = keyboardSpacing.key.defaultWidth,
  gap = keyboardSpacing.gap.keys,
  scale = 1,
  theme = "light",
}) => {
  const scaledGap = gap * scale;

  return (
    <div
      style={{
        display: "flex",
        gap: scaledGap,
        justifyContent: "center",
      }}
    >
      {keys.map((key) => (
        (() => {
          const press = getKeyPressState?.(key) ?? null;
          const isActive =
            press !== null ||
            activeKey?.toLowerCase() === key.toLowerCase();
          return (
            <Key
              key={key}
              label={key}
              width={keyWidth}
              isActive={isActive}
              currentFrame={currentFrame}
              pressStartFrame={press?.startFrame ?? null}
              pressDuration={press?.duration}
              scale={scale}
              theme={theme}
            />
          );
        })()
      ))}
    </div>
  );
};

export default KeyRow;
