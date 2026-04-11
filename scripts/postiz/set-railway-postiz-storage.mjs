import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const envFile = process.argv[2];

if (!envFile) {
  console.error("Usage: node scripts/postiz/set-railway-postiz-storage.mjs <env-file>");
  process.exit(1);
}

const parseEnv = (text) => {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
};

const source = parseEnv(fs.readFileSync(path.resolve(envFile), "utf8"));
const first = (...keys) => keys.map((key) => source[key]).find(Boolean) ?? "";
const accountIdFromEndpoint = () => {
  const endpoint = first("TOKOVO_R2_ENDPOINT", "R2_ENDPOINT");
  if (!endpoint) return "";
  const match = endpoint.match(/https:\/\/([^.]+)\.r2\.cloudflarestorage\.com\/?/i);
  return match?.[1] ?? "";
};

const vars = {
  STORAGE_PROVIDER: "cloudflare",
  CLOUDFLARE_ACCOUNT_ID:
    first("CLOUDFLARE_ACCOUNT_ID", "TOKOVO_R2_ACCOUNT_ID", "R2_ACCOUNT_ID") ||
    accountIdFromEndpoint(),
  CLOUDFLARE_ACCESS_KEY: first(
    "CLOUDFLARE_ACCESS_KEY",
    "TOKOVO_R2_ACCESS_KEY_ID",
    "R2_ACCESS_KEY_ID",
  ),
  CLOUDFLARE_SECRET_ACCESS_KEY: first(
    "CLOUDFLARE_SECRET_ACCESS_KEY",
    "TOKOVO_R2_SECRET_ACCESS_KEY",
    "R2_SECRET_ACCESS_KEY",
  ),
  CLOUDFLARE_BUCKETNAME: first(
    "CLOUDFLARE_BUCKETNAME",
    "TOKOVO_R2_BUCKET",
    "R2_BUCKET",
    "R2_BUCKET_NAME",
  ),
  CLOUDFLARE_REGION: first("CLOUDFLARE_REGION", "TOKOVO_R2_REGION", "R2_REGION") || "auto",
  CLOUDFLARE_BUCKET_URL: first(
    "CLOUDFLARE_BUCKET_URL",
    "TOKOVO_R2_PUBLIC_BASE_URL",
    "R2_PUBLIC_BASE_URL",
  ),
};

const missing = Object.entries(vars)
  .filter(([key, value]) => key !== "CLOUDFLARE_BUCKET_URL" && !value)
  .map(([key]) => key);

if (missing.length > 0) {
  console.error(`Missing required values: ${missing.join(", ")}`);
  process.exit(1);
}

const args = ["variables", "-s", "postiz-app"];
for (const [key, value] of Object.entries(vars)) {
  if (!value) continue;
  args.push("--set", `${key}=${value}`);
}

execFileSync("railway", args, { stdio: "inherit" });
