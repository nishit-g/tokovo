import type { SemanticRegion, SemanticLayoutState } from "@tokovo/core";

export function rect(x: number, y: number, width: number, height: number) {
  return { x, y, width, height };
}

export function createPx(width: number) {
  const scale = width / 393;
  return (value: number) => Math.round(value * scale);
}

export function buildSemantic(regions: Record<string, SemanticRegion>): SemanticLayoutState {
  return { regions, groups: {} };
}
