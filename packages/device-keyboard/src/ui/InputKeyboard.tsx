import React from "react";
import type { InputProjection } from "../contract/index.js";
import { requireInputKeyboardPainter } from "./painters/registry.js";

export interface InputKeyboardProps {
  projection: InputProjection;
  scale?: number;
}

export const InputKeyboard = React.memo(function InputKeyboard(props: InputKeyboardProps) {
  const Painter = requireInputKeyboardPainter(props.projection.surface.platform);
  return <Painter {...props} />;
});
