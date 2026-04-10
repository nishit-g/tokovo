type EnvLike = Record<string, string | undefined>;
type AssetUrlMap = Record<string, string>;

function getEnvValue(
  env: EnvLike,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function normalizePublicAssetPath(src: string): string {
  return src.startsWith("/") ? src.slice(1) : src;
}

function getRuntimeAssetUrlMap(): AssetUrlMap | null {
  const value = (globalThis as { __TOKOVO_ASSET_URL_MAP__?: unknown })
    .__TOKOVO_ASSET_URL_MAP__;
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as AssetUrlMap;
}

function getEnvAssetUrlMap(env: EnvLike): AssetUrlMap | null {
  const raw = env.TOKOVO_ASSET_URL_MAP?.trim();
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed as AssetUrlMap;
  } catch {
    return null;
  }
}

export function isRemoteAssetUrl(src: string): boolean {
  return /^(?:https?:)?\/\//.test(src);
}

export function isR2AssetLocator(src: string): boolean {
  return src.startsWith("r2://");
}

export function isInlineAssetUrl(src: string): boolean {
  return src.startsWith("data:") || src.startsWith("blob:");
}

export function isPublicAssetPath(src: string): boolean {
  return (
    Boolean(src) &&
    !isInlineAssetUrl(src) &&
    !isRemoteAssetUrl(src) &&
    !isR2AssetLocator(src)
  );
}

export function getPublicAssetBaseUrl(
  env: EnvLike = process.env,
): string | null {
  return (
    getEnvValue(env, [
      "TOKOVO_PUBLIC_ASSET_BASE_URL",
      "TOKOVO_ASSET_BASE_URL",
    ]) ?? null
  );
}

export function resolvePublicAssetUrl(
  src: string,
  env: EnvLike = process.env,
): string {
  if (!isPublicAssetPath(src)) {
    return src;
  }

  const baseUrl = getPublicAssetBaseUrl(env);
  if (!baseUrl) {
    return src;
  }

  return new URL(
    normalizePublicAssetPath(src),
    normalizeBaseUrl(baseUrl),
  ).toString();
}

export function resolveMappedAssetUrl(
  src: string,
  env: EnvLike = process.env,
): string {
  const runtimeMap = getRuntimeAssetUrlMap();
  if (runtimeMap?.[src]) {
    return runtimeMap[src];
  }

  const envMap = getEnvAssetUrlMap(env);
  if (envMap?.[src]) {
    return envMap[src];
  }

  return src;
}

export function resolveStaticAssetSrc(
  src: string,
  staticResolver: (path: string) => string,
  env: EnvLike = process.env,
): string {
  const mappedUrl = resolveMappedAssetUrl(src, env);
  if (mappedUrl !== src) {
    return mappedUrl;
  }

  const resolvedUrl = resolvePublicAssetUrl(src, env);
  if (resolvedUrl !== src) {
    return resolvedUrl;
  }

  if (!isPublicAssetPath(src)) {
    return src;
  }

  return staticResolver(src);
}
