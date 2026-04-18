import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runReactorVoiceDemo } from "../scripts/index.js";

const tempDirs: string[] = [];

function createTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tokovo-reactor-demo-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("reactor voice demo", () => {
  it("generates a local demo artifact with deterministic fallback routing", async () => {
    const result = await runReactorVoiceDemo({
      cacheDir: createTempDir(),
    });

    expect(result.artifact.provider).toBe("demo-pro");
    expect(result.request.alignmentMode).toBe("require-character");
    expect(result.manifest.segments).toHaveLength(2);
    expect(fs.existsSync(result.artifact.audioPath)).toBe(true);
  });
});
