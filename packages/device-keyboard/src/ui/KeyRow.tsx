import React from "react";
import { Key } from "./Key";
import { keyboardSpacing, type KeyboardTheme } from "./tokens";

interface KeyRowProps {
  keys: readonly string[];
  activeKey?: string | null;
  keyWidth?: number;
  gap?: number;
  scale?: number;
  theme?: KeyboardTheme;
}

export const KeyRow: React.FC<KeyRowProps> = ({
  keys,
  activeKey,
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
        <Key
          key={key}
          label={key}
          width={keyWidth}
          isActive={activeKey?.toLowerCase() === key.toLowerCase()}
          scale={scale}
          theme={theme}
        />
      ))}
    </div>
  );
};

export default KeyRow;
