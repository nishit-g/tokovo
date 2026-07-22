import type React from "react";
import type { InputPlatform } from "../../contract/index.js";
import type { InputKeyboardProps } from "../InputKeyboard.js";
import { AndroidInputKeyboardPainter } from "./AndroidInputKeyboardPainter.js";
import { IOSInputKeyboardPainter } from "./IOSInputKeyboardPainter.js";

export type InputKeyboardPainter = React.ComponentType<InputKeyboardProps>;

const painters = new Map<InputPlatform, InputKeyboardPainter>([
  ["ios", IOSInputKeyboardPainter],
  ["android", AndroidInputKeyboardPainter],
]);

export function registerInputKeyboardPainter(
  platform: InputPlatform,
  painter: InputKeyboardPainter,
): void {
  if (painters.has(platform)) {
    throw new Error(`INPUT_PAINTER_COLLISION: ${platform} already has a keyboard painter.`);
  }
  painters.set(platform, painter);
}

export function requireInputKeyboardPainter(platform: InputPlatform): InputKeyboardPainter {
  const painter = painters.get(platform);
  if (!painter) throw new Error(`INPUT_PAINTER_MISSING: no keyboard painter for ${platform}.`);
  return painter;
}
