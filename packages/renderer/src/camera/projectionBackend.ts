import type { CameraProjectionPass } from "@tokovo/camera";

export type CameraProjectionBackend =
  | "affine-css"
  | "preview-svg"
  | "texture-compositor";

export interface CameraProjectionPassRegistration {
  kind: CameraProjectionPass["kind"];
  version: 1;
  releaseBackend: "composited" | "texture";
}

export class CameraProjectionPassRegistry {
  readonly #entries = new Map<string, CameraProjectionPassRegistration>();

  register(registration: CameraProjectionPassRegistration): void {
    const key = `${registration.kind}@${registration.version}`;
    if (this.#entries.has(key)) {
      throw new Error(
        `Camera projection pass renderer "${key}" is already registered.`,
      );
    }
    this.#entries.set(key, registration);
  }

  require(
    kind: CameraProjectionPass["kind"],
    version: 1,
  ): CameraProjectionPassRegistration {
    const key = `${kind}@${version}`;
    const registration = this.#entries.get(key);
    if (!registration) {
      throw new CameraProjectionPassRegistrationError(kind, version);
    }
    return registration;
  }

  list(): readonly CameraProjectionPassRegistration[] {
    return [...this.#entries.values()].sort((left, right) =>
      left.kind.localeCompare(right.kind),
    );
  }
}

export function createBuiltinCameraProjectionPassRegistry(): CameraProjectionPassRegistry {
  const registry = new CameraProjectionPassRegistry();
  for (const registration of [
    { kind: "projective-warp", version: 1, releaseBackend: "composited" },
    { kind: "color-grade", version: 1, releaseBackend: "composited" },
    { kind: "radial-warp", version: 1, releaseBackend: "texture" },
    { kind: "fisheye-warp", version: 1, releaseBackend: "texture" },
    { kind: "anamorphic-edge-stretch", version: 1, releaseBackend: "texture" },
    { kind: "directional-smear", version: 1, releaseBackend: "texture" },
  ] as const) {
    registry.register(registration);
  }
  return registry;
}

const BUILTIN_PROJECTION_PASS_REGISTRY =
  createBuiltinCameraProjectionPassRegistry();

/**
 * Selects a backend without visual fallback. Projective tilt remains a GPU
 * composited CSS transform. Non-linear release output must be rasterized and
 * processed by the offline texture compositor; SVG filters are preview-only.
 */
export function selectCameraProjectionBackend(input: {
  mode: "preview" | "render";
  passes: readonly CameraProjectionPass[];
  registry?: CameraProjectionPassRegistry;
}): CameraProjectionBackend {
  const registry = input.registry ?? BUILTIN_PROJECTION_PASS_REGISTRY;
  const registrations = input.passes.map((pass) =>
    registry.require(pass.kind, 1),
  );
  const needsTexture = registrations.some(
    (registration) => registration.releaseBackend === "texture",
  );
  if (!needsTexture) return "affine-css";
  return input.mode === "preview" ? "preview-svg" : "texture-compositor";
}

export class CameraProjectionPassRegistrationError extends Error {
  readonly code = "CAM_PROJECTION_PASS_RENDERER_MISSING";

  constructor(kind: CameraProjectionPass["kind"], version: number) {
    super(
      `No renderer is registered for camera projection pass "${kind}@${version}".`,
    );
    this.name = "CameraProjectionPassRegistrationError";
  }
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
