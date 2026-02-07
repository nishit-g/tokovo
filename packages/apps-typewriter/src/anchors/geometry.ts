import type { Rect } from "@tokovo/core";

export type TypewriterGeometry = {
  desk: Rect;
  paper: Rect;
  textArea: Rect;
  typewriter: Rect;
};

export function computeTypewriterGeometry(dim: { width: number; height: number }): TypewriterGeometry {
  const vw = dim.width;
  const vh = dim.height;

  const paperWidth = Math.min(vw * 0.72, 940);
  const paperHeight = vh * 0.62;
  const paperX = (vw - paperWidth) / 2;
  const paperY = vh * 0.07;

  const textInsetX = paperWidth * 0.09;
  const textInsetTop = paperHeight * 0.12;
  const textInsetBottom = paperHeight * 0.10;

  const typewriterY = paperY + paperHeight - vh * 0.02;

  return {
    desk: { x: 0, y: 0, width: vw, height: vh },
    paper: { x: paperX, y: paperY, width: paperWidth, height: paperHeight },
    textArea: {
      x: paperX + textInsetX,
      y: paperY + textInsetTop,
      width: paperWidth - textInsetX * 2,
      height: paperHeight - textInsetTop - textInsetBottom,
    },
    typewriter: {
      x: vw * 0.05,
      y: typewriterY,
      width: vw * 0.90,
      height: Math.max(0, vh - typewriterY),
    },
  };
}

