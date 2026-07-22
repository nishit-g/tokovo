import type {
  CompositionProfileId,
  EditorialCompositionProfile,
  VisualRect,
  VisualSize,
} from "./contract.js";
import { requireEditorialCompositionProfile } from "./profiles.js";

function overlapArea(a: VisualRect, b: VisualRect, padding: number): number {
  const left = Math.max(a.x, b.x - padding);
  const top = Math.max(a.y, b.y - padding);
  const right = Math.min(a.x + a.width, b.x + b.width + padding);
  const bottom = Math.min(a.y + a.height, b.y + b.height + padding);
  return Math.max(0, right - left) * Math.max(0, bottom - top);
}

/** Deterministically places an overlay into designed negative space. */
export function solveEditorialOverlayViewport(input: {
  canvas: VisualSize;
  overlay: VisualSize;
  compositionProfileId: CompositionProfileId;
  protectedRegions?: readonly VisualRect[];
}): VisualRect {
  const profile: EditorialCompositionProfile = requireEditorialCompositionProfile(
    input.compositionProfileId,
  );
  const margin = profile.protectedRegionPadding;
  if (
    input.overlay.width + margin * 2 > input.canvas.width ||
    input.overlay.height + margin * 2 > input.canvas.height
  ) {
    throw new Error(
      `VISUAL_OVERLAY_TOO_LARGE: ${input.overlay.width}x${input.overlay.height} cannot fit ${input.canvas.width}x${input.canvas.height}.`,
    );
  }
  const horizontal = [
    margin,
    (input.canvas.width - input.overlay.width) / 2,
    input.canvas.width - input.overlay.width - margin,
  ];
  const vertical = [
    margin,
    (input.canvas.height - input.overlay.height) / 2,
    input.canvas.height - input.overlay.height - margin,
  ];
  const candidates = vertical.flatMap((y) => horizontal.map((x) => ({ x, y, ...input.overlay })));
  const preferred = profile.negativeSpacePreference;
  const preferredX =
    preferred === "right"
      ? horizontal[2]
      : preferred === "left"
        ? horizontal[0]
        : input.canvas.width * profile.preferredPosition[0] - input.overlay.width / 2;
  const preferredY =
    preferred === "bottom"
      ? vertical[2]
      : preferred === "top"
        ? vertical[0]
        : input.canvas.height * profile.preferredPosition[1] - input.overlay.height / 2;
  const ranked = [...candidates].sort((a, b) => {
    const overlap = (rect: VisualRect) =>
      (input.protectedRegions ?? []).reduce(
        (sum, protectedRegion) => sum + overlapArea(rect, protectedRegion, margin),
        0,
      );
    const preferencePenalty = (rect: VisualRect) =>
      Math.abs(rect.x - preferredX) + Math.abs(rect.y - preferredY);
    return overlap(a) - overlap(b) || preferencePenalty(a) - preferencePenalty(b);
  });
  const selected = ranked[0];
  if (!selected) {
    throw new Error("VISUAL_OVERLAY_PLACEMENT_EMPTY: no deterministic placement candidates exist.");
  }
  return selected;
}
