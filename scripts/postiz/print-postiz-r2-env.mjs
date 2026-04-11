import fs from "node:fs";
import path from "node:path";

const envFile = process.argv[2];

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

const source = envFile
  ? parseEnv(fs.readFileSync(path.resolve(envFile), "utf8"))
  : process.env;

const first = (...keys) => keys.map((key) => source[key]).find(Boolean) ?? "";

const accountIdFromEndpoint = () => {
  const endpoint = first("TOKOVO_R2_ENDPOINT", "R2_ENDPOINT");
  if (!endpoint) return "";
  const match = endpoint.match(/https:\/\/([^.]+)\.r2\.cloudflarestorage\.com/i);
  return match?.[1] ?? "";
};

const accountId = first("TOKOVO_R2_ACCOUNT_ID", "R2_ACCOUNT_ID") || accountIdFromEndpoint();

const mapped = {
  CLOUDFLARE_ACCOUNT_ID: accountId,
  CLOUDFLARE_ACCESS_KEY: first("TOKOVO_R2_ACCESS_KEY_ID", "R2_ACCESS_KEY_ID"),
  CLOUDFLARE_SECRET_ACCESS_KEY: first(
    "TOKOVO_R2_SECRET_ACCESS_KEY",
    "R2_SECRET_ACCESS_KEY",
  ),
  CLOUDFLARE_BUCKETNAME: first("TOKOVO_R2_BUCKET", "R2_BUCKET"),
  CLOUDFLARE_REGION: first("TOKOVO_R2_REGION", "R2_REGION") || "auto",
  CLOUDFLARE_BUCKET_URL: first("TOKOVO_R2_PUBLIC_BASE_URL", "R2_PUBLIC_BASE_URL"),
};

for (const [key, value] of Object.entries(mapped)) {
  console.log(`${key}=${value}`);
}
