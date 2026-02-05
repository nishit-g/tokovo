import { describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import path from "path";

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      if (entry.isFile() && full.endsWith(".ts")) return [full];
      return [];
    }),
  );
  return files.flat();
}

describe("device-camera anti-coupling contract", () => {
  it("does not import @tokovo/apps-* packages", async () => {
    const srcRoot = path.resolve(__dirname, "..");
    const files = await walk(srcRoot);
    const violations: string[] = [];

    for (const file of files) {
      const source = await fs.readFile(file, "utf8");
      if (/from\s+["']@tokovo\/apps-/.test(source)) {
        violations.push(file);
      }
    }

    expect(violations).toEqual([]);
  });
});
