import type { LayoutRect, SemanticRegion } from "@tokovo/core";

export const X_DESIGN_WIDTH = 393;

export function rect(
  x: number,
  y: number,
  width: number,
  height: number,
): LayoutRect {
  return { x, y, width, height };
}

export function buildSemantic(
  regions: Record<string, SemanticRegion>,
  groups: Record<string, string[]> = {},
) {
  return { regions, groups };
}

export function createPx(viewportWidth: number) {
  const scale = viewportWidth / X_DESIGN_WIDTH;
  return (value: number) => value * scale;
}
