export interface Live2DPreviewManifestCheck {
  ok: boolean;
  reason?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function validateLive2DModelManifest(
  manifest: unknown,
): Live2DPreviewManifestCheck {
  if (!isObject(manifest)) {
    return {
      ok: false,
      reason: "Model manifest is not a JSON object",
    };
  }

  const fileReferences = manifest.FileReferences;
  if (!isObject(fileReferences)) {
    return {
      ok: false,
      reason: "Model manifest is missing FileReferences",
    };
  }

  const moc = fileReferences.Moc;
  const textures = fileReferences.Textures;
  if (typeof moc !== "string" || moc.length === 0) {
    return {
      ok: false,
      reason: "Model manifest is missing FileReferences.Moc",
    };
  }

  if (!Array.isArray(textures) || textures.length === 0) {
    return {
      ok: false,
      reason: "Model manifest is missing FileReferences.Textures",
    };
  }

  return { ok: true };
}
