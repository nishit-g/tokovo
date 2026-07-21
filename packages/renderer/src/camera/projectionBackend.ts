import type { CameraProjectionPass } from "@tokovo/camera";

export type CameraProjectionBackend =
  | "affine-css"
  | "preview-svg"
  | "texture-compositor";

const TEXTURE_PASS_KINDS = new Set<CameraProjectionPass["kind"]>([
  "radial-warp",
  "fisheye-warp",
  "anamorphic-edge-stretch",
  "directional-smear",
]);

/**
 * Selects a backend without visual fallback. Projective tilt remains a GPU
 * composited CSS transform. Non-linear release output must be rasterized and
 * processed by the offline texture compositor; SVG filters are preview-only.
 */
export function selectCameraProjectionBackend(input: {
  mode: "preview" | "render";
  passes: readonly CameraProjectionPass[];
}): CameraProjectionBackend {
  const needsTexture = input.passes.some((pass) =>
    TEXTURE_PASS_KINDS.has(pass.kind),
  );
  if (!needsTexture) return "affine-css";
  return input.mode === "preview" ? "preview-svg" : "texture-compositor";
}

export class CameraProjectionBackendError extends Error {
  readonly code = "CAM_TEXTURE_COMPOSITOR_REQUIRED";

  constructor(outputId: string, frame: number) {
    super(
      `Camera output "${outputId}" at frame ${frame} requires the offline texture compositor; ` +
        "the SVG reference painter is forbidden for release rendering.",
    );
    this.name = "CameraProjectionBackendError";
  }
}
