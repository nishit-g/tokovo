import path from "node:path";

function resolveRepoRoot(): string {
  return path.resolve(process.cwd(), "..", "..");
}

export function getPublishingRoot(): string {
  return process.env.PUBLISHING_STORAGE_ROOT ?? path.join(resolveRepoRoot(), ".tokovo", "publishing");
}

export function getPublishingDbPath(): string {
  return process.env.PUBLISHING_DB_PATH ?? path.join(getPublishingRoot(), "metadata.db");
}

export function getArtifactScanRoot(): string {
  return process.env.PUBLISHING_ARTIFACT_SCAN_ROOT ?? path.join(resolveRepoRoot(), "out");
}

export function getPostizBaseUrl(): string {
  const value = process.env.POSTIZ_BASE_URL;
  if (!value) {
    throw new Error("Missing POSTIZ_BASE_URL");
  }
  return value.replace(/\/$/, "");
}

export function getPostizApiKey(): string {
  const value = process.env.POSTIZ_API_KEY;
  if (!value) {
    throw new Error("Missing POSTIZ_API_KEY");
  }
  return value;
}
