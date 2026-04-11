import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const repoRoot = path.resolve(dirname, "..", "..", "..");

type EnvLike = Record<string, string | undefined>;

export type R2Config = {
  bucket: string;
  region: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string | null;
  keyPrefix: string;
};

let cachedEnv: EnvLike | null = null;

function parseEnvFile(source: string): EnvLike {
  const next: EnvLike = {};
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) continue;
    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    next[key] = value;
  }
  return next;
}

export function getResolvedEnv(): EnvLike {
  if (cachedEnv) return cachedEnv;

  const env: EnvLike = {};
  for (const filePath of [
    path.join(repoRoot, "apps", "render-service", ".env.local"),
  ]) {
    if (!fs.existsSync(filePath)) continue;
    Object.assign(env, parseEnvFile(fs.readFileSync(filePath, "utf8")));
  }

  cachedEnv = {
    ...env,
    ...process.env,
  };
  return cachedEnv;
}

function getFirstEnvValue(
  keys: string[],
  env: EnvLike = getResolvedEnv(),
): string | undefined {
  for (const key of keys) {
    const value = env[key]?.trim();
    if (value) return value;
  }

  return undefined;
}

function normalizeUrl(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function normalizeKeyPrefix(prefix: string): string {
  return prefix.replace(/^\/+|\/+$/g, "");
}

export function getRenderServicePollMs(): number {
  const raw = getResolvedEnv().TOKOVO_RENDER_SERVICE_POLL_MS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 500) return 2000;
  return Math.floor(parsed);
}

export function getBrowserExecutable(): string | null {
  return getResolvedEnv().TOKOVO_BROWSER_EXECUTABLE?.trim() || null;
}

export function getRenderMaxConcurrency(): number | null {
  const raw = getResolvedEnv().TOKOVO_RENDER_MAX_CONCURRENCY?.trim();
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return Math.floor(parsed);
}

export function getPublicAssetBaseUrl(): string | null {
  const raw = getFirstEnvValue([
    "TOKOVO_PUBLIC_ASSET_BASE_URL",
    "TOKOVO_ASSET_BASE_URL",
  ]);
  return raw ? normalizeUrl(raw) : null;
}

function getRawR2Config(env: EnvLike = getResolvedEnv()) {
  return {
    bucket: getFirstEnvValue(["TOKOVO_R2_BUCKET", "R2_BUCKET"], env),
    region: getFirstEnvValue(["TOKOVO_R2_REGION", "R2_REGION"], env) ?? "auto",
    endpoint:
      getFirstEnvValue(["TOKOVO_R2_ENDPOINT", "R2_ENDPOINT"], env) ??
      (() => {
        const accountId = getFirstEnvValue(
          ["TOKOVO_R2_ACCOUNT_ID", "R2_ACCOUNT_ID"],
          env,
        );
        return accountId
          ? `https://${accountId}.r2.cloudflarestorage.com`
          : undefined;
      })(),
    accessKeyId: getFirstEnvValue(
      ["TOKOVO_R2_ACCESS_KEY_ID", "R2_ACCESS_KEY_ID"],
      env,
    ),
    secretAccessKey: getFirstEnvValue(
      ["TOKOVO_R2_SECRET_ACCESS_KEY", "R2_SECRET_ACCESS_KEY"],
      env,
    ),
    publicBaseUrl: getFirstEnvValue(
      ["TOKOVO_R2_PUBLIC_BASE_URL", "R2_PUBLIC_BASE_URL"],
      env,
    ),
    keyPrefix:
      getFirstEnvValue(["TOKOVO_R2_KEY_PREFIX", "R2_KEY_PREFIX"], env) ?? "",
  };
}

export function hasAnyR2Config(): boolean {
  const raw = getRawR2Config();
  return Boolean(
    raw.bucket ||
    raw.endpoint ||
    raw.accessKeyId ||
    raw.secretAccessKey ||
    raw.publicBaseUrl ||
    raw.keyPrefix,
  );
}

export function getR2ConfigValidationError(): string | null {
  const raw = getRawR2Config();
  const hasAnyValue = hasAnyR2Config();
  if (!hasAnyValue) return null;

  const missing: string[] = [];
  if (!raw.bucket) missing.push("bucket");
  if (!raw.endpoint) missing.push("endpoint (or account id)");
  if (!raw.accessKeyId) missing.push("access key id");
  if (!raw.secretAccessKey) missing.push("secret access key");

  if (missing.length === 0) return null;
  return `R2 upload is partially configured. Missing ${missing.join(", ")}.`;
}

export function getR2Config(): R2Config | null {
  const validationError = getR2ConfigValidationError();
  if (validationError) return null;

  const raw = getRawR2Config();
  if (
    !hasAnyR2Config() ||
    !raw.bucket ||
    !raw.endpoint ||
    !raw.accessKeyId ||
    !raw.secretAccessKey
  ) {
    return null;
  }

  return {
    bucket: raw.bucket,
    region: raw.region,
    endpoint: normalizeUrl(raw.endpoint),
    accessKeyId: raw.accessKeyId,
    secretAccessKey: raw.secretAccessKey,
    publicBaseUrl: raw.publicBaseUrl ? normalizeUrl(raw.publicBaseUrl) : null,
    keyPrefix: normalizeKeyPrefix(raw.keyPrefix),
  };
}
