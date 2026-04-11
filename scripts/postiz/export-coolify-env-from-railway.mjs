import { execFileSync } from "node:child_process";

const runCwd = process.env.RAILWAY_RUN_CWD ?? process.cwd();

function runRailwayVariables(service) {
  try {
    const output = execFileSync(
      "railway",
      ["variables", "--service", service, "--json"],
      {
        cwd: runCwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "inherit"],
      },
    );
    return JSON.parse(output);
  } catch (error) {
    throw new Error(
      `Failed to read Railway variables for service "${service}". Run this from a Railway-linked Tokovo checkout or set RAILWAY_RUN_CWD to one.`,
      { cause: error },
    );
  }
}

function parseUrl(value) {
  return value ? new URL(value) : null;
}

function decode(value) {
  return value ? decodeURIComponent(value) : "";
}

const appVars = runRailwayVariables("postiz-app");
const temporalVars = runRailwayVariables("temporal");

const databaseUrl = parseUrl(appVars.DATABASE_URL);
const redisUrl = parseUrl(appVars.REDIS_URL);

if (!databaseUrl || !redisUrl) {
  throw new Error("Missing DATABASE_URL or REDIS_URL in Railway postiz-app variables.");
}

const lines = [
  `MAIN_URL=${appVars.MAIN_URL ?? "https://postiz.tokovo.io"}`,
  `FRONTEND_URL=${appVars.FRONTEND_URL ?? "https://postiz.tokovo.io"}`,
  `NEXT_PUBLIC_BACKEND_URL=${appVars.NEXT_PUBLIC_BACKEND_URL ?? "https://postiz.tokovo.io/api"}`,
  `BACKEND_INTERNAL_URL=${appVars.BACKEND_INTERNAL_URL ?? "http://localhost:3000"}`,
  `JWT_SECRET=${appVars.JWT_SECRET ?? ""}`,
  `IS_GENERAL=${appVars.IS_GENERAL ?? "true"}`,
  `RUN_CRON=${appVars.RUN_CRON ?? "true"}`,
  `DISABLE_REGISTRATION=${appVars.DISABLE_REGISTRATION ?? "false"}`,
  `STORAGE_PROVIDER=${appVars.STORAGE_PROVIDER ?? "cloudflare"}`,
  `CLOUDFLARE_ACCOUNT_ID=${appVars.CLOUDFLARE_ACCOUNT_ID ?? ""}`,
  `CLOUDFLARE_ACCESS_KEY=${appVars.CLOUDFLARE_ACCESS_KEY ?? ""}`,
  `CLOUDFLARE_SECRET_ACCESS_KEY=${appVars.CLOUDFLARE_SECRET_ACCESS_KEY ?? ""}`,
  `CLOUDFLARE_BUCKETNAME=${appVars.CLOUDFLARE_BUCKETNAME ?? ""}`,
  `CLOUDFLARE_REGION=${appVars.CLOUDFLARE_REGION ?? "auto"}`,
  `CLOUDFLARE_BUCKET_URL=${appVars.CLOUDFLARE_BUCKET_URL ?? ""}`,
  `UPLOAD_DIRECTORY=${appVars.UPLOAD_DIRECTORY ?? "/uploads"}`,
  `NEXT_PUBLIC_UPLOAD_DIRECTORY=${appVars.NEXT_PUBLIC_UPLOAD_DIRECTORY ?? "/uploads"}`,
  `POSTIZ_DB_USER=${decode(databaseUrl.username)}`,
  `POSTIZ_DB_PASSWORD=${decode(databaseUrl.password)}`,
  `POSTIZ_DB_NAME=${databaseUrl.pathname.replace(/^\//, "")}`,
  `POSTIZ_REDIS_PASSWORD=${decode(redisUrl.password)}`,
  `TEMPORAL_DB_USER=${temporalVars.POSTGRES_USER ?? "postgres"}`,
  `TEMPORAL_DB_PASSWORD=${temporalVars.POSTGRES_PWD ?? ""}`,
  `TEMPORAL_DB_NAME=temporal`,
  `OPENAI_API_KEY=${appVars.OPENAI_API_KEY ?? ""}`,
  `X_API_KEY=${appVars.X_API_KEY ?? ""}`,
  `X_API_SECRET=${appVars.X_API_SECRET ?? ""}`,
  `LINKEDIN_CLIENT_ID=${appVars.LINKEDIN_CLIENT_ID ?? ""}`,
  `LINKEDIN_CLIENT_SECRET=${appVars.LINKEDIN_CLIENT_SECRET ?? ""}`,
  `YOUTUBE_CLIENT_ID=${appVars.YOUTUBE_CLIENT_ID ?? ""}`,
  `YOUTUBE_CLIENT_SECRET=${appVars.YOUTUBE_CLIENT_SECRET ?? ""}`,
  `THREADS_APP_ID=${appVars.THREADS_APP_ID ?? ""}`,
  `THREADS_APP_SECRET=${appVars.THREADS_APP_SECRET ?? ""}`,
  `FACEBOOK_APP_ID=${appVars.FACEBOOK_APP_ID ?? ""}`,
  `FACEBOOK_APP_SECRET=${appVars.FACEBOOK_APP_SECRET ?? ""}`,
  `TIKTOK_CLIENT_ID=${appVars.TIKTOK_CLIENT_ID ?? ""}`,
  `TIKTOK_CLIENT_SECRET=${appVars.TIKTOK_CLIENT_SECRET ?? ""}`,
];

process.stdout.write(`${lines.join("\n")}\n`);
