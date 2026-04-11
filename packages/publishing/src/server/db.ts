import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import { getPublishingDbPath } from "./config.js";

type DatabaseSync = {
  exec(sql: string): void;
  prepare(sql: string): {
    run: (...params: unknown[]) => unknown;
    all: (...params: unknown[]) => unknown[];
    get: (...params: unknown[]) => unknown;
  };
};

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite") as {
  DatabaseSync: new (path: string) => DatabaseSync;
};

let database: DatabaseSync | null = null;

function ensureDatabase(): DatabaseSync {
  if (database) {
    return database;
  }

  const dbPath = getPublishingDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  database = new DatabaseSync(dbPath);
  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS render_artifacts (
      id TEXT PRIMARY KEY,
      episode_id TEXT NOT NULL,
      source_hash TEXT NOT NULL,
      video_path TEXT NOT NULL,
      thumbnail_path TEXT,
      duration_ms INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      synced_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS publishing_channels (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      postiz_integration_id TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      status TEXT NOT NULL,
      metadata_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS publish_variants (
      id TEXT PRIMARY KEY,
      artifact_id TEXT NOT NULL REFERENCES render_artifacts(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      caption TEXT NOT NULL,
      title TEXT,
      settings_json TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scheduled_posts (
      id TEXT PRIMARY KEY,
      variant_id TEXT NOT NULL REFERENCES publish_variants(id) ON DELETE CASCADE,
      channel_id TEXT NOT NULL REFERENCES publishing_channels(id) ON DELETE CASCADE,
      scheduled_at TEXT NOT NULL,
      timezone TEXT NOT NULL,
      status TEXT NOT NULL,
      postiz_post_id TEXT,
      postiz_response_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(variant_id, channel_id, scheduled_at)
    );
  `);

  return database;
}

export function getPublishingDb(): DatabaseSync {
  return ensureDatabase();
}

export type { DatabaseSync };
