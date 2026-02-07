import type { Rect } from "@tokovo/core";
import type { TypewriterThemeTokens } from "../theme/types.js";

export type TypewriterGeometry = {
  desk: Rect;
  paper: Rect;
  textArea: Rect;
  typewriter: Rect;
};

export function computeTypewriterGeometry(
  dim: { width: number; height: number },
  theme: TypewriterThemeTokens,
): TypewriterGeometry {
  const vw = dim.width;
  const vh = dim.height;

  const paperWidth = Math.min(vw * theme.paper.widthPct, theme.paper.maxWidthPx);
  const paperHeight = vh * theme.paper.heightPct;
  const paperX = (vw - paperWidth) / 2;
  const paperY = vh * theme.paper.topPct;

  const headerHeight =
    theme.text.headerTopPadPx +
    theme.text.headerBottomPadPx +
    theme.text.metaLineHeightPx * 4 +
    theme.text.headerGapPx * 3;

  const textInsetX = paperWidth * theme.text.marginXPct;
  const textAreaWidth = Math.min(
    paperWidth - textInsetX * 2,
    theme.layout.maxCols * theme.text.charWidthPx,
  );
  const textAreaHeight = Math.min(
    paperHeight - headerHeight - theme.text.headerBottomPadPx,
    theme.layout.maxRows * theme.text.lineHeightPx,
  );

  const textAreaX = paperX + (paperWidth - textAreaWidth) / 2;
  const textAreaY = paperY + headerHeight + Math.max(8, theme.text.headerBottomPadPx);

  const typewriterWidth = vw * theme.typewriter.wrapWidthPct;
  const typewriterHeight = vh * theme.typewriter.wrapHeightPct;
  const typewriterX = (vw - typewriterWidth) / 2;
  const typewriterY = vh - typewriterHeight;

  return {
    desk: { x: 0, y: 0, width: vw, height: vh },
    paper: { x: paperX, y: paperY, width: paperWidth, height: paperHeight },
    textArea: {
      x: textAreaX,
      y: textAreaY,
      width: textAreaWidth,
      height: textAreaHeight,
    },
    typewriter: {
      x: typewriterX,
      y: typewriterY,
      width: typewriterWidth,
      height: typewriterHeight,
    },
  };
}

