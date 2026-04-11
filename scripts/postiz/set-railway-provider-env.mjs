import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const envFile = process.argv[2];

if (!envFile) {
  console.error("Usage: node scripts/postiz/set-railway-provider-env.mjs <env-file>");
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

const values = parseEnv(fs.readFileSync(path.resolve(envFile), "utf8"));
const keys = [
  "YOUTUBE_CLIENT_ID",
  "YOUTUBE_CLIENT_SECRET",
  "FACEBOOK_APP_ID",
  "FACEBOOK_APP_SECRET",
  "TIKTOK_CLIENT_ID",
  "TIKTOK_CLIENT_SECRET",
  "LINKEDIN_CLIENT_ID",
  "LINKEDIN_CLIENT_SECRET",
  "X_API_KEY",
  "X_API_SECRET",
  "THREADS_APP_ID",
  "THREADS_APP_SECRET",
];

const args = ["variables", "-s", "postiz-app"];
let count = 0;

for (const key of keys) {
  const value = values[key];
  if (!value) continue;
  args.push("--set", `${key}=${value}`);
  count += 1;
}

if (count === 0) {
  console.error("No Postiz provider variables found in env file.");
  process.exit(1);
}

execFileSync("railway", args, { stdio: "inherit" });
