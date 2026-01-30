import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { VoiceScript } from "../types/script";
import { VoiceManifest } from "../types/manifest";

export interface CacheEntry {
  manifest: VoiceManifest;
  audioPath: string;
}

export interface CacheConfig {
  cacheDir: string;
}

export function computeScriptHash(script: VoiceScript): string {
  const content = JSON.stringify({
    voices: script.voices,
    lines: script.lines,
  });
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
}

export class FileCache {
  private cacheDir: string;

  constructor(config: CacheConfig) {
    this.cacheDir = config.cacheDir;
  }

  private getEntryDir(scriptId: string, hash: string): string {
    return path.join(this.cacheDir, `${scriptId}_${hash}`);
  }

  async get(script: VoiceScript): Promise<CacheEntry | null> {
    const hash = computeScriptHash(script);
    const entryDir = this.getEntryDir(script.id, hash);
    const manifestPath = path.join(entryDir, "manifest.json");
    const audioPath = path.join(entryDir, "audio.mp3");

    if (!fs.existsSync(manifestPath) || !fs.existsSync(audioPath)) {
      return null;
    }

    const manifest: VoiceManifest = JSON.parse(
      fs.readFileSync(manifestPath, "utf-8"),
    );

    if (manifest.contentHash !== hash) {
      return null;
    }

    return { manifest, audioPath };
  }

  async set(
    script: VoiceScript,
    audioBuffer: Buffer,
    manifest: VoiceManifest,
  ): Promise<CacheEntry> {
    const hash = computeScriptHash(script);
    const entryDir = this.getEntryDir(script.id, hash);

    fs.mkdirSync(entryDir, { recursive: true });

    const audioPath = path.join(entryDir, "audio.mp3");
    const manifestPath = path.join(entryDir, "manifest.json");

    fs.writeFileSync(audioPath, audioBuffer);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    return { manifest, audioPath };
  }

  clear(scriptId?: string): void {
    if (scriptId) {
      const entries = fs.readdirSync(this.cacheDir);
      for (const entry of entries) {
        if (entry.startsWith(`${scriptId}_`)) {
          fs.rmSync(path.join(this.cacheDir, entry), { recursive: true });
        }
      }
    } else {
      fs.rmSync(this.cacheDir, { recursive: true });
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }
}
